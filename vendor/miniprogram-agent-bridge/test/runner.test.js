const test = require("node:test");
const assert = require("node:assert/strict");
const net = require("node:net");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const {
  DEFAULT_RUNNER_CONFIG,
  resolveRunnerConfig,
  resolveRouteValue,
  resolveSelectorValue,
  buildChooseMediaMock,
  buildDevtoolsPrepPlan,
  findAvailablePort,
  ensureHomeReady,
  waitForPagePath,
  waitForDetailSheet,
  executeFlow,
  runParseAlbumScenario,
  runChatScenario,
  runDishDetailChatScenario
} = require("../lib/runner");

const PROJECT_PATH = process.cwd();
const OUTPUT_BASE_DIR = path.join(PROJECT_PATH, ".wechat-agent", "runs");

test("resolveRunnerConfig applies repository defaults", () => {
  const config = resolveRunnerConfig();

  assert.equal(config.projectPath, PROJECT_PATH);
  assert.equal(config.cliPath, "/Applications/wechatwebdevtools.app/Contents/MacOS/cli");
  assert.equal(config.cliPort, 9420);
  assert.equal(config.fixtureImagePath, "");
  assert.equal(config.outputBaseDir, OUTPUT_BASE_DIR);
  assert.equal(config.parseUploadSelector, ".action-secondary");
  assert.equal(config.menuChatSelector, ".ai-cta");
});

test("buildChooseMediaMock mirrors wx.chooseMedia success payload", () => {
  assert.deepEqual(
    buildChooseMediaMock({
      tempFilePath: "http://usr/runner-picked-image.png",
      size: 2048
    }),
    {
      tempFiles: [
        {
          tempFilePath: "http://usr/runner-picked-image.png",
          size: 2048,
          fileType: "image"
        }
      ],
      type: "image"
    }
  );
});

test("buildDevtoolsPrepPlan quits stale IDE sessions before starting bridge and build", () => {
  assert.deepEqual(
    buildDevtoolsPrepPlan(),
    ["quit", "start-collector", "start-watcher", "build-npm"]
  );

  assert.deepEqual(
    buildDevtoolsPrepPlan({ skipBuildNpm: true }),
    ["quit", "start-collector", "start-watcher"]
  );
});

test("findAvailablePort falls back when the preferred DevTools port is already occupied", async () => {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const occupiedPort = server.address().port;
  const resolvedPort = await findAvailablePort(occupiedPort);

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  assert.equal(typeof resolvedPort, "number");
  assert.notEqual(resolvedPort, occupiedPort);
  assert.ok(resolvedPort > 0);
});

test("waitForPagePath polls until one of the expected routes appears", async () => {
  const seen = [];
  const sequence = [
    { path: "pages/loading/index" },
    { path: "pages/loading/index" },
    { path: "pages/menu-list/index" }
  ];

  const result = await waitForPagePath({
    miniProgram: {
      currentPage: async () => {
        const next = sequence.shift() || { path: "pages/menu-list/index" };
        seen.push(next.path);
        return next;
      }
    },
    targetPaths: ["pages/menu-list/index"],
    timeoutMs: 100,
    pollIntervalMs: 1,
    sleep: async () => {}
  });

  assert.equal(result.path, "pages/menu-list/index");
  assert.deepEqual(seen, [
    "pages/loading/index",
    "pages/loading/index",
    "pages/menu-list/index"
  ]);
});

test("ensureHomeReady waits through splash and skips onboarding into the real home page", async () => {
  const calls = [];
  const state = { step: 0 };
  const onboardingPage = {
    path: "pages/onboarding/index",
    $: async (selector) => {
      calls.push(["onboardingSelect", selector]);
      if (selector !== ".ob-skip") return null;
      return {
        tap: async () => {
          calls.push("skipTap");
          state.step = 1;
        }
      };
    }
  };

  const result = await ensureHomeReady({
    miniProgram: {
      currentPage: async () => {
        if (state.step === 0) {
          state.step = -1;
          calls.push(["currentPage", "pages/splash/index"]);
          return { path: "pages/splash/index" };
        }
        if (state.step === -1) {
          calls.push(["currentPage", "pages/onboarding/index"]);
          return onboardingPage;
        }
        calls.push(["currentPage", "pages/index/index"]);
        return { path: "pages/index/index" };
      }
    },
    sleep: async (ms) => {
      calls.push(["sleep", ms]);
    }
  });

  assert.equal(result.path, "pages/index/index");
  assert.deepEqual(calls, [
    ["currentPage", "pages/splash/index"],
    ["sleep", 1200],
    ["currentPage", "pages/onboarding/index"],
    ["onboardingSelect", ".ob-skip"],
    "skipTap",
    ["sleep", 1200],
    ["currentPage", "pages/index/index"]
  ]);
});

test("runParseAlbumScenario mirrors the fixture, taps album upload, and captures final screenshot", async () => {
  const calls = [];
  const albumButton = {
    tap: async () => {
      calls.push("albumTap");
    }
  };
  const homePage = {
    waitFor: async (ms) => {
      calls.push(["homeWaitFor", ms]);
    },
    $: async (selector) => {
      calls.push(["homeSelect", selector]);
      return selector === ".action-secondary" ? albumButton : null;
    }
  };
  const currentPages = [
    { path: "pages/loading/index" },
    { path: "pages/menu-list/index" }
  ];
  const miniProgram = {
    evaluate: async (fn, base64, extension) => {
      calls.push(["evaluate", typeof fn, base64, extension]);
      return "http://usr/runner-picked-image.png";
    },
    mockWxMethod: async (name, payload) => {
      calls.push(["mockWxMethod", name, payload]);
    },
    reLaunch: async (route) => {
      calls.push(["reLaunch", route]);
      return homePage;
    },
    currentPage: async () => {
      const next = currentPages.shift() || { path: "pages/menu-list/index" };
      calls.push(["currentPage", next.path]);
      return next;
    },
    screenshot: async ({ path }) => {
      calls.push(["screenshot", path]);
      return path;
    }
  };

  const result = await runParseAlbumScenario({
    miniProgram,
    fixture: {
      base64: "Zm9v",
      extension: ".png",
      size: 1234,
      sourcePath: "/tmp/source.png"
    },
    outputDir: "/tmp/wechat-mini-runner-parse",
    sleep: async () => {},
    timeoutMs: 100,
    pollIntervalMs: 1
  });

  assert.equal(result.ok, true);
  assert.equal(result.finalPage.path, "pages/menu-list/index");
  assert.equal(result.screenshotPath, "/tmp/wechat-mini-runner-parse/parse-album.png");
  assert.deepEqual(calls, [
    ["evaluate", "function", "Zm9v", ".png"],
    [
      "mockWxMethod",
      "chooseMedia",
      {
        tempFiles: [
          {
            tempFilePath: "http://usr/runner-picked-image.png",
            size: 1234,
            fileType: "image"
          }
        ],
        type: "image"
      }
    ],
    ["reLaunch", "/pages/index/index"],
    ["homeWaitFor", 1200],
    ["homeSelect", ".action-secondary"],
    "albumTap",
    ["currentPage", "pages/loading/index"],
    ["currentPage", "pages/menu-list/index"],
    ["screenshot", "/tmp/wechat-mini-runner-parse/parse-album.png"]
  ]);
});

test("runChatScenario opens AI chat from the menu list, sends a question, and waits for an answer", async () => {
  const calls = [];
  const state = {
    stage: "menu"
  };

  const menuChatButton = {
    tap: async () => {
      calls.push("menuChatTap");
      state.stage = "chat";
    }
  };
  const inputEl = {
    input: async (value) => {
      calls.push(["input", value]);
    }
  };
  const sendEl = {
    tap: async () => {
      calls.push("sendTap");
    }
  };
  const menuPage = {
    waitFor: async (ms) => {
      calls.push(["menuWaitFor", ms]);
    },
    $: async (selector) => {
      calls.push(["menuSelect", selector]);
      return selector === ".ai-cta" ? menuChatButton : null;
    }
  };
  const chatPage = {
    waitFor: async (ms) => {
      calls.push(["chatWaitFor", ms]);
    },
    $: async (selector) => {
      calls.push(["chatSelect", selector]);
      if (selector === ".chat-input") return inputEl;
      if (selector === ".chat-send") return sendEl;
      return null;
    },
    data: async () => {
      return {
        loading: false,
        messages: [
          { role: "ai", text: "你好" },
          { role: "user", text: "这道菜怎么点比较正宗？" },
          { role: "ai", text: "可以这样点" }
        ]
      };
    }
  };

  const miniProgram = {
    evaluate: async (fn, menu) => {
      calls.push(["seedMenu", typeof fn, menu.menu_id, menu.dishes.length]);
      return true;
    },
    reLaunch: async (route) => {
      calls.push(["reLaunch", route]);
      return menuPage;
    },
    currentPage: async () => {
      const path = state.stage === "chat" ? "pages/chat/index" : "pages/menu-list/index";
      calls.push(["currentPage", path]);
      if (path === "pages/chat/index") {
        return {
          path,
          waitFor: chatPage.waitFor,
          $: chatPage.$,
          data: chatPage.data
        };
      }
      return {
        path,
        waitFor: menuPage.waitFor,
        $: menuPage.$
      };
    },
    screenshot: async ({ path }) => {
      calls.push(["screenshot", path]);
      return path;
    }
  };

  const seededMenu = {
    menu_id: "m_seeded",
    dishes: [{ dish_id: "d_1", chinese_name: "凯撒沙拉" }]
  };

  const result = await runChatScenario({
    miniProgram,
    menu: seededMenu,
    question: "这道菜怎么点比较正宗？",
    outputDir: "/tmp/wechat-mini-runner-chat",
    sleep: async () => {},
    timeoutMs: 100,
    pollIntervalMs: 1
  });

  assert.equal(result.ok, true);
  assert.equal(result.finalPage.path, "pages/chat/index");
  assert.equal(result.answerText, "可以这样点");
  assert.equal(result.screenshotPath, "/tmp/wechat-mini-runner-chat/chat-flow.png");
  assert.deepEqual(calls, [
    ["seedMenu", "function", "m_seeded", 1],
    ["reLaunch", "/pages/menu-list/index"],
    ["menuWaitFor", 1200],
    ["menuSelect", ".ai-cta"],
    "menuChatTap",
    ["currentPage", "pages/chat/index"],
    ["chatWaitFor", 800],
    ["chatSelect", ".chat-input"],
    ["input", "这道菜怎么点比较正宗？"],
    ["chatSelect", ".chat-send"],
    "sendTap",
    ["currentPage", "pages/chat/index"],
    ["screenshot", "/tmp/wechat-mini-runner-chat/chat-flow.png"]
  ]);
});

test("waitForDetailSheet waits until menu list detail sheet is open with a current dish", async () => {
  const seen = [];
  const menuPage = {
    path: "pages/menu-list/index",
    data: async () => ({
      showDetail: true,
      currentDish: {
        dish_id: "d_001",
        chinese_name: "Caesar"
      }
    })
  };

  const result = await waitForDetailSheet({
    miniProgram: {
      currentPage: async () => {
        seen.push("pages/menu-list/index");
        return menuPage;
      }
    },
    timeoutMs: 100,
    pollIntervalMs: 1,
    sleep: async () => {}
  });

  assert.equal(result.page.path, "pages/menu-list/index");
  assert.equal(result.data.currentDish.dish_id, "d_001");
  assert.deepEqual(seen, ["pages/menu-list/index"]);
});

test("runDishDetailChatScenario opens the first dish detail and continues into AI chat", async () => {
  const calls = [];
  const state = {
    stage: "menu"
  };

  const dishCard = {
    tap: async () => {
      calls.push("dishCardTap");
      state.stage = "detail";
    }
  };
  const detailChatButton = {
    tap: async () => {
      calls.push("detailChatTap");
      state.stage = "chat";
    }
  };
  const inputEl = {
    input: async (value) => {
      calls.push(["chatInput", value]);
      state.question = value;
    }
  };
  const sendButton = {
    tap: async () => {
      calls.push("chatSendTap");
      state.stage = "answered";
    }
  };

  const menuPage = {
    path: "pages/menu-list/index",
    waitFor: async (ms) => {
      calls.push(["menuWaitFor", ms]);
    },
    $: async (selector) => {
      calls.push(["menuSelect", selector, state.stage]);
      if (selector === ".dish-card") return dishCard;
      if (selector === ".dh-cta" && state.stage === "detail") return detailChatButton;
      return null;
    },
    data: async () => {
      if (state.stage === "detail") {
        return {
          showDetail: true,
          currentDish: {
            dish_id: "d_001",
            chinese_name: "Caesar",
            price: "$11.25"
          }
        };
      }
      return { showDetail: false, currentDish: null };
    }
  };

  const chatPage = {
    path: "pages/chat/index",
    waitFor: async (ms) => {
      calls.push(["chatWaitFor", ms]);
    },
    $: async (selector) => {
      calls.push(["chatSelect", selector]);
      if (selector === ".chat-input") return inputEl;
      if (selector === ".chat-send") return sendButton;
      return null;
    },
    data: async () => ({
      loading: false,
      messages: [
        { role: "ai", text: "你好，我可以帮你解释这份菜单、根据口味推荐，或者解答点单时的困惑。" },
        { role: "user", text: state.question || "" },
        { role: "ai", text: "建议先点基础版，再按口味考虑加鸡肉。" }
      ]
    })
  };

  const miniProgram = {
    currentPage: async () => {
      if (state.stage === "chat" || state.stage === "answered") {
        return chatPage;
      }
      return menuPage;
    },
    screenshot: async ({ path }) => {
      calls.push(["screenshot", path]);
      return path;
    }
  };

  const result = await runDishDetailChatScenario({
    miniProgram,
    question: "这道菜怎么点比较正宗？",
    outputDir: "/tmp/wechat-mini-runner-dish-chat",
    timeoutMs: 100,
    pollIntervalMs: 1,
    sleep: async () => {}
  });

  assert.equal(result.ok, true);
  assert.equal(result.answerText, "建议先点基础版，再按口味考虑加鸡肉。");
  assert.equal(result.detailPage.path, "pages/menu-list/index");
  assert.equal(result.detailPage.data.currentDish.dish_id, "d_001");
  assert.equal(result.finalPage.path, "pages/chat/index");
  assert.equal(result.detailScreenshotPath, "/tmp/wechat-mini-runner-dish-chat/dish-detail.png");
  assert.equal(result.chatScreenshotPath, "/tmp/wechat-mini-runner-dish-chat/dish-chat.png");
  assert.deepEqual(calls, [
    ["menuSelect", ".dish-card", "menu"],
    "dishCardTap",
    ["menuWaitFor", 800],
    ["screenshot", "/tmp/wechat-mini-runner-dish-chat/dish-detail.png"],
    ["menuSelect", ".dh-cta", "detail"],
    "detailChatTap",
    ["chatWaitFor", 800],
    ["chatSelect", ".chat-input"],
    ["chatInput", "这道菜怎么点比较正宗？"],
    ["chatSelect", ".chat-send"],
    "chatSendTap",
    ["screenshot", "/tmp/wechat-mini-runner-dish-chat/dish-chat.png"]
  ]);
});

test("resolveRouteValue and resolveSelectorValue support adapter keys and literals", () => {
  const config = resolveRunnerConfig();

  assert.equal(resolveRouteValue(config, "home"), "/pages/index/index");
  assert.equal(resolveRouteValue(config, "/pages/custom/index"), "/pages/custom/index");
  assert.equal(resolveSelectorValue(config, "upload"), ".action-secondary");
  assert.equal(resolveSelectorValue(config, ".custom-selector"), ".custom-selector");
});

test("executeFlow runs generic tap, input, upload, observe, and screenshot steps", async () => {
  const calls = [];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "wxmp-flow-"));
  const fixturePath = path.join(tempDir, "fixture.png");
  fs.writeFileSync(fixturePath, "fixture");

  const uploadButton = {
    tap: async () => {
      calls.push("uploadTap");
    }
  };
  const inputEl = {
    input: async (value) => {
      calls.push(["input", value]);
    }
  };
  const sendEl = {
    tap: async () => {
      calls.push("sendTap");
    }
  };

  const page = {
    path: "pages/demo/index",
    $: async (selector) => {
      calls.push(["select", selector]);
      if (selector === ".action-secondary") return uploadButton;
      if (selector === ".chat-input") return inputEl;
      if (selector === ".chat-send") return sendEl;
      return null;
    },
    data: async () => ({
      loading: false,
      title: "demo",
      messages: [{ role: "ai", text: "done" }]
    })
  };

  const miniProgram = {
    reLaunch: async (route) => {
      calls.push(["reLaunch", route]);
      return page;
    },
    currentPage: async () => page,
    evaluate: async (fn, ...args) => {
      calls.push(["evaluate", typeof fn, ...args.map((arg) => (typeof arg === "string" ? arg : typeof arg))]);
      return "http://usr/fixture.png";
    },
    mockWxMethod: async (name, payload) => {
      calls.push(["mockWxMethod", name, payload.type]);
    },
    screenshot: async ({ path: screenshotPath }) => {
      calls.push(["screenshot", path.basename(screenshotPath)]);
      return screenshotPath;
    }
  };

  const result = await executeFlow(
    miniProgram,
    resolveRunnerConfig({ fixtureImagePath: fixturePath }),
    {
      name: "generic-demo",
      steps: [
        { type: "relaunch", route: "/pages/demo/index" },
        { type: "mock-choose-media" },
        { type: "tap", selectorKey: "upload" },
        { type: "input", selector: ".chat-input", value: "hello" },
        { type: "tap", selector: ".chat-send" },
        { type: "observe", name: "after-send" },
        { type: "screenshot", name: "final-screen" },
        { type: "read-current-page" }
      ]
    },
    { outputDir: tempDir }
  );

  assert.equal(result.ok, true);
  assert.equal(result.finalPage.path, "pages/demo/index");
  assert.equal(result.observations["after-send"].path, "pages/demo/index");
  assert.ok(result.observations["after-send"].screenshotPath.endsWith("after-send.png"));
  assert.ok(result.artifacts["final-screen"].endsWith("final-screen.png"));
  assert.equal(result.trace.length, 8);
  assert.deepEqual(calls, [
    ["reLaunch", "/pages/demo/index"],
    ["evaluate", "function", "Zml4dHVyZQ==", ".png"],
    ["mockWxMethod", "chooseMedia", "image"],
    ["select", ".action-secondary"],
    "uploadTap",
    ["select", ".chat-input"],
    ["input", "hello"],
    ["select", ".chat-send"],
    "sendTap",
    ["screenshot", "after-send.png"],
    ["screenshot", "final-screen.png"]
  ]);
});
