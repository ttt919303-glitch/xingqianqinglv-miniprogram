const app = getApp();

Page({
  data: {
    detail: null,
    tripId: ''
  },

  onLoad(options) {
    this.setData({
      tripId: options.id || 'shanghai'
    });
  },

  onShow() {
    this.loadDetail();
  },

  loadDetail() {
    const detail = app.getTripDetail(this.data.tripId);
    wx.setNavigationBarTitle({
      title: `${detail.trip.city}旅行详情`
    });
    this.setData({
      detail
    });
  },

  openRoute() {
    wx.setStorageSync('selectedTripId', this.data.detail.trip.id);
    wx.switchTab({
      url: '/pages/plan/plan'
    });
  },

  openBills() {
    wx.setStorageSync('selectedTripId', this.data.detail.trip.id);
    wx.switchTab({
      url: '/pages/bills/bills'
    });
  },

  openChecklist() {
    wx.switchTab({
      url: '/pages/checklist/checklist'
    });
  },

  openFavorites() {
    wx.navigateTo({
      url: `/pages/favorites/favorites?id=${this.data.detail.trip.id}`
    });
  },

  addMemo() {
    app.addMemo(this.data.detail.trip.id, {
      content: '确认酒店入住时间',
      category: '入住'
    });
    wx.showToast({
      title: '已加入备忘',
      icon: 'success'
    });
    this.loadDetail();
  }
});
