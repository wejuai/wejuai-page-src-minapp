// compontents/conInfo/index.js
const app = getApp();
const { UTIL, API } = app.globalData;

// 一级评论列表滚动元素node
let scrollStairNode;
// 二级评论列表滚动元素node
let scrollSubNode;
// 二级评论输入框元素node
let subCommentsInputNode;
// 初始data
let initialData = {
  // 二级评论下选中的一级评论对象
  coninfoStair: {},
  // 二级评论下选中的二级评论对象
  coninfoSub: {},
  // 一级评论列表
  commentList: [],
  // 一级评论分页数据集
  commentPage: { total: 0, totalPages: 1, size: 10 },
  // 背景显示
  backGroundShow: false,
  backGroundAn: false,
  bodyShow: false,
  bodyAn: false,
  // 一级评论框 placeholder
  stairPlaceholder: '亲，发个评论吧'
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 文章Id、悬赏Id
    appId: {
      type: String,
      value: ''
    },
    // 悬赏作者
    appAuthorId: {
      type: String,
      value: ''
    }
  },

  options: {
    addGlobalClass: true
  },

  externalClasses: ['ext-class'],

  /**
   * 组件的初始数据
   */
  data: initialData,

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取回答列表
    getCommentList(obj) {
      let { appId, appAuthorId, commentPage, commentList } = this.data;
      let params = {
        id: appId, size: commentPage.size, self: false
      };

      if(obj && obj.detail) {
        params.page = obj.detail.current || 0;
      }

      app.REQUEST(API.rewardDemandId + groupid + API._rewardSubmission, 'GET', params, 'app').then(res => {
        if(res.statusCode == 200) {
          let { content, totalElements, size } = res.data;

          commentList = params.page == 0 ? content : [ ...commentList, ...content ];

          commentPage.total = totalElements;
          commentPage.totalPages = Math.ceil(totalElements / commentPage.size);
          commentPage.page = params.page;
 
          scrollStairNode.setPage(commentPage.page, commentPage.totalPages);
          scrollStairNode.endTriggered();
          this.setData({ commentList, commentPage });
        }
      })
      .catch(() => {
        scrollStairNode.endTriggered();
      })
    },
    // 打开弹窗
    open() {
      UTIL.an_opacity_out_in(
        this,
        { show: 'backGroundShow', animation: 'backGroundAn' },
        true,
        300,
        0.5
        );

      UTIL.an_translateY_out_in(
        this,
        { show: 'bodyShow', animation: 'bodyAn' },
        true
      ),
      
      scrollStairNode = this.selectComponent('#scrollStair');
      scrollSubNode = this.selectComponent('#scrollSub');
      subCommentsInputNode = this.selectComponent('#subCommentsInput');
    },
    // 关闭弹窗
    close() {
      UTIL.an_opacity_out_in(
        this,
        { show: 'backGroundShow', animation: 'backGroundAn' },
        false
        );
        
      UTIL.an_translateY_out_in(
        this,
        { show: 'bodyShow', animation: 'bodyAn' },
        false
      );

      setTimeout(() => {
        this.triggerEvent('closeEnd');
        this.setData(initialData)
      }, 300);
    },
    // 跳转到回答详情
    toAnswerDeal(e) {
      let { commentList } = this.data;
      let idx = UTIL.getNodeSetData(e, 'idx');
      let obj = commentList[idx];
      let url = '/answer/pages/deal/index';

      app.setPageParams(url, obj);
      wx.navigateTo({ url: `${url}?answerid=${obj.id}` })
    }
  },

  lifetimes: {
    attached() {

    }
  }
})
