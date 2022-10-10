// pages/essay/essay.js
const app = getApp();
const { UTIL, API, userInfo } = app.globalData;

let title = '';
let text = '';
let inShort = '';
let draftSetInterval;
// 草稿id
let draftId;
let editorNode;
let moreUtilNode;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 发布积分
    integral: 0,
    // 用户信息
    userInfo,
    // 草稿详情
    draft: {},
    utils: [],
    showUtil: false
  },

  /* -start- 获取数据 */
  // 获取草稿详情
  getDraftInfo() {
    app.REQUEST(API.rewardSubmissionDraft_ + draftId, 'GET')
      .then(res => {
        if(res.statusCode == 200) {
          let draft = res.data;
          let json = { draft };

          title = draft.title;
          text = draft.text;
          inShort = draft.inShort;

          this.setData(json, this.initUtil);
        }
      })
  },
  /* -end- 获取数据 */

  /* -start- 跳转页面 */
  // 跳转图片剪裁页面
  toCropper(e) {
    let type = e.target.dataset.type;

    wx.navigateTo({
      url: '/pages/cropper/index?type=' + type
    })
  },
  /* -end- 跳转页面 */

  /* -start- 处理事件 */
  utilShow() {
    this.setData({ showUtil: true });
  },
  utilHide() {
    this.setData({ showUtil: false });
  },
  // 输入描述
  inShortTextareaInput(e) {
    inShort = e.detail.value;
  },
  // 输入富文本
  editorInput(e) {
    let { html } = e.detail.detail;
    
    text = html;
    inShort = e.detail.detail.text.substring(0, 100).replace(/\n/g,"").replace(/\r/g,"");
  },
  // 输入富文本
  getHtml(e) {
    let { html } = e.detail.content;
    
    text = html;
    inShort = e.detail.content.text.substring(0, 100).replace(/\n/g,"").replace(/\r/g,"");
  },
  // 图片上传插入示例
  insertImage(e){ 
    let opt = e.detail;
    this.selectComponent('#hf_editor').insertImage(opt);
  },
  // 初始化更多按钮
  initUtil() {
    let utils = [];

    utils = [
      { id: 'delete', class: 'delete', icon: 'icon-shanchu', label:'删除' },
      { id: 'submit', class: 'submit', icon: 'icon-fabu', label:'发布' },
      { id: 'save', class: 'save', icon: 'icon-166991', label:'保存' },
    ]
    this.setData({ utils })
  },
  // 点击更多
  utilClick(e) {
    let event = e.detail;

    // 发布
    if(event.id == 'submit') {
      this.submitUtil();
    }
    // 删除
    else if(event.id == 'delete') {
      this.deleteUtil();
    }
    // 保存
    else if(event.id == 'save') {
      this.saveUtil();
    }
  },
  // 发布
  submitUtil() {
    // 先存草稿
    this.articleDraft().then(res => {
      // 再发布草稿
      app.REQUEST(API.rewardSubmissionDraft_ + draftId + API._publish, 'POST')
        .then(res => {
          let { statusCode } = res;

          if(statusCode == 200) {
            UTIL.toast('回答发布成功');
            setTimeout(() => {
              UTIL.toBack(false, true);
            }, 1000)
          }
        })
    })
  },
  // 删除
  deleteUtil() {
    app.REQUEST(API.rewardSubmissionDraft_ + draftId, 'DELETE')
      .then(res => {
        let { statusCode } = res;
        if(statusCode == 200) {
          UTIL.toBack(false, true);
        }
      })
  },
  // 保存
  saveUtil() {
    this.articleDraft().then(res => {
      this.toBack(false, true);
    })
  },
  // 保存草稿
  articleDraft() {
    let params = {
      text, inShort
    };

    return new Promise((resolve, reject) => {
      app.REQUEST(API.rewardSubmissionDraft_ + draftId, 'PUT', params)
        .then(res => {
          resolve(res);
        })
    })
  },
  // 设置循环保存草稿
  setArtivleDraft() {
    let that = this;

    !!draftSetInterval && clearInterval(draftSetInterval);

    draftSetInterval = setInterval(() => {
      that.articleDraft()
    }, 6000);
  },
  /* -end- 处理事件 */

  /**
   * 自定义生命周期函数--返回
   */
  callBack(e) {
    this.setData({ cover: e });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options && options.draftid) {
      draftId = options.draftid;

      this.getDraftInfo();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    editorNode = this.selectComponent("#editor");
    moreUtilNode = this.selectComponent("#moreUtil");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setArtivleDraft();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    !!draftSetInterval && clearInterval(draftSetInterval);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    !!draftSetInterval && clearInterval(draftSetInterval);
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