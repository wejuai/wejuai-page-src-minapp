// compontents/cutBox/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 头部列表
    tabList: Array,
    // 显示筛选
    showSceen: {
      type: Boolean,
      value: false
    },
    ///是否自己处理筛选的点击事件 默认 false 如果自己处理 自己绑定点击的事件  showSceenClick 
    sceenEvent:{
      type: Boolean,
      value: false
    },
    isNeedShowEndMsg:{
      type: Boolean,
      value: true
    },
    // 背景色
    background: {
      type: String,
      value: '#ffffff'
    },
    // 初始显示的下标
    define: {
      type: String,
      observer(val) {
        let active = 0;
        if(val && val != '') {
          active = val;
        }
        this.setData({ active })
      }
    },
    // 加载状态 ['firstLoad', 'moreLoad', 'null', 'moreNull']
    loadType: Object,
    // 暂无 相关数据
    nullObj: {
      type: Object,
      value: {
        label: '暂无数据',
        buttom: '发布需求',
        show: true
      }
    },
    // 筛选默认选中值
    defineParams: Object,
    // 其他顶部距离 单位 px
    otherTop: {
      type: Number,
      value: 0
    },
    slotTop: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    scrollHeight: '0rpx',
    // 选中的标签index
    active: 0,
    isRefresh: false,
    // 显示筛选弹框
    sceenShow: false
  },
  
  options:{
    multipleSlots: true,
    addGlobalClass: true
  },

  externalClasses: [ 'scroll-in-box' ],

  /**
   * 组件的方法列表
   */
  methods: {
    // 计算滚动容器高度
    calcScrollHeight() {
      let that = this;
      wx.getSystemInfo({
        success(res) {
          let { otherTop } = that.data;
          let { windowHeight } = res;
          let info = wx.getMenuButtonBoundingClientRect();
          let customBar = info.bottom + info.top - res.statusBarHeight;
          let scrollHeight = (windowHeight - customBar - otherTop) + 'px';

          that.setData({ scrollHeight });
        },
      })
    },
    // 切换标签页
    cutHeaderBind(e) {
      let active = e.currentTarget.dataset.idx;
      let event = this.data.tabList[active];
      this.triggerEvent('cutTab', event);
      this.setData({ active });
    },
    // swiper滑动切换
    cutChange(e) {
      let active = e.detail.current;
      let source = e.detail.source
      let event = this.data.tabList[active];

      if(source == 'touch') {
        this.triggerEvent('cutTab', event);
        this.setData({ active });
      }
    },
    // 下拉刷新
    scrollToupper(e) {
      if(!this.data.isRefresh) {
        
        this.setData({ isRefresh: true }, () => {
          let { active, tabList } = this.data;

          this.triggerEvent('scrollTop', { ...tabList[active] });
        });
      }
    },
    // 触底加载
    scrollTolower(e) {
      let { active, tabList, loadType } = this.data;
      let nowLoadType = loadType[tabList[active].slot];

      if(
        nowLoadType != 'null' &&
        nowLoadType != 'moreNull'
        )
      {
        this.triggerEvent('scrollBottom', { ...tabList[active] });
      }
    },
    // 隐藏加载
    hideRefresh() {
      this.setData({ isRefresh: false });
    },
    // 显示筛选
    showSceenClick() {
      if(this.data.sceenEvent){
        
        this.triggerEvent('showSceenClick');
      }else{
        this.setData({ sceenShow: true })
      }
      
    },
    // 隐藏筛选后回调
    hidenEnd() {
      this.setData({ sceenShow: false })
    },
    // 筛选
    sceenConfirm(e) {
      let { active, tabList } = this.data;
      let sceen = e.detail;
      this.hidenEnd();
      this.triggerEvent("sceenConfirm", { sceen, ...tabList[active]});
    },
    // 空状态按钮点击
    nullClick() {
      let { active, tabList } = this.data;
      this.triggerEvent('null', tabList[active]);
    }
  },

  lifetimes: {
    attached() {
      this.calcScrollHeight();
    }
  }
})
