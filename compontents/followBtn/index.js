// compontents/followBtn/index.js
const app = getApp();
const { API, UTIL } = app.globalData;
const states = {
  user: {
    follow: API.postFollow,
    unFollow: API.postUnFollow,
    type: 'POST'
  },
  hobby: {
    follow: API.hobbyAdd,
    unFollow: API.hobbyReduce,
    type: 'PUT'
  }
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    state: {
      type: String,
      value: 'user',
      observer() {
        this.initReady();
      }
    },
    otherId: {
      type: String,
      observer(val) {
        this.initReady();
      }
    },
    hobby: {
      type: Object,
      value: {}
    },
    userFollow: {
      type: Boolean,
      value: false,
      observer(val) {
        this.initReady();
      }
    },
    hash: {
      type: Number,
      value: 0,
      observer(val) {
        console.log(val);
        this.initReady();
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
    // 是否关注
    is: false,
    // 是否是用户本人
    isUser: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 取消关注
    cancelAttention() {
      let that = this;
      let { otherId, state, hobby } = this.data;
      let obj = states[state];

      wx.showModal({
        content: '是否取消关注',
        cancelText: '再想想',
        confirmText: '取消关注',
        success(e) {
          if(e.confirm) {
            if(state == 'hobby') {
              app.reduceHobby(hobby).then(res => {
                that.setData({ is: false }, () => {
                  that.triggerEvent("callback", false);
                })
              })
            }
            else if(state == 'user') {
              app.REQUEST(obj.unFollow + otherId, obj.type)
                .then(res => {
                  if(res.statusCode == 200) {
                    that.setData({ is: false }, () => {
                      that.triggerEvent("callback", false);
                    })
                  }
                })
            }
          }
        }
      })
    },
    // 关注
    addAttention() {
      let that = this;
      let { otherId, state, hobby } = this.data;
      
      let obj = states[state];
      
      if(state == 'hobby') {
        app.addHobby(hobby).then(res => {
          that.setData({ is: true }, () => {
            that.triggerEvent("callback", true);
          })
        })
      }
      else if(state == 'user') {
        app.REQUEST(obj.follow + otherId, obj.type, {}, false, {coerceLogin: true})
          .then(res => {
            if(res.statusCode == 200) {
              this.setData({ is: true }, () => {
                that.triggerEvent("callback", true);
              })
            }
          })
      }
    },
    // 判断是否已关注用户
    hasFollowUser() {
      let { otherId, userFollow } = this.data;
      let userInfo = app.globalData.userInfo;
      let json = {};

      // 判断该用户是否是本人
      if(otherId == userInfo.id) {
        json.isUser = true;
      } else {
        json.is = userFollow;
      }
      
      this.setData(json);
    },
    // 判断是否已关注爱好
    hasFollowHobby() {
      let { otherId } = this.data;
      let is = false;

      app.globalData.attentionedHobby.map(item => {
        if(item.id == otherId) {
          is = true;
        }
      });

      this.setData({ is })
    },
    // 初始化
    initReady() {
      let { state } = this.data;
      if(state == 'user') {
        this.hasFollowUser()
      }
      else if(state == 'hobby') {
        this.hasFollowHobby()
      }
    }
  },
  lifetimes: {
    attached() {
      this.initReady();
    }
  }
})
