module.exports = {
  name: "xingqianqinglv-add-item-smoke",
  steps: [
    { type: "seed-storage", key: "customItems", value: [], syncGlobalData: false },
    { type: "seed-storage", key: "preferredCategoryId", value: "travel", syncGlobalData: false },
    { type: "relaunch", routeKey: "add", waitMs: 500 },
    { type: "tap", selectorKey: "addItemTab", waitMs: 200 },
    { type: "input", selectorKey: "nameInput", value: "墨镜" },
    { type: "input", selectorKey: "countInput", value: "1" },
    { type: "input", selectorKey: "noteInput", value: "晴天拍照和防晒用" },
    { type: "tap", selectorKey: "saveButton", waitMs: 900 },
    { type: "wait-page", pathKeys: ["category"], timeoutMs: 8000, pollIntervalMs: 500 },
    { type: "observe", name: "category-after-add", screenshot: false }
  ]
};
