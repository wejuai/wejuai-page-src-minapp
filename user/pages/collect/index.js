// user/pages/collect/index.js
const app = getApp();

// 滚动元素node
let scrollEssayNode;
let scrollGroupNode;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: 0, 
    selectPerson: true,
    // 文章数据集
    essay: {
      list: [],
      size: 10,
      pages: 1,
      current: 0
    },
    // 悬赏数据集
    group: {
      list: [],
      size: 10,
      pages: 1,
      current: 0
    }
  },

  // tab切换回调
  tabChange(e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    }, () => {
      let { currentData, essay, group } = that.data;
      if(currentData == 0 && essay.list.length == 0) {
        that.getEssayList();
      }
      if(currentData == 1 && group.list.length == 0) {
        that.getGroupList()
      }
    })
  },
  // 点击切换tab
  checkCurrent(e) {
    const that = this;

    if (that.data.currentData === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentData: e.target.dataset.current
      })
    }
  },
  // 获取文章列表
  getEssayList(obj) {
    let that = this;
    let { current } = obj ? obj.detail : { current: 0 };
    let { essay } = that.data;

    app.REQUEST(app.globalData.API.collectionArticle, 'GET', { page: current, size: essay.size })
    .then(res => {
      if(res.statusCode == 200) {
        let list = current == 0 ? res.data.content : [ ...that.data.list, ...res.data.content ];

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
  // 获取悬赏列表
  getGroupList(obj) {
    let that = this;
    let { current } = obj ? obj.detail : { current: 0 };
    let { group } = that.data;

    app.REQUEST(app.globalData.API.collectionReward, 'GET', { page: current, size: group.size })
    .then(res => {
      if(res.statusCode == 200) {
        let list = current == 0 ? res.data.content : [ ...that.data.list, ...res.data.content ];

        that.setData({
          group: {
            ...group,
            list: list,
            pages: res.data.totalPages
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
   * 自定义生命周期函数--重新加载
   */
  resfer() {
    scrollEssayNode.refresherrefresh();
    scrollGroupNode.refresherrefresh();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 文章滚动组件
    scrollEssayNode = this.selectComponent('#scrollEssay');
    // 悬赏滚动组件
    scrollGroupNode = this.selectComponent('#scrollGroup');
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