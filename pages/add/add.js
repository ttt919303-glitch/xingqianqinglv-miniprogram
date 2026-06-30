const app = getApp();

Page({
  data: {
    type: 'trip',
    name: '',
    date: '',
    startDate: '',
    endDate: '',
    note: '',
    traffic: '',
    trafficTime: '',
    duration: '',
    attractionsText: '',
    importedSpots: [],
    poiMatching: false,
    poiMatchStatus: '',
    count: 1,
    categories: [],
    categoryIndex: 3,
    selectedCategoryName: '旅行用品'
  },

  onLoad() {
    this.loadCategories();
  },

  onShow() {
    this.applyPreferredCategory();
  },

  loadCategories() {
    const categories = app.getCategories().map(item => ({
      id: item.id,
      name: item.name
    }));
    this.setData({
      categories,
      selectedCategoryName: categories[3] ? categories[3].name : categories[0].name
    });
    this.applyPreferredCategory();
  },

  switchType(event) {
    this.setData({
      type: event.currentTarget.dataset.type
    });
  },

  onNameInput(event) {
    this.setData({ name: event.detail.value });
  },

  onDateInput(event) {
    this.setData({ date: event.detail.value });
  },

  onStartDateInput(event) {
    this.setData({ startDate: event.detail.value });
  },

  onEndDateInput(event) {
    this.setData({ endDate: event.detail.value });
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value });
  },

  onTrafficInput(event) {
    this.setData({ traffic: event.detail.value });
  },

  onTrafficTimeInput(event) {
    this.setData({ trafficTime: event.detail.value });
  },

  onDurationInput(event) {
    this.setData({ duration: event.detail.value });
  },

  onAttractionsInput(event) {
    const attractionsText = event.detail.value;
    this.setData({
      attractionsText,
      importedSpots: app.parseAttractions(attractionsText),
      poiMatchStatus: ''
    });
  },

  async matchImportedPois() {
    const spots = this.data.importedSpots;
    if (!spots.length) {
      wx.showToast({
        title: '请先导入地点',
        icon: 'none'
      });
      return;
    }

    this.setData({
      poiMatching: true,
      poiMatchStatus: '正在匹配地图坐标'
    });

    let matchedCount = 0;
    const matchedSpots = [];
    for (const spot of spots) {
      let nextSpot = spot;
      try {
        const pois = await app.searchTencentPois(spot.name, this.data.name);
        const matched = app.matchAttractionsWithPois([spot], pois)[0];
        if (matched && matched.lat && matched.lng) {
          nextSpot = matched;
          matchedCount += 1;
        }
      } catch (error) {
        nextSpot = spot;
      }
      matchedSpots.push(nextSpot);
    }

    this.setData({
      importedSpots: matchedSpots,
      poiMatching: false,
      poiMatchStatus: matchedCount ? `已匹配 ${matchedCount} 个地点坐标` : '暂未匹配到坐标，可直接保存'
    });
    wx.showToast({
      title: matchedCount ? '匹配完成' : '暂无坐标',
      icon: 'none'
    });
  },

  onCountInput(event) {
    this.setData({ count: event.detail.value });
  },

  applyPreferredCategory() {
    if (!this.data.categories.length) {
      return;
    }
    const preferredCategoryId = wx.getStorageSync('preferredCategoryId');
    const preferredIndex = this.data.categories.findIndex(item => item.id === preferredCategoryId);
    if (preferredIndex >= 0) {
      this.setData({
        type: 'item',
        categoryIndex: preferredIndex,
        selectedCategoryName: this.data.categories[preferredIndex].name
      });
    }
  },

  onCategoryChange(event) {
    const categoryIndex = Number(event.detail.value);
    this.setData({
      categoryIndex,
      selectedCategoryName: this.data.categories[categoryIndex].name
    });
  },

  saveDraft() {
    if (!this.data.name.trim()) {
      wx.showToast({
        title: this.data.type === 'trip' ? '请填写目的地' : '请填写物品名称',
        icon: 'none'
      });
      return;
    }

    let targetCategoryId = '';

    if (this.data.type === 'trip') {
      app.addTrip({
        city: this.data.name,
        dateRange: this.data.date,
        startDate: this.data.startDate,
        endDate: this.data.endDate,
        note: this.data.note,
        traffic: this.data.traffic,
        trafficTime: this.data.trafficTime,
        duration: this.data.duration,
        attractionsText: this.data.attractionsText,
        attractions: this.data.importedSpots
      });
    } else {
      const category = this.data.categories[this.data.categoryIndex];
      targetCategoryId = category.id;
      app.addItem({
        categoryId: category.id,
        name: this.data.name,
        count: this.data.count,
        note: this.data.note
      });
    }

    wx.showToast({
      title: '已保存',
      icon: 'success'
    });
    this.setData({
      name: '',
      date: '',
      startDate: '',
      endDate: '',
      note: '',
      traffic: '',
      trafficTime: '',
      duration: '',
      attractionsText: '',
      importedSpots: [],
      poiMatching: false,
      poiMatchStatus: '',
      count: 1
    });

    if (this.data.type === 'trip') {
      wx.switchTab({
        url: '/pages/home/home'
      });
      return;
    }

    wx.switchTab({
      url: '/pages/checklist/checklist',
      success() {
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/category/category?id=${targetCategoryId}`
          });
        }, 80);
      }
    });
  }
});
