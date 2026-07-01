const app = getApp();

Page({
  data: {
    detail: null,
    tripId: '',
    selectedDayIndex: 0,
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
    editingTransportId: '',
    memoCategories: app.getMemoCategories(),
    memoForm: {
      content: '',
      category: '出发前',
      date: '',
      remindTime: '',
      placeName: '',
      transportId: ''
    },
    editingMemoId: ''
  },

  onLoad(options) {
    this.setData({
      tripId: options.id || 'shanghai',
      selectedDayIndex: Number(wx.getStorageSync('selectedTripDayIndex') || 0)
    });
  },

  onShow() {
    this.loadDetail();
  },

  loadDetail() {
    const detail = app.getTripDetail(this.data.tripId, this.data.selectedDayIndex);
    wx.setNavigationBarTitle({
      title: `${detail.trip.city}旅行详情`
    });
    this.setData({
      detail,
      selectedDayIndex: detail.selectedDayIndex
    });
  },

  openRoute() {
    wx.setStorageSync('selectedTripId', this.data.detail.trip.id);
    wx.setStorageSync('selectedTripDayIndex', this.data.selectedDayIndex);
    wx.switchTab({
      url: '/pages/plan/plan'
    });
  },

  chooseDay(event) {
    const selectedDayIndex = Number(event.currentTarget.dataset.index);
    wx.setStorageSync('selectedTripDayIndex', selectedDayIndex);
    this.setData({ selectedDayIndex });
    this.loadDetail();
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

  onMemoInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      memoForm: {
        ...this.data.memoForm,
        [field]: event.detail.value
      }
    });
  },

  chooseMemoCategory(event) {
    this.setData({
      memoForm: {
        ...this.data.memoForm,
        category: event.currentTarget.dataset.category
      }
    });
  },

  saveMemo() {
    const form = this.data.memoForm;
    if (!form.content.trim()) {
      wx.showToast({
        title: '请填写待办内容',
        icon: 'none'
      });
      return;
    }
    if (this.data.editingMemoId) {
      app.updateMemo(this.data.editingMemoId, form);
    } else {
      app.addMemo(this.data.detail.trip.id, form);
    }
    this.setData({
      editingMemoId: '',
      memoForm: {
        content: '',
        category: '出发前',
        date: '',
        remindTime: '',
        placeName: '',
        transportId: ''
      }
    });
    wx.showToast({
      title: '待办已保存',
      icon: 'success'
    });
    this.loadDetail();
  },

  addMemo() {
    this.saveMemo();
  },

  editMemo(event) {
    const id = event.currentTarget.dataset.id;
    const memo = this.data.detail.memoSummary.memos.find(item => item.id === id);
    if (!memo) {
      return;
    }
    this.setData({
      editingMemoId: id,
      memoForm: {
        content: memo.content,
        category: memo.category,
        date: memo.date || '',
        remindTime: memo.remindTime || '',
        placeName: memo.placeName || '',
        transportId: memo.transportId || ''
      }
    });
  },

  toggleMemo(event) {
    app.toggleMemoDone(event.currentTarget.dataset.id);
    this.loadDetail();
  },

  deleteMemo(event) {
    app.removeMemo(event.currentTarget.dataset.id);
    this.loadDetail();
  },

  addMemoToCalendar(event) {
    app.scheduleMemoReminder(this.data.detail.trip.id, event.currentTarget.dataset.id)
      .then(result => {
        const success = result.channel === 'subscribe' || result.channel === 'calendar';
        wx.showToast({
          title: success ? '提醒已设置' : '当前环境不支持提醒',
          icon: success ? 'success' : 'none'
        });
      });
  }
});
