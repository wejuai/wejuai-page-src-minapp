const app = getApp();

Component({
  data: {
    selected: 0,
    color: "#fff",
    selectedColor: "#3cc51f",
    list: [
      {
        "pagePath": "/pages/home/index",
        "text": "首页",
        "iconPath": "../icon/home.png",
        "selectedIconPath": "../icon/home_active.png"
      },
      {
        "pagePath": "/pages/message/index",
        "text": "消息",
        "iconPath": "../icon/message.png",
        "selectedIconPath": "../icon/message_active.png"
      },
      {
        "pagePath": "/pages/user/index",
        "text": "我的",
        "iconPath": "../icon/user.png",
        "selectedIconPath": "../icon/user_active.png"
      }
    ],
    isIphoneX: false,
    animation: false,
    isShow: true,
    messageNum: 0
  },
  
  options: {
    addGlobalClass: true
  },
  
  lifetimes: {
    attached() {
      this.setData({
        isIphoneX: app.globalData.isIphoneX,
        messageNum: app.globalData.messageNum
      });
    },
    ready() {
      let that = this;
      wx.$hideTabBar = (an) => {
        if(an) {
          app.globalData.UTIL.an_translateY_out_in(that, { animation: 'animation', show: 'isShow' }, false);
        } else {
          that.setData({ isShow: false })
        }
      }
      wx.$showTabBar = (an) => {
        if(an) {
          app.globalData.UTIL.an_translateY_out_in(that, { animation: 'animation', show: 'isShow' }, true);
        } else {
          that.setData({ isShow: true })
        }
      }
    }
  },
  methods: {
    switchTab(e) {
      let url = app.globalData.UTIL.getNodeSetData(e, 'path');
      let index = app.globalData.UTIL.getNodeSetData(e, 'index');
      
      wx.switchTab({url});
      this.setData({ selected: index });
    },
    onCancel() {

    },
    onConfirm() {

    }
  }
})