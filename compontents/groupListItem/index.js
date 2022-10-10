// essay/compontents/listItem/index.js
const app = getApp();
const { UTIL, API, userInfo } = app.globalData;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: 'Object',
      observer(val) {
        this.hasMarkAuthor(val);
        this.hasMarkEnd(val);
        this.hasMarkLock(val);
        this.hasMarkIntegral(val);
      }
    },
    // 显示“悬赏”
    showGroupMark: {
      type: Number,
      value: false
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
    userInfo,
    // 已锁定
    show_unlocked: false,
    // 作者
    show_author: false,
    // 展示积分
    show_integral: false,
    // 已结束
    show_end: false
  },
  
  options:{
    styleIsolation:'apply-shared'
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /* -start- mark相关 */
    // 已结束
    hasMarkEnd(val) {
      if(val.status == 'END') {
        this.setData({ show_end: true });
      }
    },
    // 锁定
    hasMarkLock(val) {
      if(val.status == 'LOCKING') {
        this.setData({ show_unlocked: true });
      }
    },
    // 作者
    hasMarkAuthor(val) {
      let userInfo = app.globalData.userInfo;
      if(val.userId == userInfo.id && this.data.showAuthor) {
        this.setData({ show_author: true })
      }
    },
    // 积分
    hasMarkIntegral(val) {
      if(val.integral > 0) {
        this.setData({ show_integral: true })
      }
    },
    /* -end- mark相关 */

    // 跳转个人中心
    toUser(e) {
      let otherId = app.globalData.UTIL.getNodeSetData(e, 'userid');
      
      wx.navigateTo({ url: '/user/pages/otherInfo/index?id=' + otherId })
    },
    // 跳转悬赏详情
    toEssay(e) {
      let id = UTIL.getNodeSetData(e, 'id');
      let { info, userInfo, draft } = this.data;
      let url = '/group/pages/info/index?groupid=' + id;
      let that = this;

      wx.navigateTo({ url });
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
  }
})
