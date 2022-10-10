// compontents/getUserInfoBox/index.js
const app = getApp();

let that;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 用户id
    userId: {
      type: String,
      observer(val) {
        if(!val || val == '') {
          this.show();
        } else {
          this.hide();
        }
      }
    }
  },

  options: {
    addGlobalClass: true
  },

  externalClasses: ['ext-class'],

  /**
   * 组件的初始数据
   */
  data: {
    show: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    watchLogin(e) {
      !e && that.show();
      e && that.hide();
    },
    show() {
      this.setData({ show: true })
    },
    hide() {
      this.setData({ show: false })
    },
    clickTap() {
      let { userId, show } = this.data;
      let userInfo = app.globalData.userInfo;
      if(!show) {
        if(userId == userInfo.id) {
          this.toUserPage();
        } else {
          this.toOtherPage();
        }
      }
    },
    onGotUserInfo(e) {
      let that = this;
      let { userId } = this.data;
      let userInfo = app.globalData.userInfo;

      if(userInfo && userInfo.id) {
        if(userId == userInfo.id) {
          this.toUserPage();
        } else {
          this.toOtherPage();
        }
      } else {
        wx.getUserProfile({
          desc: "获取你的昵称、头像、地区及性别",
          success: data => {
            console.log(data)
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
      
        // if(e.detail && e.detail.iv) {
        //   wx.login({
        //     success(res) {
        //       if(res.code) {
        //         let data = e.detail;
        //         app.REQUEST('/accounts/signUp/wx', 'POST', data)
        //           .then(_res => {
        //             let userInfo = JSON.parse(e.detail.rawData);
        //             userInfo["Set-Cookie"] = _res.header["Cookie"];
                    
        //             if (!userInfo) {
        //               return;
        //             }
        //             that.setData({
        //               userInfo: userInfo
        //             })
        //             app.globalData.userInfo = userInfo;
        //             app.globalData.isAccredit = true;
        //             app.globalData.refresh = new Date();
        //             wx.setStorageSync('userInfo', userInfo);

        //             app.GETUSER(() => {
        //               that.triggerEvent('confirm', e);
        //             })
        //           })
        //       }
        //     }
        //   })
        // }
      }
    },
    // 跳转个人用户中心
    toUserPage() {
      wx.switchTab({ url: '/pages/user/index' })
    },
    // 跳转他人用户中心
    toOtherPage() {
      let { userId } = this.data;
      wx.navigateTo({ url: '/user/pages/otherInfo/index?id=' + userId })
    }
  },
  lifetimes: {
    attached() {
      that = this;
      app.watch(false, 'isAccredit', this.watchLogin);

      this.setData({ show: !app.globalData.isAccredit });
    }
  }
})
