// pages/essay/essay.js
const app = getApp();
const { UTIL, API, userInfo } = app.globalData;

let title = '';
let text = '';
let replenishText = '';
let inShort = '';
let draftSetInterval;
// 草稿id
let draftId;
let essayId;
let screenNode;
let popupNode;
let pageOptions;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面类型
    type: false,
    // 发布积分
    integral: 0,
    // 封面图片
    cover: {},
    // 用户信息
    userInfo,
    // 爱好id
    hobbyid: false,
    // 文章详情
    essay: {},
    // 文章补充时间
    replenishTime: false,
    // 操作列表
    utils: []
  },

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
  // 初始化更多按钮
  initUtil() {
    let utils = [];

    utils = [
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
    // 保存
    else if(type == 'save') {
      this.saveUtil();
    }
  },
  // 设置循环保存草稿
  setArtivleDraft() {
    let that = this;

    !!draftSetInterval && clearInterval(draftSetInterval);

    draftSetInterval = setInterval(() => {
      that.articleDraft(true)
    }, 6000);
  },
  // 关闭循环保存草稿
  clearArtivleDraft() {
    !!draftSetInterval && clearInterval(draftSetInterval);
  },
  // 修改积分
  integralInput(e) {
    let integral = e.detail.value;
    
    integral = parseInt(integral.replace(/[^0-9]/ig,""));

    if(integral > userInfo.integral) {
      integral = userInfo.integral;
    }
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
  // 输入补充富文本
  replenishEditorInput(e) {
    let { html } = e.detail.detail;
    let { replenishTime } = this.data;
    
    replenishText = `<br/><sup style="font-size: 10px;color: #929292;">----- ${replenishTime} 补充以下内容 --------</sup><br/>`
    replenishText += html;
    replenishText += `<sub style="font-size: 10px;color: #929292;">----- ${replenishTime} 补充内容结束 --------</sub>`;
  },
  // 输入补充富文本
  getReplenishHtml(e) {
    let { html } = e.detail.content;
    let { replenishTime } = this.data;
    
    replenishText = `<br/><sup style="font-size: 10px;color: #929292;">----- ${replenishTime} 补充以下内容 --------</sup><br/>`
    replenishText += html;
    replenishText += `<sub style="font-size: 10px;color: #929292;">----- ${replenishTime} 补充内容结束 --------</sub>`;
  },
  // 保存修改
  submitUtil() {
    let { essay, integral, cover } = this.data;
    
    // 文章Id存在，表示是编辑文章，编辑文章只需要调用添加补充内容
    if(essay.id && essay.id != '') {
      let params = {
        addText: replenishText,
        id: essay.id
      };
  
      app.REQUEST(API.articleAddText, 'PUT', params, false, { showLoading: true })
        .then(res => {
          let { statusCode } = res;
  
          if(statusCode == 200) {
            if(cover.id) {
              app.REQUEST(`${API.article}${essay.id}${API._cover}?imageId=${cover.id}`, 'PUT', {
                imageId: cover.id
              })
                .then(res => {
                  UTIL.toast('文章更新成功');
                  setTimeout(() => {
                    UTIL.toBack({}, true);
                  }, 1000)
                })
            } else {
              UTIL.toast('文章更新成功');
              setTimeout(() => {
                UTIL.toBack({}, true);
              }, 1000)
            }
          }
        })
    }
    // 发布文章
    else {
      if(
        integral > 0 &&
        (!app.globalData.userInfo.phone ||
        app.globalData.userInfo.phone == '')
      ) {
        popupNode.open();
      } else {
        this.clearArtivleDraft();
        this.issue();
      }
    }
  },
  // 发布文章
  issue() {
    let { hobbyid, integral, cover } = this.data;
    let params = {
      coverId: cover.id, emailText: '',
      hobbyId: hobbyid, integral, title, inShort
    };

    if(essayId) {
      params.id = essayId;
    }

    params.text = text.replace(/\swx:nodeid=\"[0-9]+\"/g, '');

    this.articleDraft().then(res => {     
      app.wxSubscribeMessage(['新的回复提醒']).then(() => {
        app.REQUEST(API.articlePublish + res.data.value, 'POST', params)
          .then(res => {
            let { statusCode } = res;
    
            if(statusCode == 200) {
              draftId = undefined;
              UTIL.toast('发布成功');
              setTimeout(() => {
                UTIL.toBack(false, true);
              }, 1000)
            }
          })
      })
    })
  },
  // 手机号授权回调
  popupConfirm(e) {
    let { confirm, value, callBackKey } = e.detail;

    if(confirm) {
      this.issue();
    }
  },
  // 保存
  saveUtil() {
    this.articleDraft().then(res => {
      UTIL.toBack(false, true);
    })
  },
  // 保存草稿
  articleDraft(auto) {
    let { hobbyid, integral, cover } = this.data;
    let params = {
      coverId: cover.id, emailText: '',
      hobbyId: hobbyid, integral, text, title, inShort
    };

    if(draftId) {
      params.id = draftId;
    }
    return new Promise((resolve, reject) => {
      if(title && title != '') {
        app.REQUEST(API.articleDraft, 'POST', params)
          .then(res => {
            draftId = res.data.value;
            resolve(res);
          })
      } else {
        !auto && UTIL.toast('标题不能为空');
        reject('标题不能为空');
      }
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
    let essay = app.getPageParams();

    pageOptions = options;

    if(options) {
      let { type, hobbyid } = options;
      if(!type || type == '') {
        console.error('文章编辑页面缺必要的传入参数 type');
        return;
      }

      json.type = type;
      // 创建
      if(type == 'create') {
        if(!hobbyid || hobbyid == '') {
          console.error('文章编辑页面, create 状态缺少必要的传入参数 hobbyid');
          return;
        }

        json.hobbyid = options.hobbyid;
      }
      // 编辑
      else if(type == 'compile') {
        if(!essay || Object.keys(essay).length == 0) {
          console.error('文章编辑页面, compile 状态缺少必要的 PageParams 数据');
          return;
        }

        json.essay = essay;
        json.integral = essay.integral;
        json.cover = { url: essay.coverUrl };
        json.replenishTime = UTIL.dateToStr(new Date().getTime(), 3, '-');

        essayId = essay.id;
        title = essay.title;
        text = essay.text;
        inShort = essay.inShort;
      }
    }

    if(options && options.hobbyid) {
      json.hobbyid = options.hobbyid;
    }

    this.setData(json, () => {
      this.initUtil();
    })
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
    popupNode = this.selectComponent("#popup");
    
    if(this.data.type == 'create') {
      this.setArtivleDraft();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.clearArtivleDraft();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.clearArtivleDraft();
    
    title = '';
    text = '';
    replenishText = '';
    inShort = '';
    draftSetInterval = false;
    this.setData({ cover: {}, emailText: "", hobbyId: false , integral: 0});
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