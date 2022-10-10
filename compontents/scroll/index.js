// compontents/scroll/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // load type
    loadType: {
      type: Number,
      value: 0
    },
    // 滚动条位置
    scrollTop: {
      type: 'String',
      value: '0rpx'
    },
    // 在设置滚动条位置时使用动画过渡
    scrollWithAnimation: {
      type: 'Boolean',
      value: false
    },
    // 当前页
    current: {
      type: 'Number',
      observer(val) {
        this.hideLoadMore()
      }
    },
    top: Number,
    isTabber: {
      type: Boolean,
      value: true,
      observer(val) {
        this.calcScrollHeight()
      }
    },
    delay: {
      type: Boolean,
      value: false,
      observer(val) {
        this.getList(0, 'refres');
      }
    },
    nullLabel: {
      type: String,
      value: "什么都没有"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 没有更多
    notMore: false,
    // 加载更多
    loadMore: false,
    // 暂无数据
    notData: false,
    // 首次加载
    firstLoad: true,
    // 下拉刷新状态
    triggered: true,
    scrollHeight: 0,
    // 当前页
    current: 0,
    // 总页数
    pages: 0
  },
  // 启动插槽
  options:{
    multipleSlots: true,
    styleIsolation:'apply-shared'
  },

  externalClasses: ['ext-class'],

  /**
   * 组件的方法列表
   */
  methods: {
    // 计算滚动容器高度
    calcScrollHeight() {
      let that = this;
      wx.getSystemInfo({
        success(res) {
          let { windowHeight } = res;
          let { isTabber } = that.data;
          let info = wx.getMenuButtonBoundingClientRect();
          // let customBar = info.bottom + info.top - res.statusBarHeight;
          let customBar = 0;
          
          if(!isTabber) {
            customBar = 0;
          }

          let scrollHeight = (windowHeight - customBar) + 'px';

          that.setData({ scrollHeight });
        },
      })
    },
    // 滚动到底部时触发
    scrolltolower(e) {
      let { pages, current } = this.data;

      if(current < pages - 1) {
        this.showLoadMore();
        this.getList(current + 1, 'more');
      }
    },
    // 自定义下拉刷新被触发
    refresherrefresh(e) {
      this.getList(0, 'refresh');
    },
    // 设置总页数和当前页
    setPage(current, pages) {
      this.setData({ current, pages }, this.ifStatus);
    },
    // 判断显示状态
    ifStatus() {
      let { current, pages } = this.data;

      // 加载更多
      if(current < pages - 1) {
        this.showLoadMore();
      }
      // 没有数据
      else if(pages == 0) {
        this.showNotData();
      }
      // 没有更多
      else if(current >= pages - 1) {
        this.showNotMore();
      }
    },
    // 加载列表
    getList(current, type) {
      this.triggerEvent("loadList", {current, type});
    },

    // 完成下拉刷新
    endTriggered() {
      this.setData({ triggered: false });
    },
    // 显示加载更多
    showLoadMore() {
      this.setData({
        loadMore: true, notMore: false, notData: false, firstLoad: false
      });
    },
    // 隐藏加载更多
    hideLoadMore() {
      this.setData({ loadMore: false });
    },
    // 显示暂无更多
    showNotMore() {
      this.setData({
        notMore: true, notData: false, loadMore: false, firstLoad: false
      });
    },
    // 隐藏暂无更多
    hideNotMore() {
      this.setData({ notMore: false });
    },
    // 显示暂无数据
    showNotData() {
      this.setData({
        notData: true, notMore: false, loadMore: false, firstLoad: false
      });
    },
    // 隐藏暂无数据
    hideNotData() {
      this.setData({ notData: false });
    },
    // 关闭首次加载占位
    closeFirstLoad() {
      this.setData({ firstLoad: false })
    }
  },
  attached() {
    this.calcScrollHeight();
    if(!this.data.delay) {
      this.getList(0, 'refres');
    }
  }
})
