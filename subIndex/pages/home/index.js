// pages/subIndex/subIndex.js
const app = getApp();
const { API, UTIL } = app.globalData;

let cutBox;
let screen = {};
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hobbyId: false,
    notFollow: false,
    // 显示搜索icon
    searchIconShow: true,
    // 筛选内容
    searchValue: '',
    //顶部高度
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    // 爱好信息
    hobby: {},
    // 切换列表头部
    tabList: [
      { id: 0, label: '文章', slot: 'essay', scrollClass: 'bgc_page' },
      { id: 1, label: '悬赏', slot: 'group', scrollClass: 'bgc_page' }
    ],
    // 每页请求数量
    size: 10,
    // 加载状态 ['firstLoad', 'moreLoad', 'null', 'moreNull']
    loadType: {
      essay: 'firstLoad',
      group: 'firstLoad'
    },
    nullObj: {
      label: '暂无数据',
      show: true
    },
    // 数据列表
    // 全部
    essayObj: {
      page: 0,
      list: []
    },
    // 生效中
    groupObj: {
      page: 0,
      list: []
    },
    followHash: 0
  },

  /* -start- 获取数据 */
  // 获取列表
  getList(key, type) {
    let { size, loadType, nullObj, hobbyId, notFollow } = this.data;
    
    if(!notFollow) {
      nullObj.label = "暂无数据";
    }
    else {
      nullObj.label = "需要关注后才可查看内容";
    }
    let keyObj = this.data[key + 'Obj'];
    let params = { pageSize: size };
    let pageNo;
    let list = keyObj.list;
    let url = key == 'essay' ? API.appArticle : API.rewardList;

    params.hobbyType = hobbyId.toUpperCase();
    if(type == 'more') {
      pageNo = this.data[key + 'Obj'].page + 1;
      list = this.data[key + 'Obj'].list;
    }
    else {
      pageNo = 0;
      list = [];
    }

    if(screen.direction) {
      params.direction = screen.direction;
    }
    if(screen.sortType) {
      params.sortType = screen.sortType;
    }
    if(screen.titleStr && screen.titleStr != '') {
      params.titleStr = screen.titleStr;
    }

    params.page = pageNo;
    app.REQUEST(url, 'GET', params, 'app', {
      "x-server-name": hobbyId, showLoading: true
    }).then(res => {
      let { data } = res;
      
      if(type == 'refresh' && cutBox) cutBox.hideRefresh();

      list = [ ...list, ...data.content ];

      if(!list || !list.length) {
        loadType[key] = 'null';
      }
      else if(list.length >= data.totalElements) {
        loadType[key] = 'moreNull'
      }
      else {
        loadType[key] = 'moreLoad'
      }

      let json = { loadType };
      json[key + 'Obj'] = { ...keyObj, page: pageNo, list };
      json.nullObj = nullObj;
      this.setData(json);
    })
  },
  // 判断是否关注
  isFollow() {
    let { notFollow, hobbyId } = this.data;

    notFollow = true;
    app.globalData.attentionedHobby.map(item => {
      if(item.id == hobbyId) {
        notFollow = false;
      }
    });
    this.setData({ notFollow });
  },
  /* -end- 获取数据 */

  /* -start- 事件处理 */
  // 跳转探索星球
  toStar() {
    let { hobby } = this.data;

    app.globalData.userInfo.performance = 'HIGH';
    app.TOHOME(hobby);
  },
  // 回到首页
  toHome() {
    app.TOHOME();
  },
  // 获取星球详情
  getCelestialBody() {
    let { hobby, hobbyId } = this.data;
    app.REQUEST(API.getCelestialBody_all, 'GET', { id: hobbyId, type: 'HOBBY' }, 'app')
      .then(res => {
        hobby = res.data.hobbyInfo;
        hobby.x = res.data.x;
        hobby.y = res.data.y;
        this.setData({ hobby });
      })
  },
  // 隐藏搜索icon
  hideSearchIcon() {
    this.setData({ searchIconShow: false });
  },
  // 显示搜索icon
  showSearchIcon() {
    this.setData({ searchIconShow: true });
  },
  // 跳转爱好星球简介
  toDeal() {

  },
  // 返回
  toBack() {
    UTIL.toBack();
  },
  cutFollow(e) {
    this.setData({ notFollow: !e.detail });
    this.searchClick();
  },
  // 关注 / 取消关注
  attention() {
    let { hobby, hobbyId } = this.data;

    app.addHobby(hobby).then(res => {
      UTIL.toast('关注成功');
      let followHash = new Date().getTime();
      this.setData({ notFollow: false, followHash });
    })
  },
  // 取消关注
  attentionReduce() {
    let { hobby, hobbyId } = this.data;

    wx.showModal({
      content: '是否取消关注',
      cancelText: '再想想',
      confirmText: '取消关注',
      success() {
        app.REQUEST(API.hobbyReduce + hobbyId, 'PUT')
          .then(res => {
            UTIL.toast('取消关注成功');
            this.setData({ notFollow: true });
          })
      }
    })
  },
  // 排序改变
  screenChange(e) {
    let { direction, sortType } = e.detail;
    let key = UTIL.getNodeSetData(e, 'key');

    screen.direction = direction;
    screen.sortType = sortType;
    this.getList(key, 'refresh');
  },
  // 搜索输入框输入
  searchInput(e) {
    let { value } = e.detail;

    screen.titleStr = value;
    this.setData({ searchValue: value });
  },
  // 筛选事件
  searchClick(e) {
    this.getList('essay', 'refresh');
    this.getList('group', 'refresh');
  },
  // 加载更多
  loadMore(e) {
    this.getList(e.detail.slot, 'more');
  },
  // 刷新 
  loadRefresh(e) {
    this.getList(e.detail.slot, 'refresh');
  },
  // 切换标签
  loadTab(e) {
    let list = this.data[e.detail.slot + 'Obj'].list;
    let loadType = this.data.loadType[e.detail.slot];
    
    if(loadType == 'firstLoad' && !list.length) {
      this.getList(e.detail.slot, 'refresh');
    }
  },
  /* -end- 事件处理 */

  /**
   * 自定义生命周期函数--刷新
   */
  resfer() {
    that.getList('essay', 'refresh');
    that.getList('group', 'refresh');
    that.getCelestialBody();
    that.isFollow();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let hobby = app.getPageParams() || {};

    that = this;
    if(options) {
      if(!options.hobbyid || options.hobbyid == '') {
        console.error(`缺少url参数: hobbyid(爱好id)`)
        return;
      }

      this.setData({ hobby, hobbyId: options.hobbyid }, () => {
        this.isFollow();
      });
    } else {
      console.error(`缺少页面参数`)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    cutBox = this.selectComponent("#cutBox");
    let slot = this.data.tabList[0].slot;
    this.searchClick();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.resfer();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})