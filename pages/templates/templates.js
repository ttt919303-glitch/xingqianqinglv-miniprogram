const app = getApp();

const templateItems = {
  business: [
    { categoryId: 'electronics', name: '笔记本电脑', count: 1 },
    { categoryId: 'docs', name: '会议资料', count: 1 },
    { categoryId: 'clothes', name: '正装', count: 1 }
  ],
  weekend: [
    { categoryId: 'travel', name: '墨镜', count: 1 },
    { categoryId: 'travel', name: '折叠雨衣', count: 1 },
    { categoryId: 'wash', name: '小样护肤品', count: 1 }
  ],
  graduate: [
    { categoryId: 'electronics', name: '自拍杆', count: 1 },
    { categoryId: 'clothes', name: '拍照穿搭', count: 2 },
    { categoryId: 'travel', name: '纪念册', count: 1 }
  ],
  family: [
    { categoryId: 'medicine', name: '儿童常用药', count: 1 },
    { categoryId: 'clothes', name: '备用换洗衣物', count: 2 },
    { categoryId: 'travel', name: '湿巾纸巾', count: 1 }
  ]
};

Page({
  data: {
    templates: []
  },

  onLoad() {
    this.setData({
      templates: app.globalData.templates
    });
  },

  useTemplate(event) {
    const id = event.currentTarget.dataset.id;
    const name = event.currentTarget.dataset.name;
    const items = templateItems[id] || [];
    const added = items
      .map(item => app.addItem(item, { unique: true }))
      .filter(Boolean).length;
    wx.showToast({
      title: added ? `已添加${added}项` : `${name}已存在`,
      icon: added ? 'success' : 'none'
    });
  }
});
