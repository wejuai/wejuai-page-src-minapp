// compontents/header/index.js
const app = getApp();
const { UTIL, API, userInfo, system } = app.globalData;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    home_icon: {
      type: String,
      value: '/icon/toHome_black.png'
    }
  },

  options:{
    styleIsolation: 'apply-shared',
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    //顶部高度
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 返回首页
    toHome() {
      app.TOHOME();
    },
    // 返回
    toBack() {
      UTIL.toBack();
    },
  }
})
