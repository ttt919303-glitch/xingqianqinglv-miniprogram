const app = getApp();

Page({
  data: {
    trips: [],
    current: 0,
    progress: {},
    tip: ''
  },

  onShow() {
    const progress = app.getOverallProgress();
    const trips = app.getTrips().map(item => ({
      ...item,
      percent: Math.round((item.packed / item.total) * 100)
    }));
    this.setData({
      trips,
      progress,
      tip: trips[0] ? trips[0].tip : ''
    });
  },

  onTripChange(event) {
    const current = event.detail.current;
    const trip = this.data.trips[current];
    this.setData({
      current,
      tip: trip.tip
    });
  },

  openPlan(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/plan/plan?id=${id}`
    });
  },

  goChecklist() {
    wx.switchTab({
      url: '/pages/checklist/checklist'
    });
  }
});
