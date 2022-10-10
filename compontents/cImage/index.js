// compontents/image/index.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: {
      type: 'String',
      value: ''
    },
    loadImg: {
      type: 'String',
      value: '/icon/imageLoad.png'
    },
    mode: {
      type: 'String',
      value: 'aspectFill'
    },
    full: {
      type: Boolean,
      value: false
    },
    style: {
      type: 'String',
      value: ''
    }
  },

  options: {
    addGlobalClass: true
  },
  externalClasses: [ 'ext-class' ],
  
  /**
   * 组件的初始数据
   */
  data: {
    defaultShow: true,
    animation: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    imgload(e) {
      let that = this;
      app.globalData.UTIL.an_opacity_out_in(that, { animation: 'animation', show: 'defaultShow' }, false);
      this.triggerEvent('loadEnd', e);
    }
  }
})
