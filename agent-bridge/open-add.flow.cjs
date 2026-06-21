module.exports = {
  name: "xingqianqinglv-open-add-smoke",
  steps: [
    { type: "relaunch", routeKey: "add", waitMs: 500 },
    { type: "read-current-page" }
  ]
};
