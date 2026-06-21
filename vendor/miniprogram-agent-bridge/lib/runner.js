#!/usr/bin/env node

const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { parseArgs } = require("node:util");

const { resolveWechatDevtoolsConfig } = require("./devtools");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_PROJECT_PATH = process.cwd();
const DEFAULT_OUTPUT_BASE = path.join(DEFAULT_PROJECT_PATH, ".wechat-agent", "runs");

function defaultDetailIsOpen(pageData) {
  const currentDish = pageData && pageData.currentDish;
  return !!(pageData && pageData.showDetail && currentDish && currentDish.dish_id);
}

function defaultExtractAssistantReply(pageData) {
  const messages = Array.isArray(pageData && pageData.messages) ? pageData.messages : [];
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const item = messages[i] || {};
    if (item.role === "ai") {
      return String(item.text || item.html || "").replace(/<[^>]+>/g, "").trim();
    }
  }
  return "";
}

async function defaultSeedMenuWriter(miniProgram, menu) {
  return miniProgram.evaluate(
    function writeMenu(seedMenu) {
      const app = typeof getApp === "function" ? getApp() : null;
      wx.setStorageSync("currentMenu", seedMenu);
      if (app && app.globalData) {
        app.globalData.currentMenu = seedMenu;
      }
      return true;
    },
    menu
  );
}

const DEFAULT_ADAPTER = {
  name: "generic-menu-miniapp",
  routes: {
    home: "/pages/index/index",
    result: "pages/menu-list/index",
    chat: "pages/chat/index"
  },
  selectors: {
    upload: ".action-secondary",
    dishCard: ".dish-card",
    detailChat: ".dh-cta",
    menuChat: ".ai-cta",
    chatInput: ".chat-input",
    chatSend: ".chat-send",
    onboardingSkip: ".ob-skip"
  },
  waits: {
    parse: 1200,
    detailOpen: 800,
    chat: 1200,
    chatCompose: 800
  },
  detailIsOpen: defaultDetailIsOpen,
  extractAssistantReply: defaultExtractAssistantReply,
  seedMenuWriter: defaultSeedMenuWriter
};

const DEFAULT_RUNNER_CONFIG = {
  rootDir: ROOT_DIR,
  projectPath: DEFAULT_PROJECT_PATH,
  cliPath: "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
  cliPort: 9420,
  outputBaseDir: DEFAULT_OUTPUT_BASE,
  fixtureImagePath: "",
  adapterPath: "",
  homeRoute: DEFAULT_ADAPTER.routes.home,
  menuListRoute: DEFAULT_ADAPTER.routes.result,
  chatRoute: DEFAULT_ADAPTER.routes.chat,
  parseUploadSelector: DEFAULT_ADAPTER.selectors.upload,
  dishCardSelector: DEFAULT_ADAPTER.selectors.dishCard,
  detailChatSelector: DEFAULT_ADAPTER.selectors.detailChat,
  menuChatSelector: DEFAULT_ADAPTER.selectors.menuChat,
  chatInputSelector: DEFAULT_ADAPTER.selectors.chatInput,
  chatSendSelector: DEFAULT_ADAPTER.selectors.chatSend,
  onboardingSkipSelector: DEFAULT_ADAPTER.selectors.onboardingSkip,
  parseWaitMs: DEFAULT_ADAPTER.waits.parse,
  detailOpenWaitMs: DEFAULT_ADAPTER.waits.detailOpen,
  chatWaitMs: DEFAULT_ADAPTER.waits.chat,
  chatComposeWaitMs: DEFAULT_ADAPTER.waits.chatCompose,
  parseTimeoutMs: 120000,
  detailTimeoutMs: 15000,
  chatTimeoutMs: 45000,
  pollIntervalMs: 2000,
  chatQuestion: "这道菜怎么点比较正宗？",
  detailIsOpen: DEFAULT_ADAPTER.detailIsOpen,
  extractAssistantReply: DEFAULT_ADAPTER.extractAssistantReply,
  seedMenuWriter: DEFAULT_ADAPTER.seedMenuWriter,
  automatorPackageName: "miniprogram-automator",
  automatorVersion: "0.12.1"
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function probePort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error) => {
      if (error && error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }
      reject(error);
    });
    server.listen(port, "127.0.0.1", () => {
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve(true);
      });
    });
  });
}

async function findAvailablePort(preferredPort) {
  const preferred = Number(preferredPort) || 0;
  if (preferred > 0) {
    const available = await probePort(preferred);
    if (available) {
      return preferred;
    }
  }

  for (let offset = 1; offset <= 20; offset += 1) {
    const candidate = preferred > 0 ? preferred + offset : 0;
    if (!candidate) break;
    const available = await probePort(candidate);
    if (available) {
      return candidate;
    }
  }

  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve(port);
      });
    });
  });
}

function slugify(value) {
  return String(value || "run")
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "run";
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function loadOptionalModule(filePath) {
  if (!filePath) return null;
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error("Adapter file not found: " + resolved);
  }
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(resolved);
}

function resolveAdapter(adapterPath) {
  const loaded = loadOptionalModule(adapterPath);
  if (!loaded) {
    return DEFAULT_ADAPTER;
  }

  return {
    ...DEFAULT_ADAPTER,
    ...loaded,
    routes: {
      ...DEFAULT_ADAPTER.routes,
      ...(loaded.routes || {})
    },
    selectors: {
      ...DEFAULT_ADAPTER.selectors,
      ...(loaded.selectors || {})
    },
    waits: {
      ...DEFAULT_ADAPTER.waits,
      ...(loaded.waits || {})
    },
    detailIsOpen: typeof loaded.detailIsOpen === "function" ? loaded.detailIsOpen : DEFAULT_ADAPTER.detailIsOpen,
    extractAssistantReply:
      typeof loaded.extractAssistantReply === "function"
        ? loaded.extractAssistantReply
        : DEFAULT_ADAPTER.extractAssistantReply,
    seedMenuWriter:
      typeof loaded.seedMenuWriter === "function" ? loaded.seedMenuWriter : DEFAULT_ADAPTER.seedMenuWriter
  };
}

function resolveRunnerConfig(overrides = {}) {
  const projectPath = path.resolve(overrides.projectPath || process.env.WECHAT_MINIPROGRAM_PROJECT || DEFAULT_RUNNER_CONFIG.projectPath);
  const adapterPath = overrides.adapterPath || process.env.WECHAT_MINIPROGRAM_ADAPTER || DEFAULT_RUNNER_CONFIG.adapterPath;
  const fixtureImagePathInput =
    overrides.fixtureImagePath ||
    process.env.WECHAT_AGENT_FIXTURE ||
    DEFAULT_RUNNER_CONFIG.fixtureImagePath ||
    "";
  const adapter = resolveAdapter(adapterPath);
  const wechatConfig = resolveWechatDevtoolsConfig({
    ...overrides,
    projectPath
  });
  const outputBaseDir = path.resolve(
    overrides.outputBaseDir ||
      process.env.WECHAT_AGENT_OUTPUT_DIR ||
      path.join(projectPath, ".wechat-agent", "runs")
  );
  return {
    ...DEFAULT_RUNNER_CONFIG,
    ...wechatConfig,
    ...overrides,
    rootDir: overrides.rootDir || DEFAULT_RUNNER_CONFIG.rootDir,
    projectPath,
    cliPath: overrides.cliPath || process.env.WECHAT_DEVTOOLS_CLI || DEFAULT_RUNNER_CONFIG.cliPath,
    cliPort: Number(overrides.cliPort || wechatConfig.cliPort || DEFAULT_RUNNER_CONFIG.cliPort),
    outputBaseDir,
    fixtureImagePath: fixtureImagePathInput ? path.resolve(fixtureImagePathInput) : "",
    adapterPath,
    adapter,
    homeRoute: overrides.homeRoute || adapter.routes.home,
    menuListRoute: overrides.menuListRoute || adapter.routes.result,
    chatRoute: overrides.chatRoute || adapter.routes.chat,
    parseUploadSelector: overrides.parseUploadSelector || adapter.selectors.upload,
    dishCardSelector: overrides.dishCardSelector || adapter.selectors.dishCard,
    detailChatSelector: overrides.detailChatSelector || adapter.selectors.detailChat,
    menuChatSelector: overrides.menuChatSelector || adapter.selectors.menuChat,
    chatInputSelector: overrides.chatInputSelector || adapter.selectors.chatInput,
    chatSendSelector: overrides.chatSendSelector || adapter.selectors.chatSend,
    onboardingSkipSelector: overrides.onboardingSkipSelector || adapter.selectors.onboardingSkip,
    parseWaitMs: Number(overrides.parseWaitMs || adapter.waits.parse || DEFAULT_RUNNER_CONFIG.parseWaitMs),
    detailOpenWaitMs: Number(overrides.detailOpenWaitMs || adapter.waits.detailOpen || DEFAULT_RUNNER_CONFIG.detailOpenWaitMs),
    chatWaitMs: Number(overrides.chatWaitMs || adapter.waits.chat || DEFAULT_RUNNER_CONFIG.chatWaitMs),
    chatComposeWaitMs: Number(overrides.chatComposeWaitMs || adapter.waits.chatCompose || DEFAULT_RUNNER_CONFIG.chatComposeWaitMs),
    detailIsOpen: typeof overrides.detailIsOpen === "function" ? overrides.detailIsOpen : adapter.detailIsOpen,
    extractAssistantReply:
      typeof overrides.extractAssistantReply === "function" ? overrides.extractAssistantReply : adapter.extractAssistantReply,
    seedMenuWriter: typeof overrides.seedMenuWriter === "function" ? overrides.seedMenuWriter : adapter.seedMenuWriter
  };
}

function resolveRouteValue(config, routeOrKey) {
  if (!routeOrKey) return "";
  const routeMap = (config && config.adapter && config.adapter.routes) || {};
  const value = routeMap[routeOrKey] || routeOrKey;
  if (!value) return "";
  return String(value).startsWith("/") ? String(value) : `/${String(value).replace(/^\/+/, "")}`;
}

function normalizePagePath(routeOrKey, config) {
  const resolved = resolveRouteValue(config, routeOrKey);
  return String(resolved || "").replace(/^\/+/, "");
}

function resolveSelectorValue(config, selectorOrKey) {
  if (!selectorOrKey) return "";
  const selectorMap = (config && config.adapter && config.adapter.selectors) || {};
  return selectorMap[selectorOrKey] || selectorOrKey;
}

function loadFlow(flowPath) {
  const loaded = loadOptionalModule(flowPath);
  if (!loaded) {
    throw new Error("Flow file not found: " + flowPath);
  }
  if (Array.isArray(loaded)) {
    return { name: path.basename(flowPath, path.extname(flowPath)), steps: loaded };
  }
  if (Array.isArray(loaded.steps)) {
    return {
      name: loaded.name || path.basename(flowPath, path.extname(flowPath)),
      steps: loaded.steps
    };
  }
  throw new Error("Flow module must export an array or { name, steps }");
}

function buildChooseMediaMock({ tempFilePath, size = 0, fileType = "image" } = {}) {
  return {
    tempFiles: [
      {
        tempFilePath,
        size,
        fileType
      }
    ],
    type: "image"
  };
}

function readFixtureFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return {
    base64: buffer.toString("base64"),
    size: buffer.byteLength,
    extension: path.extname(filePath) || ".png",
    sourcePath: filePath
  };
}

async function mirrorFixtureToMiniProgram(miniProgram, fixture) {
  return miniProgram.evaluate(
    function writeFixture(base64, extension) {
      const fsManager = wx.getFileSystemManager();
      const filePath = wx.env.USER_DATA_PATH + "/runner-picked-image" + extension;
      fsManager.writeFileSync(filePath, wx.base64ToArrayBuffer(base64), "binary");
      return filePath;
    },
    fixture.base64,
    fixture.extension
  );
}

async function seedCurrentMenu(miniProgram, menu, config = DEFAULT_RUNNER_CONFIG) {
  if (!menu || !config || typeof config.seedMenuWriter !== "function") {
    return false;
  }
  return config.seedMenuWriter(miniProgram, menu, config);
}

async function waitForPagePath({
  miniProgram,
  targetPaths = [],
  timeoutMs = DEFAULT_RUNNER_CONFIG.parseTimeoutMs,
  pollIntervalMs = DEFAULT_RUNNER_CONFIG.pollIntervalMs,
  sleep = defaultSleep,
  onTick = null
} = {}) {
  const targetSet = new Set((targetPaths || []).filter(Boolean));
  const startedAt = Date.now();
  let lastPage = null;

  while (Date.now() - startedAt <= timeoutMs) {
    lastPage = await miniProgram.currentPage();
    if (typeof onTick === "function") {
      await onTick(lastPage);
    }
    if (lastPage && targetSet.has(lastPage.path)) {
      return lastPage;
    }
    await sleep(pollIntervalMs);
  }

  const error = new Error(
    "Timed out waiting for page path: " + Array.from(targetSet).join(", ")
  );
  error.page = lastPage;
  throw error;
}

async function waitForChatAnswer({
  miniProgram,
  extractAnswer = DEFAULT_RUNNER_CONFIG.extractAssistantReply,
  timeoutMs = DEFAULT_RUNNER_CONFIG.chatTimeoutMs,
  pollIntervalMs = DEFAULT_RUNNER_CONFIG.pollIntervalMs,
  sleep = defaultSleep
} = {}) {
  const startedAt = Date.now();
  let lastPage = null;
  let lastData = null;

  while (Date.now() - startedAt <= timeoutMs) {
    lastPage = await miniProgram.currentPage();
    if (lastPage && typeof lastPage.data === "function") {
      lastData = await lastPage.data();
      const answerText =
        typeof extractAnswer === "function" ? String(extractAnswer(lastData) || "").trim() : "";
      if (answerText && !lastData.loading) {
        return { page: lastPage, data: lastData, answerText };
      }
    }
    await sleep(pollIntervalMs);
  }

  const error = new Error("Timed out waiting for AI answer");
  error.page = lastPage;
  error.data = lastData;
  throw error;
}

async function safePageData(page) {
  if (!page || typeof page.data !== "function") return null;
  try {
    return await page.data();
  } catch (_) {
    return null;
  }
}

async function waitForDetailSheet({
  miniProgram,
  menuListRoute = DEFAULT_RUNNER_CONFIG.menuListRoute,
  isDetailOpen = DEFAULT_RUNNER_CONFIG.detailIsOpen,
  timeoutMs = DEFAULT_RUNNER_CONFIG.detailTimeoutMs,
  pollIntervalMs = DEFAULT_RUNNER_CONFIG.pollIntervalMs,
  sleep = defaultSleep
} = {}) {
  const startedAt = Date.now();
  let lastPage = null;
  let lastData = null;

  while (Date.now() - startedAt <= timeoutMs) {
    lastPage = await miniProgram.currentPage();
    lastData = await safePageData(lastPage);
    if (lastPage && lastPage.path === menuListRoute) {
      if (typeof isDetailOpen === "function" ? isDetailOpen(lastData) : false) {
        return { page: lastPage, data: lastData };
      }
    }
    await sleep(pollIntervalMs);
  }

  const error = new Error("Timed out waiting for dish detail sheet");
  error.page = lastPage;
  error.data = lastData;
  throw error;
}

async function ensureHomeReady({
  miniProgram,
  homeRoute = DEFAULT_RUNNER_CONFIG.homeRoute,
  splashRoute = "pages/splash/index",
  onboardingRoute = "pages/onboarding/index",
  onboardingSkipSelector = DEFAULT_RUNNER_CONFIG.onboardingSkipSelector,
  sleep = defaultSleep,
  splashWaitMs = 1200,
  onboardingWaitMs = 1200
} = {}) {
  let page = await miniProgram.currentPage();

  if (page && page.path === splashRoute) {
    await sleep(splashWaitMs);
    page = await miniProgram.currentPage();
  }

  if (page && page.path === onboardingRoute) {
    const skip = typeof page.$ === "function" ? await page.$(onboardingSkipSelector) : null;
    if (skip && typeof skip.tap === "function") {
      await skip.tap();
      await sleep(onboardingWaitMs);
      page = await miniProgram.currentPage();
    }
  }

  if (page && page.path === String(homeRoute || "").replace(/^\/+/, "")) {
    return page;
  }

  return miniProgram.reLaunch(homeRoute);
}

function buildRunOutputDir(baseDir, scenario, label = "") {
  const runId = [nowStamp(), slugify(scenario), slugify(label || "default"), String(process.pid)].join("-");
  return path.join(baseDir, runId);
}

function writeReport(reportPath, payload) {
  ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, JSON.stringify(payload, null, 2), "utf8");
}

function attachMiniProgramEventBuffers(miniProgram) {
  const consoleEvents = [];
  const exceptionEvents = [];

  if (miniProgram && typeof miniProgram.on === "function") {
    miniProgram.on("console", (entry) => {
      consoleEvents.push(entry);
    });
    miniProgram.on("exception", (entry) => {
      exceptionEvents.push(entry);
    });
  }

  return { consoleEvents, exceptionEvents };
}

function buildDevtoolsPrepPlan(options = {}) {
  const plan = ["quit", "start-collector", "start-watcher"];
  if (!options.skipBuildNpm) {
    plan.push("build-npm");
  }
  return plan;
}

async function getCurrentPage(miniProgram, context) {
  const page = await miniProgram.currentPage();
  if (context) {
    context.currentPage = page;
  }
  return page;
}

async function getResolvedPage(miniProgram, context, mode = "current") {
  if (mode === "last" && context && context.currentPage) {
    return context.currentPage;
  }
  return getCurrentPage(miniProgram, context);
}

async function requireElement(page, selector, verb) {
  if (!page || typeof page.$ !== "function") {
    throw new Error(`Current page does not support selector lookup for ${verb}`);
  }
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Selector not found for ${verb}: ${selector}`);
  }
  return element;
}

async function executeFlowStep(step, runtime) {
  const { miniProgram, config, context, fixture } = runtime;
  const type = String(step.type || "").trim();
  if (!type) {
    throw new Error("Flow step is missing type");
  }

  if (type === "ensure-home") {
    const page = await ensureHomeReady({
      miniProgram,
      homeRoute: resolveRouteValue(config, step.routeKey || step.route || config.homeRoute),
      onboardingSkipSelector: resolveSelectorValue(config, step.onboardingSkipSelectorKey || step.onboardingSkipSelector || config.onboardingSkipSelector)
    });
    context.currentPage = page;
    return { path: page && page.path ? page.path : "" };
  }

  if (type === "relaunch") {
    const route = resolveRouteValue(config, step.routeKey || step.route);
    const page = await miniProgram.reLaunch(route);
    context.currentPage = page;
    if (step.waitMs) {
      await page.waitFor(Number(step.waitMs));
    }
    return { route, path: page && page.path ? page.path : "" };
  }

  if (type === "switch-tab") {
    const route = resolveRouteValue(config, step.routeKey || step.route);
    const page = await miniProgram.switchTab(route);
    context.currentPage = page;
    if (step.waitMs) {
      await page.waitFor(Number(step.waitMs));
    }
    return { route, path: page && page.path ? page.path : "" };
  }

  if (type === "native-switch-tab") {
    const route = resolveRouteValue(config, step.routeKey || step.route);
    const nativeUrl = normalizePagePath(step.routeKey || step.route, config);
    await miniProgram.native().switchTab({ url: nativeUrl });
    if (step.waitMs) {
      await defaultSleep(Number(step.waitMs));
    }
    const page = await miniProgram.currentPage();
    context.currentPage = page;
    return { route, nativeUrl, path: page && page.path ? page.path : "" };
  }

  if (type === "wait") {
    await defaultSleep(Number(step.ms || 0));
    return { waitedMs: Number(step.ms || 0) };
  }

  if (type === "wait-page") {
    const targetPaths = (step.pathKeys || step.paths || [])
      .map((item) => normalizePagePath(item, config))
      .filter(Boolean);
    const page = await waitForPagePath({
      miniProgram,
      targetPaths,
      timeoutMs: Number(step.timeoutMs || config.parseTimeoutMs),
      pollIntervalMs: Number(step.pollIntervalMs || config.pollIntervalMs)
    });
    context.currentPage = page;
    return { path: page && page.path ? page.path : "" };
  }

  if (type === "tap") {
    const page = await getResolvedPage(miniProgram, context, step.page || "current");
    const selector = resolveSelectorValue(config, step.selectorKey || step.selector);
    const element = await requireElement(page, selector, "tap");
    if (typeof element.tap !== "function") {
      throw new Error(`Selector does not support tap: ${selector}`);
    }
    await element.tap();
    if (step.waitMs) {
      await defaultSleep(Number(step.waitMs));
    }
    return { selector };
  }

  if (type === "input") {
    const page = await getResolvedPage(miniProgram, context, step.page || "current");
    const selector = resolveSelectorValue(config, step.selectorKey || step.selector);
    const element = await requireElement(page, selector, "input");
    if (typeof element.input !== "function") {
      throw new Error(`Selector does not support input: ${selector}`);
    }
    await element.input(String(step.value || ""));
    return { selector, value: String(step.value || "") };
  }

  if (type === "mock-choose-media") {
    const selectedFixture = step.fixture
      ? readFixtureFile(path.resolve(step.fixture))
      : fixture || (config.fixtureImagePath ? readFixtureFile(config.fixtureImagePath) : null);
    if (!selectedFixture) {
      throw new Error("mock-choose-media requires --fixture or step.fixture");
    }
    const sandboxPath = await mirrorFixtureToMiniProgram(miniProgram, selectedFixture);
    await miniProgram.mockWxMethod(
      "chooseMedia",
      buildChooseMediaMock({
        tempFilePath: sandboxPath,
        size: selectedFixture.size
      })
    );
    context.fixture = selectedFixture;
    context.sandboxPath = sandboxPath;
    return { sandboxPath, sourcePath: selectedFixture.sourcePath };
  }

  if (type === "seed-storage") {
    const key = String(step.key || "");
    if (!key) {
      throw new Error("seed-storage requires key");
    }
    await miniProgram.evaluate(
      function writeStorage(storageKey, storageValue, syncGlobalData) {
        const app = typeof getApp === "function" ? getApp() : null;
        wx.setStorageSync(storageKey, storageValue);
        if (syncGlobalData && app && app.globalData) {
          app.globalData[storageKey] = storageValue;
        }
        return true;
      },
      key,
      step.value,
      step.syncGlobalData !== false
    );
    return { key };
  }

  if (type === "wait-detail") {
    const result = await waitForDetailSheet({
      miniProgram,
      menuListRoute: normalizePagePath(step.routeKey || step.route || config.menuListRoute, config),
      isDetailOpen: typeof step.isDetailOpen === "function" ? step.isDetailOpen : config.detailIsOpen,
      timeoutMs: Number(step.timeoutMs || config.detailTimeoutMs),
      pollIntervalMs: Number(step.pollIntervalMs || config.pollIntervalMs)
    });
    context.currentPage = result.page;
    return {
      path: result.page && result.page.path ? result.page.path : "",
      data: result.data
    };
  }

  if (type === "wait-chat-answer") {
    const result = await waitForChatAnswer({
      miniProgram,
      extractAnswer:
        typeof step.extractAnswer === "function" ? step.extractAnswer : config.extractAssistantReply,
      timeoutMs: Number(step.timeoutMs || config.chatTimeoutMs),
      pollIntervalMs: Number(step.pollIntervalMs || config.pollIntervalMs)
    });
    context.currentPage = result.page;
    return {
      path: result.page && result.page.path ? result.page.path : "",
      answerText: result.answerText,
      data: result.data
    };
  }

  if (type === "read-current-page") {
    const page = await getCurrentPage(miniProgram, context);
    const data = await safePageData(page);
    return {
      path: page && page.path ? page.path : "",
      data
    };
  }

  if (type === "screenshot") {
    const fileName = `${slugify(step.name || `step-${context.trace.length + 1}`)}.png`;
    const screenshotPath = path.join(context.outputDir, fileName);
    await miniProgram.screenshot({ path: screenshotPath });
    context.artifacts[step.name || fileName] = screenshotPath;
    return { screenshotPath };
  }

  if (type === "observe") {
    const page = await getCurrentPage(miniProgram, context);
    const data = await safePageData(page);
    const name = step.name || `observe-${context.trace.length + 1}`;
    const observation = {
      path: page && page.path ? page.path : "",
      data
    };
    if (step.screenshot !== false) {
      const screenshotPath = path.join(context.outputDir, `${slugify(name)}.png`);
      await miniProgram.screenshot({ path: screenshotPath });
      observation.screenshotPath = screenshotPath;
      context.artifacts[name] = screenshotPath;
    }
    context.observations[name] = observation;
    return observation;
  }

  throw new Error(`Unsupported flow step: ${type}`);
}

async function executeFlow(miniProgram, config, flow, runtimeOptions = {}) {
  const outputDir = runtimeOptions.outputDir;
  ensureDir(outputDir);
  const fixture =
    runtimeOptions.fixture ||
    (config.fixtureImagePath ? readFixtureFile(config.fixtureImagePath) : null);
  const context = {
    currentPage: null,
    outputDir,
    artifacts: {},
    observations: {},
    trace: []
  };

  for (const step of flow.steps || []) {
    const startedAt = new Date().toISOString();
    context.currentStep = {
      type: step.type,
      name: step.name || "",
      selectorKey: step.selectorKey || "",
      routeKey: step.routeKey || "",
      route: step.route || "",
      startedAt
    };
    try {
      const result = await executeFlowStep(step, {
        miniProgram,
        config,
        context,
        fixture
      });
      context.trace.push({
        type: step.type,
        name: step.name || "",
        startedAt,
        result
      });
    } catch (error) {
      error.flowTrace = context.trace;
      error.currentStep = context.currentStep;
      throw error;
    }
  }

  const finalPage = await getCurrentPage(miniProgram, context);
  return {
    ok: true,
    flowName: flow.name || "flow",
    finalPage: {
      path: finalPage && finalPage.path ? finalPage.path : "",
      data: await safePageData(finalPage)
    },
    observations: context.observations,
    artifacts: context.artifacts,
    trace: context.trace
  };
}

async function runParseAlbumScenario({
  miniProgram,
  fixture,
  outputDir,
  homeRoute = DEFAULT_RUNNER_CONFIG.homeRoute,
  uploadSelector = DEFAULT_RUNNER_CONFIG.parseUploadSelector,
  parseWaitMs = DEFAULT_RUNNER_CONFIG.parseWaitMs,
  targetPath = DEFAULT_RUNNER_CONFIG.menuListRoute,
  timeoutMs = DEFAULT_RUNNER_CONFIG.parseTimeoutMs,
  pollIntervalMs = DEFAULT_RUNNER_CONFIG.pollIntervalMs,
  sleep = defaultSleep
} = {}) {
  if (!fixture || !fixture.sourcePath) {
    throw new Error("parse-album requires a fixture image. Pass --fixture <path>.");
  }
  ensureDir(outputDir);
  const screenshotPath = path.join(outputDir, "parse-album.png");
  const sandboxPath = await mirrorFixtureToMiniProgram(miniProgram, fixture);
  await miniProgram.mockWxMethod(
    "chooseMedia",
    buildChooseMediaMock({
      tempFilePath: sandboxPath,
      size: fixture.size
    })
  );

  const homePage = await miniProgram.reLaunch(homeRoute);
  await homePage.waitFor(parseWaitMs);
  const uploadButton = await homePage.$(uploadSelector);
  if (!uploadButton || typeof uploadButton.tap !== "function") {
    throw new Error("Album upload selector not found: " + uploadSelector);
  }
  await uploadButton.tap();

  let finalPage = null;
  let ok = true;
  let errorMessage = "";
  try {
    finalPage = await waitForPagePath({
      miniProgram,
      targetPaths: [targetPath],
      timeoutMs,
      pollIntervalMs,
      sleep
    });
  } catch (error) {
    ok = false;
    errorMessage = error && error.message ? error.message : "parse album scenario failed";
    finalPage = error && error.page ? error.page : await miniProgram.currentPage();
  }

  await miniProgram.screenshot({ path: screenshotPath });
  return {
    ok,
    error: errorMessage,
    sandboxPath,
    screenshotPath,
    finalPage: {
      path: finalPage && finalPage.path ? finalPage.path : "",
      data: await safePageData(finalPage)
    }
  };
}

async function runChatScenario({
  miniProgram,
  menu,
  question = DEFAULT_RUNNER_CONFIG.chatQuestion,
  outputDir,
  menuListRoute = DEFAULT_RUNNER_CONFIG.menuListRoute,
  menuChatSelector = DEFAULT_RUNNER_CONFIG.menuChatSelector,
  chatInputSelector = DEFAULT_RUNNER_CONFIG.chatInputSelector,
  chatSendSelector = DEFAULT_RUNNER_CONFIG.chatSendSelector,
  menuWaitMs = DEFAULT_RUNNER_CONFIG.chatWaitMs,
  composeWaitMs = DEFAULT_RUNNER_CONFIG.chatComposeWaitMs,
  chatRoute = DEFAULT_RUNNER_CONFIG.chatRoute,
  extractAnswer = DEFAULT_RUNNER_CONFIG.extractAssistantReply,
  timeoutMs = DEFAULT_RUNNER_CONFIG.chatTimeoutMs,
  pollIntervalMs = DEFAULT_RUNNER_CONFIG.pollIntervalMs,
  sleep = defaultSleep
} = {}) {
  ensureDir(outputDir);
  const screenshotPath = path.join(outputDir, "chat-flow.png");

  if (menu) {
    await seedCurrentMenu(miniProgram, menu);
  }

  const menuPage = await miniProgram.reLaunch("/" + String(menuListRoute || "").replace(/^\/+/, ""));
  await menuPage.waitFor(menuWaitMs);
  const chatButton = await menuPage.$(menuChatSelector);
  if (!chatButton || typeof chatButton.tap !== "function") {
    throw new Error("Menu chat selector not found: " + menuChatSelector);
  }
  await chatButton.tap();

  const chatPage = await waitForPagePath({
    miniProgram,
    targetPaths: [chatRoute],
    timeoutMs,
    pollIntervalMs,
    sleep
  });

  await chatPage.waitFor(composeWaitMs);
  const input = await chatPage.$(chatInputSelector);
  if (!input || typeof input.input !== "function") {
    throw new Error("Chat input selector not found: " + chatInputSelector);
  }
  await input.input(question);

  const sendButton = await chatPage.$(chatSendSelector);
  if (!sendButton || typeof sendButton.tap !== "function") {
    throw new Error("Chat send selector not found: " + chatSendSelector);
  }
  await sendButton.tap();

  let answer = { page: chatPage, data: await safePageData(chatPage), answerText: "" };
  let ok = true;
  let errorMessage = "";
  try {
    answer = await waitForChatAnswer({
      miniProgram,
      extractAnswer,
      timeoutMs,
      pollIntervalMs,
      sleep
    });
  } catch (error) {
    ok = false;
    errorMessage = error && error.message ? error.message : "chat flow failed";
    answer = {
      page: error && error.page ? error.page : await miniProgram.currentPage(),
      data: error && error.data ? error.data : null,
      answerText: ""
    };
  }

  await miniProgram.screenshot({ path: screenshotPath });
  return {
    ok,
    error: errorMessage,
    answerText: answer.answerText,
    screenshotPath,
    finalPage: {
      path: answer.page && answer.page.path ? answer.page.path : "",
      data: answer.data || await safePageData(answer.page)
    }
  };
}

async function runDishDetailChatScenario({
  miniProgram,
  question = DEFAULT_RUNNER_CONFIG.chatQuestion,
  outputDir,
  menuListRoute = DEFAULT_RUNNER_CONFIG.menuListRoute,
  dishCardSelector = DEFAULT_RUNNER_CONFIG.dishCardSelector,
  detailChatSelector = DEFAULT_RUNNER_CONFIG.detailChatSelector,
  detailOpenWaitMs = DEFAULT_RUNNER_CONFIG.detailOpenWaitMs,
  chatInputSelector = DEFAULT_RUNNER_CONFIG.chatInputSelector,
  chatSendSelector = DEFAULT_RUNNER_CONFIG.chatSendSelector,
  chatRoute = DEFAULT_RUNNER_CONFIG.chatRoute,
  chatComposeWaitMs = DEFAULT_RUNNER_CONFIG.chatComposeWaitMs,
  isDetailOpen = DEFAULT_RUNNER_CONFIG.detailIsOpen,
  extractAnswer = DEFAULT_RUNNER_CONFIG.extractAssistantReply,
  timeoutMs = DEFAULT_RUNNER_CONFIG.chatTimeoutMs,
  pollIntervalMs = DEFAULT_RUNNER_CONFIG.pollIntervalMs,
  sleep = defaultSleep
} = {}) {
  ensureDir(outputDir);
  const detailScreenshotPath = path.join(outputDir, "dish-detail.png");
  const chatScreenshotPath = path.join(outputDir, "dish-chat.png");

  const menuPage = await waitForPagePath({
    miniProgram,
    targetPaths: [menuListRoute],
    timeoutMs,
    pollIntervalMs,
    sleep
  });

  const dishCard = await menuPage.$(dishCardSelector);
  if (!dishCard || typeof dishCard.tap !== "function") {
    throw new Error("Dish card selector not found: " + dishCardSelector);
  }
  await dishCard.tap();
  await menuPage.waitFor(detailOpenWaitMs);

  let detailResult = { page: menuPage, data: await safePageData(menuPage) };
  let ok = true;
  let errorMessage = "";

  try {
    detailResult = await waitForDetailSheet({
      miniProgram,
      menuListRoute,
      isDetailOpen,
      timeoutMs,
      pollIntervalMs,
      sleep
    });
  } catch (error) {
    ok = false;
    errorMessage = error && error.message ? error.message : "dish detail flow failed";
    detailResult = {
      page: error && error.page ? error.page : await miniProgram.currentPage(),
      data: error && error.data ? error.data : null
    };
  }

  await miniProgram.screenshot({ path: detailScreenshotPath });
  if (!ok) {
    return {
      ok,
      error: errorMessage,
      detailScreenshotPath,
      chatScreenshotPath: "",
      answerText: "",
      detailPage: {
        path: detailResult.page && detailResult.page.path ? detailResult.page.path : "",
        data: detailResult.data || await safePageData(detailResult.page)
      },
      finalPage: null
    };
  }

  const detailPage = detailResult.page;
  const chatButton = await detailPage.$(detailChatSelector);
  if (!chatButton || typeof chatButton.tap !== "function") {
    throw new Error("Detail chat selector not found: " + detailChatSelector);
  }
  await chatButton.tap();

  const chatPage = await waitForPagePath({
    miniProgram,
    targetPaths: [chatRoute],
    timeoutMs,
    pollIntervalMs,
    sleep
  });

  await chatPage.waitFor(chatComposeWaitMs);
  const input = await chatPage.$(chatInputSelector);
  if (!input || typeof input.input !== "function") {
    throw new Error("Chat input selector not found: " + chatInputSelector);
  }
  await input.input(question);

  const sendButton = await chatPage.$(chatSendSelector);
  if (!sendButton || typeof sendButton.tap !== "function") {
    throw new Error("Chat send selector not found: " + chatSendSelector);
  }
  await sendButton.tap();

  let answer = { page: chatPage, data: await safePageData(chatPage), answerText: "" };
  try {
    answer = await waitForChatAnswer({
      miniProgram,
      extractAnswer,
      timeoutMs,
      pollIntervalMs,
      sleep
    });
  } catch (error) {
    ok = false;
    errorMessage = error && error.message ? error.message : "dish chat flow failed";
    answer = {
      page: error && error.page ? error.page : await miniProgram.currentPage(),
      data: error && error.data ? error.data : null,
      answerText: ""
    };
  }

  await miniProgram.screenshot({ path: chatScreenshotPath });
  return {
    ok,
    error: errorMessage,
    answerText: answer.answerText,
    detailScreenshotPath,
    chatScreenshotPath,
    detailPage: {
      path: detailPage && detailPage.path ? detailPage.path : "",
      data: detailResult.data || await safePageData(detailPage)
    },
    finalPage: {
      path: answer.page && answer.page.path ? answer.page.path : "",
      data: answer.data || await safePageData(answer.page)
    }
  };
}

function loadAutomator() {
  try {
    return require("miniprogram-automator");
  } catch (error) {
    throw new Error(
      "Missing dependency: miniprogram-automator. Run `npm install` in this repository first. " +
        (error && error.message ? error.message : "")
    );
  }
}

function runNodeTool(args, config) {
  const toolPath = path.join(config.rootDir, "lib", "devtools.js");
  const res = spawnSync(process.execPath, [toolPath, ...args], {
    cwd: config.rootDir,
    stdio: "inherit",
    env: process.env
  });
  if (res.status !== 0) {
    throw new Error("Failed running wechat-devtools command: " + args.join(" "));
  }
}

function terminateDevtoolsApp() {
  const attempts = [
    ["osascript", ["-e", 'tell application "wechatdevtools" to quit']],
    ["pkill", ["-f", "/Applications/wechatwebdevtools.app/Contents/MacOS/wechatdevtools"]],
    ["pkill", ["-f", "wechatwebdevtools"]]
  ];

  for (const [command, args] of attempts) {
    try {
      spawnSync(command, args, {
        stdio: "ignore",
        env: process.env
      });
    } catch (_) {
      // ignore cleanup failures
    }
  }

  spawnSync("sh", ["-c", "sleep 2"], {
    stdio: "ignore",
    env: process.env
  });
}

function prepareDevtoolsSession(config, options = {}) {
  const plan = buildDevtoolsPrepPlan(options);
  for (const command of plan) {
    if (command === "quit") {
      terminateDevtoolsApp();
      continue;
    }
    runNodeTool([command], config);
  }
}

async function launchMiniProgram(config) {
  const automator = loadAutomator();
  const port = await findAvailablePort(config.cliPort);
  let cliPath = config.cliPath;
  let args = [];
  if (process.platform === "win32" && /\.bat$/i.test(cliPath || "")) {
    const cliDir = path.dirname(cliPath);
    cliPath = path.join(cliDir, "node.exe");
    args = [path.join(cliDir, "cli.js")];
  }
  const miniProgram = await automator.launch({
    cliPath,
    args,
    projectPath: config.projectPath,
    port,
    timeout: 60000,
    trustProject: true
  });
  return { miniProgram, port };
}

function printUsage() {
  console.log(
    [
      "Usage: node lib/runner.js <command> [options]",
      "",
      "Commands:",
      "  doctor         Check CLI, bridge scripts, automator dependency, and adapter",
      "  run-flow       Execute a generic UI flow described in a local JS module",
      "  parse-album    Tap the upload entry and wait for parse result",
      "  chat-flow      Open menu-level AI chat and send a question",
      "  dish-chat-flow Open the first dish detail, then continue into AI chat",
      "  full-smoke     Run parse, dish-level chat, and menu-level chat in sequence",
      "",
      "Options:",
      "  --project <path>       Target miniprogram project path (default: current working directory)",
      "  --adapter <path>       Adapter module that defines routes, selectors, and hooks",
      "  --port <n>             Override WeChat DevTools automation port",
      "  --flow <path>          JS module that exports { name, steps } for run-flow",
      "  --fixture <path>       Test image for parse-album / full-smoke",
      "  --output-dir <path>    Override evidence base directory",
      "  --question <text>      Override AI question",
      "  --with-build           Run build-npm before launch",
      "  --skip-build           Alias for no build (default)",
      "  --seed-file <path>     Optional JSON file to seed currentMenu before chat-flow",
      "  --no-seed-menu         Disable seeding even if --seed-file is provided"
    ].join("\n")
  );
}

function doctor(config) {
  let automatorInstalled = true;
  try {
    loadAutomator();
  } catch (_) {
    automatorInstalled = false;
  }
  return {
    ok:
      fs.existsSync(config.cliPath) &&
      fs.existsSync(config.projectPath) &&
      fs.existsSync(path.join(config.rootDir, "lib", "bridge", "collector-server.mjs")) &&
      fs.existsSync(path.join(config.rootDir, "lib", "bridge", "watch-devtools-log.mjs")) &&
      automatorInstalled,
    checks: {
      cliPath: config.cliPath,
      cliExists: fs.existsSync(config.cliPath),
      projectPath: config.projectPath,
      projectExists: fs.existsSync(config.projectPath),
      fixtureImagePath: config.fixtureImagePath,
      fixtureExists: !!config.fixtureImagePath && fs.existsSync(config.fixtureImagePath),
      adapterPath: config.adapterPath,
      adapterLoaded: !!config.adapter,
      automatorInstalled
    }
  };
}

async function runParseAlbumCommand(config, options = {}) {
  prepareDevtoolsSession(config, options);
  const outputDir = buildRunOutputDir(config.outputBaseDir, "parse-album", path.basename(config.fixtureImagePath));
  ensureDir(outputDir);
  const fixture = readFixtureFile(config.fixtureImagePath);
  const launched = await launchMiniProgram(config);
  const miniProgram = launched.miniProgram;
  const eventBuffers = attachMiniProgramEventBuffers(miniProgram);
  let result;

  try {
    await ensureHomeReady({
      miniProgram,
      homeRoute: config.homeRoute,
      onboardingSkipSelector: config.onboardingSkipSelector
    });
    result = await runParseAlbumScenario({
      miniProgram,
      fixture,
      outputDir,
      homeRoute: config.homeRoute,
      uploadSelector: config.parseUploadSelector,
      parseWaitMs: config.parseWaitMs,
      targetPath: config.menuListRoute,
      timeoutMs: config.parseTimeoutMs,
      pollIntervalMs: config.pollIntervalMs
    });
  } finally {
    await miniProgram.close().catch(() => {});
  }

  const report = {
    scenario: "parse-album",
    started_at: new Date().toISOString(),
    output_dir: outputDir,
    cli_port_used: launched.port,
    fixture_image: config.fixtureImagePath,
    result,
    console_events: eventBuffers.consoleEvents,
    exception_events: eventBuffers.exceptionEvents
  };
  writeReport(path.join(outputDir, "report.json"), report);
  console.log(JSON.stringify(report, null, 2));
  if (!result.ok) {
    process.exitCode = 1;
  }
}

async function runChatCommand(config, options = {}) {
  prepareDevtoolsSession(config, options);
  const outputDir = buildRunOutputDir(config.outputBaseDir, "chat-flow", slugify(config.chatQuestion));
  ensureDir(outputDir);
  const launched = await launchMiniProgram(config);
  const miniProgram = launched.miniProgram;
  const eventBuffers = attachMiniProgramEventBuffers(miniProgram);
  let result;

  try {
    await ensureHomeReady({
      miniProgram,
      homeRoute: config.homeRoute,
      onboardingSkipSelector: config.onboardingSkipSelector
    });
    result = await runChatScenario({
      miniProgram,
      menu: options.seedMenu === false ? null : options.seedMenu || null,
      question: config.chatQuestion,
      outputDir,
      menuListRoute: config.menuListRoute,
      menuChatSelector: config.menuChatSelector,
      chatInputSelector: config.chatInputSelector,
      chatSendSelector: config.chatSendSelector,
      menuWaitMs: config.chatWaitMs,
      composeWaitMs: config.chatComposeWaitMs,
      chatRoute: config.chatRoute,
      extractAnswer: config.extractAssistantReply,
      timeoutMs: config.chatTimeoutMs,
      pollIntervalMs: config.pollIntervalMs
    });
  } finally {
    await miniProgram.close().catch(() => {});
  }

  const report = {
    scenario: "chat-flow",
    started_at: new Date().toISOString(),
    output_dir: outputDir,
    cli_port_used: launched.port,
    question: config.chatQuestion,
    result,
    console_events: eventBuffers.consoleEvents,
    exception_events: eventBuffers.exceptionEvents
  };
  writeReport(path.join(outputDir, "report.json"), report);
  console.log(JSON.stringify(report, null, 2));
  if (!result.ok) {
    process.exitCode = 1;
  }
}

async function runDishChatCommand(config, options = {}) {
  prepareDevtoolsSession(config, options);
  const outputDir = buildRunOutputDir(config.outputBaseDir, "dish-chat-flow", slugify(config.chatQuestion));
  ensureDir(outputDir);
  const fixture = readFixtureFile(config.fixtureImagePath);
  const launched = await launchMiniProgram(config);
  const miniProgram = launched.miniProgram;
  const eventBuffers = attachMiniProgramEventBuffers(miniProgram);
  let parseResult = null;
  let result = null;

  try {
    await ensureHomeReady({
      miniProgram,
      homeRoute: config.homeRoute,
      onboardingSkipSelector: config.onboardingSkipSelector
    });
    parseResult = await runParseAlbumScenario({
      miniProgram,
      fixture,
      outputDir,
      homeRoute: config.homeRoute,
      uploadSelector: config.parseUploadSelector,
      parseWaitMs: config.parseWaitMs,
      targetPath: config.menuListRoute,
      timeoutMs: config.parseTimeoutMs,
      pollIntervalMs: config.pollIntervalMs
    });

    if (parseResult.ok && parseResult.finalPage.path === config.menuListRoute) {
      result = await runDishDetailChatScenario({
        miniProgram,
        question: config.chatQuestion,
        outputDir,
        menuListRoute: config.menuListRoute,
        dishCardSelector: config.dishCardSelector,
        detailChatSelector: config.detailChatSelector,
        detailOpenWaitMs: config.detailOpenWaitMs,
        chatInputSelector: config.chatInputSelector,
        chatSendSelector: config.chatSendSelector,
        chatRoute: config.chatRoute,
        chatComposeWaitMs: config.chatComposeWaitMs,
        isDetailOpen: config.detailIsOpen,
        extractAnswer: config.extractAssistantReply,
        timeoutMs: config.chatTimeoutMs,
        pollIntervalMs: config.pollIntervalMs
      });
    }
  } finally {
    await miniProgram.close().catch(() => {});
  }

  const report = {
    scenario: "dish-chat-flow",
    started_at: new Date().toISOString(),
    output_dir: outputDir,
    cli_port_used: launched.port,
    fixture_image: config.fixtureImagePath,
    question: config.chatQuestion,
    parse_result: parseResult,
    result,
    console_events: eventBuffers.consoleEvents,
    exception_events: eventBuffers.exceptionEvents
  };
  writeReport(path.join(outputDir, "report.json"), report);
  console.log(JSON.stringify(report, null, 2));
  if (!parseResult || !parseResult.ok || !result || !result.ok) {
    process.exitCode = 1;
  }
}

async function runFullSmokeCommand(config, options = {}) {
  prepareDevtoolsSession(config, options);
  const outputDir = buildRunOutputDir(config.outputBaseDir, "full-smoke", path.basename(config.fixtureImagePath));
  ensureDir(outputDir);
  const fixture = readFixtureFile(config.fixtureImagePath);
  const launched = await launchMiniProgram(config);
  const miniProgram = launched.miniProgram;
  const eventBuffers = attachMiniProgramEventBuffers(miniProgram);
  let parseResult = null;
  let chatResult = null;
  let dishChatResult = null;

  try {
    await ensureHomeReady({
      miniProgram,
      homeRoute: config.homeRoute,
      onboardingSkipSelector: config.onboardingSkipSelector
    });
    parseResult = await runParseAlbumScenario({
      miniProgram,
      fixture,
      outputDir,
      homeRoute: config.homeRoute,
      uploadSelector: config.parseUploadSelector,
      parseWaitMs: config.parseWaitMs,
      targetPath: config.menuListRoute,
      timeoutMs: config.parseTimeoutMs,
      pollIntervalMs: config.pollIntervalMs
    });

    if (parseResult.ok && parseResult.finalPage.path === config.menuListRoute) {
      dishChatResult = await runDishDetailChatScenario({
        miniProgram,
        question: config.chatQuestion,
        outputDir,
        menuListRoute: config.menuListRoute,
        dishCardSelector: config.dishCardSelector,
        detailChatSelector: config.detailChatSelector,
        detailOpenWaitMs: config.detailOpenWaitMs,
        chatInputSelector: config.chatInputSelector,
        chatSendSelector: config.chatSendSelector,
        chatRoute: config.chatRoute,
        chatComposeWaitMs: config.chatComposeWaitMs,
        isDetailOpen: config.detailIsOpen,
        extractAnswer: config.extractAssistantReply,
        timeoutMs: config.chatTimeoutMs,
        pollIntervalMs: config.pollIntervalMs
      });
      chatResult = await runChatScenario({
        miniProgram,
        menu: null,
        question: config.chatQuestion,
        outputDir,
        menuListRoute: config.menuListRoute,
        menuChatSelector: config.menuChatSelector,
        chatInputSelector: config.chatInputSelector,
        chatSendSelector: config.chatSendSelector,
        menuWaitMs: config.chatWaitMs,
        composeWaitMs: config.chatComposeWaitMs,
        chatRoute: config.chatRoute,
        extractAnswer: config.extractAssistantReply,
        timeoutMs: config.chatTimeoutMs,
        pollIntervalMs: config.pollIntervalMs
      });
    }
  } finally {
    await miniProgram.close().catch(() => {});
  }

  const report = {
    scenario: "full-smoke",
    started_at: new Date().toISOString(),
    output_dir: outputDir,
    cli_port_used: launched.port,
    fixture_image: config.fixtureImagePath,
    parse_result: parseResult,
    dish_chat_result: dishChatResult,
    chat_result: chatResult,
    console_events: eventBuffers.consoleEvents,
    exception_events: eventBuffers.exceptionEvents
  };
  writeReport(path.join(outputDir, "report.json"), report);
  console.log(JSON.stringify(report, null, 2));
  if (!parseResult || !parseResult.ok || (dishChatResult && !dishChatResult.ok) || (chatResult && !chatResult.ok)) {
    process.exitCode = 1;
  }
}

async function runFlowCommand(config, options = {}) {
  if (!options.flowPath) {
    throw new Error("run-flow requires --flow <path>");
  }

  prepareDevtoolsSession(config, options);
  const flow = loadFlow(options.flowPath);
  const outputDir = buildRunOutputDir(config.outputBaseDir, "run-flow", flow.name || "flow");
  ensureDir(outputDir);
  const launched = await launchMiniProgram(config);
  const miniProgram = launched.miniProgram;
  const eventBuffers = attachMiniProgramEventBuffers(miniProgram);
  let result = null;

  try {
    result = await executeFlow(miniProgram, config, flow, { outputDir });
  } catch (error) {
    const currentPage = await miniProgram.currentPage().catch(() => null);
    result = {
      ok: false,
      flowName: flow.name || "flow",
      error: error && error.message ? error.message : "run-flow failed",
      currentStep: error && error.currentStep ? error.currentStep : null,
      finalPage: {
        path: currentPage && currentPage.path ? currentPage.path : "",
        data: await safePageData(currentPage)
      },
      observations: {},
      artifacts: {},
      trace: error && Array.isArray(error.flowTrace) ? error.flowTrace : []
    };
  } finally {
    await miniProgram.close().catch(() => {});
  }

  const report = {
    scenario: "run-flow",
    started_at: new Date().toISOString(),
    output_dir: outputDir,
    cli_port_used: launched.port,
    flow_path: path.resolve(options.flowPath),
    fixture_image: config.fixtureImagePath,
    result,
    console_events: eventBuffers.consoleEvents,
    exception_events: eventBuffers.exceptionEvents
  };
  writeReport(path.join(outputDir, "report.json"), report);
  console.log(JSON.stringify(report, null, 2));
  if (!result.ok) {
    process.exitCode = 1;
  }
}

async function main(argv = process.argv.slice(2)) {
  const [command] = argv;
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  const { values } = parseArgs({
    args: argv.slice(1),
    options: {
      project: { type: "string" },
      adapter: { type: "string" },
      port: { type: "string" },
      fixture: { type: "string" },
      "output-dir": { type: "string" },
      flow: { type: "string" },
      question: { type: "string" },
      "with-build": { type: "boolean" },
      "skip-build": { type: "boolean" },
      "seed-file": { type: "string" },
      "no-seed-menu": { type: "boolean" }
    },
    allowPositionals: true,
    strict: false
  });

  let seedMenu = null;
  if (values["seed-file"]) {
    seedMenu = JSON.parse(fs.readFileSync(path.resolve(values["seed-file"]), "utf8"));
  }

  const config = resolveRunnerConfig({
    projectPath: values.project,
    adapterPath: values.adapter,
    cliPort: values.port ? Number(values.port) : undefined,
    fixtureImagePath: values.fixture,
    outputBaseDir: values["output-dir"],
    chatQuestion: values.question
  });

  if (command === "doctor") {
    console.log(JSON.stringify(doctor(config), null, 2));
    return;
  }
  if (command === "run-flow") {
    await runFlowCommand(config, {
      skipBuildNpm: values["with-build"] ? false : true,
      flowPath: values.flow
    });
    return;
  }
  if (command === "parse-album") {
    await runParseAlbumCommand(config, {
      skipBuildNpm: values["with-build"] ? false : true
    });
    return;
  }
  if (command === "chat-flow") {
    await runChatCommand(config, {
      skipBuildNpm: values["with-build"] ? false : true,
      seedMenu: values["no-seed-menu"] ? null : seedMenu
    });
    return;
  }
  if (command === "dish-chat-flow") {
    await runDishChatCommand(config, {
      skipBuildNpm: values["with-build"] ? false : true
    });
    return;
  }
  if (command === "full-smoke") {
    await runFullSmokeCommand(config, {
      skipBuildNpm: values["with-build"] ? false : true
    });
    return;
  }

  throw new Error("Unknown command: " + command);
}

module.exports = {
  DEFAULT_RUNNER_CONFIG,
  resolveRunnerConfig,
  resolveAdapter,
  resolveRouteValue,
  resolveSelectorValue,
  loadFlow,
  buildChooseMediaMock,
  buildDevtoolsPrepPlan,
  findAvailablePort,
  ensureHomeReady,
  waitForPagePath,
  waitForDetailSheet,
  executeFlowStep,
  executeFlow,
  runParseAlbumScenario,
  runChatScenario,
  runDishDetailChatScenario,
  mirrorFixtureToMiniProgram,
  seedCurrentMenu,
  defaultExtractAssistantReply,
  buildRunOutputDir,
  doctor,
  main
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error && error.stack ? error.stack : String(error));
    process.exit(1);
  });
}
