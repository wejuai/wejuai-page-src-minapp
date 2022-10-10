// subIndex/compontents/moreUtil/index.js
const app = getApp();
const { UTIL, userInfo } = app.globalData;

let utilList = [
  { id: 'essay', class: 'essay', src: '/images/article.png', label:'文章', url: '/essay/pages/upData/index' },
  { id: 'group', class: 'group', src: '/images/group.png', label:'悬赏',
  url: '/group/pages/upData/index' }
];
let popupNode;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 爱好对象
    hobby: {
      type: Object,
      value: {}
    },
    // 自定义
    custom: {
      type: Boolean,
      value: false
    },
    // 自定义的点击文案
    btnTxt: {
      type: String,
      value: ''
    },
    hide: {
      type: Boolean,
      value: false
    },
    utils: {
      type: Array,
      observer(val) {
        if(val) {
          this.setData({ utilList: val })
        } else {
          this.setData({ utilList })
        }
      }
    }
  },

  externalClasses: [ 'ext-class' ],
  
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 操作列表
    utilList,
    // 是否展开
    isOpen: false,
    // 背景显示
    backGroundShow: false,
    backGroundAn: false,
    bodyShow: false,
    bodyAn: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击操作按钮事件
    toUtil(e) {
      if(this.data.hide) {
        popupNode.open();
        return;
      };
      let idx = UTIL.getNodeSetData(e, 'idx');
      let obj = this.data.utilList[idx];
      let that = this;
      let userInfo = app.globalData.userInfo;

      if(obj.id == 'group') {
        if(userInfo.integral < 100) {
          wx.showModal({
            content: `当前积分为 ${userInfo.integral}，发布悬赏的最低积分是 100，所以现在还不可以发布悬赏`,
            cancelText: '等等再说',
            cancelColor: '#9A9A9A',
            confirmText: '获取积分',
            confirmColor: '#4DC4FF',
            success(res) {
              if(res.confirm) {
                wx.navigateTo({
                  url: '/integral/pages/myIntegral/index',
                })
                that.close();
              } else if(res.cancel) {
                that.close();
              }
            } 
          })
          return;
        } else {
          this.close();
          wx.navigateTo({
            url: `${obj.url}?hobbyid=${this.data.hobby.id}&type=create`
          });
        }
      }
      else if(obj.id == 'essay') {
        this.close();
        wx.navigateTo({
          url: `${obj.url}?hobbyid=${this.data.hobby.id}&type=create`
        });
      }
      else {
        this.triggerEvent('util', obj)
      }
    },
    // 点击悬浮按钮
    btnClick() {
      if(this.data.custom) {
        this.triggerEvent('click');
      } else {
        this.open();
      }
    },
    // 点击关注
    popupConfirm() {
      popupNode.close();
      this.triggerEvent('follow');
    },
    // 打开
    open() {
      popupNode = this.selectComponent("#popup");
      UTIL.an_opacity_out_in(
        this,
        { show: 'backGroundShow', animation: 'backGroundAn' },
        true,
        300,
        0.9
        );

      UTIL.an_translateY_out_in(
        this,
        { show: 'bodyShow', animation: 'bodyAn' },
        true
      )
    },
    // 关闭
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
      )
    }
  }
})
