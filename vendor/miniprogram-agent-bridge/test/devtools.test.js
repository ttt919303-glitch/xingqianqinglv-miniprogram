const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const {
  DEFAULT_CONFIG,
  resolveWechatDevtoolsConfig,
  buildCliInvocation,
  buildBridgeInvocation,
  buildDevSessionPlan,
  patchOptionalCatchBinding
} = require("../lib/devtools");

const PROJECT_PATH = process.cwd();
const OUT_DIR = path.join(PROJECT_PATH, ".wechat-agent", "bridge");
const COLLECTOR_SCRIPT = path.join(PROJECT_PATH, "lib", "bridge", "collector-server.mjs");
const WATCHER_SCRIPT = path.join(PROJECT_PATH, "lib", "bridge", "watch-devtools-log.mjs");

test("resolveWechatDevtoolsConfig applies repository defaults", () => {
  const config = resolveWechatDevtoolsConfig();

  assert.equal(config.projectPath, PROJECT_PATH);
  assert.equal(config.cliPath, "/Applications/wechatwebdevtools.app/Contents/MacOS/cli");
  assert.equal(config.cliPort, 9420);
  assert.equal(config.collectorPort, 17831);
  assert.equal(config.lang, "zh");
  assert.equal(config.outDir, OUT_DIR);
});

test("buildCliInvocation builds official CLI commands with shared project config", () => {
  const config = resolveWechatDevtoolsConfig({ cliPort: 9527 });

  assert.deepEqual(
    buildCliInvocation("open", config),
    {
      command: "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
      args: ["open", "--project", PROJECT_PATH, "--port", "9527", "--lang", "zh"]
    }
  );

  assert.deepEqual(
    buildCliInvocation("build-npm", config),
    {
      command: "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
      args: ["build-npm", "--project", PROJECT_PATH, "--port", "9527", "--lang", "zh"]
    }
  );
});

test("buildCliInvocation appends subcommand-specific arguments", () => {
  const config = resolveWechatDevtoolsConfig();

  assert.deepEqual(
    buildCliInvocation("preview", config, {
      qrFormat: "image",
      qrOutput: "/tmp/wxmp-preview.png",
      infoOutput: "/tmp/wxmp-preview.json"
    }),
    {
      command: DEFAULT_CONFIG.cliPath,
      args: [
        "preview",
        "--project",
        DEFAULT_CONFIG.projectPath,
        "--port",
        "9420",
        "--lang",
        "zh",
        "--qr-format",
        "image",
        "--qr-output",
        "/tmp/wxmp-preview.png",
        "--info-output",
        "/tmp/wxmp-preview.json"
      ]
    }
  );

  assert.deepEqual(
    buildCliInvocation("upload", config, {
      version: "0.1.0",
      desc: "ci upload",
      infoOutput: "/tmp/wxmp-upload.json"
    }),
    {
      command: DEFAULT_CONFIG.cliPath,
      args: [
        "upload",
        "--project",
        DEFAULT_CONFIG.projectPath,
        "--port",
        "9420",
        "--lang",
        "zh",
        "--version",
        "0.1.0",
        "--desc",
        "ci upload",
        "--info-output",
        "/tmp/wxmp-upload.json"
      ]
    }
  );
});

test("buildBridgeInvocation configures collector and watcher environment", () => {
  const config = resolveWechatDevtoolsConfig();

  assert.deepEqual(
    buildBridgeInvocation("collector", config),
    {
      command: process.execPath,
      args: [COLLECTOR_SCRIPT],
      env: {
        WECHAT_COLLECTOR_PORT: "17831",
        WECHAT_CONSOLE_OUTDIR: OUT_DIR
      },
      pidFile: path.join(OUT_DIR, "collector.pid")
    }
  );

  assert.deepEqual(
    buildBridgeInvocation("watcher", config),
    {
      command: process.execPath,
      args: [WATCHER_SCRIPT],
      env: {
        WECHAT_CONSOLE_OUTDIR: OUT_DIR
      },
      pidFile: path.join(OUT_DIR, "watcher.pid")
    }
  );
});

test("buildDevSessionPlan starts bridge processes before opening the project", () => {
  const config = resolveWechatDevtoolsConfig();

  assert.deepEqual(
    buildDevSessionPlan(config),
    [
      {
        type: "bridge",
        name: "collector",
        ...buildBridgeInvocation("collector", config)
      },
      {
        type: "bridge",
        name: "watcher",
        ...buildBridgeInvocation("watcher", config)
      },
      {
        type: "cli",
        name: "open",
        ...buildCliInvocation("open", config)
      }
    ]
  );
});

test("patchOptionalCatchBinding rewrites optional catch binding for WeChat parser compatibility", () => {
  const source = [
    "try {",
    "  wasm = init();",
    "} catch {",
    "  // no wasm support :(",
    "}"
  ].join("\n");

  const patched = patchOptionalCatchBinding(source);

  assert.equal(patched.includes("catch (err) {"), true);
  assert.equal(patched.includes("void err;"), true);
  assert.equal(
    patchOptionalCatchBinding(patched),
    patched
  );
});
