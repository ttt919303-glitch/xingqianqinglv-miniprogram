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
    date: '',
    placeName: '',
    payment: '',
    participants: '1',
    payer: '',
    members: '',
    note: '',
    editingBillId: '',
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

  onDateInput(event) {
    this.setData({ date: event.detail.value });
  },

  onPlaceInput(event) {
    this.setData({ placeName: event.detail.value });
  },

  onPaymentInput(event) {
    this.setData({ payment: event.detail.value });
  },

  onParticipantsInput(event) {
    this.setData({ participants: event.detail.value });
  },

  onPayerInput(event) {
    this.setData({ payer: event.detail.value });
  },

  onMembersInput(event) {
    this.setData({ members: event.detail.value });
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value });
  },

  onCategoryChange(event) {
    this.setData({ categoryIndex: Number(event.detail.value) });
  },

  onTypeChange(event) {
    this.setData({ typeIndex: Number(event.detail.value) });
  },

  saveBill() {
    if (!this.data.title.trim() || !Number(this.data.amount)) {
      wx.showToast({
        title: '请填写账单和金额',
        icon: 'none'
      });
      return;
    }
    const payload = {
      title: this.data.title,
      amount: this.data.amount,
      category: this.data.categories[this.data.categoryIndex],
      type: this.data.typeIndex === 1 ? 'budget' : 'actual',
      date: this.data.date,
      placeName: this.data.placeName,
      payment: this.data.payment,
      participants: this.data.participants,
      payer: this.data.payer,
      members: this.data.members,
      note: this.data.note
    };
    if (this.data.editingBillId) {
      app.updateBill(this.data.editingBillId, payload);
    } else {
      app.addBill(this.data.selectedTripId, payload);
    }
    this.setData({
      title: '',
      amount: '',
      date: '',
      placeName: '',
      payment: '',
      participants: '1',
      payer: '',
      members: '',
      note: '',
      editingBillId: ''
    });
    this.refresh();
    wx.showToast({
      title: '已保存',
      icon: 'success'
    });
  },

  addBill() {
    this.saveBill();
  },

  editBill(event) {
    const bill = this.data.summary.bills.find(item => item.id === event.currentTarget.dataset.id);
    if (!bill) {
      return;
    }
    this.setData({
      editingBillId: bill.id,
      title: bill.title,
      amount: String(bill.amount),
      date: bill.date || '',
      placeName: bill.placeName || '',
      payment: bill.payment || '',
      participants: String(bill.participants || 1),
      payer: bill.payer || '',
      members: (bill.members || []).join('、'),
      note: bill.note || '',
      categoryIndex: Math.max(0, this.data.categories.indexOf(bill.category)),
      typeIndex: bill.type === 'budget' ? 1 : 0
    });
  },

  deleteBill(event) {
    app.removeBill(event.currentTarget.dataset.id);
    this.refresh();
    wx.showToast({
      title: '已删除',
      icon: 'success'
    });
  }
});
