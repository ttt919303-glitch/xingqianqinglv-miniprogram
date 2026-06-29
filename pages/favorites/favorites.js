const app = getApp();

Page({
  data: {
    tripId: '',
    trips: [],
    dayTabs: [],
    selectedDayIndex: 0,
    selectedDayTitle: '第1天',
    places: [],
    filters: [],
    selectedFilter: '全部',
    form: {
      name: '',
      city: '',
      tag: '想去',
      budget: '',
      stayMinutes: '80',
      bestPeriod: '灵活',
      note: ''
    },
    editingPlaceId: ''
  },

  onLoad(options) {
    const trips = app.getTrips();
    const tripId = options.id || (trips[0] && trips[0].id) || '';
    const trip = trips.find(item => item.id === tripId) || trips[0];
    this.setData({
      trips,
      tripId,
      dayTabs: trip ? app.getTripDays(trip) : [],
      selectedDayTitle: trip ? app.getTripDays(trip)[0].title : '第1天'
    });
  },

  onShow() {
    this.loadPlaces();
  },

  loadPlaces() {
    this.setData({
      filters: app.getFavoritePlaceFilters(),
      places: app.getFavoritePlaces({ filter: this.data.selectedFilter })
    });
  },

  chooseFilter(event) {
    this.setData({
      selectedFilter: event.currentTarget.dataset.filter
    });
    this.loadPlaces();
  },

  chooseTrip(event) {
    const tripId = event.currentTarget.dataset.id;
    const trip = this.data.trips.find(item => item.id === tripId);
    const dayTabs = trip ? app.getTripDays(trip) : [];
    this.setData({
      tripId,
      selectedDayIndex: 0,
      dayTabs,
      selectedDayTitle: dayTabs[0] ? dayTabs[0].title : '第1天'
    });
  },

  chooseDay(event) {
    const selectedDayIndex = Number(event.currentTarget.dataset.index);
    const selectedDay = this.data.dayTabs[selectedDayIndex];
    this.setData({
      selectedDayIndex,
      selectedDayTitle: selectedDay ? selectedDay.title : '第1天'
    });
  },

  addToTrip(event) {
    const placeId = event.currentTarget.dataset.id;
    app.addFavoritePlaceToTrip(placeId, this.data.tripId, this.data.selectedDayIndex);
    wx.showToast({
      title: '已加入行程',
      icon: 'success'
    });
    this.loadPlaces();
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      form: {
        ...this.data.form,
        [field]: event.detail.value
      }
    });
  },

  editPlace(event) {
    const place = app.getFavoritePlaces().find(item => item.id === event.currentTarget.dataset.id);
    if (!place) {
      return;
    }
    this.setData({
      editingPlaceId: place.id,
      form: {
        name: place.name,
        city: place.city,
        tag: place.tag,
        budget: String(place.budget || ''),
        stayMinutes: String(place.stayMinutes || 80),
        bestPeriod: place.bestPeriod,
        note: place.note
      }
    });
  },

  savePlace() {
    if (!this.data.form.name.trim()) {
      wx.showToast({
        title: '请填写地点名称',
        icon: 'none'
      });
      return;
    }
    if (this.data.editingPlaceId) {
      app.updateFavoritePlace(this.data.editingPlaceId, this.data.form);
    } else {
      app.addFavoritePlace(this.data.form);
    }
    this.setData({
      editingPlaceId: '',
      selectedFilter: '全部',
      form: {
        name: '',
        city: '',
        tag: '想去',
        budget: '',
        stayMinutes: '80',
        bestPeriod: '灵活',
        note: ''
      }
    });
    this.loadPlaces();
    wx.showToast({
      title: '地点已保存',
      icon: 'success'
    });
  },

  deletePlace(event) {
    app.removeFavoritePlace(event.currentTarget.dataset.id);
    this.loadPlaces();
  }
});
