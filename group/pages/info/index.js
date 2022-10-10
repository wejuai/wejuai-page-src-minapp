// pages/group/group.js
const app = getApp();
const { UTIL, API, userInfo, system } = app.globalData;

// 评论顶部 mark
let markLabelNode;
let conInfoNode;
let answerListNode;
let promptNode;

// 评论输入内容
let commentText = '';
let commen_id = false;
let commen_type = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //顶部高度
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    // 当前用户信息
    userInfo,
    // 更多内容
    utils: [],
    // 作者信息
    author: {},
    // 当前用户是否是作者
    isAuthor: false,
    // 悬赏信息
    group: {},
    // 悬赏ID
    groupid: false,
    // 热门评论
    commentHotList: [],
    // 评论框输入内容（用来清空评论内容）
    commentText: '',
    // 热门回答
    answerHotList: [],
    // 是否已收藏
    collection: false,
    // 是否已点赞
    star: false,
    // 总的评论数量
    commentTotal: 0,
    // 总的回答数量
    answerTotal: 0,
    // 输入框浮动高度
    fixBottom: 0,
    // 浮动评论框显示
    fixInput: false,
    // 传入评论组件的默认选中的一级评论
    stairObj: {},
    // 传入回答组件的默认选中的回答
    answerObj: {},
    // Prompt 组件参数
    promptOption: {},
    // 标签
    mark: [],
    // 
    showUtil: false,
    // 
    buttonBox: { show: false, data: {} }
  },

  /* -start- mark相关 */
  // 已结束
  hasMarkEnd(val, mark) {
    if(val.status == 'END') {
      mark.push({ bgc: 'bg_gray_tint fc_gray', orientation: 'top right', title: '已结束' })
    }
    return mark;
  },
  // 锁定
  hasMarkLock(val, mark) {
    if(val.status == 'LOCKING') {
      mark.push({ bgc: 'bg_gray_tint fc_gray', orientation: 'top right', title: '锁定' })
    }
    return mark;
  },
  // 作者
  hasMarkAuthor(val, mark) {
    let userInfo = app.globalData.userInfo;
    if(val.userId == userInfo.id) {
      mark.push({ bgc: 'bg_gray_tint fc_gray', orientation: 'bottom right', title: '作者' })
    }
    return mark;
  },
  // 积分
  hasMarkIntegral(val, mark) {
    if(val.integral > 0) {
      mark.push({ bgc: 'gb_integral fc_white', orientation: 'top left', title: val.integral })
    }
    return mark;
  },
  /* -end- mark相关 */

  /* -start- 事件处理 */
  buttonHide() {
    this.setData({ buttonBox: { show: false } })
  },
  buttonShow(e) {
    let idx = UTIL.getNodeSetData(e, 'idx');
    let data = this.data.commentHotList[idx];
    
    this.setData({ buttonBox: { show: true, data, idx } })
  },
  // 阅读悬赏
  groupWatch() {
    let { groupid } = this.data;
    app.REQUEST(API.rewardDemandWatch + groupid, 'PUT');
  },
  // 切换评论点赞取消点赞
  tabStar() {
    let { buttonBox, commentHotList } = this.data;
    let obj = buttonBox.data;
    
    if(obj.star) {
      // 取消
      app.REQUEST(API.commentUnStar + obj.id, 'PUT', {}, false, { showLoading: true })
        .then(res => {
          console.log(res)
          if(res.statusCode == 200) {
            commentHotList[buttonBox.idx].star = false;
            commentHotList[buttonBox.idx].starNum--;
            buttonBox.show = false;
            this.setData({ buttonBox, commentHotList });
          }
        })
    } else {
      // 点赞
      app.REQUEST(API.commentStar + obj.id, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          commentHotList[buttonBox.idx].star = true;
          commentHotList[buttonBox.idx].starNum++;
          buttonBox.show = false;
          this.setData({ buttonBox, commentHotList });
        }
      })
    }
  },
  // 返回
  toBack() {
    UTIL.toBack();
  },
  utilShow() {
    this.setData({ showUtil: true });
  },
  utilHide() {
    this.setData({ showUtil: false });
  },
  // 滚动事件
  scroll(e) {

  },
  // 初始化更多按钮
  initUtil() {
    let { author, group } = this.data;
    let utils = [];
    let isAuthor = false;

    // 作者
    if(author.id == app.globalData.userInfo.id) {
      isAuthor = true;

      // 已结束结束
      if(group.status == 'END') {
        utils = [
          { id: 'delete', class: 'delete', icon: 'icon-shanchu', label:'删除' }
        ];
      } else
      // 锁定
      if(group.status == 'LOCKING') {
        utils = [];
      }
      else {
        utils = [
          { id: 'delete', class: 'delete', icon: 'icon-shanchu', label:'删除' },
          { id: 'compile', class: 'compile', icon: 'icon-bianji2', label:'编辑' },
          { id: 'return', class: 'return', icon: 'icon-fanhuan', label:'返还积分' },
          { id: 'increase', class: 'increase', icon: 'icon-zhuijia', label:'增加悬赏' }
        ];

        // 是否延时过
        if(!group.extension) {
          utils.push({
            id: 'delayed', class: 'delayed', icon: 'icon-bianji2', label:'延时悬赏' 
          })
        }
      }
    }
    // 回答者
    else if(group.answer) {
      utils = [
        { id: 'myAnswer', class: 'myAnswer', icon: 'icon-huida', label:'我的回答' },
        { id: 'report', class: 'report', icon: 'icon-jubao', label:'举报' }
      ]
    }
    // 其他
    else {
      utils = [
        { id: 'createAnswer', class: 'createAnswer', icon: 'icon-huida', label:'我要回答' },
        { id: 'report', class: 'report', icon: 'icon-jubao', label:'举报' }
      ]
    }

    this.setData({ utils, isAuthor })
  },
  // 初始化标签
  initMark() {
    let { group } = this.data;
    let mark = [];
        
    mark = this.hasMarkAuthor(group, mark);
    mark = this.hasMarkEnd(group, mark);
    mark = this.hasMarkLock(group, mark);
    // mark = this.hasMarkIntegral(group, mark);

    this.setData({ mark })
  },
  // 点击更多
  utilClick(e) {
    let type = UTIL.getNodeSetData(e, "type");

    // 举报
    if(type == 'report') {
      this.reportUtil();
    }
    // 删除
    else if(type == 'delete') {
      this.deleteUtil();
    }
    // 编辑
    else if(type == 'compile') {
      this.compileUtil();
    }
    // 延时悬赏
    else if(type == 'delayed') {
      this.delayedUtil();
    }
    // 积分返还
    else if(type == 'return') {
      this.returnUtil();
    }
    // 增加悬赏
    else if(type == 'increase') {
      this.increaseUtil();
    }
    // 我的回答
    else if(type == 'myAnswer') {
      this.myAnswerUtil();
    }
    // 我要回答
    else if(type == 'createAnswer') {
      this.createAnswerUtil();
    }
  },
  // 我的回答
  myAnswerUtil() {
    let { answerHotList, group, groupid } = this.data;
    let url = '/answer/pages/deal/index';
    let obj_answer = UTIL.findObj(answerHotList, { userId: app.globalData.userInfo.id });
    let obj = { answer: obj_answer, group };

    app.setPageParams(url, obj);
    wx.navigateTo({ url: `${url}?answerid=${obj_answer.id}&groupid=${groupid}` });
  },
  // 我要回答
  createAnswerUtil() {
    let { groupid } = this.data;
    
    wx.navigateTo({ url: `/answer/pages/upData/index?type=create&groupid=${groupid}` })
  },
  // 延时悬赏
  delayedUtil() {
    let that = this;
    let { groupid } = this.data;
      
    wx.showModal({
      content: '申请延时 15 天，每个悬赏只有一次申请延迟的机会，确定要延时悬赏吗',
      cancelText: '再想想',
      confirmText: '延时',
      success(res) {
        if(res.confirm) {
          let url = `${API.rewardDemand_}${groupid}${API._extension}`;
          app.REQUEST(url, 'PUT', {}, false, { showLoading: true })
            .then(res => {
              that.resfer();
            })
        }
      }
    })
  },
  // 积分返还
  returnUtil() {
    let promptOption = {
      mold: 'textarea',
      placeholder: '申请全额返还悬赏积分的理由',
      confirmText: '申请',
      cancelText: '再想想',
      callBackKey: 'returnPromptCallBack',
      label: [{ text: `没有收到有用的回答时，可以说明原因并申请返还悬赏的全部积分` }]
    }
    
    this.setData({ promptOption }, () => {
      promptNode.open();
    })
  },
  // 积分返还输入确定回调
  returnPromptCallBack(e) {
    let { groupid } = this.data;

    if(e.confirm) {
      let reason = e.value;
      if(!reason || reason == '') {
        UTIL.toast('请说明申请全额返还悬赏积分的理由')
      }
      else if(reason.length < 20 || reason.length > 200) {
        UTIL.toast(`理由请控制在 20 ~ 200 字符，当前长度 ${reason.length}`)
      }
      else {
        let params = { id: groupid, reason };
        app.REQUEST(API.applyCancel, 'POST', params, false, { showLoading: true })
          .then(res => {
            if(res.statusCode == 200) {
              promptNode.close();
              UTIL.toBack(false, true)
            }
          })
      }
    }
  },
  // 增加悬赏
  increaseUtil() {
    let that = this;

    this.hasIntegral(() => {
      app.GETUSER((userInfo) => {
        let promptOption = {
          placeholder: '增加积分数量',
          inputType: 'number',
          callBackKey: 'increasePromptCallBack',
          label: [{ text: `剩余可使用积分 ${userInfo.integral}` }]
        }
        
        that.setData({ promptOption }, () => {
          promptNode.open();
        })
      })
    })
  },
  // 增加悬赏输入确定回调
  increasePromptCallBack(e) {
    let { groupid } = this.data;

    if(e.confirm) {
      let integral = e.value;

      if(isNaN(integral)) {
        UTIL.toast('积分只能是数字')
      } 
      else if(String(integral).indexOf(".") >= 0) {
        UTIL.toast('积分不能是小数呦~')
      }
      else if(integral > app.globalData.userInfo.integral) {
        UTIL.toast('哎，积分不够用了~')
      }
      else {
        integral = parseInt(integral);

        let url = `${API.rewardDemand_}${groupid}${API._addReward}?integral=${integral}`;

        app.REQUEST(url, 'PUT', {}, false, { showLoading: true })
          .then(res => {
            if(res.statusCode == 200) {
              promptNode.close();
              this.resfer();
              app.GETUSER()
            }
          })
      }
    }
  },
  // 举报
  reportUtil(e) {
    if(e) commen_id = UTIL.getNodeSetData(e, "id");
    else commen_id = false;
    if(e) commen_type = UTIL.getNodeSetData(e, "type");
    else commen_type = false;
    let promptOption = {
      mold: 'textarea',
      placeholder: '举报该悬赏的理由',
      confirmText: '不能忍',
      cancelText: '再想想',
      callBackKey: 'reportPromptCallBack',
      label: [{ text: `管理员会根据您提供的理由进行审查` }]
    }
    
    this.setData({ promptOption }, () => {
      promptNode.open();
    })
  },
  // 举报输入确定回调
  reportPromptCallBack(e) {
    let { groupid } = this.data;

    if(e.confirm) {
      let reason = e.value;
      if(!reason || reason == '') {
        UTIL.toast('不要任性，请至少给个理由')
      }
      else if(reason.length < 20 || reason.length > 200) {
        UTIL.toast(`举报理由请控制在 20 ~ 200 字符，当前长度 ${reason.length}`)
      }
      else {
        let appId = groupid;
        if(commen_id) appId = commen_id;
        let appType = 'REWARD_DEMAND';
        if(commen_type) appType = commen_type;
        let type = 'APP';

        let params = { appId, appType, reason, type };
  
        app.REQUEST(API.report, 'POST', params, false, { showLoading: true })
          .then(res => {
            if(res.statusCode == 200) {
              promptNode.close();
              UTIL.toast("举报成功");
              this.buttonHide();
            }
          })
      }
    }
  },
  // prompt 确认事件回调
  promptConfirm(e) {
    let { callBackKey } = e.detail;

    this[callBackKey](e.detail);
  },
  // 删除
  deleteUtil() {
    let { groupid } = this.data;
      
    wx.showModal({
      content: '确定要删除悬赏吗',
      cancelText: '再想想',
      confirmText: '删除',
      success(res) {
        if(res.confirm) {
          app.REQUEST(API.rewardDemand_ + groupid, 'DELETE', {}, false, { showLoading: true })
            .then(res => {
              UTIL.toBack(false, true)
            })
        }
      }
    })
  },
  // 编辑
  compileUtil() {
    let { group } = this.data;
    let url = '/group/pages/upData/index'

    app.setPageParams(url, group);
    wx.navigateTo({
      url: `${url}?hobbyid=${group.hobbyId}&type=compile`
    })
  },
  // 评论输入
  commentInput(e) {
    let { value } = e.detail;

    commentText = value;
  },
  // 发布评论 
  publishCommost() {
    let { groupid } = this.data;
    let params = {
      appId: groupid,
      appType: 'REWARD_DEMAND',
      text: commentText
    };

    app.REQUEST(API.createComment, 'POST', params, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          this.setData({ commentText: '' }, this.getCommentHotList)
        }
      })
  },
  // 打开评论弹窗 
  openComment() {
    conInfoNode.open();
  },
  // 关闭评论弹窗 
  closeComment() {

  },
  // 打开回答弹窗 
  openAnswerList() {
    answerListNode.open();
  },
  // 点击更多评论 
  moreComment() {
    this.openComment();
  },
  // 切换悬赏收藏与取消
  articleTabCollect() {
    let { groupid, collection, group } = this.data;

    if(collection) {
      // 取消
      app.REQUEST(API.reduceCollectId + groupid, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          UTIL.toast('取消收藏');
          group.collectNum--
          this.setData({ collection: false, group })
        }
      })
    } else {
      // 收藏
      app.REQUEST(API.giveCollectId + groupid, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          UTIL.toast('已收藏');
          group.collectNum++
          this.setData({ collection: true, group })
        }
      })
    }
  },
  // 切换悬赏点赞与取消
  articleTabStar() {
    let { groupid, star, group } = this.data;
    
    if(star) {
      // 取消
      app.REQUEST(API.reduceStarId + groupid, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          group.starNum--
          this.setData({ star: false, group })
        }
      })
    } else {
      // 点赞
      app.REQUEST(API.giveStarId + groupid, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          group.starNum++
          this.setData({ star: true, group })
        }
      })
    }
  },
  // 切换评论点赞与取消
  commentTabStar(e) {
    let { commentHotList } = this.data;
    let idx = UTIL.getNodeSetData(e, 'idx');
    let obj = commentHotList[idx];

    if(obj.star) {
      // 取消
      app.REQUEST(API.commentUnStar + obj.id, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          commentHotList[idx].star = false;
          commentHotList[idx].starNum--;
          this.setData({ commentHotList })
        }
      })
    } else {
      // 点赞
      app.REQUEST(API.commentStar + obj.id, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          commentHotList[idx].star = true;
          commentHotList[idx].starNum++;
          this.setData({ commentHotList })
        }
      })
    }
  },
  // 关闭评论弹窗事件
  closeEnd() {
    this.getCommentHotList();
  },
  // 评论框获取焦点
  inputFocus(e) {
    this.setData({ fixBottom: e.detail.height });
  },
  // 评论框失去焦点
  inputBlur(e) {
    this.setData({ fixBottom: 0, fixInput: false });
  },
  // 打开浮动评论框
  openFixInput() {
    this.setData({ fixInput: true });
  },
  // 点击评论
  stairClick(e) {
    let { commentHotList } = this.data;
    let idx = UTIL.getNodeSetData(e, 'idx');

    this.setData({ stairObj: commentHotList[idx] }, this.openComment);
  },
  // 删除评论
  delCom() {
    let { buttonBox, commentHotList } = this.data;
    app.REQUEST(API.delComment + buttonBox.data.id, 'DELETE', {}, false, { showLoading: true })
    .then(res => {
      if(res.statusCode == 200) {
        commentHotList.splice([buttonBox.idx], 1);
        buttonBox.show = false;
        wx.showToast({
          title: '删除评论成功',
          icon: 'none'
        })
        this.getCommentHotList();
        this.setData({ buttonBox });
      }
    })
  },
  // 点击回答
  answerClick(e) {
    let { answerHotList, group, groupid } = this.data;
    let idx = UTIL.getNodeSetData(e, 'idx');
    let obj_answer = answerHotList[idx];
    let url = '/answer/pages/deal/index';
    let obj = { answer: obj_answer, group };
    
    app.setPageParams(url, obj);
    wx.navigateTo({ url: `${url}?answerid=${obj_answer.id}&groupid=${groupid}` })
  },
  /* -end- 事件处理 */

  /* -start- 逻辑处理 */
  // 判断积分是否达到 100
  hasIntegral(callBack) {
    let userInfo = app.globalData.userInfo;
    if(userInfo.integral < 100) {
      wx.showModal({
        content: `当前积分为 ${userInfo.integral}，悬赏单次添加积分最低是 100，现在的积分还差点`,
        cancelText: '等等再说',
        cancelColor: '#9A9A9A',
        confirmText: '获取积分',
        confirmColor: '#4DC4FF',
        success(res) {
          if(res.confirm) {
            wx.navigateTo({
              url: '/integral/pages/myIntegral/index',
            })
          }
        } 
      })
      return;
    } else {
      callBack && callBack()
    }
  },
  /* -end- 逻辑处理 */

  /* -start- 获取数据 */
  // 获取悬赏详情
  getGroupInfo() {
    let { groupid } = this.data;
    app.REQUEST(API.rewardDemandId + groupid, 'GET', {}, 'app', { showLoading: true })
      .then(res => {
        let { data } = res;
        data.createTime = UTIL.msgTimeSwitch(data.createdAt, 1, '-');

        this.setData({ group: data }, () => {
          this.groupWatch();
          this.initMark();
          this.getHasStar();
          this.getAuthorInfo();
          this.getCommentHotList();
          this.getAnswerHotList();
        })
      })
  },
  // 获取作者详情
  getAuthorInfo() {
    let { group } = this.data;
    app.REQUEST(API.getOtherUser + group.userId, 'GET', {}, 'app')
      .then(res => {
        this.setData({ author: res.data }, this.initUtil)
      })
  },
  // 查看当前悬赏是否收藏和点赞
  getHasStar() {
    let { group } = this.data;

    this.setData({
      collection: group.collect,
      star: group.star
    })
  },
  // 获取评论预览
  getCommentHotList() {
    let { groupid } = this.data;
    let params = {
      appId: groupid, appType: 'REWARD_DEMAND', page: 0, size: 2
    }

    app.REQUEST(API.comment, 'GET', params, 'app')
      .then(res => {
        if(res.statusCode == 200) {
          let { content, totalElements } = res.data;
          
          content.slice(0, 2);
          this.setData({ commentHotList: content, commentTotal: totalElements });
        }
      })
  },
  // 获取回答预览
  getAnswerHotList() {
    let { groupid, group } = this.data;
    let params = {
      id: groupid, page: 0, size: 100
    }
    
    // 悬赏作者
    if(group.userId == app.globalData.userInfo.id) {
      params.self = false;
    }
    // 回答者
    else if(group.answer) {
      params.self = false;
    }
    // 观众
    else {
      this.setData({ answerHotList: [], answerTotal: 0 });
      return;
    }
    
    app.REQUEST(API.rewardDemandId + groupid + API._rewardSubmission, 'GET', params, 'app')
    .then(res => {
      if(res.statusCode == 200) {
        let { content, totalElements } = res.data;
        
        content.slice(0, 2);
        this.setData({ answerHotList: content, answerTotal: totalElements });
      }
    })
  },
  /* -end- 获取数据 */

  
  /**
   * 自定义生命周期函数--刷新
   */
  resfer() {
    this.getGroupInfo();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options && options.groupid) {
      this.setData({ groupid: options.groupid }, () => {
        this.getGroupInfo();
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    conInfoNode = this.selectComponent("#coninfo");
    answerListNode = this.selectComponent("#answerList");
    promptNode = this.selectComponent("#prompt");
    
    wx.createSelectorQuery().in(this)
    .select('#markLabel').boundingClientRect()
    .exec(res => {
      if(res && res.length) {
        markLabelNode = res[0];
      }
    });
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