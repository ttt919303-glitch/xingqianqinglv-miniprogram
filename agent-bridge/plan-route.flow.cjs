module.exports = {
  name: "xingqianqinglv-plan-route-smoke",
  steps: [
    { type: "relaunch", route: "/pages/plan/plan?id=shanghai", waitMs: 500 },
    { type: "tap", selectorKey: "tencentRouteButton", waitMs: 2500 },
    { type: "observe", name: "plan-route", screenshot: false }
  ]
};
