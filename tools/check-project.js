const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const excludedDirs = new Set([
  '.git',
  '.agents',
  '.devtools-local',
  '.pnpm-store',
  '.wechat-agent',
  'node_modules',
  'vendor'
]);

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function assertFile(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`缺少文件：${relativePath}`);
  }
}

function walk(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, result);
    } else {
      result.push(fullPath);
    }
  }
  return result;
}

function checkJsonFiles() {
  ['app.json', 'project.config.json', 'project.private.config.json', 'sitemap.json'].forEach(readJson);
}

function checkMiniProgramStructure() {
  const appJson = readJson('app.json');
  appJson.pages.forEach(page => {
    ['js', 'json', 'wxml', 'wxss'].forEach(ext => assertFile(`${page}.${ext}`));
  });
  appJson.tabBar.list.forEach(item => {
    assertFile(item.iconPath);
    assertFile(item.selectedIconPath);
  });
}

function checkJavaScriptSyntax() {
  const files = walk(root).filter(file => file.endsWith('.js') || file.endsWith('.cjs'));
  files.forEach(file => {
    childProcess.execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  });
  return files.length;
}

try {
  checkJsonFiles();
  checkMiniProgramStructure();
  const jsCount = checkJavaScriptSyntax();
  console.log(`项目结构检查通过：JSON 4 个，JS/CJS ${jsCount} 个。`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
