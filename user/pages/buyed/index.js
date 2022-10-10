// user/pages/collect/index.js
const app = getApp();

// 滚动元素node
let scrollEssayNode;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: 0, 
    selectPerson: true,
    userId: false,
    scroll_delay: true,
    scroll_top: 0,
    // 文章数据集
    essay: {
      list: [],
      size: 10,
      current: 0
    }
  },

  // 获取已购文章列表
  getEssayList(obj) {
    let that = this;
    let { essay, userId } = that.data;
    let current = 0,
        titleStr = '',
        direction = 'DESC';

    if(obj.detail) {
      current = obj.detail.current || 0;
      obj.detail.titleStr && (titleStr = obj.detail.titleStr);
      obj.detail.direction && (direction = obj.detail.direction);
    }

    let params = {
      page: current,
      size: essay.size,
      titleStr,
      direction,
      userId
    };

    app.REQUEST(app.globalData.API.purchased, 'GET', params)
    .then(res => {
      if(res.statusCode == 200) {
        let list = current == 0 ? res.data.content : [ ...that.data.essay.list, ...res.data.content ];

        that.setData({
          essay: {
            ...essay,
            list: list,
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 文章滚动组件
    scrollEssayNode = this.selectComponent('#scrollEssay');

    if(options) {
      if(!options.userid && options.userid == '') {
        console.log(`文章列表页，取消必须的页面传入参数 userid, 当前 userid= ${options.userid}`);
        return;
      }
      let json = {};

      json.userId = options.userid;
      json.scroll_delay = false;

      wx.createSelectorQuery().select('#scrollEssay').boundingClientRect(function(rect){
        json.scroll_top = rect.top
        that.setData(json);
      }).exec()
    }
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