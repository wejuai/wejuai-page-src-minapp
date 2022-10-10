// pages/essay/essay.js
const app = getApp();
const { UTIL, API, userInfo } = app.globalData;

let title = '';
let text = '';
let inShort = '';
let draftSetInterval;
// 草稿id
let draftId;
let screenNode;
let editorNode;
let moreUtilNode;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 发布积分
    integral: 0,
    // 封面图片
    cover: {},
    // 用户信息
    userInfo,
    // 爱好id
    hobbyid: false,
    // 草稿详情
    draft: {},
    // 操作列表
    utils: [],
    showUtil: false
  },

  /* -start- 获取数据 */
  // 获取草稿详情
  getDraftInfo() {
    app.REQUEST(API.articleDraftId + draftId, 'GET')
      .then(res => {
        if(res.statusCode == 200) {
          let draft = res.data;
          let json = { draft };
          
          if(draft.hobbyId && draft.hobbyId != '') {
            let hobby = {
              id: draft.hobbyId,
              name: draft.hobbyName,
              image: draft.hobbyImage
            }

            json.hobbyid = draft.hobbyId;
            screenNode.setData({ hobby })
          }

          json.cover = { url: draft.coverUrl };
          json.integral = draft.integral;

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
    let type = UTIL.getNodeSetData(e, 'type');

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
  // 修改积分
  integralInput(e) {
    let integral = e.detail.value;
    
    integral = parseInt(integral.replace(/[^0-9]/ig,""));

    if(integral < 0) {
      integral = 0;
    }

    this.setData({ integral })
  },
  // 输入标题
  titleInput(e) {
    title = e.detail.value;
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
    let type = UTIL.getNodeSetData(e, "type");

    // 发布
    if(type == 'submit') {
      this.submitUtil();
    }
    // 删除
    else if(type == 'delete') {
      this.deleteUtil();
    }
    // 保存
    else if(type == 'save') {
      this.saveUtil();
    }
  },
  // 发布
  submitUtil() {
    // 先存草稿
    this.articleDraft().then(res => {
      // 再发布草稿
      app.REQUEST(API.articlePublish + res.data.value, 'POST')
        .then(res => {
          let { statusCode } = res;

          if(statusCode == 200) {
            UTIL.toast('文章发布成功');
            setTimeout(() => {
              UTIL.toBack(false, true);
            }, 1000)
          }
        })
    })
  },
  // 删除
  deleteUtil() {
    app.REQUEST(API.articleDraftId + draftId, 'DELETE')
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
      UTIL.toBack(false, true);
    })
  },
  // 保存草稿
  articleDraft() {
    let { hobbyid, integral, cover } = this.data;
    let params = {
      coverId: cover.id, emailText: '',
      hobbyId: hobbyid, integral, text, title, inShort
    };

    if(draftId) {
      params.id = draftId;
    }

    params.text = text.replace(/\swx:nodeid=\"[0-9]+\"/g, '');

    return new Promise((resolve, reject) => {
      app.REQUEST(API.articleDraft, 'POST', params)
        .then(res => {
          draftId = res.data.value;
          resolve(res);
        })
    })
  },
  // 设置循环保存草稿
  setArtivleDraft() {
    let that = this;

    !!draftSetInterval && clearInterval(draftSetInterval);

    draftSetInterval = setInterval(() => {
      if(title && title != '') {
        that.articleDraft()
      }
    }, 6000);
  },
  // 筛选改变
  screenChange(e) {
    this.setData({ hobbyid: e.detail.hobby.id })
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    screenNode = this.selectComponent('#screen');
    editorNode = this.selectComponent("#editor");
    moreUtilNode = this.selectComponent("#moreUtil");
    
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