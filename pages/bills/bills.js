const app = getApp();

Page({
  data: {
    trips: [],
    selectedTripId: '',
    summary: {
      budgetTotal: 0,
      actualTotal: 0,
      leftBudget: 0,
      categories: [],
      bills: []
    },
    title: '',
    amount: '',
    categoryIndex: 0,
    typeIndex: 0,
    categories: ['交通', '住宿', '餐饮', '门票', '购物', '其他'],
    types: ['实际花费', '预算']
  },

  onLoad(options) {
    const trips = app.getTrips();
    this.setData({
      trips,
      selectedTripId: options.id || wx.getStorageSync('selectedTripId') || (trips[0] && trips[0].id) || ''
    });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    if (!this.data.selectedTripId) {
      return;
    }
    this.setData({
      summary: app.getBillSummary(this.data.selectedTripId)
    });
  },

  chooseTrip(event) {
    wx.setStorageSync('selectedTripId', event.currentTarget.dataset.id);
    this.setData({
      selectedTripId: event.currentTarget.dataset.id
    });
    this.refresh();
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onAmountInput(event) {
    this.setData({ amount: event.detail.value });
  },

  onCategoryChange(event) {
    this.setData({ categoryIndex: Number(event.detail.value) });
  },

  onTypeChange(event) {
    this.setData({ typeIndex: Number(event.detail.value) });
  },

  addBill() {
    if (!this.data.title.trim() || !Number(this.data.amount)) {
      wx.showToast({
        title: '请填写账单和金额',
        icon: 'none'
      });
      return;
    }
    app.addBill(this.data.selectedTripId, {
      title: this.data.title,
      amount: this.data.amount,
      category: this.data.categories[this.data.categoryIndex],
      type: this.data.typeIndex === 1 ? 'budget' : 'actual'
    });
    this.setData({
      title: '',
      amount: ''
    });
    this.refresh();
    wx.showToast({
      title: '已记录',
      icon: 'success'
    });
  }
});
