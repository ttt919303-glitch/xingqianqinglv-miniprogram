# 行前晴旅 Agent Bridge 使用说明

本目录用于配合 `vendor/miniprogram-agent-bridge` 做微信小程序自动化联调，主要验证新增物品、新增行程、页面跳转和页面 data 是否符合预期。

## 工具位置

仓库已下载到：

```text
vendor/miniprogram-agent-bridge
```

本机微信开发者工具已确认路径为：

```text
F:\微信小程序\微信web开发者工具\cli.bat
```

运行前在 PowerShell 中设置环境变量：

```powershell
$env:WECHAT_DEVTOOLS_CLI="F:\微信小程序\微信web开发者工具\cli.bat"
```

本机已登录微信开发者工具，项目 AppID 使用 `project.config.json` 中的 `wx954db165ba44ad61`。首次执行自动化时，如果开发者工具提示开启服务端口，选择同意即可。

项目已接入腾讯位置服务 WebService。若要在真机或正式环境中请求真实路线，需要在微信公众平台小程序后台配置 request 合法域名：

```text
https://apis.map.qq.com
```

如果接口请求失败，行程计划页会回退到本地路线推荐，不影响基础展示和课程验收。

为了便于本机课堂演示，`project.config.json` 和 `project.private.config.json` 已关闭开发者工具本地 URL 校验。上传、真机预览或正式发布时仍以微信公众平台后台的 request 合法域名配置为准。

## 安装依赖

```powershell
cd vendor\miniprogram-agent-bridge
pnpm install
```

当前工具依赖 `miniprogram-automator@0.12.1`。

## 环境检查

```powershell
npx wxmp-runner doctor `
  --project "F:\微信小程序\微信小程序作业" `
  --adapter "F:\微信小程序\微信小程序作业\agent-bridge\xingqianqinglv.adapter.cjs"
```

## 冒烟流程

新增物品流程：

```powershell
npx wxmp-runner run-flow `
  --project "F:\微信小程序\微信小程序作业" `
  --adapter "F:\微信小程序\微信小程序作业\agent-bridge\xingqianqinglv.adapter.cjs" `
  --flow "F:\微信小程序\微信小程序作业\agent-bridge\add-item.flow.cjs" `
  --port 9432
```

新增行程流程：

```powershell
npx wxmp-runner run-flow `
  --project "F:\微信小程序\微信小程序作业" `
  --adapter "F:\微信小程序\微信小程序作业\agent-bridge\xingqianqinglv.adapter.cjs" `
  --flow "F:\微信小程序\微信小程序作业\agent-bridge\add-trip.flow.cjs" `
  --port 9431
```

行程路线推荐流程：

```powershell
npx wxmp-runner run-flow `
  --project "F:\微信小程序\微信小程序作业" `
  --adapter "F:\微信小程序\微信小程序作业\agent-bridge\xingqianqinglv.adapter.cjs" `
  --flow "F:\微信小程序\微信小程序作业\agent-bridge\plan-route.flow.cjs" `
  --port 9436
```

运行结果会输出到：

```text
.wechat-agent/runs
```

其中包含 `report.json`、页面 data、console/exception 事件。当前 Windows + 微信开发者工具版本下，`miniprogram-automator` 的截图接口可能长时间不返回，因此本项目冒烟流程默认关闭截图，只采集页面 data 作为验收证据。
