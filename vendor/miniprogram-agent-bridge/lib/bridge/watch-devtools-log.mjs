#!/usr/bin/env node
import fs from "fs";
import path from "path";
import os from "os";

const home = os.homedir();
const baseDir = process.env.WECHAT_DEVTOOLS_BASE ||
  path.join(home, "Library", "Application Support", "微信开发者工具");
const outDir = process.env.WECHAT_CONSOLE_OUTDIR ||
  path.join(process.cwd(), "runtime-logs", "wechat-console-bridge");
const pollMs = Number(process.env.WECHAT_POLL_MS || 1200);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listDirsSafe(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
}

function listFilesSafe(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name);
  } catch {
    return [];
  }
}

function mtimeMs(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function pickLatestUserDataDir() {
  const children = listDirsSafe(baseDir);
  let best = null;
  let bestMtime = 0;
  for (const name of children) {
    const candidate = path.join(baseDir, name, "WeappLog");
    const mt = mtimeMs(candidate);
    if (mt > bestMtime) {
      bestMtime = mt;
      best = path.join(baseDir, name);
    }
  }
  return best;
}

function pickLatestLogFile(weappLogDir) {
  const logsDir = path.join(weappLogDir, "logs");
  const files = listFilesSafe(logsDir).filter((f) => f.endsWith(".log"));
  let best = null;
  let bestMtime = 0;
  for (const file of files) {
    const fp = path.join(logsDir, file);
    const mt = mtimeMs(fp);
    if (mt > bestMtime) {
      bestMtime = mt;
      best = fp;
    }
  }
  return best;
}

function classifyLevel(line) {
  const lower = line.toLowerCase();
  if (line.includes("[ERROR]")) return "error";
  if (line.includes("[WARN]")) return "warn";
  if (lower.includes(":error:console(")) return "warn";
  if (lower.includes(":error:")) return "error";
  if (/\bwarn(ing)?\b/i.test(line)) return "warn";
  if (line.includes("invalid app.json rendererOptions.skyline")) return "warn";
  if (line.includes("Skyline 渲染模式")) return "warn";
  if (line.includes("getSystemInfo API")) return "warn";
  return "info";
}

function parseLine(line, sourceFile) {
  return {
    ts: new Date().toISOString(),
    source_file: sourceFile,
    level: classifyLevel(line),
    raw: line
  };
}

function appendJsonl(filePath, obj) {
  fs.appendFileSync(filePath, `${JSON.stringify(obj)}\n`, "utf8");
}

function appendText(filePath, text) {
  fs.appendFileSync(filePath, `${text}\n`, "utf8");
}

function watchFile(filePath, sink) {
  let position = 0;
  let inode = null;

  function readNew() {
    try {
      const st = fs.statSync(filePath);
      if (inode !== st.ino) {
        inode = st.ino;
        position = 0;
      }
      if (st.size < position) position = 0;
      if (st.size === position) return;
      const fd = fs.openSync(filePath, "r");
      const len = st.size - position;
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, position);
      fs.closeSync(fd);
      position = st.size;
      sink(buf.toString("utf8"));
    } catch {
      // ignore transient read errors
    }
  }

  readNew();
  const t = setInterval(readNew, pollMs);
  return () => clearInterval(t);
}

function main() {
  ensureDir(outDir);
  const logJsonl = path.join(outDir, "devtools-stream.jsonl");
  const errTxt = path.join(outDir, "devtools-errors.log");
  const warnTxt = path.join(outDir, "devtools-warnings.log");
  const issueTxt = path.join(outDir, "devtools-issues.log");
  const statusTxt = path.join(outDir, "watch-status.txt");

  const userDataDir = pickLatestUserDataDir();
  if (!userDataDir) {
    console.error(`No WeChat DevTools userdata found under: ${baseDir}`);
    process.exit(1);
  }
  const weappLogDir = path.join(userDataDir, "WeappLog");
  const latestMainLog = pickLatestLogFile(weappLogDir);
  const stderrLog = path.join(weappLogDir, "stderr.log");

  if (!latestMainLog) {
    console.error(`No main log file found under: ${path.join(weappLogDir, "logs")}`);
    process.exit(1);
  }

  const watchFiles = [latestMainLog];
  if (fs.existsSync(stderrLog)) watchFiles.push(stderrLog);

  appendText(
    statusTxt,
    `[${new Date().toISOString()}] watching files:\n${watchFiles.map((p) => `- ${p}`).join("\n")}\n`
  );
  console.log("watching:");
  for (const f of watchFiles) console.log(`- ${f}`);
  console.log(`output: ${logJsonl}`);

  const disposers = watchFiles.map((fp) =>
    watchFile(fp, (chunk) => {
      const lines = chunk.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const row = parseLine(line, fp);
        appendJsonl(logJsonl, row);
        if (row.level === "error") appendText(errTxt, line);
        if (row.level === "warn") appendText(warnTxt, line);
        if (row.level === "warn" || row.level === "error") appendText(issueTxt, line);
      }
    })
  );

  process.on("SIGINT", () => {
    disposers.forEach((fn) => fn());
    console.log("\nstopped.");
    process.exit(0);
  });
}

main();
