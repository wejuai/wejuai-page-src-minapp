// compontents/comments/index.js
const app = getApp();
const { UTIL } = app.globalData;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: '亲，说点什么'
    },
    // 开启前部 slot
    pre: {
      type: Boolean,
      value: false
    },
    notUtil: {
      type: Boolean,
      value: false
    }
  },

  options: {
    addGlobalClass: true,
    multipleSlots: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 工具栏开关
    utilShow: false,
    // 工具栏动画
    animation: false,
    // 输入内容
    value: '',
    // 键盘高度
    fixBottom: 0,
    // 获取焦点
    focus: false,
    // 显示input浮动
    inputShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 切换工具栏
    switchUtil(show) {
      let { utilShow } = this.data;
      let height = utilShow ? '0rpx' : '200rpx';

      if(show != undefined && show.constructor == Boolean) {
        height = !show ? '0rpx' : '200rpx';
      }

      app.globalData.UTIL.an_height_open_fold(this, { animation: 'animation' }, height);
      if(show != undefined) {
        this.setData({ utilShow: show })
      } else {
        this.setData({ utilShow: !utilShow })
      }
    },
    // 点击inputView
    openInput() {
      this.setData({ inputShow: true, focus: true });
    },
    // 输入
    inputInput(e) {
      this.setData({ value: e.detail.value });
    },
    // 发送消息
    inputConfirm(e) {
      let { value } = this.data;
      this.triggerEvent('inputConfirm', {
        value: value, type: 'text'
      });
      this.setData({ value: '', focus: false })
    },
    // 获取焦点
    bindfocus(e) {
      this.setData({ fixBottom: e.detail.height })
    },
    // 失去焦点
    bindblur(e) {
      this.setData({ fixBottom: 0, focus: false, inputShow: false })
    },
    // 手动过去焦点
    manualFocus() {
      this.setData({ focus: true });
    },
    // 发送图片
    sendImg() {
      let that = this;
      wx.chooseImage({
        success(res) {
          let { tempFilePaths } = res;
          let n = 0;
          let load = wx.showLoading({
            title: `${n+1} / ${tempFilePaths.length}`, mask: true
          })

          tempFilePaths.map((o, i) => {
            app.UPLOADIMG('MESSAGE', o, res => {
              n ++;
              
              load = wx.showLoading({
                title: `${n+1} / ${tempFilePaths.length}`, mask: true
              })

              if(n >= tempFilePaths.length) {
                wx.hideLoading()
              }

              that.triggerEvent('inputConfirm', {
                value: res, type: 'image'
              });
              that.switchUtil(false);
            })
          })
        }
      })
    }
  }
})
