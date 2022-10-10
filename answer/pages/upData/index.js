// answer/pages/upData/index.js
const app = getApp();
const { UTIL, API } = app.globalData;

// 简介
let inShort = '';
// 内容
let text = '';
// 悬赏id
let groupId;
// 回答id
let answerId;
// 页面参数
let pageOptions;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面类型
    type: false,
    // 回答详情
    answer: {}
  },

  /* -start- 跳转页面 */
  /* -end- 跳转页面 */

  /* -start- 处理事件 */
  // 输入富文本
  editorInput(e) {
    let { html } = e.detail.detail;
    
    text = html;
  },
  // 输入简介
  inShortTextareaInput(e) {
    let { value } = e.detail;
    
    inShort = value;
  },
  // 保存修改
  submit() {
    let { type, answer } = this.data;
    let params = {
      inShort, rewardDemandId: groupId, text
    };

    if(type == 'compile') {
      params.id = answer.id;
    }

    params.text = text.replace(/\swx:nodeid=\"[0-9]+\"/g, '');

    app.wxSubscribeMessage(['悬赏被选中消息']).then(() => {
      app.REQUEST(API.rewardDemandResult, 'POST', params)
        .then(res => {
          let { statusCode } = res;
  
          if(statusCode == 200) {
            UTIL.toast('编辑成功');
            setTimeout(() => {
              UTIL.toBack(false, true);
            }, 1000)
          }
        })
    })
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
    let json = {};
    let answer = app.getPageParams();

    pageOptions = options;

    if(options) {
      let { type, groupid } = options;
      if(!type || type == '') {
        console.error('文章编辑页面缺必要的传入参数 type');
        return;
      }

      json.type = type;
      // 创建
      if(type == 'create') {
        if(!groupid || groupid == '') {
          console.error('回答编辑页面, create 状态缺少必要的传入参数 groupid');
          return;
        }

        groupId = options.groupid;
      }
      // 编辑
      else if(type == 'compile') {
        if(!answer || Object.keys(answer).length == 0) {
          console.error('回答编辑页面, compile 状态缺少必要的 PageParams 数据');
          return;
        }

        json.answer = answer;
        groupId = answer.groupid;
        text = answer.text;
        inShort = answer.inShort;
      }
    }

    this.setData(json)
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})