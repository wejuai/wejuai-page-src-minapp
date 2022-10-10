// compontents/screen/index.js
const app = getApp();
const { API, UTIL, withdrawStatus, orderTypes } = app.globalData;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    align: {
      type: 'String',
      value: 'left'
    },
    placeholder: {
      type: 'String',
      value: '搜索'
    },
    isSearch: {
      type: 'Boolean',
      value: true
    },
    isSortType: {
      type: 'Boolean',
      value: true
    },
    isSort: {
      type: 'Boolean',
      value: true
    },
    isIncome: {
      type: 'Boolean',
      value: false
    },
    isWithdrawStatus: {
      type: 'Boolean',
      value: false
    },
    isOderType: {
      type: 'Boolean',
      value: false
    },
    isHobby: {
      type: Boolean,
      value: false,
      observer(val) {
        if(val) {
          this.getHobby();
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    search: '',
    sortTypeList: [
      { id: 'TIME', title: '时间' },
      { id: 'COLLECTION', title: '收藏' },
      { id: 'DISPLAY', title: '浏览' },
      { id: 'INTEGRAL', title: '积分' },
      { id: 'STAR', title: '评价' },
    ],
    sortType: { id: 'TIME', title: '时间' },
    sortList: [
      { id: 'DESC', title: '顺序' },
      { id: 'ASC', title: '倒序' }
    ],
    sort: { id: 'DESC', title: '顺序' },
    hobbyList: [],
    orderTypesList: [
      { title: "全部" },
      { id: "ARTICLE", title: "文章" },
      { id: "CHARGE", title: "充值" },
      { id: "CASH_WITHDRAWAL", title: "提现" },
      { id: "CASH_WITHDRAWAL_RETURN", title: "提现退回" },
      { id: "REWARD_DEMAND", title: "发布悬赏" },
      { id: "ADD_REWARD", title: "增加悬赏金" },
      { id: "SELECTED_REWARD", title: "选定悬赏" },
      { id: "SYSTEM_ADD", title: "系统发放" },
      { id: "SYSTEM_SUB", title: "系统扣除" },
      { id: "REWARD_DEMAND_RETURN", title: "取消悬赏退回" },
      { id: "REWARD_DEMAND_COMPENSATE", title: "回答的悬赏取消补偿" }
    ],
    withdrawStatus_ac: { title: "提现状态" },
    orderTypes_ac: { title: "订单类型" },
    withdrawStatusList: [
      { title: "全部" },
      { id: "NOT_PASS", title: "审核未通过" },
      { id: "PASS", title: "审核通过" },
      { id: "UNTREATED", title: "未审核" }
    ],
    incomeList: [
      { title: "全部" },
      { id: "income", title: "收入" },
      { id: "expend", title: "支出" }
    ],
    income: { title: "支付方向" },
    hobby: { name: '请选择爱好' }
  },

  options:{
    styleIsolation:'apply-shared'
  },

  externalClasses: ['ext-picker', 'ext-screen'],

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击搜索
    searchClick() {
      this.callBack();
    },
    // 输入搜索
    searchInput(e) {
      this.setData({
        search: e.detail.value
      })
    },
    // 排序类型
    changeSortType(e) {
      let that = this;
      this.setData({
        sortType: that.data.sortTypeList[e.detail.value]
      }, this.callBack)
    },
    // 改变排序规则
    changeSort(e) {
      let that = this;
      this.setData({
        sort: that.data.sortList[e.detail.value]
      }, this.callBack)
    },
    // 获取爱好列表
    getHobby() {
      app.REQUEST(API.userHobbies, 'GET', {}, false)
        .then(res => {
          let hobbyList = res.data;
          this.setData({ hobbyList });
        })
    },
    // 改变爱好
    changeHobby(e) {
      let that = this;
      let hobby = that.data.hobbyList[e.detail.value];
      this.setData({ hobby }, this.callBack);
    },
    // 改变提现状态
    changeWithdrawStatus(e) {
      let that = this;
      let withdrawStatus_ac = that.data.withdrawStatusList[e.detail.value];
      this.setData({ withdrawStatus_ac }, this.callBack);
    },
    // 改变支付方向
    changeIncome(e) {
      let that = this;
      let income = that.data.incomeList[e.detail.value];
      this.setData({ income }, this.callBack);
    },
    // 改变订单状态
    changeOrderType(e) {
      let that = this;
      let orderTypes_ac = that.data.orderTypesList[e.detail.value];
      this.setData({ orderTypes_ac }, this.callBack);
    },
    // 返回事件
    callBack() {
      let { search, sort, sortType, hobby, orderTypes_ac, withdrawStatus_ac, income } = this.data;
      
      this.triggerEvent('screen', {
        titleStr: search,
        sortType: sortType.id,
        direction: sort.id,
        hobby, orderTypes_ac, withdrawStatus_ac, income
      })
    }
  }
})
