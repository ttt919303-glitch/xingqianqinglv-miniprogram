const app = getApp();

Page({
  data: {
    categories: [],
    progress: {},
    packingLibraries: [],
    weatherLibraries: []
  },

  onShow() {
    const categories = app.getCategories().map(category => {
      const progress = app.getCategoryProgress(category);
      return { ...category, ...progress };
    });
    this.setData({
      categories,
      progress: app.getOverallProgress(),
      packingLibraries: app.getPackingLibraries(),
      weatherLibraries: app.getWeatherPackingLibraries()
    });
  },

  openCategory(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/category/category?id=${id}`
    });
  },

  packAll() {
    const ids = app.getAllItems().map(item => item.id);
    app.setPackedIds(ids);
    wx.showToast({
      title: '已全部打包',
      icon: 'success'
    });
    this.onShow();
  },

  unpackAll() {
    wx.showModal({
      title: '重新整理',
      content: '确认清空所有已打包状态吗？',
      success: result => {
        if (result.confirm) {
          app.unpackAll();
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
          this.onShow();
        }
      }
    });
  },

  applyLibrary(event) {
    const result = app.applyPackingLibrary(event.currentTarget.dataset.id);
    wx.showToast({
      title: result.added ? `已加入${result.added}项` : '已在清单中',
      icon: 'none'
    });
    this.onShow();
  },

  applyWeatherLibrary(event) {
    const result = app.applyWeatherPacking(event.currentTarget.dataset.id);
    wx.showToast({
      title: result.added ? `已补充${result.added}项` : '已在清单中',
      icon: 'none'
    });
    this.onShow();
  }
});
