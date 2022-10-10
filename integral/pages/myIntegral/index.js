const app = getApp();
const { API, UTIL, payType, channelType } = app.globalData;

let promptNode;
let popupNode;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    integral: 0,
    // 弹层相关
    prompt: {}
  },

  // 跳转积分明细
  toDetail() {
    wx.navigateTo({
      url: '/user/pages/detail/index'
    })
  },

  // 跳转提现明细
  toWithdraw() {
    wx.navigateTo({
      url: '/user/pages/withdraw/index'
    })
  },
  
  // 获取用户详细信息
  userDetailedInfo() {
    app.REQUEST(app.globalData.API.userDetailedInfo, 'GET')
    .then(res => {
      let { statusCode, data } = res;

      if(statusCode == 200) {
        this.setData({ integral: data.integral })
      }
    })
  },

  // 充值弹窗
  rechargeClick() {
    let prompt = {
      title: '充值', confirmText: '支付', placeholder: '输入金额',
      callBackKey: 'recharge', label: `兑换比例：1CNY = 100积分`
    }
    this.setData({ prompt }, () => {
      promptNode.open();
    });
  },
  // 判断用户是否可以提现
  hasWithraw() {
    if(
      !app.globalData.userInfo.phone ||
      app.globalData.userInfo.phone == ''
    ) {
      popupNode.open();
    } else {
      this.withdrawClick();
    }
  },
  // 手机号授权回调
  popupConfirm(e) {
    let { confirm, value, callBackKey } = e.detail;

    if(confirm) {
      app.GETUSER(false, true);
      // this.issue();
    }
  },
  // 提现弹窗
  withdrawClick() {
    let prompt = {
      title: '提现', confirmText: '提现', placeholder: '输入积分',
      callBackKey: 'withdraw', label: [{ text: `兑换比例：100积分 = 1CNY，提现最低限度 1000积分` },
      { text: `提现扣除7%手续费`, style: "color: rgba(115, 131, 255, 1) !important;" }]
    }
    this.setData({ prompt }, () => {
      promptNode.open();
    });
  },
  // 弹窗确认事件
  promptConfirm(e) {
    let { confirm, value, callBackKey } = e.detail;

    if(confirm) {
      // 充值
      if(callBackKey == 'recharge') {
        if(isNaN(value)) {
          UTIL.toast('金额只能是数字哦~')
          return
        }
        else if(String(value).indexOf('.') > -1) {
          UTIL.toast('金额的单位是 元，所以只能是整数')
          return
        }
        else if(value < 0 && String(value).indexOf('-') > -1) {
          UTIL.toast('金额是负数的话，可以试试提现')
          return
        }
        else {
          this.recharge(value);
        }
      }
      // 提现
      else if(callBackKey == 'withdraw') {
        if(isNaN(value)) {
          UTIL.toast('积分只能是数字哦~')
          return
        }
        else if(String(value).indexOf('.') > -1) {
          UTIL.toast('积分目前没有小数，所以只能输入整数')
          return
        }
        else if(value < 0 && String(value).indexOf('-') > -1) {
          UTIL.toast('提现积分是负数的话，可以试试充值')
          return
        }
        else if(value < 1000) {
          UTIL.toast('1000 积分可以兑换 10RMB，所以提现最低是 1000积分')
          return
        }
        else {
          this.withdraw(value);
        }
      }
    }
  },

  // 充值
  recharge(value) {
    let that = this;
    let params = {
      amount: value * 100, state: 'integral/pages/myIntegral/index', 
      type: payType
    };

    app.REQUEST(API.recharge, 'POST', params).then(res => {
      let { statusCode, data } = res

      if(statusCode == 200) {
        app.PAY(data, () => {
          promptNode.close();
          that.onLoad();
        }, () => {
          promptNode.close();
        });
      }
    })
  },
  // 提现
  withdraw(value) {
    let that = this;
    let params = {
      integral: value, channelType
    };

    app.REQUEST(API.withdrawal, 'POST', params).then(res => {
      let { statusCode, data } = res

      if(statusCode == 200) {
        app.wxSubscribeMessage(['审核结果通知']);
        UTIL.toast('提现已申请，等待审核')

        promptNode.close();
        that.onLoad();
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    promptNode = this.selectComponent("#prompt");
    popupNode = this.selectComponent("#popup");

    app.GETUSER(false, true);
    this.userDetailedInfo()
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

  }
})