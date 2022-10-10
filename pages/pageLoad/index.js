// pages/load/index.js
const app = getApp();

let that;
let pageParams = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnShow: false,
    intro: '遨游你内心中的小秘密\n在你的心中总有一个爱好，可能难以启齿，\n可能不敢让别人知道，可能觉得别人会嘲笑你，\n但是内心又挥之不去，\n那这里就是你所需要的地方。\n我们将不通的圈子进行隔离，\n来吧~ ',
  },

  options:{
    styleIsolation:'apply-shared'
  },

  // 监听是否授权
  watchLogin(e) {
    if(e) {
      this.setData({ btnShow: false })
    } else {
      this.setData({ btnShow: true })
    }
  },
  // 跳转主页
  toHome() {
    app.TOHOME(pageParams);
  },
  
onGotUserInfo(e) {
  let that = this;
  
  wx.getUserProfile({
    desc: "获取你的昵称、头像、地区及性别",
    success: data => {
      let wxUserInfo = data.userInfo;
      wx.login({
        success(res) {
          if(res.code) {
            app.REQUEST('/accounts/signUp/wx?code='+res.code, 'POST',data)
              .then(_res => {
                let userInfo = JSON.parse(wxUserInfo);
                userInfo["Set-Cookie"] = _res.header["Set-Cookie"];
                
                if (!userInfo) {
                  return;
                }
                that.setData({
                  userInfo: userInfo
                })
                app.globalData.userInfo = userInfo;
                app.globalData.isLogin = true;
                app.globalData.refresh = new Date();
                wx.setStorageSync('userInfo', userInfo);
                
                that.triggerEvent('confirm', e)
                that.hide();
              })
          }
        }
      })
    },
    fail: res => {
      //拒绝授权
      wx.showToast({ title: '您拒绝了请求', icon: 'none' });
      return;
    }
  })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.updataManager();
    that = this;
    pageParams = options;
    app.watch(false, 'isAccredit', this.watchLogin);
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
    let that = this;
    
    // 获取用户信息
    app.GETUSER((userInfo) => {
      if(userInfo && userInfo.performance) {
        let performance = userInfo.performance;

        if(performance == 'NEW') {
          performance = 'LOW';
        }
        app._setUserFunction(performance).then(() => {
          setTimeout(() => {
            app.TOHOME(pageParams);
          }, 3000);
        })
      }
      else {
        that.setData({ btnShow: true });
      }
    }, true)
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