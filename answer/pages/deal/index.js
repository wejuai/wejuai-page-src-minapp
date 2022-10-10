// pages/essay/essay.js
const app = getApp();
const { UTIL, API, system } = app.globalData;

// 评论顶部 mark
let markLabelNode;
let conInfoNode;
let moreUtilNode;
let promptNode;
// 编辑的评价信息
let evaluateInfo = {};

// 评论输入内容
let commentText = '';
// 回答详情用于缓存
let answer = {};
// 悬赏详情
let group = {};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //顶部高度
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    // 更多内容
    utils: [],
    // 隐藏更多按钮
    hideUtils: false,
    // 回答发布者信息
    author: {},
    // 回答信息
    answer: {},
    // 回答ID
    answerid: false,
    groupid: false,
    // 输入框浮动高度
    fixBottom: 0,
    // 浮动评论框显示
    fixInput: false,
    // 评价信息
    evaluateInfo: {},
    // 当前用户角色
    userRole: '',
    showUtil: false
  },

  /* -start- 事件处理 */
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
  // 初始化更多按钮
  initUtil() {
    let { author } = this.data;
    let utils = [];
    let userRole = 'other';
    let hideUtils = false;

    // 回答发布者
    if(author.id == app.globalData.userInfo.id) {
      utils = [
        { id: 'compile', class: 'compile', icon: 'icon-bianji2', label:'编辑' },
        { id: 'revocation', class: 'revocation', icon: 'icon-chexiao', label:'撤销回答' },
      ];
      userRole = 'answer';
      hideUtils = false;
    }
    // 悬赏作者
    else if(group.userId == app.globalData.userInfo.id) {
      // 悬赏结束
      if(group.status == 'END') {
        utils = [];
        hideUtils = true;
      }
      // 锁定
      else if(group.status == 'LOCKING') {
        utils = [];
        hideUtils = true;
      }
      else {
        utils = [
          { id: 'designate', class: 'designate', icon: 'icon-xuanding', label:'选定' }
        ];
        hideUtils = false;
      }
      userRole = 'group';
    }

    this.setData({ utils, userRole, hideUtils });
  },
  // 点击更多
  utilClick(e) {
    let type = UTIL.getNodeSetData(e, "type");

    // 删除
    if(type == 'delete') {
      this.deleteUtil();
    }
    // 编辑
    else if(type == 'compile') {
      this.compileUtil();
    }
    // 撤销回答
    else if(type == 'revocation') {
      this.revocationUtil();
    }
    // 选定回答
    else if(type == 'designate') {
      this.designateUtil();
    }
  },
  // 删除
  deleteUtil() {
    let { answerid } = this.data;
      
    wx.showModal({
      content: '确定要删除文章吗',
      cancelText: '再想想',
      confirmText: '删除',
      success(res) {
        if(res.confirm) {
          app.REQUEST(API.article_ + essayid, 'DELETE')
            .then(res => {
              UTIL.toBack(false, true)
            })
        }
      }
    })
  },
  // 编辑
  compileUtil() {
    let { answer, groupid } = this.data;
    let url = '/answer/pages/upData/index'

    answer.groupid = groupid;
    app.setPageParams(url, answer);
    wx.navigateTo({
      url: `${url}?type=compile`
    })
  },
  // 撤销回答
  revocationUtil() {
    let { answerid } = this.data;
      
    wx.showModal({
      content: '撤销的回答可以在草稿中再次发布',
      cancelText: '再想想',
      confirmText: '撤销',
      success(res) {
        if(res.confirm) {
          app.REQUEST(API.rewardSubmission_ + answerid + API._revoke, 'POST')
            .then(res => {
              let { statusCode } = res;
              if(statusCode == 200) {
                UTIL.toBack(false, true)
              }
            })
        }
      }
    })
  },
  // 选定回答
  designateUtil() {
    let { answerid } = this.data;

    wx.showModal({
      content: '恭喜你找到了你想要的',
      cancelText: '再想想',
      confirmText: '就选他了',
      success(res) {
        if(res.confirm) {
          app.REQUEST(API.rewardDemandSelectId + answerid, 'POST')
            .then(res =>{
              let { statusCode, data } = res;
              if(statusCode == 200) {
                UTIL.toBack(false, true)
              }
            })
        }
      }
    })
  },
  // 编辑评分
  starChange(e) {
    evaluateInfo.score = e.detail.num;
    console.log(evaluateInfo, e)
  },
  // 编辑评价
  evaluateInput(e) {
    let { value } = e.detail;

    evaluateInfo.content = value;
  },
  // 提交评价
  submitEvaluate() {
    let params = {
      appId: group.id,
      content: evaluateInfo.content,
      rewardSubmissionId: answer.id,
      score: evaluateInfo.score
    };

    if(!params.content || params.content.length > 200) {
      UTIL.toast('评价内容不得超过 200 个字符');
      return;
    }

    app.REQUEST(API.rewardDemandEvaluate, 'POST', params)
      .then(res => {
        let { statusCode, data } = res;
        if(statusCode == 200) {
          UTIL.toBack(false, true);
        }
      })
  },
  /* -end- 事件处理 */

  /* -start- 获取数据 */
  // 获取回答详情
  getAnswerInfo() {
    this.setData({ answer }, () => {
      this.getAuthorInfo();
      this.getEvaluateInfo();
    })
  },
  // 获取作者详情
  getAuthorInfo() {
    let { userId, headImage, nickName } = answer;
    let author = { id: userId, headImage, nickName };
    this.setData({ author }, this.initUtil);
  },
  // 获取回答评价
  getEvaluateInfo() {
    let evaluateInfo = {};

    if(answer.selected && answer.evaluateInfo) {
      evaluateInfo = answer.evaluateInfo;
    }

    this.setData({ evaluateInfo })
  },
  // 获取回答预览
  getAnswerHotList() {
    let { group } = this.data;
    let params = {
      id: group.id, page: 0, size: 1
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
      return;
    }
    
    app.REQUEST(API.rewardDemandId + group.id + API._rewardSubmission, 'GET', params, 'app')
    .then(res => {
      if(res.statusCode == 200) {
        let { content } = res.data;
        answer = content[0];
        evaluateInfo = answer.evaluateInfo;
        
        this.setData({ evaluateInfo });
      }
    })
  },
  /* -end- 获取数据 */

  
  /**
   * 自定义生命周期函数--刷新
   */
  resfer() {
    this.getAnswerInfo();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let json = {};
    let params = app.getPageParams();

    answer = params.answer;
    group = params.group;

    if(!answer || Object.keys(answer).length == 0) {
      console.error('回答详情页, 缺少必要的 PageParams 数据');
      return;
    }
    if(options) {
      if(!options.answerid || options.answerid == '') {
        console.error('回答详情页, 缺少必要的传入参数 answerid');
        return
      }
    }
    json.answerid = options.answerid;
    json.groupid = options.groupid;
    this.setData(json, this.getAnswerInfo);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    conInfoNode = this.selectComponent("#coninfo");
    moreUtilNode = this.selectComponent("#moreUtil");
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