const app = getApp();
const { API, UTIL, userInfo, height } = app.globalData;

let that;
let scrollEvent = {};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 聊天关系id
    chatId: false,
    // 滚动到的定位点id
    scrollIntoScroll: false,
    // 滚动定位点id
    scrollIntoView: false,
    // 顶部更多历史按钮状态 0：暂无更多；1：加载更多；2：正在加载
    moreType: 1,
    // 加载的历史消息页数
    page: 0,
    size: 20,
    // 上次显示发送消息的时间
    preMsgTime: 0,
    // 消息列表
    msgList: [],
    // 加载更多后跳转锚点
    moreMark: false,
    // 显示底部新消息
    showNewBottom: false
  },

  /* -start- 获取数据*/
  getList(type) {
    let { page, size, msgList, preMsgTime } = this.data;
    let data = { page, size };
    let json = { preMsgTime };
    let moreMarkId = false;

    app.REQUEST(API.messageSystem, "GET", data)
      .then(res => {
        let { content, totalPages } = res.data;

        if(content.length) {
          let newContent = content.map(item => {
            let createTime = new Date(item.createdAt).getTime();
            if(Math.abs(createTime - json.preMsgTime) > 1000 * 60 * 5) {
                item.msgTime = UTIL.msgTimeSwitch(item.createdAt, 5, '-');
                json.preMsgTime = createTime;
              }

            return item;
          })
          if(type == 'more') {
            moreMarkId = msgList[0].id;
          }

          msgList = [ ...newContent, ...msgList ];
          json.msgList = msgList;
          
          if(page >= totalPages) {
            json.moreType = 0
          } else {
            json.moreType = 1
          }
        } else {
          json.moreType = 0
        }

        this.setData(json, () => {
          if(page == 0) {
            this.scrollToBottom();
          }
          if(type == 'more') {
            this.setMoreMark(moreMarkId);
          }
        })
      })
  },
  /* -end- 获取数据*/

  /* -start- 事件处理*/
  // 设置消息已读
  setMsgWatch(e) {
    let { msgList } = this.data;
    let id = UTIL.getNodeSetData(e, 'id');
    let idx = UTIL.getNodeSetData(e, 'idx');

    app.REQUEST(API.messageSystem_ + id + API._messageWatch, "PUT")
      .then(res => {
        let { statusCode } = res;
        
        if(statusCode == 200) {
          msgList[idx].watch = true;
          this.setData({ msgList });
        }
      })
  },
  // 滚动到底部
  scrollToBottom () {
    let idTime = new Date().getTime();

    this.setData({ scrollIntoView: 'view_' + idTime }, () => {
      this.setData({ scrollIntoScroll: 'view_' + idTime, showNewBottom: false })
    })
  },
  // 获取更多历史
  getMore() {
    let { page } = this.data;
    let moreType = 2;
    page += 1;

    this.setData({ page, moreType }, () => {
      this.getList('more')
    });
  },
  // 收到消息回调
  receiveMessage(msg) {
    let { msgList, showNewBottom } = that.data;
    let { scrollTop, scrollHeight } = scrollEvent;

    if(scrollHeight - scrollTop - height > 100) {
      showNewBottom = true;
    } else {
      that.scrollToBottom();
    }

    msgList.push(msg);
    that.watchMessage(msg.id);
    that.setData({ msgList, showNewBottom })
  },
  // 阅读单条消息
  watchMessage(id) {
    app.REQUEST(
      API.messageWatch_ + id + API._messageWatch,
      'PUT', {}, false
      );
  },
  // 滚动事件
  scrollScroll(e) {
    scrollEvent = e.detail;

    if(scrollEvent.scrollHeight - scrollEvent.scrollTop - height < 100) {
      let showNewBottom = false;
      this.setData({ showNewBottom })
    }
  },
  /* -end- 事件处理*/

  /* -start- 逻辑处理*/
  setMoreMark(id) {
    let moreMark = 'moreMark_' + id;

    this.setData({ moreMark }, () => {
      this.setData({ scrollIntoScroll: moreMark })
    })
  },
  /* -end- 逻辑处理*/

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
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
    app.SETPAGETHIS(this);
    that = this;
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