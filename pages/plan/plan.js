const app = getApp();

Page({
  data: {
    trips: [],
    trip: null,
    selectedId: 'shanghai',
    dayTabs: [],
    selectedDayIndex: 0,
    strategies: app.getRouteStrategies(),
    strategyId: 'time',
    routePlan: {
      strategyName: '时间优先',
      totalText: '约0分钟',
      transitMinutes: 0,
      transferCount: 0
    },
    routeSummary: '',
    routeSteps: [],
    routeSpots: [],
    timeline: {
      items: [],
      summary: '',
      conflicts: []
    },
    mapPreview: {
      latitude: 31.2304,
      longitude: 121.4737,
      scale: 12,
      markers: [],
      polyline: []
    },
    activeMapSpot: null,
    editMode: false,
    draggingSpotIndex: -1,
    editingSpotIndex: -1,
    spotForm: {
      time: '09:00',
      name: '',
      note: '',
      area: '',
      stayMinutes: '80',
      bestPeriod: '灵活',
      address: '',
      lat: '',
      lng: ''
    },
    spotPoiResults: [],
    routeSource: 'local',
    routeLoading: false,
    routeError: '',
    assistantResultText: ''
  },

  onLoad(options) {
    const selectedId = options.id || wx.getStorageSync('selectedTripId') || 'shanghai';
    const selectedDayIndex = Number(wx.getStorageSync('selectedTripDayIndex') || 0);
    this.setTrip(selectedId, selectedDayIndex);
  },

  onShow() {
    const selectedId = wx.getStorageSync('selectedTripId');
    if (selectedId && selectedId !== this.data.selectedId) {
      this.setTrip(selectedId, Number(wx.getStorageSync('selectedTripDayIndex') || 0));
    }
  },

  setTrip(id, dayIndex = this.data.selectedDayIndex) {
    const trips = app.getTrips();
    const rawTrip = trips.find(item => item.id === id) || trips[0];
    const dayTabs = app.getTripDays(rawTrip);
    const selectedDayIndex = Math.min(Math.max(Number(dayIndex) || 0, 0), dayTabs.length - 1);
    const activeTrip = app.getTripForDay(rawTrip.id, selectedDayIndex);
    const trip = {
      ...activeTrip,
      isCustom: rawTrip.id.startsWith('custom-')
    };
    wx.setNavigationBarTitle({
      title: `${trip.city}行程`
    });
    this.setData({
      trips,
      trip,
      selectedId: trip.id,
      dayTabs,
      selectedDayIndex
    });
    this.buildRoute();
  },

  chooseTrip(event) {
    wx.setStorageSync('selectedTripId', event.currentTarget.dataset.id);
    wx.setStorageSync('selectedTripDayIndex', 0);
    this.setTrip(event.currentTarget.dataset.id, 0);
  },

  chooseDay(event) {
    const index = Number(event.currentTarget.dataset.index);
    wx.setStorageSync('selectedTripDayIndex', index);
    this.setTrip(this.data.selectedId, index);
  },

  chooseStrategy(event) {
    this.setData({
      strategyId: event.currentTarget.dataset.id
    });
    this.buildRoute();
  },

  chooseSegmentMode(event) {
    const dataset = event.currentTarget.dataset;
    app.updateRouteSegmentMode(this.data.trip.id, dataset.from, dataset.to, dataset.mode);
    this.buildRoute();
  },

  tapMapMarker(event) {
    const markerId = Number(event.markerId);
    const spot = this.data.routeSpots[markerId - 1];
    if (!spot) {
      return;
    }
    this.setData({
      activeMapSpot: app.getAttractionDetail(spot)
    });
  },

  favoriteActiveSpot() {
    const spot = this.data.activeMapSpot;
    if (!spot) {
      return;
    }

    const saved = app.addFavoritePlaceOnce({
      name: spot.name,
      city: this.data.trip ? this.data.trip.city : spot.city,
      tag: spot.tag || '拍照点',
      budget: spot.ticketPrice || 0,
      stayMinutes: spot.stayMinutes || 80,
      bestPeriod: spot.bestPeriod || '',
      status: '想去',
      note: spot.note || '',
      address: spot.address || '',
      lat: spot.lat,
      lng: spot.lng
    });
    this.setData({
      activeMapSpot: {
        ...spot,
        saved: true
      }
    });
    wx.showToast({
      title: saved ? '已加入收藏' : '已在收藏夹',
      icon: 'none'
    });
  },

  resetSpotForm() {
    this.setData({
      editingSpotIndex: -1,
      spotForm: {
        time: '09:00',
        name: '',
        note: '',
        area: '',
        stayMinutes: '80',
        bestPeriod: '灵活',
        address: '',
        lat: '',
        lng: ''
      },
      spotPoiResults: []
    });
  },

  onSpotInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      spotForm: {
        ...this.data.spotForm,
        [field]: event.detail.value
      }
    });
  },

  editSpot(event) {
    const index = Number(event.currentTarget.dataset.index);
    const spot = (this.data.trip.attractions || [])[index];
    if (!spot) {
      return;
    }
    this.setData({
      editingSpotIndex: index,
      spotForm: {
        time: spot.time || '09:00',
        name: spot.name || '',
        note: spot.note || '',
        area: spot.area || '',
        stayMinutes: String(spot.stayMinutes || 80),
        bestPeriod: spot.bestPeriod || '灵活',
        address: spot.address || '',
        lat: spot.lat !== undefined ? String(spot.lat) : '',
        lng: spot.lng !== undefined ? String(spot.lng) : ''
      }
    });
  },

  searchSpotPois() {
    const keyword = this.data.spotForm.name.trim();
    if (!keyword) {
      wx.showToast({
        title: '请先填写景点名称',
        icon: 'none'
      });
      return;
    }
    app.searchTencentPois(keyword, this.data.trip.city)
      .then(results => {
        this.setData({ spotPoiResults: results });
      })
      .catch(() => {
        wx.showToast({
          title: '地点搜索暂不可用',
          icon: 'none'
        });
      });
  },

  selectSpotPoi(event) {
    const dataset = event.currentTarget.dataset;
    this.setData({
      spotForm: {
        ...this.data.spotForm,
        name: dataset.name,
        address: dataset.address || '',
        lat: String(dataset.lat),
        lng: String(dataset.lng)
      },
      spotPoiResults: []
    });
  },

  saveSpot() {
    const form = this.data.spotForm;
    if (!form.name.trim()) {
      wx.showToast({
        title: '请填写景点名称',
        icon: 'none'
      });
      return;
    }
    const isEditing = this.data.editingSpotIndex >= 0;
    const nextTrip = isEditing
      ? app.updateTripSpot(this.data.trip.id, this.data.editingSpotIndex, form, this.data.selectedDayIndex)
      : app.addTripSpot(this.data.trip.id, form, this.data.selectedDayIndex);
    const activeTrip = app.getTripForDay(nextTrip.id, this.data.selectedDayIndex);
    this.setData({
      trip: {
        ...activeTrip,
        isCustom: nextTrip.id.startsWith('custom-')
      },
      strategyId: 'manual',
      editMode: true
    });
    this.resetSpotForm();
    this.buildRoute();
    wx.showToast({
      title: isEditing ? '景点已更新' : '景点已加入',
      icon: 'success'
    });
  },

  deleteSpot(event) {
    const nextTrip = app.removeTripSpot(this.data.trip.id, event.currentTarget.dataset.index, this.data.selectedDayIndex);
    const activeTrip = app.getTripForDay(nextTrip.id, this.data.selectedDayIndex);
    this.setData({
      trip: {
        ...activeTrip,
        isCustom: nextTrip.id.startsWith('custom-')
      },
      strategyId: 'manual',
      editMode: true
    });
    this.resetSpotForm();
    this.buildRoute();
  },

  focusRouteMap() {
    const polylines = this.data.mapPreview.polyline || [];
    const markers = this.data.mapPreview.markers || [];
    const points = polylines[0] && polylines[0].points && polylines[0].points.length
      ? polylines[0].points
      : markers.map(item => ({ latitude: item.latitude, longitude: item.longitude }));

    if (!points.length || typeof wx.createMapContext !== 'function') {
      return;
    }

    const mapContext = wx.createMapContext('routeMap', this);
    if (mapContext && typeof mapContext.includePoints === 'function') {
      mapContext.includePoints({
        points,
        padding: [48, 32, 48, 32]
      });
    }
  },

  buildRoute() {
    const trip = this.data.trip;
    if (!trip) {
      return;
    }
    const routePlan = app.buildRoutePlan(trip, this.data.strategyId);
    const routeSteps = routePlan.segments.map((item, index) => {
      return {
        title: item.title,
        desc: item.desc,
        from: item.from,
        to: item.to,
        mode: item.mode,
        minutes: item.minutes,
        cost: item.cost || 0,
        options: (item.options || []).map(option => ({
          ...option,
          active: option.mode === item.mode
        })),
        active: index === 0
      };
    });
    if (routePlan.orderedAttractions.length) {
      const last = routePlan.orderedAttractions[routePlan.orderedAttractions.length - 1];
      routeSteps.push({
        title: `${last.name}收尾`,
        desc: '完成当天最后一站后，按住宿位置选择返程方式。',
        mode: '返程',
        minutes: 0,
        active: routeSteps.length === 0
      });
    }
    this.setData({
      routePlan,
      routeSummary: routePlan.summary,
      routeSteps,
      routeSpots: routePlan.orderedAttractions,
      timeline: app.buildEditableTimeline({ ...trip, attractions: routePlan.orderedAttractions }),
      mapPreview: app.buildRouteMapPreview(trip, routePlan),
      routeSource: routePlan.source || 'local',
      routeError: routePlan.errorMessage || '',
      assistantResultText: ''
    });
  },

  applyRoutePlan(routePlan) {
    const routeSteps = routePlan.segments.map((item, index) => ({
      title: item.title,
      desc: item.desc,
      from: item.from,
      to: item.to,
      mode: item.mode,
      minutes: item.minutes,
      cost: item.cost || 0,
      options: (item.options || []).map(option => ({
        ...option,
        active: option.mode === item.mode
      })),
      active: index === 0
    }));
    if (routePlan.orderedAttractions.length) {
      const last = routePlan.orderedAttractions[routePlan.orderedAttractions.length - 1];
      routeSteps.push({
        title: `${last.name}收尾`,
        desc: '完成当天最后一站后，按住宿位置选择返程方式。',
        mode: '返程',
        minutes: 0,
        active: routeSteps.length === 0
      });
    }
    this.setData({
      routePlan,
      routeSummary: routePlan.summary,
      routeSteps,
      routeSpots: routePlan.orderedAttractions,
      timeline: app.buildEditableTimeline({ ...this.data.trip, attractions: routePlan.orderedAttractions }),
      mapPreview: app.buildRouteMapPreview(this.data.trip, routePlan),
      routeSource: routePlan.source || 'local',
      routeError: routePlan.errorMessage || '',
      assistantResultText: ''
    });
  },

  toggleEditMode() {
    const editMode = !this.data.editMode;
    this.setData({
      editMode,
      strategyId: editMode ? 'manual' : this.data.strategyId
    });
    if (editMode) {
      this.buildRoute();
    }
  },

  moveSpot(event) {
    const index = Number(event.currentTarget.dataset.index);
    const delta = Number(event.currentTarget.dataset.delta);
    const nextTrip = app.moveTripSpot(this.data.trip.id, index, delta, this.data.selectedDayIndex);
    const activeTrip = app.getTripForDay(nextTrip.id, this.data.selectedDayIndex);
    this.setData({
      trip: {
        ...activeTrip,
        isCustom: nextTrip.id.startsWith('custom-')
      },
      strategyId: 'manual'
    });
    this.buildRoute();
  },

  startDragSpot(event) {
    this.setData({
      draggingSpotIndex: Number(event.currentTarget.dataset.index),
      editMode: true
    });
  },

  dropSpot(event) {
    const fromIndex = this.data.draggingSpotIndex;
    const toIndex = Number(event.currentTarget.dataset.index);
    if (fromIndex < 0) {
      return;
    }
    const nextTrip = app.reorderTripSpot(this.data.trip.id, fromIndex, toIndex, this.data.selectedDayIndex);
    const activeTrip = app.getTripForDay(nextTrip.id, this.data.selectedDayIndex);
    this.setData({
      trip: {
        ...activeTrip,
        isCustom: nextTrip.id.startsWith('custom-')
      },
      strategyId: 'manual',
      draggingSpotIndex: -1
    });
    this.buildRoute();
  },

  restoreRecommendedOrder() {
    this.setData({
      strategyId: 'time'
    });
    this.buildRoute();
    wx.showToast({
      title: '已恢复推荐顺序',
      icon: 'none'
    });
  },

  openDetail() {
    if (!this.data.trip) {
      return;
    }
    wx.navigateTo({
      url: `/pages/detail/detail?id=${this.data.trip.id}`
    });
  },

  fetchTencentRoute() {
    if (!this.data.trip || this.data.routeLoading) {
      return;
    }
    this.setData({
      routeLoading: true,
      routeError: ''
    });
    app.buildTencentRoutePlan(this.data.trip, this.data.strategyId)
      .then(routePlan => {
        this.applyRoutePlan(routePlan);
        if (routePlan.source === 'tencent') {
          wx.showToast({
            title: '已生成腾讯路线',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '已显示本地路线',
            icon: 'none'
          });
        }
      })
      .catch(error => {
        this.setData({
          routeError: error.message || '腾讯地图路线暂不可用'
        });
      })
      .then(() => {
        this.setData({
          routeLoading: false
        });
      });
  },

  applyDayAssistant() {
    if (!this.data.trip) {
      return;
    }
    const result = app.applyDayAssistant(
      this.data.trip.id,
      this.data.selectedDayIndex,
      this.data.routePlan
    );
    const text = result.totalAdded
      ? `已生成${result.dayTitle}：待办 ${result.memos.added} 条 · 预算 ${result.bills.added} 条`
      : `${result.dayTitle}提醒和预算已存在`;
    this.setData({
      assistantResultText: text
    });
    wx.showToast({
      title: result.totalAdded ? '已生成助手内容' : '内容已存在',
      icon: result.totalAdded ? 'success' : 'none'
    });
  },

  openChecklist() {
    wx.switchTab({
      url: '/pages/checklist/checklist'
    });
  },

  deleteTrip() {
    if (!this.data.trip || !this.data.trip.isCustom) {
      wx.showToast({
        title: '预设行程不可删除',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '删除行程',
      content: `确认删除“${this.data.trip.city}”行程吗？`,
      success: result => {
        if (result.confirm) {
          app.removeCustomTrip(this.data.trip.id);
          const firstTrip = app.getTrips()[0];
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
          this.setTrip(firstTrip.id);
        }
      }
    });
  }
});
