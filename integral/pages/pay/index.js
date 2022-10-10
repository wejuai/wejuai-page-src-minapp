// integral/pages/pay/index.js
const app = getApp();
const { UTIL, API } = app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    header: '',
    payIntegral: 0,
    userInfo: {},
    essayid: "",
    type: 'article',
    shade: { show: false, type: 'being' }
  },

  // 支付积分
  pay() {
    let { type } = this.data;

    this.showShade('being');
    switch(type) {
      case 'article':
        this.articlePay();
        break;
    }
  },
  // 文章支付
  articlePay() {
    let { essayid } = this.data;
    app.REQUEST(API.article_ + essayid + API._buy)
      .then(res => {
        if(res.statusCode == 200) {
          UTIL.toBack({}, true);
          this.hideShade('success');
        } else {
          this.hideShade('error');
        }
      }).catch(err => {
        this.hideShade('error');
      })
  },
  // 取消
  toBack() {
    UTIL.toBack();
  },
  // 展示遮罩
  showShade(type) {
    this.setData({ shade: { type, show: true } });
  },
  // 隐藏遮罩
  hideShade(type) {
    let { shade } = this.data;

    shade.type = type;
    this.setData( { shade }, () => {
      setTimeout(() => {
        this.setData({ shade: { show: false, type: 'being' } });
      }, 1000)
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { header, integral:payIntegral, type, essayid } = options;
    let userInfo = app.globalData.userInfo;

    this.setData({ header, payIntegral, userInfo, type, essayid})
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})