// user/pages/collect/index.js
const app = getApp();

// 滚动元素node
let scrollNode;
let searchText;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: 0, 
    selectPerson: true,
    // 关注数据集
    attention: {
      list: [],
      size: 10,
      pages: 1,
      current: 0
    },
    searchVal: ''
  },

  // 搜索框输入
  searchInput(e) {
    searchText = e.detail.value;
  },
  // 获取列表
  getList(obj) {
    let that = this;
    let { attention } = that.data;
    let current = 0,
        titleStr = '';

    if(obj.detail) {
      current = obj.detail.current || 0;
    }

    app.REQUEST(
      app.globalData.API.followList, 'GET',
      { page: current, size: attention.size, titleStr: searchText }, false, { showLoading: true }
    )
    .then(res => {
      if(res.statusCode == 200) {
        let content = res.data.content.map(item => ({ ...item, isAttention: true }));
        let list = current == 0 ? content : [ ...that.data.list, ...content ];

        that.setData({
          attention: {
            ...attention,
            list: list,
            current: current + 1
          }
        })
      }
      scrollNode.setPage(current, res.data.totalPages);
      scrollNode.endTriggered();
    })
    .catch(err => {
      scrollNode.endTriggered();
    })
  },

  // 跳转 用户详情
  toOther(e) {
    let userId = app.globalData.UTIL.getNodeSetData(e, 'userid');

    wx.navigateTo({
      url: '/pages/userInfo/index?id=' + userId
    })
  },
  // 切换关注
  changeAttention(e) {
    let that = this;
    let i = app.globalData.UTIL.getNodeSetData(e, 'index');
    let { attention } = this.data;
    let info = attention.list[i];

    if(info.isAttention) {
      wx.showModal({
        title: '提示',
        content: '确定要取消关注吗',
        success (res) {
          if (res.confirm) {
            app.REQUEST(app.globalData.API.postUnFollow + info.id, 'POST')
            .then(res => {
              if(res.statusCode == 200) {
                UTIL.toast('已取消关注')
                attention.list[i].isAttention = false
                that.setData({ attention })
              }
            })
          }
        }
      })
    } else {
      app.REQUEST(app.globalData.API.postFollow + info.id, 'POST')
      .then(res => {
        if(res.statusCode == 200) {
          UTIL.toast('已关注')
          attention.list[i].isAttention = true
          that.setData({ attention })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 悬赏滚动组件
    scrollNode = this.selectComponent('#scroll');
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