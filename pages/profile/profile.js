const app = getApp();

Page({
  data: {
    progress: {},
    backupText: '',
    backupStatus: '',
    stats: [],
    guide: [
      '首页查看行程倒计时和准备进度',
      '物品清单按分类勾选，长按自定义物品可删除',
      '新增页可添加行程、物品和当天景点',
      '模板页可快速补充常见旅行物品'
    ]
  },

  onShow() {
    const progress = app.getOverallProgress();
    this.setData({
      progress,
      stats: [
        { label: '全部行程', value: app.getTrips().length },
        { label: '清单分类', value: app.getCategories().length },
        { label: '清单物品', value: app.getAllItems().length }
      ]
    });
  },

  clearPacked() {
    app.unpackAll();
    wx.showToast({
      title: '已清空勾选',
      icon: 'success'
    });
    this.onShow();
  },

  exportBackup() {
    const backupText = app.exportBackup();
    this.setData({
      backupText,
      backupStatus: '备份已生成并复制，可保存到云盘或聊天文件。'
    });
    wx.setClipboardData({
      data: backupText,
      success() {
        wx.showToast({
          title: '已复制备份',
          icon: 'success'
        });
      }
    });
  },

  onBackupInput(event) {
    this.setData({
      backupText: event.detail.value
    });
  },

  importBackup() {
    try {
      app.importBackup(this.data.backupText);
      this.setData({
        backupStatus: '备份已导入。'
      });
      wx.showToast({
        title: '导入成功',
        icon: 'success'
      });
      this.onShow();
    } catch (error) {
      wx.showToast({
        title: '备份格式不正确',
        icon: 'none'
      });
    }
  },

  resetData() {
    wx.showModal({
      title: '恢复初始数据',
      content: '会清空新增行程、新增物品，并恢复默认打包进度。确认继续吗？',
      success: result => {
        if (result.confirm) {
          app.resetUserData();
          wx.showToast({
            title: '已恢复',
            icon: 'success'
          });
          this.onShow();
        }
      }
    });
  }
});
