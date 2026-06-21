const app = getApp();

Page({
  data: {
    trips: [],
    trip: null,
    selectedId: 'shanghai',
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
    editMode: false,
    routeSource: 'local',
    routeLoading: false,
    routeError: ''
  },

  onLoad(options) {
    const selectedId = options.id || wx.getStorageSync('selectedTripId') || 'shanghai';
    this.setTrip(selectedId);
  },

  onShow() {
    const selectedId = wx.getStorageSync('selectedTripId');
    if (selectedId && selectedId !== this.data.selectedId) {
      this.setTrip(selectedId);
    }
  },

  setTrip(id) {
    const trips = app.getTrips();
    const rawTrip = trips.find(item => item.id === id) || trips[0];
    const trip = {
      ...rawTrip,
      isCustom: rawTrip.id.startsWith('custom-')
    };
    wx.setNavigationBarTitle({
      title: `${trip.city}行程`
    });
    this.setData({
      trips,
      trip,
      selectedId: trip.id
    });
    this.buildRoute();
  },

  chooseTrip(event) {
    wx.setStorageSync('selectedTripId', event.currentTarget.dataset.id);
    this.setTrip(event.currentTarget.dataset.id);
  },

  chooseStrategy(event) {
    this.setData({
      strategyId: event.currentTarget.dataset.id
    });
    this.buildRoute();
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
        mode: item.mode,
        minutes: item.minutes,
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
      routeError: routePlan.errorMessage || ''
    });
  },

  applyRoutePlan(routePlan) {
    const routeSteps = routePlan.segments.map((item, index) => ({
      title: item.title,
      desc: item.desc,
      mode: item.mode,
      minutes: item.minutes,
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
      routeError: routePlan.errorMessage || ''
    });
  },

  toggleEditMode() {
    this.setData({
      editMode: !this.data.editMode
    });
  },

  moveSpot(event) {
    const index = Number(event.currentTarget.dataset.index);
    const delta = Number(event.currentTarget.dataset.delta);
    const nextTrip = app.moveTripSpot(this.data.trip.id, index, delta);
    this.setData({
      trip: {
        ...nextTrip,
        isCustom: nextTrip.id.startsWith('custom-')
      },
      strategyId: 'manual'
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
