module.exports = {
  name: "basic-miniapp",
  routes: {
    home: "/pages/index/index",
    conversation: "/pages/chat/index"
  },
  selectors: {
    uploadEntry: ".action-secondary",
    primaryInput: ".chat-input",
    primarySubmit: ".chat-send",
    onboardingSkip: ".ob-skip"
  },
  waits: {
    launch: 1200,
    compose: 800
  },
  extractAssistantReply(pageData) {
    const messages = Array.isArray(pageData && pageData.messages) ? pageData.messages : [];
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const item = messages[i] || {};
      if (item.role === "ai") {
        return String(item.text || item.html || "").replace(/<[^>]+>/g, "").trim();
      }
    }
    return "";
  }
};
