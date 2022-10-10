//index.js
//获取应用实例
const app = getApp();
const { UTIL } = app.globalData;

Page({
  data: {
    //顶部高度
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    // 他人用户id
    otherId: '',
    // 基本信息
    userInfo: {},
    // 详细信息
    detailedInfo: {
      attentionNum: 0,
      followNum: 0,
      integral: 0,
      collectNum: 0,
      articleNum: 0,
      rewardNum: 0,
      draftNum: 0,
    }
  },

  // 获取用户信息
  getUser() {
    app.REQUEST(app.globalData.API.getUser, 'GET')
    .then(res => {
      wx.setNavigationBarTitle({
        title: res.data.nickName 
      })
      this.setData({ userInfo: res.data })
    })
  },
  // 获取用户详细信息
  userDetailedInfo() {
    app.REQUEST(app.globalData.API.userDetailedInfo, 'GET')
    .then(res => {
      let detailedInfo = app.globalData.UTIL.setObejctDefault({
        collectNum: [[''], 0],
        articleNum: [[''], 0],
        rewardNum: [[''], 0],
        draftNum: [[''], 0],
      }, res.data)
      this.setData({ detailedInfo })
    })
  },
  // 获取他人用户信息
  getOtherUser() {
    let { otherId } = this.data;

    app.REQUEST(app.globalData.API.getOtherUser + otherId, 'GET', {}, 'app')
    .then(res => {
      let userInfo = UTIL.setObejctDefault({
        age: [[''], '永远的18岁'],
        birthday: [[''], '未知'],
        inShort: [[''], '什么都没写'],
        nickName: [[''], '没有名字'],
      }, res.data);
      this.setData({ userInfo })
    })
  },
  // 展示简介
  openInShort() {
    wx.showModal({
      title: '简介',
      content: this.data.userInfo.inShort,
      showCancel: false,
      confirmText: '看到了'
    })
  },

  // 跳转 粉丝
  toFollow() {
    wx.navigateTo({
      url: '/user/pages/follow/index'
    })
  },
  // 跳转 图片编辑
  toCropper(e) {
    let imgUpdata = e.target.dataset.type;

    wx.navigateTo({
      url: '/pages/cropper/index?imgUpdata=' + imgUpdata
    })
  },
  // 跳转 编辑资料
  toChangeInfo() {
    wx.navigateTo({
      url: '/user/pages/userInfo/index'
    })
  },
  // 跳转 我的收藏
  toCollect() {
    wx.navigateTo({
      url: '/user/pages/collect/index'
    })
  },
  // 跳转 我的文章
  toArticle() {
    let url = '/essay/pages/list/index?userid=' + this.data.otherId;

    wx.navigateTo({ url })
  },
  // 跳转 我的悬赏
  toReward() {
    let url = '/group/pages/list/index?userid=' + this.data.otherId;

    wx.navigateTo({ url })
  },
  // 跳转 我的草稿
  toDraft() {
    wx.navigateTo({
      url: '/user/pages/draft/index'
    })
  },
  // 跳转 设置
  toSet() {
    wx.navigateTo({
      url: '/pages/changeInfo/index'
    })
  },
  // 返回
  toBack() {
    UTIL.toBack();
  },

  resfer() {
    this.onLoad()
  },

  onPullDownRefresh() {
    this.onLoad()
  },

  onLoad(options) {
    console.log(options)
    if(!options || !options.id || options.id == "") {
      UTIL.toast('他人用户中心页面，缺少必要传入参数 id')
      return;
    }

    this.setData({ otherId: options.id }, () => {
      this.getOtherUser();
    });
  },
  onShow() {

  }
})
