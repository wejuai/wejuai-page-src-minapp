// setting/pages/setting/index.js
const app = getApp();
const { API, UTIL } = app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    phone: ''
  },

  // 授权获取手机号
  getPhoneNumber: function (e) {
    app.accreditPhone(e);
  },
  // 切换模式 
  switchConcise() {
    let that = this;
    let { userInfo } = this.data;
    const callBack = (performance) => {
      userInfo.performance = performance;
      that.setData({ userInfo }, () => {
        UTIL.toast('切换成功');
      });
    };

    if(this.data.userInfo.performance == 'LOW') {
      app._setUserFunction('HIGH').then(res => {
        callBack('HIGH');
      });
    } else {
      app._setUserFunction('LOW').then(res => {
        callBack('LOW');
      });
    }
  },
  // 联系客服回调
  getContact(e) {
    console.log(e);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let userInfo = app.globalData.userInfo;
    let phone = userInfo.phone;

    phone = phone.substring(0, 3) + '****' + phone.substring(7);

    this.setData({ userInfo, phone });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})