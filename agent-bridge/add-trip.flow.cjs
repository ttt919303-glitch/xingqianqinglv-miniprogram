module.exports = {
  name: "xingqianqinglv-add-trip-smoke",
  steps: [
    { type: "seed-storage", key: "customTrips", value: [], syncGlobalData: false },
    { type: "relaunch", routeKey: "add", waitMs: 500 },
    { type: "tap", selectorKey: "addTripTab", waitMs: 200 },
    { type: "input", selectorKey: "nameInput", value: "南京" },
    { type: "input", selectorKey: "dateInput", value: "8月5日 - 8月6日" },
    { type: "input", selectorKey: "trafficInput", value: "高铁 G12" },
    { type: "input", selectorKey: "trafficTimeInput", value: "08:00 - 09:30" },
    { type: "input", selectorKey: "durationInput", value: "1小时30分" },
    { type: "input", selectorKey: "attractionsInput", value: "09:30 夫子庙 - 上午先逛秦淮河\n14:00 中山陵 - 下午避开人流" },
    { type: "input", selectorKey: "noteInput", value: "带好学生证，提前查看天气" },
    { type: "tap", selectorKey: "saveButton", waitMs: 900 },
    { type: "wait-page", pathKeys: ["home"], timeoutMs: 8000, pollIntervalMs: 500 },
    { type: "observe", name: "home-after-add-trip", screenshot: false }
  ]
};
