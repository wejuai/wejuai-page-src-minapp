// user/pages/detail/index.js
const app = getApp();
const { API, UTIL, orderTypes } = app.globalData;

let scrollEssayNode;
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: 0, 
    selectPerson: true,
    orderTypes,
    // 明细数据集
    deal: {
      list: [],
      size: 10,
      pages: 1,
      current: 0
    }
  },

  /* -start- 事件处理 */
  // 点击订单号
  orderIdClick(e) {
    let id = UTIL.getNodeSetData(e, 'id');

    wx.setClipboardData({ data: id, success(){
      UTIL.toast(`订单号：${id}  已复制`);
    } });
  },
  /* -end- 事件处理 */

  /* -start- 数据请求 */
  getList(obj) {
    let that = this;
    let { deal } = that.data;
    let params = {};
    let current = 0;

    if(obj.detail) {
      current = obj.detail.current || 0;
      if(obj.detail.orderTypes_ac && obj.detail.orderTypes_ac.id) params.type = obj.detail.orderTypes_ac.id;
      if(obj.detail.income && obj.detail.income.id) params.income = (obj.detail.income.id == "income");
    }

    params = {
      ...params,
      page: current,
      size: deal.size
    };

    app.REQUEST(API.orders, 'GET', params, false, { showLoading: true })
    .then(res => {
      if(res.statusCode == 200) {
        let list = res.data.content;

        if(current > 0) {
          list = [ ...that.data.deal.list, ...list ]
        }

        that.setData({
          deal: {
            ...deal,
            list: list,
            pages: res.data.totalPages,
            current: current + 1
          }
        })
      }
      scrollEssayNode.setPage(current, res.data.totalPages);
      scrollEssayNode.endTriggered();
    })
    .catch(err => {
      scrollEssayNode.endTriggered();
    })
  },
  /* -end- 数据请求 */

  /**
   * 自定义生命周期函数--刷新
   */
  resfer() {
    that.getList();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    scrollEssayNode = this.selectComponent('#scrollEssay');
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