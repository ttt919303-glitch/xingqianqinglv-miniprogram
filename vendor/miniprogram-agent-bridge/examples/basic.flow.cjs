module.exports = {
  name: "basic-smoke",
  steps: [
    { type: "ensure-home" },
    { type: "observe", name: "home" },
    { type: "mock-choose-media" },
    { type: "tap", selectorKey: "uploadEntry", waitMs: 500 },
    { type: "observe", name: "after-upload-trigger" },
    { type: "relaunch", routeKey: "conversation" },
    { type: "input", selectorKey: "primaryInput", value: "你好" },
    { type: "tap", selectorKey: "primarySubmit" },
    { type: "wait-chat-answer", name: "assistant" },
    { type: "observe", name: "conversation" }
  ]
};
