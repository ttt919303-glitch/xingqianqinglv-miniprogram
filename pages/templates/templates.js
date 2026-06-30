const app = getApp();

Page({
  data: {
    templates: [],
    trips: [],
    selectedTripId: '',
    selectedTripName: '',
    lastResultText: ''
  },

  onLoad() {
    this.loadPage();
  },

  onShow() {
    this.loadPage();
  },

  loadPage() {
    const trips = app.getTrips();
    const selectedTripId = this.data.selectedTripId || (trips[0] && trips[0].id) || '';
    this.setData({
      trips,
      selectedTripId,
      selectedTripName: this.getTripName(trips, selectedTripId),
      templates: this.buildTemplates()
    });
  },

  buildTemplates() {
    const packs = app.getTripTemplatePacks();
    return app.globalData.templates.map(template => {
      const pack = packs.find(item => item.id === template.id);
      return {
        ...template,
        summary: pack ? [
          `${pack.items.length} 件物品`,
          `${pack.memos.length} 条备忘`,
          `${pack.bills.length} 条预算`,
          `${pack.places.length} 个地点`
        ] : []
      };
    });
  },

  getTripName(trips, tripId) {
    const trip = trips.find(item => item.id === tripId);
    return trip ? trip.city : '当前行程';
  },

  chooseTrip(event) {
    const selectedTripId = event.currentTarget.dataset.id;
    this.setData({
      selectedTripId,
      selectedTripName: this.getTripName(this.data.trips, selectedTripId),
      lastResultText: ''
    });
  },

  useTemplate(event) {
    const id = event.currentTarget.dataset.id;
    const result = app.applyTripTemplate(id, this.data.selectedTripId);
    const templateName = result.template ? result.template.name : '旅行模板';
    const resultText = this.formatResultText(templateName, result);
    this.setData({ lastResultText: resultText });
    wx.showToast({
      title: result.totalAdded ? `新增${result.totalAdded}项` : '内容已存在',
      icon: result.totalAdded ? 'success' : 'none'
    });
  },

  formatResultText(templateName, result) {
    const parts = [
      `清单 ${result.items.added}`,
      `备忘 ${result.memos.added}`,
      `预算 ${result.bills.added}`,
      `地点 ${result.places.added}`
    ];
    return `${templateName}已套用到${this.data.selectedTripName}：${parts.join(' · ')}`;
  }
});
