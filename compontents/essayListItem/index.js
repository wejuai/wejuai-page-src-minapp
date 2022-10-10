// essay/compontents/listItem/index.js
const app = getApp();
const { UTIL, API } = app.globalData;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: 'Object',
      observer(val) {
        this.hasMarkAuthor(val);
        this.hasMarkUnlocked(val);
        this.hasMarkIntegral(val);
      }
    },
    // 显示爱好
    showHobby: {
      type: Boolean,
      value: false
    },
    // 显示当前用户是否是作者
    showAuthor: {
      type: Boolean,
      value: true
    },
    // 是否是草稿
    draft: {
      type: Boolean,
      value: false
    },
    // 是否显示foot
    foot: {
      type: Boolean,
      value: true
    },
    // index
    index: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mark: [],
    markShow: false,
    type: 'integral',
    // 显示锁定
    show_locked: false,
    // 作者
    show_author: false,
    // 展示积分
    show_integral: false,
    show_ani: false
  },
  
  options:{
    styleIsolation:'apply-shared'
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /* -start- mark相关 */
    // 已解锁
    hasMarkUnlocked(val) {
      let userInfo = app.globalData.userInfo;
      let show_locked = val.integral > 0 && !val.unLock && val.userId != userInfo.id;
      
      this.setData({ show_locked });
    },
    // 作者
    hasMarkAuthor(val) {
      let userInfo = app.globalData.userInfo;
      let show_author = val.userId == userInfo.id && this.data.showAuthor;
      
      this.setData({ show_author });
    },
    // 积分
    hasMarkIntegral(val) {
      let show_integral = val.integral > 0;
      
      this.setData({ show_integral });
    },
    /* -end- mark相关 */

    // 跳转个人中心
    toUser(e) {
      let otherId = app.globalData.UTIL.getNodeSetData(e, 'userid');
 
      wx.navigateTo({ url: '/user/pages/otherInfo/index?id=' + otherId })
    },
    // 跳转文章详情
    toEssay(e) {
      let id = UTIL.getNodeSetData(e, 'id');
      let { info, draft } = this.data;
      let url = '/essay/pages/info/index?essayid=' + id;
      let that = this;
      let userInfo = app.globalData.userInfo;

      if(draft) {
        url = '/essay/pages/draft/index?draftid=' + id;
        wx.navigateTo({ url });
        return;
      }

      // if(
      //   info.integral > 0 && !info.unLock &&
      //   info.userId != userInfo.id
      // ) {
      //   wx.showModal({
      //     content: `阅读文章完整内容需要赞助作者 ${info.integral} 积分`,
      //     cancelText: '再等等',
      //     confirmText: '支持作者',
      //     success(e) {
      //       if(e.confirm) {
      //         that.articleBuy().then(() => {
      //           UTIL.toast('感谢您的支持');
      //           app.GETUSER(false, true);
      //           setTimeout(() => {
      //             wx.navigateTo({ url });
      //           }, 1000)
      //         })
      //       }
      //     },
      //     fail() {
      //       UTIL.toast('作者以后会努力创作出你喜欢的内容');
      //     }
      //   })
      // } 
      // else {
        wx.navigateTo({ url });
      // }
    },
    // 跳转爱好子站
    toHobby(e) {

    },
    // 点赞
    tabStar() {
      let { info } = this.data;

      if(info.star) {
        // 取消
        app.REQUEST(API.articleReduceStar + info.id, 'PUT')
          .then(res => {
            if(res.statusCode == 200) {
              info.star = false;
              info.starNum --
              this.setData({ info });
            }
          })
      } else {
        // 点赞
        app.REQUEST(API.articleGiveStar + info.id, 'PUT')
          .then(res => {
            if(res.statusCode == 200) {
              info.star = true;
              info.starNum ++
              this.setData({ info });
            }
          })
      }
    },
    // 收藏
    tabCollect() {
      let { info } = this.data;

      if(info.collect) {
        // 取消
        app.REQUEST(API.articleReduceCollect + info.id, 'PUT')
          .then(res => {
            if(res.statusCode == 200) {
              info.collect = false;
              info.collectNum --
              this.setData({ info });
            }
          })
      } else {
        // 点赞
        app.REQUEST(API.articleGiveCollect + info.id, 'PUT')
          .then(res => {
            if(res.statusCode == 200) {
              info.collect = true;
              info.collectNum ++
              this.setData({ info });
            }
          })
      }
    },
    // 购买文章
    articleBuy() {
      let { info } = this.data;

      return new Promise((resolve, reject) => {
        app.REQUEST(API.article_ + info.id + API._buy)
          .then(res => {
            if(res.statusCode == 200) {
              resolve()
            }
          })
      })
    },
  }
})
