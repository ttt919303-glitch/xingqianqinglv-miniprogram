const app = getApp();

Page({
  data: {
    categoryId: '',
    category: null,
    tabs: ['全部', '未打包', '已打包'],
    activeTab: 0,
    items: [],
    visibleItems: [],
    progress: {}
  },

  onLoad(options) {
    const id = options.id || 'travel';
    this.setData({ categoryId: id });
    this.loadCategory();
  },

  onShow() {
    if (this.data.categoryId) {
      this.loadCategory();
    }
  },

  loadCategory() {
    const categories = app.getCategories();
    const category = categories.find(item => item.id === this.data.categoryId) || categories[0];
    wx.setNavigationBarTitle({
      title: category.name
    });
    this.setData({ category });
    this.refreshItems();
  },

  refreshItems() {
    if (!this.data.category) {
      return;
    }
    const packedIds = app.getPackedIds();
    const items = this.data.category.items.map(item => ({
      ...item,
      packed: packedIds.includes(item.id)
    }));
    const progress = app.getCategoryProgress(this.data.category);
    this.setData({ items, progress });
    this.applyFilter();
  },

  applyFilter() {
    let visibleItems = this.data.items;
    if (this.data.activeTab === 1) {
      visibleItems = visibleItems.filter(item => !item.packed);
    }
    if (this.data.activeTab === 2) {
      visibleItems = visibleItems.filter(item => item.packed);
    }
    this.setData({ visibleItems });
  },

  switchTab(event) {
    this.setData({
      activeTab: Number(event.currentTarget.dataset.index)
    });
    this.applyFilter();
  },

  toggleItem(event) {
    const id = event.currentTarget.dataset.id;
    const packedIds = app.getPackedIds();
    const nextIds = packedIds.includes(id)
      ? packedIds.filter(itemId => itemId !== id)
      : packedIds.concat(id);
    app.setPackedIds(nextIds);
    this.refreshItems();
  },

  packCategory() {
    app.packCategory(this.data.categoryId);
    wx.showToast({
      title: '本类已完成',
      icon: 'success'
    });
    this.loadCategory();
  },

  unpackCategory() {
    app.unpackCategory(this.data.categoryId);
    wx.showToast({
      title: '已重新整理',
      icon: 'success'
    });
    this.loadCategory();
  },

  addItem() {
    wx.setStorageSync('preferredCategoryId', this.data.categoryId);
    wx.switchTab({
      url: '/pages/add/add'
    });
  },

  removeItem(event) {
    const id = event.currentTarget.dataset.id;
    const item = this.data.items.find(candidate => candidate.id === id);
    if (!item) {
      return;
    }
    if (!item.custom) {
      wx.showToast({
        title: '预设物品不可删除',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '删除物品',
      content: `确认删除“${item.name}”吗？`,
      success: result => {
        if (result.confirm) {
          app.removeCustomItem(item.id);
          this.loadCategory();
        }
      }
    });
  }
});
