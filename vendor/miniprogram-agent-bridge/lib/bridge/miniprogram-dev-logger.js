function postToCollector(payload) {
  return new Promise((resolve) => {
    wx.request({
      url: "http://127.0.0.1:17831/collect",
      method: "POST",
      data: payload,
      timeout: 1200,
      success: () => resolve(true),
      fail: () => resolve(false)
    });
  });
}

function stringifyArgs(args) {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a);
      } catch {
        return String(a);
      }
    })
    .join(" ");
}

function installMiniProgramDevLogger() {
  const rawConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  ["log", "info", "warn", "error"].forEach((level) => {
    console[level] = (...args) => {
      rawConsole[level].apply(console, args);
      const message = stringifyArgs(args);
      postToCollector({
        level,
        message,
        page: getCurrentPages()?.slice(-1)?.[0]?.route || ""
      });
    };
  });

  wx.onError((err) => {
    postToCollector({
      level: "error",
      message: err,
      category: "wx.onError",
      page: getCurrentPages()?.slice(-1)?.[0]?.route || ""
    });
  });

  wx.onUnhandledRejection((res) => {
    postToCollector({
      level: "error",
      message: stringifyArgs([res.reason || "UnhandledRejection"]),
      category: "wx.onUnhandledRejection",
      page: getCurrentPages()?.slice(-1)?.[0]?.route || ""
    });
  });
}

module.exports = {
  installMiniProgramDevLogger
};
