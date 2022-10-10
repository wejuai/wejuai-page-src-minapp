// pages/group/group.js
const app = getApp();
const { UTIL, API, userInfo } = app.globalData;

let title = '';
let text = '';
let replenishText = '';
let inShort = '';
let groupId;
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
    integral: 100,
    // 用户信息
    userInfo,
    // 爱好id
    hobbyid: false,
    // 悬赏详情
    group: {},
    // 补充内容时间
    replenishTime: false
  },

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
  // 修改积分
  integralInput(e) {
    let integral = e.detail.value;
    
    integral = parseInt(integral.replace(/[^0-9]/ig,""));

    if(integral > userInfo.integral) {
      integral = userInfo.integral;
    }
    if(integral < 100) {
      integral = 100;
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
    
    replenishText = `<br/><p style="font-size: 24rpx;color: #F2F2F2FF;">----- ${replenishTime} 补充以下内容 --------</p><br/>`
    replenishText += html;
    replenishText += `<br/><p style="font-size: 24rpx;color: #F2F2F2FF;">----- ${replenishTime} 补充内容结束 --------</p>`;
  },
  // 输入补充富文本
  getReplenishHtml(e) {
    let { html } = e.detail.content;
    let { replenishTime } = this.data;
    
    replenishText = `<br/><sup style="font-size: 10px;color: #929292;">----- ${replenishTime} 补充以下内容 --------</sup><br/>`
    replenishText += html;
    replenishText += `<sub style="font-size: 10px;color: #929292;">----- ${replenishTime} 补充内容结束 --------</sub>`;
  },
  // 发布
  submit() {
    let { group } = this.data;

    // 悬赏Id存在，表示是编辑悬赏，编辑悬赏只需要调用添加补充内容
    if(group.id && group.id != '') {
      let params = {
        addText: replenishText,
        id: group.id
      };
  
      app.REQUEST(API.rewardDemandAddText, 'PUT', params, false, { showLoading: true })
        .then(res => {
          let { statusCode } = res;
  
          if(statusCode == 200) {
            app.GETUSER(false, true);
            UTIL.toast('悬赏更新成功');
            setTimeout(() => {
              UTIL.toBack({}, true);
            }, 1000)
          }
        })
    }
    // 发布悬赏
    else {
      if(
        !app.globalData.userInfo.phone ||
        app.globalData.userInfo.phone == ''
      ) {
        popupNode.open();
      } else {
        this.issue();
      }
    }
  },
  // 发布
  issue() {
    let { hobbyid, integral } = this.data;
    let params = {
      hobbyId: hobbyid, integral, text, title, inShort
    };

    app.wxSubscribeMessage(['新的回复提醒', '悬赏到期通知']).then(() => {
      app.REQUEST(API.postRewardDemand, 'POST', params)
        .then(res => {
          let { statusCode } = res;
  
          if(statusCode == 200) {
            app.GETUSER(false, true);
            UTIL.toast('悬赏发布成功');
            setTimeout(() => {
              UTIL.toBack({}, true);
            }, 1000)
          }
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
  /* -end- 处理事件 */

  /**
   * 自定义生命周期函数--返回
   */
  callBack(e) {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let json = {};
    let group = app.getPageParams();

    pageOptions = options;

    if(options) {
      let { type, hobbyid } = options;
      if(!type || type == '') {
        console.error('悬赏编辑页面缺必要的传入参数 type');
        return;
      }

      json.type = type;
      // 创建
      if(type == 'create') {
        if(!hobbyid || hobbyid == '') {
          console.error('悬赏编辑页面, create 状态缺少必要的传入参数 hobbyid');
          return;
        }

        json.hobbyid = options.hobbyid;
      }
      // 编辑
      else if(type == 'compile') {
        if(!group || Object.keys(group).length == 0) {
          console.error('悬赏编辑页面, compile 状态缺少必要的 PageParams 数据');
          return;
        }

        json.group = group;
        json.integral = group.integral;
        json.replenishTime = UTIL.dateToStr(new Date().getTime(), 3, '-');

        groupId = group.id;
        title = group.title;
        text = group.text;
        inShort = group.inShort;
      }
    }

    this.setData(json);
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
    title = '';
    text = '';
    replenishText = '';
    inShort = '';
    this.setData({ integral: 100, hobbyid: false, group: {}, replenishTime: false });
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