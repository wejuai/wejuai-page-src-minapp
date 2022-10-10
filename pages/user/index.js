//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    istoback: false,
    // 当前是否是查看本人个人中心
    isMy: true,
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
      hobbyNum: 0
    }
  },

  // 获取用户信息
  getUser() {
    app.REQUEST(app.globalData.API.getUser, 'GET')
    .then(res => {
      this.setData({ userInfo: res.data })
    })
  },
  login() {
    if(!app.globalData.userInfo || !app.globalData.userInfo.id) {
      app.LOGIN(() => {
        this.resfer();
      }, true);
    }
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
  // 获取用户详细信息
  userDetailedInfo() {
    let that = this;

    app.REQUEST(app.globalData.API.userDetailedInfo, 'GET')
    .then(res => {
      let detailedInfo = app.globalData.UTIL.setObejctDefault({
        collectNum: [[''], 0],
        articleNum: [[''], 0],
        rewardNum: [[''], 0],
        draftNum: [[''], 0],
        attentionNum: [[''], 0],
      }, res.data)
      
      app.setHobby().then(n => {
        detailedInfo.hobbyNum = n.length;
        that.setData({ detailedInfo })
      });
    })
  },

  // 跳转 积分
  toIntegral() {
    wx.navigateTo({
      url: '/integral/pages/myIntegral/index'
    })
  },
  // 跳转 爱好
  openHobbyes() {
    wx.navigateTo({
      url: '/user/pages/hobby/index'
    })
  },
  // 跳转 关注
  toAttention() {
    wx.navigateTo({
      url: '/user/pages/attention/index'
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
    let { userInfo } = this.data;
    let url = '/essay/pages/list/index?userid=' + userInfo.id;

    wx.navigateTo({ url })
  },
  // 跳转 我的悬赏
  toReward() {
    let { userInfo } = this.data;
    let url = '/group/pages/list/index?userid=' + userInfo.id;

    wx.navigateTo({ url })
  },
  // 跳转 我的草稿
  toDraft() {
    wx.navigateTo({
      url: '/user/pages/draft/index'
    })
  },
  // 跳转 已购买的文章
  toBuyed() {
    let { userInfo } = this.data;
    let url = '/user/pages/buyed/index?userid=' + userInfo.id;

    wx.navigateTo({ url })
  },
  // 跳转 设置
  toSet() {
    wx.navigateTo({
      url: '/setting/pages/setting/index'
    })
  },

  resfer() {
    this.getUser();
    this.userDetailedInfo();
  },

  onPullDownRefresh() {
    this.resfer();
  },

  onLoad: function () {

  },
  onShow() {
    app.SETPAGETHIS(this);
    app.setMsgNum(this);
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    
    this.getUser();
    this.userDetailedInfo();
  }
})
