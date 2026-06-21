const app = getApp();

Page({
  data: {
    tripId: '',
    trips: [],
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
    this.setData({
      trips,
      tripId: options.id || (trips[0] && trips[0].id) || ''
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
    this.setData({
      tripId: event.currentTarget.dataset.id
    });
  },

  addToTrip(event) {
    const placeId = event.currentTarget.dataset.id;
    app.addFavoritePlaceToTrip(placeId, this.data.tripId);
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
