const app = getApp();

Page({
  data: {
    tripId: '',
    trips: [],
    places: []
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
      places: app.getFavoritePlaces()
    });
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
  }
});
