// components/dialog/dialog.js
var config = require('../../utils/config');
var app = getApp();
var that;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '微信授权'
    },
    titleColor: {
      type: String,
      value: '#000000'
    },
    logImage: {
      type: String,
      value: '../../icon/logo/logo_100.png'
    },
    logName: {
      type: String,
      value: '为聚爱'
    },
    content: {
      type: String,
      value: '获得您的公开信息(昵称、头像等)'
    },
    contentColor: {
      type: String,
      value: '#888888'
    },
    isShow: {
      type: Boolean,
      value: false,
      observer(val) {
        this.setData({ show: val });
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    userInfo: {}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 监听 isLogin变化
    watchLogin(e) {
      console.log('57',e)
      !e && that.show();
      e && that.hide();
    },
    cancelCallback() {
      this.hide();
      this.triggerEvent('cancel');
    },
    hide() {
      this.setData({
        show: false
      })
    },
    show() {
      this.setData({
        show: true
      })
    },
    onGotUserInfo(e) {
      let that = this;

      wx.getUserProfile({
        desc: "获取你的昵称、头像、地区及性别",
        success: data => {
          app.LOGIN(() => {
            that.triggerEvent('confirm', e)
            that.hide();
          }, true);
        },
        fail: res => {
          //拒绝授权
          wx.showToast({ title: '您拒绝了请求', icon: 'none' });
          return;
        }
      })
    }
  },
  lifetimes: {
    attached() {
      that = this;
      app.watch(false, 'isLogin', this.watchLogin);
      
      let userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userInfo: userInfo
      })
    }
  }
})
