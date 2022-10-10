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
        let mark = [];
        
        mark = this.hasMarkAuthor(val, mark);
        mark = this.hasMarkUnlocked(val, mark);
        mark = this.hasMarkNotUnlock(val, mark);
        mark = this.hasMarkIntegral(val, mark);

        this.setData({ mark })
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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mark: [],
    markShow: false,
    type: 'integral'
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
    hasMarkUnlocked(val, mark) {
      let userInfo = app.globalData.userInfo;
      if(val.integral > 0 && val.unLock && val.userId != userInfo.id) {
        mark.push({ bgc: 'bg_gray_tint fc_gray', orientation: 'top right', title: '已解锁' })
      }
      return mark;
    },
    // 未解锁
    hasMarkNotUnlock(val, mark) {
      let userInfo = app.globalData.userInfo;
      if(val.integral > 0 && !val.unLock && val.userId != userInfo.id) {
        mark.push({ bgc: 'bg_gray_tint fc_gray', orientation: 'top right', title: '未解锁' })
      }
      return mark;
    },
    // 作者
    hasMarkAuthor(val, mark) {
      let userInfo = app.globalData.userInfo;
      if(val.userId == userInfo.id && this.data.showAuthor) {
        mark.push({ bgc: 'bg_gray_tint fc_gray', orientation: 'bottom right', title: '作者' })
      }
      return mark;
    },
    // 积分
    hasMarkIntegral(val, mark) {
      if(val.integral > 0) {
        mark.push({ bgc: 'gb_integral fc_white', orientation: 'top left', title: val.integral })
      }
      return mark;
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
        url = '/answer/pages/draft/index?draftid=' + id;
        wx.navigateTo({ url });
        return;
      }

      if(
        info.integral > 0 && !info.unLock &&
        info.userId != userInfo.id
      ) {
        wx.showModal({
          content: `阅读文章完整内容需要赞助作者 ${info.integral} 积分`,
          cancelText: '再等等',
          confirmText: '支持作者',
          success() {
            that.articleBuy().then(() => {
              UTIL.toast('感谢您的支持');
              setTimeout(() => {
                wx.navigateTo({ url });
              }, 1000)
            })
          },
          fail() {
            UTIL.toast('作者以后会努力创作出你喜欢的内容');
          }
        })
      } else {
        wx.navigateTo({ url });
      }
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
