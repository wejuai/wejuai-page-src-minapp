// pages/essay/essay.js
const app = getApp();
const { UTIL, API, userInfo, system } = app.globalData;

// 评论顶部 mark
let markLabelNode;
let conInfoNode;
let promptNode;

// 评论输入内容
let commentText = '';
let inputBlurTimeOut = false;
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
    // 文章信息
    essay: {},
    // 文章ID
    essayid: false,
    // 热门评论
    commentHotList: [],
    // 全部评论
    commentList: [],
    // 评论框输入内容（用来清空评论内容）
    commentText: '',
    // 是否已收藏
    collection: false,
    // 是否已点赞
    star: false,
    // 总的评论数量
    commentTotal: 0,
    // 输入框浮动高度
    fixBottom: 0,
    // 浮动评论框显示
    fixInput: false,
    // 传入评论组件的默认选中的一级评论
    stairObj: {},
    // 标签
    mark: [],
    // 展示解锁
    showUnlockShade: false,
    // 
    showUtil: false,
    // 
    buttonBox: { show: false, data: {} }
  },

  /* -start- mark相关 */
  // 已解锁
  hasMarkUnlocked(val, mark) {
    let userInfo = app.globalData.userInfo;
    if(val.integral > 0 && val.unLock && val.userId != userInfo.id) {
      mark.push({ bgc: 'bg_gray_tint fc_gray', orientation: 'top right', title: '已解锁' })
    }
    return mark;
  },
  // 未解锁
  hasMarkNotUnlock(val, mark) {
    let userInfo = app.globalData.userInfo;
    if(val.integral > 0 && !val.unLock && val.userId != userInfo.id) {
      mark.push({ bgc: 'bg_gray_tint fc_gray', orientation: 'top right', title: '未解锁' })
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
    console.log(idx)
    this.setData({ buttonBox: { show: true, data, idx } })
  },
  // 解锁文章
  unlockEssay() {
    let { essay, author } = this.data;
    wx.navigateTo({ url: `/integral/pages/pay/index?header=${author.nickName}&integral=${essay.integral}&type=article&essayid=${essay.id}` });
  },
  // 返回首页
  toHome() {
    UTIL.TOHOME();
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
  // 查看图片大图
  showImage(e) {
    let url = UTIL.getNodeSetData(e, 'url')

    wx.previewImage({
      current: url,
      urls: [url]
    });
  },
  // 取消关注
  cancelAttention() {

  },
  // 关注
  addAttention() {

  },
  // 滚动事件
  scroll(e) {

  },
  // 初始化更多按钮
  initUtil() {
    let { author } = this.data;
    let utils = [];

    if(author.id == userInfo.id) {
      utils = [
        { id: 'delete', class: 'delete', icon: 'icon-shanchu', label:'删除' },
        { id: 'compile', class: 'compile', icon: 'icon-bianji2', label:'编辑' },
        { id: 'revocation', class: 'revocation', icon: 'icon-chexiao', label:'撤销发布' },
        { id: 'setIntegral', class: 'setIntegral', icon: 'icon-jifen', label:'修改积分' }
      ]
    } else {
      utils = [
        { id: 'report', class: 'report', icon: 'icon-jubao', label:'举报' }
      ]
    }
    this.setData({ utils })
  },

  // 初始化标签
  initMark() {
    let { essay } = this.data;
    let mark = [];
        
    mark = this.hasMarkAuthor(essay, mark);
    mark = this.hasMarkUnlocked(essay, mark);
    mark = this.hasMarkNotUnlock(essay, mark);
    mark = this.hasMarkIntegral(essay, mark);

    this.setData({ mark })
  },
  // 点击更多
  utilClick(e) {
    let event = e.detail;

    // 举报
    if(event.id == 'report') {
      this.reportUtil();
    }
    // 删除
    else if(event.id == 'delete') {
      this.deleteUtil();
    }
    // 编辑
    else if(event.id == 'compile') {
      this.compileUtil();
    }
    // 撤销发布
    else if(event.id == 'revocation') {
      this.revocationUtil();
    }
    // 修改积分
    else if(event.id == 'setIntegral') {
      this.setIntegralUtil();
    }
  },
  // 举报
  reportUtil(e) {
    var title = "文章"
    if(e) commen_id = UTIL.getNodeSetData(e, "id");
    else commen_id = false;
    if(e) commen_type = UTIL.getNodeSetData(e, "type");
    else commen_type = false;
    if(e) title = "评论";
    let promptOption = {
      type: 'textarea',
      placeholder: `举报该${title}的理由`,
      confirmText: '不能忍',
      cancelText: '再想想',
      callBackKey: 'increasePromptCallBack',
      label: [{ text: `管理员会根据您提供的理由进行审查` }]
    }
    
    this.setData({ promptOption }, () => {
      promptNode.open();
    })
  },
  // 举报输入确定回调
  increasePromptCallBack(e) {
    let { essayid } = this.data;

    if(e.confirm) {
      let reason = e.value;
      if(!reason || reason == '') {
        UTIL.toast('不要任性，请至少给个理由')
      }
      else if(reason.length < 20 || reason.length > 200) {
        UTIL.toast(`举报理由请控制在 20 ~ 200 字符，当前长度 ${reason.length}`)
      }
      else {
        let appId = essayid;
        if(commen_id) appId = commen_id;
        let appType = 'ARTICLE';
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
  // 修改积分
  setIntegralUtil() {
    let userInfo = app.globalData.userInfo;
    let promptOption = {
      placeholder: '设置积分数量',
      inputType: 'number',
      callBackKey: 'setIntegralPromptCallBack',
      label: `积分最高不能超过 10000`
    }
    
    this.setData({ promptOption, showUtil: false }, () => {
      promptNode.open();
    })
  },
  // 修改积分输入确定回调
  setIntegralPromptCallBack(e) {
    let { essayid } = this.data;

    if(e.confirm) {
      let integral = e.value;

      if(isNaN(integral)) {
        UTIL.toast('积分只能是数字')
      } 
      else if(String(integral).indexOf(".") >= 0) {
        UTIL.toast('积分不能是小数呦~')
      }
      else if(integral > 10000) {
        UTIL.toast('哎，太贵了，文章积分上限是 10000 ~')
      }
      else {
        integral = parseInt(integral);

        let url = `${API.article_}${essayid}${API._integral}?integral=${integral}`;

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
  // prompt 确认事件回调
  promptConfirm(e) {
    let { callBackKey } = e.detail;

    this[callBackKey](e.detail);
  },
  // 删除
  deleteUtil() {
    let { essayid } = this.data;
      
    this.setData({ showUtil: false });
    wx.showModal({
      content: '确定要删除文章吗',
      cancelText: '再想想',
      confirmText: '删除',
      success(res) {
        if(res.confirm) {
          app.REQUEST(API.article_ + essayid, 'DELETE', {}, false, { showLoading: true })
            .then(res => {
              UTIL.toBack(false, true)
            })
        }
      }
    })
  },
  // 编辑
  compileUtil() {
    let { essay } = this.data;
    let url = '/essay/pages/upData/index'

    this.setData({ showUtil: false });
    app.setPageParams(url, essay);
    wx.navigateTo({
      url: `${url}?hobbyid=${essay.hobbyId}&type=compile`
    })
  },
  // 撤销发布
  revocationUtil() {
    let { essayid } = this.data;

    this.setData({ showUtil: false });
    wx.showModal({
      content: '确定要修改文章为草稿吗',
      cancelText: '再想想',
      confirmText: '撤销发布',
      success(res) {
        if(res.confirm) {
          app.REQUEST(API.article_ + essayid + API._revoke, 'POST', {}, false, { showLoading: true })
            .then(res =>{
              UTIL.toBack(false, true)
            })
        }
      }
    })
  },
  // 评论输入
  commentInput(e) {
    let { value } = e.detail;

    commentText = value;
  },
  // 发布评论 
  publishCommost() {
    if(inputBlurTimeOut) {
      clearTimeout(inputBlurTimeOut);
      inputBlurTimeOut = false;
    }
    let { essayid } = this.data;
    let params = {
      appId: essayid,
      appType: 'ARTICLE',
      text: commentText
    };

    app.REQUEST(API.createComment, 'POST', params, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          this.setData({
            commentText: '',
            fixBottom: 0, fixInput: false
          }, this.getCommentHotList)
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
  // 点击更多评论 
  moreComment() {
    this.openComment();
  },
  // 阅读文章
  articleWatch() {
    let { essayid } = this.data;
    app.REQUEST(API.articleWatch + essayid, 'PUT');
  },
  // 切换文章收藏与取消
  articleTabCollect() {
    let { essayid, collection, essay } = this.data;

    if(collection) {
      // 取消
      app.REQUEST(API.articleReduceCollect + essayid, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          UTIL.toast('取消收藏');
          essay.collectNum--
          this.setData({ collection: false, essay })
        }
      })
    } else {
      // 收藏
      app.REQUEST(API.articleGiveCollect + essayid, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          UTIL.toast('已收藏');
          essay.collectNum++
          this.setData({ collection: true, essay })
        }
      })
    }
  },
  // 切换文章点赞与取消
  articleTabStar() {
    let { essayid, star, essay } = this.data;
    
    if(star) {
      // 取消
      app.REQUEST(API.articleReduceStar + essayid, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          essay.starNum--
          this.setData({ star: false, essay })
        }
      })
    } else {
      // 点赞
      app.REQUEST(API.articleGiveStar + essayid, 'PUT', {}, false, { showLoading: true })
      .then(res => {
        if(res.statusCode == 200) {
          essay.starNum++
          this.setData({ star: true, essay })
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
    inputBlurTimeOut = setTimeout(() => {
      this.setData({ fixBottom: 0, fixInput: false });
    }, 500);
  },
  // 打开浮动评论框
  openFixInput() {
    this.setData({ fixInput: true });
  },
  // 点击评论
  stairClick(e) {
    let { commentHotList } = this.data;
    let idx = UTIL.getNodeSetData(e, 'idx');
    let stairObj = commentHotList[idx];

    stairObj.idx = idx;
    this.setData({ stairObj }, this.openComment);
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
  /* -end- 事件处理 */

  /* -start- 获取数据 */
  // 获取文章详情
  getEssayInfo() {
    let { essayid, essay } = this.data;
    let showUnlockShade = false;

    app.REQUEST(API.appArticleInfo + essayid, 'GET', {}, 'app', { showLoading: true })
      .then(res => {
        let { data } = res;
        data.createTime = UTIL.msgTimeSwitch(data.createdAt, 1, '-');

        if(
          data.integral > 0 && !data.unLock &&
          data.userId != userInfo.id
        ) {
          showUnlockShade = true;
        } else {
          showUnlockShade = false;
        }

        this.setData({ essay: data, showUnlockShade }, () => {
          this.initMark();
          this.getHasStar();
          this.getAuthorInfo();
          this.articleWatch();
          this.getCommentHotList();
        })
      })
  },
  // 获取作者详情
  getAuthorInfo() {
    let { essay } = this.data;
    app.REQUEST(API.getOtherUser + essay.userId, 'GET', {}, 'app', { showLoading: true })
      .then(res => {
        this.setData({ author: res.data }, this.initUtil)
      })
  },
  // 查看当前文章是否收藏和点赞
  getHasStar() {
    let { essayid } = this.data;
    app.REQUEST(API.article + essayid, 'GET', {}, false, { showLoading: true })
      .then(res => {
        let { collection, star } = res.data;
        this.setData({ collection, star })
      })
  },
  // 获取评论预览
  getCommentHotList() {
    let { essayid } = this.data;
    let params = {
      appId: essayid, appType: 'ARTICLE', page: 0, size: 2
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
  /* -end- 获取数据 */

  
  /**
   * 自定义生命周期函数--刷新
   */
  resfer() {
    this.getEssayInfo();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options && options.essayid) {
      this.setData({ essayid: options.essayid }, () => {
        this.getEssayInfo();
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    conInfoNode = this.selectComponent("#coninfo");
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