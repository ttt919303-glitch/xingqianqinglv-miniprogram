const app = getApp();

Page({
  data: {
    detail: null,
    tripId: '',
    transportForm: {
      role: '去程',
      type: '高铁',
      code: '',
      from: '',
      to: '',
      departTime: '',
      arriveTime: '',
      seat: '',
      price: '',
      note: ''
    },
    editingTransportId: ''
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

  openModule(event) {
    const id = event.currentTarget.dataset.id;
    const tripId = this.data.detail.trip.id;
    if (id === 'route') {
      this.openRoute();
      return;
    }
    if (id === 'bill') {
      this.openBills();
      return;
    }
    if (id === 'packing') {
      this.openChecklist();
      return;
    }
    if (id === 'favorite') {
      this.openFavorites();
      return;
    }
    if (id === 'transport' || id === 'memo') {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${tripId}`
      });
    }
  },

  onTransportInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      transportForm: {
        ...this.data.transportForm,
        [field]: event.detail.value
      }
    });
  },

  editTransport(event) {
    const id = event.currentTarget.dataset.id;
    const card = this.data.detail.transportCards.find(item => item.id === id);
    if (!card) {
      return;
    }
    this.setData({
      editingTransportId: id,
      transportForm: {
        role: card.role,
        type: card.type,
        code: card.code,
        from: card.from,
        to: card.to,
        departTime: card.departTime,
        arriveTime: card.arriveTime,
        seat: card.seat,
        price: String(card.price || ''),
        note: card.note || ''
      }
    });
  },

  saveTransport() {
    const form = this.data.transportForm;
    if (!form.code.trim()) {
      wx.showToast({
        title: '请填写班次号',
        icon: 'none'
      });
      return;
    }
    const isGeneratedCard = this.data.editingTransportId === `${this.data.detail.trip.id}-transport-main`;
    if (this.data.editingTransportId && !isGeneratedCard) {
      app.updateTransportCard(this.data.editingTransportId, form);
    } else {
      app.addTransportCard(this.data.detail.trip.id, form);
    }
    this.setData({
      editingTransportId: '',
      transportForm: {
        role: '去程',
        type: '高铁',
        code: '',
        from: '',
        to: '',
        departTime: '',
        arriveTime: '',
        seat: '',
        price: '',
        note: ''
      }
    });
    this.loadDetail();
    wx.showToast({
      title: '交通已保存',
      icon: 'success'
    });
  },

  deleteTransport(event) {
    app.removeTransportCard(event.currentTarget.dataset.id);
    this.loadDetail();
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
