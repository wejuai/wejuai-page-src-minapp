// user/pages/collect/index.js
const app = getApp();
const { UTIL } = app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hobbyes: []
  },

  // 获取爱好列表
  getHobbyList() {
    app.setHobby().then(res => {
      res[0].x = -6;
      res[0].y = -18;
      this.setData({ hobbyes: res })
    })
  },

  // 跳转爱好子站
  toHobby(e) {
    let { hobbyes } = this.data;
    let id = UTIL.getNodeSetData(e, 'id');
    let idx = UTIL.getNodeSetData(e, 'idx');
    let o = hobbyes[idx];
    let url = '/subIndex/pages/home/index';
    
    app.setPageParams(url, o);
    wx.navigateTo({ url: `${url}?hobbyid=${id}` });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHobbyList();
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

  }
})