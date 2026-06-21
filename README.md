# 行前晴旅微信小程序

**行前晴旅** 是一个可爱简洁风格的旅行行程助手，副标题为“轻松规划每一次出发”。作品把地点、交通、时间、备忘、账单和行李清单整理在一个旅行计划里，覆盖出发前准备和旅行中的路线调整。

## 功能概览

- 首页：展示上海、杭州、苏州等示例行程，包含倒计时、日期、准备进度和旅行提示。
- 物品清单：按证件、电子产品、衣物、旅行用品、洗漱用品、药品分类统计准备进度。
- 分类详情：支持全部、未打包、已打包筛选，可勾选准备状态，可新增和删除自定义物品。
- 旅行详情：聚合行程路线、交通卡片、旅行备忘、账单预算和行李清单入口。
- 行程计划：展示交通方式、交通时间、交通耗时和当天景点计划。
- 路线编辑：支持时间优先、少换乘、距离优先三种本地推荐策略，并可用上移/下移调整景点顺序，自动重算时间轴。
- 腾讯路线：接入腾讯位置服务 WebService，点击“获取腾讯路线”后优先请求真实路线；接口不可用时自动回退本地推荐。
- 账单页：记录预算和实际花费，统计总预算、已花费、剩余金额和分类金额。
- 地点收藏夹：作为旅行素材库，可将收藏地点一键加入当前行程。
- 模板页：提供商务出行、周末短途、毕业旅行、亲子旅行等旅行模板。
- 我的页面：展示作品说明、完成度统计，并支持清空勾选和恢复初始数据。

## 目录结构

```text
.
├── app.js / app.json / app.wxss
├── pages
│   ├── home
│   ├── checklist
│   ├── category
│   ├── plan
│   ├── detail
│   ├── bills
│   ├── favorites
│   ├── templates
│   ├── profile
│   └── add
├── assets
│   ├── icons
│   ├── illustrations
│   └── tabbar
├── tests
├── tools
├── agent-bridge
├── vendor/miniprogram-agent-bridge
└── 行前晴旅微信小程序项目书.md
```

## 运行方式

1. 使用微信开发者工具导入本目录。
2. AppID 使用 `project.config.json` 中的配置。
3. 本地演示阶段已关闭开发者工具 URL 校验，便于课堂环境调试。
4. 真机预览、体验版或正式发布前，需要在微信公众平台配置 request 合法域名：

```text
https://apis.map.qq.com
```

腾讯位置服务 Key 不提交到公开仓库。仓库只保留 `config/tencent-map.example.js`，本机运行时请复制为 `config/tencent-map.js` 并填写自己的 Key：

```powershell
copy config\tencent-map.example.js config\tencent-map.js
```

## 本地验证

电脑已安装 Node.js 时，可在项目根目录运行：

```powershell
npm run verify
```

该命令会执行：

- `npm run test`：验证新增物品、新增行程、路线排序、账单统计、地点收藏、旅行详情、腾讯地图请求构造、数据重置等核心逻辑。
- `npm run check`：检查小程序 JSON、页面文件、tabBar 图标和 JS/CJS 语法。

如果电脑没有配置 npm，也可以直接运行：

```powershell
node tests/add-flow.test.js
node tools/check-project.js
```

## 自动化联调

项目已下载并配置 `vendor/miniprogram-agent-bridge`，可配合 `agent-bridge` 目录中的流程在微信开发者工具中做冒烟测试。详细说明见：

```text
agent-bridge/README.md
```

## 项目书

课程项目书位于：

```text
行前晴旅微信小程序项目书.md
```

项目书包含项目简介、需求分析、系统设计、功能实现、界面设计、测试说明和项目总结，可直接对应当前小程序功能。
