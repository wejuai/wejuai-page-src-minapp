// pages/essay/essay.js
const app = getApp();
const { UTIL, API } = app.globalData;

let scrollMoreNode;
let firstOnload = true;
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //顶部高度
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    // 数据列表
    msgList: [],
    // 最新的系统消息
    newSysMsg: {}
  },

  options:{
    styleIsolation:'apply-shared'
  },

  // 滚动事件
  bindscroll() {

  },

  // 获取聊天列表
  getList(e) {
    let { msgList } = this.data;
    let { current: page, type } = e.detail;
    app.REQUEST(API.chatRelation, 'GET', { page, size: 20 })
      .then(res => {
        let { content, totalPages } = res.data;
        
        if(type == 'first' || type == 'refresh') {
          msgList = content;
        } else {
          msgList = [ ...msgList, ...content ];
        }

        scrollMoreNode.setPage(page, totalPages);
        scrollMoreNode.endTriggered();
        this.setData({ msgList }, this.getSysList);
      })
      .catch(err => {
        scrollMoreNode.endTriggered();
      })
  },

  // 获取系统消息
  getSysList() {
    let unReadMsg = 0;
    let { msgList } = this.data;
    let msgNum = app.globalData.messageNum;

    msgList.map(item => {
      unReadMsg += item.unreadMsgNum;
    });

    app.REQUEST(API.messageSystem, "GET", {})
      .then(res => {
        if(res.statusCode == 200) {
          let { content } = res.data;

          if(content && content.length) {
            let last = content[content.length - 1];
            let isNew = false;

            content.map(item => {
              if(!item.watch) {
                isNew = true
              }
            })

            this.setData({ newSysMsg: {
              lastText: last.text,
              lastTime: last.createdAt,
              unreadMsgNum: msgNum - unReadMsg,
              isNew
            } })
          }
        }
      })
  },

  // 展示图片预览
  previewImg(e) {
    let index = app.globalData.UTIL.getNodeSetData(e, 'imgidx');
    let { imageList } = this.data;

    wx.previewImage({ urls: imageList, current: index })
  },

  // 收到消息回调
  receiveMessage(msg) {
    let { msgList } = that.data;
    let newMsgList = msgList.map(item => {
      if(item.userId == msg.sender) {
        item = {
          ...item, lastText: msg.text,
          lastTime: msg.createdAt, isNew: true
        }
      }
      return item;
    })
    
    that.setData({ msgList: newMsgList })
  },

  // 跳转聊天页面
  toMessage(e) {
    let item = UTIL.getNodeSetData(e, 'item');
    let url = '/message/pages/chatRoom/index';
    
    app.setPageParams(url, item)
    wx.navigateTo({
      url: `${url}?id=${item.id}&name=${item.nickname}`
    })
  },

  // 跳转消息列表页
  toSysMessage() {
    wx.navigateTo({
      url: `/message/pages/sysChatRoom/index`
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    scrollMoreNode = this.selectAllComponents('#scrollMore')[0];
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if(!firstOnload) {
      this.getList({ detail: { current: 0, type: 'refresh' } })
    }
    firstOnload = false;
    
    app.SETPAGETHIS(this);
    app.setMsgNum(this);
    that = this;
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
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