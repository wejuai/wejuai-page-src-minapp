const app = getApp();
const { API, UTIL, height, CONFIG } = app.globalData;

let that;
let scrollEvent = {};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //顶部高度
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    CONFIG, 
    // 聊天关系id
    chatId: false,
    // 滚动到的定位点id
    scrollIntoScroll: false,
    // 滚动定位点id
    scrollIntoView: false,
    // 聊天对方用户信息
    adverse: {},
    // 聊天本人用户信息
    personal: {},
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
  // 获取历史聊天数据
  getList(type) {
    let { page, chatId, size, msgList, preMsgTime, adverse } = this.data;
    let data = { page, size };
    let json = { preMsgTime };
    let moreMarkId = false;

    let req = app.REQUEST(API.messageId_ + adverse.id + API._user, "GET", data, false, { showLoading: true });

    req.then(res => {
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
  // 返回
  toBack() {
    console.log(111)
    UTIL.toBack();
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
  // 发送消息
  inputConfirm(e) {
    let { adverse, msgList, personal } = this.data;
    let { value, type } = e.detail;
    let msg = {};

    if(type == 'image') {
      msg = {
        recipient: adverse.id, ossKey: value.ossKey,
        mediaType: 'IMAGE'
      };
    }
    else {
      msg = { recipient: adverse.id, message: value };
    }

    app.SENDMESSAGE(msg, () => {
      msgList.push({
        createdAt: new Date(),
        mediaType: msg.mediaType,
        ossKey: msg.ossKey,
        recipient: adverse.id,
        sender: personal.id,
        text: value
      });
      
      this.setData({ msgList }, this.scrollToBottom);
    });
  },
  // 滚动事件
  scrollScroll(e) {
    scrollEvent = e.detail;

    if(scrollEvent.scrollHeight - scrollEvent.scrollTop - height < 100) {
      let showNewBottom = false;
      this.setData({ showNewBottom })
    }
  },
  // 图片预览
  previewImg(e) {
    let { msgList } = this.data;
    let src = UTIL.getNodeSetData(e, 'src');
    let imgList = [];
    
    msgList.map(o => {
      if(o.mediaType == 'IMAGE') {
        imgList.push(`${CONFIG.url.media}/${o.ossKey}`);
      }
    })
    wx.previewImage({
      current: src, urls: imgList
    }, true);
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
    if(options) {
      if(!options.name || options.name == '') {
        console.error('聊天页缺少传入参数：name')
      } else {
        wx.setNavigationBarTitle({ title: options.name })
      }

      let params = app.getPageParams();
      let adverse = {
        avatar: params.avatar,
        id: params.userId,
        nickname: params.nickname
      };
      let userInfo = app.globalData.userInfo;
      let personal = {
        avatar: userInfo.headImage,
        id: userInfo.id,
        nickname: userInfo.nickName
      }
      console.log(userInfo)

      this.setData({ chatId: options.id, adverse, personal }, () => {
        this.getList()
      })
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

  }
})