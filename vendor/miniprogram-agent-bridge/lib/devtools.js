#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { parseArgs } = require("node:util");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_PROJECT_PATH = process.cwd();
const DEFAULT_OUTDIR = path.join(DEFAULT_PROJECT_PATH, ".wechat-agent", "bridge");
const DEFAULT_CONFIG = {
  rootDir: ROOT_DIR,
  projectPath: DEFAULT_PROJECT_PATH,
  cliPath: "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
  cliPort: 9420,
  collectorPort: 17831,
  lang: "zh",
  outDir: DEFAULT_OUTDIR,
  bridgeDir: path.join(ROOT_DIR, "lib", "bridge"),
  collectorScript: path.join(ROOT_DIR, "lib", "bridge", "collector-server.mjs"),
  watcherScript: path.join(ROOT_DIR, "lib", "bridge", "watch-devtools-log.mjs")
};

const CLI_COMMANDS = new Set([
  "open",
  "build-npm",
  "preview",
  "upload",
  "auto",
  "close",
  "quit"
]);

function patchOptionalCatchBinding(source) {
  const text = String(source || "");
  return text.replace(/^(\s*\})\s*catch\s*\{\s*$/gm, (_, prefix) => `${prefix} catch (err) {\n${prefix.replace(/\}$/, "  ")}void err;`);
}

function findWeChatCompatTargets(projectPath) {
  const cloudfunctionsRoot = path.join(projectPath, "cloudfunctions");
  let children = [];
  try {
    children = fs.readdirSync(cloudfunctionsRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  const targets = [];
  for (const entry of children) {
    if (!entry.isDirectory()) continue;
    targets.push(path.join(cloudfunctionsRoot, entry.name, "node_modules", "long", "index.js"));
    targets.push(path.join(cloudfunctionsRoot, entry.name, "node_modules", "long", "umd", "index.js"));
  }
  return targets.filter((filePath) => fs.existsSync(filePath));
}

function applyWeChatCompatPatches(config) {
  const targets = findWeChatCompatTargets(config.projectPath);
  let patched = 0;

  for (const filePath of targets) {
    const source = fs.readFileSync(filePath, "utf8");
    const next = patchOptionalCatchBinding(source);
    if (next !== source) {
      fs.writeFileSync(filePath, next, "utf8");
      patched += 1;
    }
  }

  return { patched, targets };
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveWechatDevtoolsConfig(overrides = {}) {
  const projectPath = path.resolve(overrides.projectPath || process.env.WECHAT_MINIPROGRAM_PROJECT || DEFAULT_CONFIG.projectPath);
  const cliPort = Number(overrides.cliPort || process.env.WECHAT_IDE_PORT || DEFAULT_CONFIG.cliPort);
  const collectorPort = Number(
    overrides.collectorPort || process.env.WECHAT_COLLECTOR_PORT || DEFAULT_CONFIG.collectorPort
  );
  const rootDir = overrides.rootDir || DEFAULT_CONFIG.rootDir;
  const outDir =
    path.resolve(
      overrides.outDir ||
        process.env.WECHAT_CONSOLE_OUTDIR ||
        path.join(projectPath, ".wechat-agent", "bridge")
    );

  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    rootDir,
    projectPath,
    cliPath: overrides.cliPath || process.env.WECHAT_DEVTOOLS_CLI || DEFAULT_CONFIG.cliPath,
    cliPort,
    collectorPort,
    lang: overrides.lang || DEFAULT_CONFIG.lang,
    outDir,
    bridgeDir: overrides.bridgeDir || DEFAULT_CONFIG.bridgeDir,
    collectorScript: overrides.collectorScript || DEFAULT_CONFIG.collectorScript,
    watcherScript: overrides.watcherScript || DEFAULT_CONFIG.watcherScript
  };
}

function pushFlag(args, flag, value) {
  if (value === undefined || value === null || value === "") return;
  args.push(flag, String(value));
}

function buildCliInvocation(action, config, options = {}) {
  if (!CLI_COMMANDS.has(action)) {
    throw new Error(`Unsupported CLI action: ${action}`);
  }

  const args = [
    action,
    "--project",
    config.projectPath,
    "--port",
    String(config.cliPort),
    "--lang",
    config.lang
  ];

  if (options.debug) args.push("--debug");
  if (options.disableGpu) args.push("--disable-gpu");

  if (action === "preview") {
    pushFlag(args, "--qr-format", options.qrFormat);
    pushFlag(args, "--qr-output", options.qrOutput);
    pushFlag(args, "--info-output", options.infoOutput);
  }

  if (action === "upload") {
    pushFlag(args, "--version", options.version);
    pushFlag(args, "--desc", options.desc);
    pushFlag(args, "--info-output", options.infoOutput);
  }

  if (action === "auto") {
    if (options.trustProject) args.push("--trust-project");
    pushFlag(args, "--ticket", options.ticket);
    pushFlag(args, "--test-ticket", options.testTicket);
  }

  if (action === "build-npm") {
    pushFlag(args, "--compile-type", options.compileType);
  }

  return {
    command: config.cliPath,
    args
  };
}

function buildBridgeInvocation(name, config) {
  if (name === "collector") {
    return {
      command: process.execPath,
      args: [config.collectorScript],
      env: {
        WECHAT_COLLECTOR_PORT: String(config.collectorPort),
        WECHAT_CONSOLE_OUTDIR: config.outDir
      },
      pidFile: path.join(config.outDir, "collector.pid")
    };
  }

  if (name === "watcher") {
    return {
      command: process.execPath,
      args: [config.watcherScript],
      env: {
        WECHAT_CONSOLE_OUTDIR: config.outDir
      },
      pidFile: path.join(config.outDir, "watcher.pid")
    };
  }

  throw new Error(`Unsupported bridge action: ${name}`);
}

function buildDevSessionPlan(config) {
  return [
    { type: "bridge", name: "collector", ...buildBridgeInvocation("collector", config) },
    { type: "bridge", name: "watcher", ...buildBridgeInvocation("watcher", config) },
    { type: "cli", name: "open", ...buildCliInvocation("open", config) }
  ];
}

function readPid(pidFile) {
  try {
    const pid = Number(fs.readFileSync(pidFile, "utf8").trim());
    return Number.isFinite(pid) && pid > 0 ? pid : 0;
  } catch {
    return 0;
  }
}

function isProcessRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function startDetachedProcess(name, invocation, config) {
  ensureDir(config.outDir);
  ensureDir(path.dirname(invocation.pidFile));

  const existingPid = readPid(invocation.pidFile);
  if (isProcessRunning(existingPid)) {
    return { ok: true, name, pid: existingPid, alreadyRunning: true };
  }

  const stdoutPath = path.join(config.outDir, `${name}.stdout.log`);
  const stderrPath = path.join(config.outDir, `${name}.stderr.log`);
  const stdoutFd = fs.openSync(stdoutPath, "a");
  const stderrFd = fs.openSync(stderrPath, "a");

  const child = spawn(invocation.command, invocation.args, {
    cwd: config.rootDir,
    env: {
      ...process.env,
      ...invocation.env
    },
    detached: true,
    stdio: ["ignore", stdoutFd, stderrFd]
  });

  child.unref();
  fs.writeFileSync(invocation.pidFile, `${child.pid}\n`, "utf8");
  return { ok: true, name, pid: child.pid, alreadyRunning: false };
}

function stopDetachedProcess(name, invocation) {
  const pid = readPid(invocation.pidFile);
  if (!isProcessRunning(pid)) {
    return { ok: true, name, pid: 0, alreadyStopped: true };
  }
  process.kill(pid, "SIGTERM");
  return { ok: true, name, pid, alreadyStopped: false };
}

function runForeground(command, args, config, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: config.rootDir,
      env: {
        ...process.env,
        ...extraEnv
      },
      stdio: "inherit"
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed (${code}): ${command} ${args.join(" ")}`));
    });
  });
}

function getStatus(config) {
  const collector = buildBridgeInvocation("collector", config);
  const watcher = buildBridgeInvocation("watcher", config);
  return {
    collector: {
      pid: readPid(collector.pidFile),
      running: isProcessRunning(readPid(collector.pidFile)),
      pidFile: collector.pidFile
    },
    watcher: {
      pid: readPid(watcher.pidFile),
      running: isProcessRunning(readPid(watcher.pidFile)),
      pidFile: watcher.pidFile
    },
    outDir: config.outDir
  };
}

function doctor(config) {
  const checks = {
    cliExists: fs.existsSync(config.cliPath),
    projectExists: fs.existsSync(config.projectPath),
    collectorExists: fs.existsSync(config.collectorScript),
    watcherExists: fs.existsSync(config.watcherScript),
    outDir: config.outDir
  };
  return {
    ok: checks.cliExists && checks.projectExists && checks.collectorExists && checks.watcherExists,
    checks
  };
}

function printUsage() {
  console.log(
    [
      "Usage: node lib/devtools.js <command> [options]",
      "",
      "Commands:",
      "  doctor             Check official CLI / project / bridge scripts",
      "  open               Open WeChat DevTools project",
      "  build-npm          Build miniapp npm",
      "  preview            Preview miniapp",
      "  upload             Upload miniapp (--version --desc required)",
      "  auto               Enable automation",
      "  close              Close current project",
      "  quit               Quit WeChat DevTools",
      "  start-collector    Start runtime collector in background",
      "  stop-collector     Stop runtime collector",
      "  start-watcher      Start DevTools log watcher in background",
      "  stop-watcher       Stop DevTools log watcher",
      "  dev                Start collector + watcher, then open project",
      "  status             Show bridge process status",
      "",
      "Shared options:",
      "  --project <path>   Target miniprogram project path (default: current working directory)",
      "  --port <number>    Override WeChat DevTools HTTP port",
      "  --lang <zh|en>     Override CLI language",
      "  --out-dir <path>   Override bridge log output directory"
    ].join("\n")
  );
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
      port: { type: "string" },
      lang: { type: "string" },
      "out-dir": { type: "string" },
      version: { type: "string" },
      desc: { type: "string" },
      "qr-format": { type: "string" },
      "qr-output": { type: "string" },
      "info-output": { type: "string" },
      "compile-type": { type: "string" },
      ticket: { type: "string" },
      "test-ticket": { type: "string" },
      "trust-project": { type: "boolean" },
      debug: { type: "boolean" },
      "disable-gpu": { type: "boolean" }
    },
    strict: false,
    allowPositionals: true
  });

  const config = resolveWechatDevtoolsConfig({
    projectPath: values.project,
    cliPort: values.port ? Number(values.port) : undefined,
    lang: values.lang,
    outDir: values["out-dir"]
  });

  if (command === "doctor") {
    console.log(JSON.stringify(doctor(config), null, 2));
    return;
  }

  if (command === "status") {
    console.log(JSON.stringify(getStatus(config), null, 2));
    return;
  }

  if (command === "start-collector") {
    console.log(JSON.stringify(startDetachedProcess("collector", buildBridgeInvocation("collector", config), config), null, 2));
    return;
  }

  if (command === "stop-collector") {
    console.log(JSON.stringify(stopDetachedProcess("collector", buildBridgeInvocation("collector", config)), null, 2));
    return;
  }

  if (command === "start-watcher") {
    console.log(JSON.stringify(startDetachedProcess("watcher", buildBridgeInvocation("watcher", config), config), null, 2));
    return;
  }

  if (command === "stop-watcher") {
    console.log(JSON.stringify(stopDetachedProcess("watcher", buildBridgeInvocation("watcher", config)), null, 2));
    return;
  }

  if (command === "dev") {
    const plan = buildDevSessionPlan(config);
    const collector = plan[0];
    const watcher = plan[1];
    const open = plan[2];
    console.log(JSON.stringify(startDetachedProcess("collector", collector, config), null, 2));
    console.log(JSON.stringify(startDetachedProcess("watcher", watcher, config), null, 2));
    await runForeground(open.command, open.args, config);
    return;
  }

  if (CLI_COMMANDS.has(command)) {
    if (command === "upload" && (!values.version || !values.desc)) {
      throw new Error("upload requires --version and --desc");
    }
    if (command === "build-npm") {
      const compat = applyWeChatCompatPatches(config);
      if (compat.patched > 0) {
        console.log(`[wechat-devtools] applied ${compat.patched} WeChat parser compatibility patches`);
      }
    }
    const invocation = buildCliInvocation(command, config, {
      version: values.version,
      desc: values.desc,
      qrFormat: values["qr-format"],
      qrOutput: values["qr-output"],
      infoOutput: values["info-output"],
      compileType: values["compile-type"],
      ticket: values.ticket,
      testTicket: values["test-ticket"],
      trustProject: values["trust-project"],
      debug: values.debug,
      disableGpu: values["disable-gpu"]
    });
    await runForeground(invocation.command, invocation.args, config);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

module.exports = {
  DEFAULT_CONFIG,
  resolveWechatDevtoolsConfig,
  buildCliInvocation,
  buildBridgeInvocation,
  buildDevSessionPlan,
  patchOptionalCatchBinding,
  applyWeChatCompatPatches,
  doctor,
  getStatus,
  main
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error && error.stack ? error.stack : String(error));
    process.exit(1);
  });
}
