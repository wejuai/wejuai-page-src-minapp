// compontents/prompt/index.js
const app = getApp();
const { API, UTIL } = app.globalData;

let inputTxt = '';
let moreInputTxt = '';

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
    // placeholder
    placeholder: {
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
    // 更多的输入框
    moreInput: {
      type: Object,
      value: {},
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
    // 回调函数
    callBackKey: {
      type: String,
      value: ''
    },
    // input 输入类型
    inputType: {
      type: String,
      value: 'text'
    },
    // label
    label: {
      type: Array,
      value: []
    },
    mold: {
      type: String,
      value: 'input'
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
    inputVal: '',
    moreInputVal: ''
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
        0.9999
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
      );
      setTimeout(() => {
        this.initialData()
      }, 300)
    },
    // 输入事件
    inputInput(e) {
      let { value } = e.detail;

      inputTxt = value;
    },
    // 更多输入事件
    moreInputInput(e) {
      let { value } = e.detail;

      moreInputTxt = value;
    },
    // 初始化数据
    initialData() {
      inputTxt = '';
      moreInputText = '';
      this.setData({ inputVal: '', moreInputVal: '' });
    },
    // 点击确认
    confirm() {
      let { callBackKey } = this.data;

      this.triggerEvent('confirm', {
        confirm: true, value: inputTxt, moreValue: moreInputTxt, callBackKey 
      })
    }
  }
})
