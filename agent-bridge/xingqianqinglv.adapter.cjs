module.exports = {
  name: "xingqianqinglv",
  routes: {
    home: "/pages/home/home",
    checklist: "/pages/checklist/checklist",
    add: "/pages/add/add",
    category: "/pages/category/category",
    plan: "/pages/plan/plan",
    templates: "/pages/templates/templates",
    profile: "/pages/profile/profile"
  },
  selectors: {
    addItemTab: ".qa-add-item-tab",
    addTripTab: ".qa-add-trip-tab",
    nameInput: ".qa-name-input",
    dateInput: ".qa-date-input",
    countInput: ".qa-count-input",
    noteInput: ".qa-note-input",
    trafficInput: ".qa-traffic-input",
    trafficTimeInput: ".qa-traffic-time-input",
    durationInput: ".qa-duration-input",
    attractionsInput: ".qa-attractions-input",
    saveButton: ".qa-save-button",
    tencentRouteButton: ".qa-tencent-route-button",
    categoryCard: ".qa-category-card",
    itemCard: ".qa-item-card",
    floatAdd: ".qa-float-add"
  },
  waits: {
    launch: 800,
    compose: 500
  },
  extractAssistantReply() {
    return "";
  }
};
