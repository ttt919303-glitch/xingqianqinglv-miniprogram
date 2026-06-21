#!/usr/bin/env node
import http from "http";
import fs from "fs";
import path from "path";

const port = Number(process.env.WECHAT_COLLECTOR_PORT || 17831);
const outDir = process.env.WECHAT_CONSOLE_OUTDIR ||
  path.join(process.cwd(), "runtime-logs", "wechat-console-bridge");
const outJsonl = path.join(outDir, "runtime-client.jsonl");
const outErr = path.join(outDir, "runtime-client-errors.log");
const outWarn = path.join(outDir, "runtime-client-warnings.log");
const outIssue = path.join(outDir, "runtime-client-issues.log");

fs.mkdirSync(outDir, { recursive: true });

function write(obj) {
  fs.appendFileSync(outJsonl, `${JSON.stringify(obj)}\n`, "utf8");
  const level = (obj.level || "").toLowerCase();
  if (level === "error") {
    fs.appendFileSync(outErr, `${obj.ts} ${obj.message || obj.raw || ""}\n`, "utf8");
  }
  if (level === "warn") {
    fs.appendFileSync(outWarn, `${obj.ts} ${obj.message || obj.raw || ""}\n`, "utf8");
  }
  if (level === "warn" || level === "error") {
    fs.appendFileSync(outIssue, `${obj.ts} [${level}] ${obj.message || obj.raw || ""}\n`, "utf8");
  }
}

function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    json(res, 200, { ok: true, port });
    return;
  }

  if (req.method === "POST" && req.url === "/collect") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(raw || "{}");
        const row = {
          ts: new Date().toISOString(),
          source: "miniprogram-runtime",
          ...data
        };
        write(row);
        json(res, 200, { ok: true });
      } catch (e) {
        json(res, 400, { ok: false, error: String(e) });
      }
    });
    return;
  }

  json(res, 404, { ok: false, error: "not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`collector listening at http://127.0.0.1:${port}/collect`);
  console.log(`output: ${outJsonl}`);
});
