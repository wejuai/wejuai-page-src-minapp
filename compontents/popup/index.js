// compontents/prompt/index.js
const app = getApp();
const { API, UTIL } = app.globalData;

let inputTxt = '';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // title
    title: {
      type: String,
      value: ''
    },
    // 确认按钮文字
    confirmText: {
      type: String,
      value: '确定',
      observer(val) {
        if(!val || val == '') {
          this.setData({ confirmText: '确定' })
        }
      }
    },
    // 取消按钮文字
    cancelText: {
      type: String,
      value: '取消',
      observer(val) {
        if(!val || val == '') {
          this.setData({ cancelText: '取消' })
        }
      }
    },
    // 授权按钮类型
    openType: {
      type: String,
      value: ''
    },
    // 回调函数
    callBackKey: {
      type: String,
      value: ''
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
    // 是否展开
    isOpen: false,
    // 背景显示
    backGroundShow: false,
    backGroundAn: false,
    bodyShow: false,
    bodyAn: false,
    // input value
    inputVal: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 打开
    open() {
      UTIL.an_opacity_out_in(
        this,
        { show: 'backGroundShow', animation: 'backGroundAn' },
        true,
        300,
        0.999999
        );

        
      UTIL.an_opacity_out_in(
        this,
        { show: 'bodyShow', animation: 'bodyAn' },
        true,
        300,
        0.999999
        );

      // UTIL.an_translateY_out_in(
      //   this,
      //   { show: 'bodyShow', animation: 'bodyAn' },
      //   true
      // )
    },
    // 关闭
    close() {
      UTIL.an_opacity_out_in(
        this,
        { show: 'backGroundShow', animation: 'backGroundAn' },
        false
        );
        
      UTIL.an_opacity_out_in(
        this,
        { show: 'bodyShow', animation: 'bodyAn' },
        false
        );
    },
    // 点击确认
    confirm() {
      let { callBackKey } = this.data;

      this.triggerEvent('confirm', {
        confirm: true, callBackKey 
      })
    },
    // 获取用户手机号回调
    getPhoneNumber(e) {
      app.accreditPhone(e)
        .catch(err => { UTIL.toast('授权失败') });
      this.close();
    },
    // 打开授权设置页回调
    openSetting(e) {
      let { callBackKey } = this.data;

      this.triggerEvent('confirm', {
        confirm: true, callBackKey, value: e
      })
    }
  }
})
