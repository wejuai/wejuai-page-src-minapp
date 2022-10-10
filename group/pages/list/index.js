// user/pages/collect/index.js
const app = getApp();

// 滚动元素node
let scrollGroupNode;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: 0, 
    selectPerson: true,
    userId: false,
    scroll_delay: true,
    // 悬赏数据集
    group: {
      list: [],
      size: 10,
      current: 0
    }
  },

  // 获取悬赏列表
  getGroupList(obj) {
    let that = this;
    let { group, userId } = that.data;
    let current = 0,
        titleStr = '',
        direction = 'DESC';

    if(obj.detail) {
      current = obj.detail.current || 0;
      obj.detail.titleStr && (titleStr = obj.detail.titleStr);
      obj.detail.direction && (direction = obj.detail.direction);
    }

    app.REQUEST(app.globalData.API.rewardList, 'GET', { page: current, size: group.size, titleStr, direction, userId }, 'app')
    .then(res => {
      if(res.statusCode == 200) {
        let list = current == 0 ? res.data.content : [ ...that.data.list, ...res.data.content ];

        that.setData({
          group: {
            ...group,
            list: list,
            current: current + 1
          }
        })
      }
      
      scrollGroupNode.setPage(current, res.data.totalPages);
      scrollGroupNode.endTriggered();
    })
    .catch(err => {
      scrollGroupNode.endTriggered();
    })
  },

  /**
   * 自定义生命周期函数--刷新
   */
  resfer() {
    this.getGroupList({ detail: {} })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 悬赏滚动组件
    scrollGroupNode = this.selectComponent('#scrollGroup');

    if(options) {
      if(!options.userid && options.userid == '') {
        console.log(`悬赏列表页，取消必须的页面传入参数 userid, 当前 userid= ${options.userid}`);
        return;
      }
      let json = {};

      json.userId = options.userid;
      json.scroll_delay = false;

      this.setData(json);
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