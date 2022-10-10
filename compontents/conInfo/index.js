// compontents/conInfo/index.js
const app = getApp();
const { UTIL, API, userInfo } = app.globalData;

let commen_id = false;
let commen_type = false;
let promptNode;

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
  // 二级评论列表
  subCommentList: [],
  // 二级评论分页数据集
  subCommentPage: { total: 0, totalPages: 1, size: 10 },
  // 展示二级评论
  subCommentShow: false,
  // 背景显示
  backGroundShow: false,
  backGroundAn: false,
  bodyShow: false,
  bodyAn: false,
  // 一级评论框 placeholder
  stairPlaceholder: '亲，发个评论吧',
  // 二级评论框 placeholder
  subPlaceholder: '',
  userInfo: userInfo,
  parentButtonBox: { data:{}, show:{} },
  subButtonBox: { data:{}, show:{} },
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
    appType: {
      type: String,
      value: 'ARTICLE'
    },
    // 默认选中一级评论
    stairObj: {
      type: Object,
      observer(val) {
        if(val && val.id) {
          this.setData({ coninfoStair: val, subCommentShow: true },
            () => {
              this.cutSubPlaceholder(1);
              this.getSubCommitList()
            }
          )
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
  data: initialData,

  /**
   * 组件的方法列表
   */
  methods: {
    // prompt 确认事件回调
    promptConfirm(e) {
      let { callBackKey } = e.detail;
  
      this[callBackKey](e.detail);
    },
    // 获取一级评论
    getCommentList(obj) {
      let { appId, appType, commentPage, commentList } = this.data;
      let params = {
        appId, appType, size: commentPage.size
      };

      if(obj && obj.detail) {
        params.page = obj.detail.current || 0;
      }

      app.REQUEST(API.comment, 'GET', params, 'app').then(res => {
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
    // 获取二级评论
    getSubCommitList(obj) {
      let { coninfoStair } = this.data;
      let { subCommentPage, subCommentList } = this.data;

      if(!coninfoStair || !coninfoStair.id) {
        return;
      }

      let params = {
        size: subCommentPage.size, commentId: coninfoStair.id
      };

      if(obj && obj.detail) {
        params.page = obj.detail.current;
      } else {
        params.page = 0;
      }

      app.REQUEST(API.commentSub, 'GET', params, 'app').then(res => {
        if(res.statusCode == 200) {
          let { content, totalElements, size } = res.data;

          subCommentList = params.page == 0 ? content : [ ...subCommentList, ...content ];

          subCommentPage.total = totalElements;
          subCommentPage.totalPages = Math.ceil(totalElements / subCommentPage.size);
          subCommentPage.page = params.page;
          
          scrollSubNode.setPage(subCommentPage.page, subCommentPage.totalPages);
          scrollSubNode.endTriggered();
          this.setData({ subCommentList, subCommentPage });
        }
      })
      .catch(() => {
        scrollSubNode.endTriggered();
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
    // 切换到二级评论
    cutSub(e) {
      let idx = UTIL.getNodeSetData(e, 'idx');
      let { commentList } = this.data;
      let coninfoStair = commentList[idx];
      coninfoStair.idx = idx;

      this.setData({ coninfoStair, subCommentShow: true }, () => {
        this.cutSubPlaceholder(1)
        this.getSubCommitList()
      });
    },
    // 切换到一级评论
    cutStair() {
      this.setData({ subCommentShow: false, coninfoSub: {} });
    },
    // 切换二级评论框 placeholder
    cutSubPlaceholder(t) {
      let { coninfoStair, coninfoSub } = this.data;
      let subPlaceholder = '';

      if(t == 1) {
        subPlaceholder = `亲，要回复 ${coninfoStair.senderInfo.nickName} 的评论吗`;
      }
      else if(t == 2) {
        subPlaceholder = `亲，要@ ${coninfoSub.senderInfo.nickName} 吗`
      }

      this.setData({ subPlaceholder })
    },
    // 创建一级评论
    stairInputConfirm(e) {
      let { value } = e.detail;
      let { appId, appType } = this.data;
      let params = {
        appId, appType, text: value
      };

      app.REQUEST(API.createComment, 'POST', params, false, { showLoading: true })
        .then(res => {
          if(res.statusCode == 200) {
            UTIL.toast('评论成功');
            this.getCommentList({ detail: { current: 0 } });
          }
        })
    },
    // 创建二级评论
    subInputConfirm(e) {
      let { value } = e.detail;
      let { appId, appType, coninfoStair, coninfoSub } = this.data;

      // 存在选中的二级评论时，发表评论改成创建@
      if(coninfoSub && coninfoSub.id) {
        this.createRemind(e);
        return;
      }

      let params = {
        appId, appType, text: value, commentId: coninfoStair.id
      };

      app.REQUEST(API.createCommentSub, 'POST', params, false, { showLoading: true })
        .then(res => {
          if(res.statusCode == 200) {
            this.getSubCommitList();
            this.getCommentList({ detail: { current: 0 } });
          }
        })
    },
    // 创建@记录
    createRemind(e) {
      let { value } = e.detail;
      let { appId, appType, coninfoStair, coninfoSub } = this.data;
      let params = {
        appId, appType, text: value,
        commentId: coninfoStair.id,
        receiver: [coninfoSub.senderInfo.id]
      };

      app.REQUEST(API.createCommentRemind, 'POST', params, false, { showLoading: true })
        .then(res => {
          if(res.statusCode == 200) {
            // 创建@记录类型的二级评论
            let params_1 = {
              appId, appType,
              text: `@${coninfoSub.senderInfo.nickName} ${value}`,
              commentId: coninfoStair.id
            };

            app.REQUEST(API.createCommentSub, 'POST', params_1)
              .then(res => {
                if(res.statusCode == 200) {
                  this.setData({ coninfoSub: {} }, () => {
                    this.cutSubPlaceholder(1);
                    this.getSubCommitList();
                    this.getCommentList({ detail: { current: 0 } });
                  });
                }
              })
          }
        })
    },
    // 切换评论点赞取消点赞
    tabStar(e) {
      let idx = UTIL.getNodeSetData(e, 'idx');
      let type = UTIL.getNodeSetData(e, 'type');
      let key = type == 'stair' ? 'commentList' : 'subCommentList';
      let list = this.data[key];
      let { coninfoStair } = this.data;
      let obj = list[idx];

      if(type == 'sub' && !obj) {
        let parentIdx = UTIL.getNodeSetData(e, 'parentidx');
        list = this.data.commentList[parentIdx].subComments.content;
        obj = list[idx];
      }

      if(obj.star) {
        var url = type == 'sub' ? API.unStarCommentSub : API.commentUnStar;
        // 取消
        app.REQUEST(url + obj.id, 'PUT', {}, false, { showLoading: true })
          .then(res => {
            if(res.statusCode == 200) {
              list[idx].star = false;
              list[idx].starNum --;
              if(type == 'stair') {
                coninfoStair = list[idx];
                coninfoStair.idx = idx;
              }
              this.setData({ [key]: list, coninfoStair });
            }
          })
      } else {  
        var url = type == 'sub' ? API.starCommentSub : API.commentStar;
        // 点赞
        app.REQUEST(url + obj.id, 'PUT', {}, false, { showLoading: true })
        .then(res => {
          if(res.statusCode == 200) {
            list[idx].star = true;
            list[idx].starNum ++;
            if(type == 'stair') {
              coninfoStair = list[idx];
              coninfoStair.idx = idx;
            }
      console.log(type, list, obj)
            this.setData({ [key]: list, coninfoStair });
          }
        })
      }
    },
    // 选中二级评论
    selectSub(e) {
      let idx = UTIL.getNodeSetData(e, 'idx');
      let { subCommentList, coninfoSub } = this.data;
      let obj = subCommentList[idx];
      let type = 1;

      if(obj.id == coninfoSub.id) {
        coninfoSub = {};
        type = 1;
      }
      else {
        coninfoSub = obj;
        type = 2;
      }

      this.setData({ coninfoSub }, () => {
        this.cutSubPlaceholder(type);
        subCommentsInputNode.manualFocus();
      });
    },
    parentButtonShow(e) {
      let idx = UTIL.getNodeSetData(e, 'idx');
      let { commentList, parentButtonBox } = this.data;

      parentButtonBox.idx = idx;
      parentButtonBox.data = commentList[idx];
      parentButtonBox.show = { [idx]: true };
      console.log(parentButtonBox, commentList, idx)
      this.setData({ parentButtonBox })
    },
    subButtonShow(e) {
      let idx = UTIL.getNodeSetData(e, 'idx');
      let { subCommentList, subButtonBox } = this.data;

      subButtonBox.idx = idx;
      subButtonBox.data = subCommentList[idx];
      subButtonBox.show = { [idx]: true };
      
      this.setData({ subButtonBox })
    },
    buttonHide() {
      let { parentButtonBox, subButtonBox } = this.data;
      
      delete parentButtonBox.idx;
      parentButtonBox.data = {};
      parentButtonBox.show = {};

      delete subButtonBox.idx;
      subButtonBox.data = {};
      subButtonBox.show = {};
      this.setData({ parentButtonBox, subButtonBox })
    },
    // 举报
    reportUtil(e) {
      if(e) commen_id = UTIL.getNodeSetData(e, "id");
      else commen_id = false;
      if(e) commen_type = UTIL.getNodeSetData(e, "type");
      else commen_type = false;
      let promptOption = {
        mold: 'textarea',
        placeholder: '举报该悬赏的理由',
        confirmText: '不能忍',
        cancelText: '再想想',
        callBackKey: 'reportPromptCallBack',
        label: [{ text: `管理员会根据您提供的理由进行审查` }]
      }
      
      this.setData({ promptOption }, () => {
        promptNode.open();
      })
    },
    // 举报输入确定回调
    reportPromptCallBack(e) {
      let { groupid } = this.data;
  
      if(e.confirm) {
        let reason = e.value;
        if(!reason || reason == '') {
          UTIL.toast('不要任性，请至少给个理由')
        }
        else if(reason.length < 20 || reason.length > 200) {
          UTIL.toast(`举报理由请控制在 20 ~ 200 字符，当前长度 ${reason.length}`)
        }
        else {
          let appId = groupid;
          if(commen_id) appId = commen_id;
          let appType = 'REWARD_DEMAND';
          if(commen_type) appType = commen_type;
          let type = 'APP';
  
          let params = { appId, appType, reason, type };
    
          app.REQUEST(API.report, 'POST', params, false, { showLoading: true })
            .then(res => {
              if(res.statusCode == 200) {
                promptNode.close();
                UTIL.toast("举报成功");
                this.buttonHide();
              }
            })
        }
      }
    },
    delCom() {
      let { parentButtonBox, commentList } = this.data;
      app.REQUEST(API.delComment + parentButtonBox.data.id, 'DELETE').then(res => {
        if(res.statusCode == 200) {
          commentList.splice([parentButtonBox.idx], 1);
          wx.showToast({
            title: '删除评论成功',
            icon: 'none'
          })
          this.buttonHide();
          this.setData({ commentList });
        }
      })
    },
    delComSub() {
      let { subButtonBox, subCommentList } = this.data;
      app.REQUEST(API.delCommentSub + subButtonBox.data.id, 'DELETE').then(res => {
        if(res.statusCode == 200) {
          subCommentList.splice([subButtonBox.idx], 1);
          wx.showToast({
            title: '删除评论成功',
            icon: 'none'
          })
          this.buttonHide();
          this.setData({ subCommentList });
        }
      })
    },
  },

  lifetimes: {
    attached() {
      promptNode = this.selectComponent("#prompt");
    }
  }
})
