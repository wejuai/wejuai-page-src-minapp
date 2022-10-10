//index.js
//获取应用实例
const app = getApp();
const { UTIL, API, CONFIG } = app.globalData;

// 搜索框输入的文字
let searchText = '';
// 切换模式页面动画需要的时间 ms
let showUniverse_an_end_time = 500;
let timeoutshowUniverse;
let universeScrollNode;
let popupNode;
let promptNode;

let touchLocation = [0, 0];

Page({
  data: {
    //顶部高度
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    // 简介文字
    intro: '一个人拥抱秘密太寂寞\n在你的心中总有一个爱好或秘密\n可能难以启齿\n却又挥之不去\n这里就是你所需要的地方\n我们将不同的圈子进行隔离，\n来吧~输入你想要的神秘代码~~\n遨游你内心中的小秘密',
    // 爱好列表
    hobbyList: [],
    isAccredit: app.globalData.isAccredit,
    // 搜索框输入内容
    searchVal: "",
    // 当前是否是探索模式
    showUniverse: false,
    showUniverse_an_end: true,
    local: false,
    bg_translate: {x:0, y:0},
    hobbyBox_left: 0,
    hobbyBoxLong_idx: 0,
    // 星球默认加载定位
    position: {},
    moreInput: {id: 1, placeholder: '联系方式'}
  },
  // 申请爱好弹窗
  applyHobby() {
    promptNode.open();
  },
  // 申请爱好
  applyHobbyConfirm(e) {
    app.REQUEST(API.hobbyApply, 'POST', { text: e.detail.value, contact: e.detail.moreValue })
      .then(res => {
        promptNode.close();
        wx.showToast({ title: '提交成功等待审核', icon: 'success', duration: 4000 })
      })
  },
  // 爱好滑动
  touchStart(e) {
    touchLocation = [ e.touches[0].pageX, e.touches[0].pageY ];
  },
  touchMove(e) {
    let { bg_translate } = this.data;
    let x = e.touches[0].pageX;
    let y = e.touches[0].pageY;

    bg_translate.x = (touchLocation[0] - x) / 2.5;
    bg_translate.y = (touchLocation[1] - y) / 2.5;
    this.setData({ bg_translate });
  },
  touchEnd(e) {
    let { hobbyList, hobbyBox_left, hobbyBoxLong_idx } = this.data;
    let x = e.changedTouches[0].pageX;
    let dir = touchLocation[0] - x < 0 ? 1 : 0; // 0 向左，1 向右
    let diff = Math.abs(touchLocation[0] - x);

    if(diff > 100) {
      if(dir == 0) hobbyBoxLong_idx ++;
      else hobbyBoxLong_idx --;
      if(hobbyBoxLong_idx >= hobbyList.length - 1) hobbyBoxLong_idx = hobbyList.length - 1;
      else if(hobbyBoxLong_idx < 0) hobbyBoxLong_idx = 0;

      hobbyBox_left = 0 - (hobbyBoxLong_idx * 100);
    }

    this.setData({ bg_translate: { x: 0, y: 0 }, hobbyBox_left, hobbyBoxLong_idx });
  },
  // 获取爱好列表
  getHobbyList() {
    app.GETUSER(res => {
      if(res && res.id) {
        let { UTIL, API } = app.globalData;
        let { random } = UTIL;
        
        let hobbyList = app.globalData.attentionedHobby.map(item => {
          let w = random(30, 100);
          let h = w;
          let font = w / 2;
  
          item.w = w;
          item.h = h;
          item.font = font > 35 ? 25 : font;
  
          return item;
        });
        
        let newList = [];
        function setList(i) {
          let start = parseInt(i / 5);
          let _i = i;
          if(i > 4) _i = i % 5;
  
          if(!newList[start]) newList[start] = [];
          newList[start][_i] = hobbyList[i];
          if(i < hobbyList.length - 1) {
            i += 1;
            setList(i);
          }
        };
        setList(0);
  
        this.setData({ hobbyList: newList }, () => {
          universeScrollNode.init();
        })
      }
      else {
        universeScrollNode.init();
      }
    }, true);
  },
  // 搜索框输入
  searchInput(e) {
    searchText = e.detail.value;
  },
  // 搜索
  search() {
    this.setData({ searchVal: searchText });

    app.REQUEST(API.hobbySearch, 'GET', { tab: searchText }, 'app')
      .then(res => {
        if(res.statusCode == 200) {
          let { type, answer, hobbyId, avatar, name } = res.data;
          if(type) {
            let url = "/subIndex/pages/home/index";
            
            app.setPageParams(url, {
              id: hobbyId, image: avatar, name
            });
            wx.navigateTo({
              url: `${url}?hobbyid=${hobbyId}`
            });
          } else {
            UTIL.toast(answer, 3000)
          }
        }
      })
  },
  // 切换模式
  cutPattern() {
    let { showUniverse } = this.data;
    let json = {};

    if(showUniverse) {
      UTIL.setLocation(universeScrollNode.getCoordinate());
      app._setUserFunction('LOW');
      json.showUniverse_an_end = true;
      json.showUniverse = false;
      clearTimeout(timeoutshowUniverse);
      timeoutshowUniverse = undefined;
    } else {
      app._setUserFunction('HIGH');
      json.showUniverse = true;
      timeoutshowUniverse = setTimeout(() => {
        this.setData({ showUniverse_an_end: false });
        clearTimeout(timeoutshowUniverse);
        timeoutshowUniverse = undefined;

        if(app.globalData.userInfo && app.globalData.userInfo.id) {
          let preLocation = UTIL.getLocation();
          let myStarInfo = universeScrollNode.getCoordinate();
          if(
            preLocation && (
              preLocation.x < myStarInfo.x - 2 || preLocation.x > myStarInfo.x + 2 || 
              preLocation.y < myStarInfo.y - 2 || preLocation.y > myStarInfo.y + 2
            )
          ){
            popupNode.open();
          }

          // let data = {
          //   id: app.globalData.userInfo.id,
          //   type: 'USER'
          // }
          // app.REQUEST(API.getCelestialBody, 'GET', data, 'app').then(res => {
            
          // });
        }
      }, showUniverse_an_end_time)
    }

    this.setData(json);
  },
  // 继续上次浏览位置
  popupConfirm(e) {
    let { confirm, value, callBackKey } = e.detail;
    let preLocation = UTIL.getLocation();

    if(confirm) {
      universeScrollNode.toPosition(Math.round(preLocation.x), Math.round(preLocation.y));
    }
    popupNode.close();
  },
  // 跳转子站
  toHobby(e) {
    let hobby = UTIL.getNodeSetData(e, 'hobby');
    let url = "/subIndex/pages/home/index";

    app.setPageParams(url, hobby);
    wx.navigateTo({
      url: `${url}?hobbyid=${hobby.id}`
    });
  },
  onShow() {
    let performance = app.globalData.userInfo.performance;
    let local = false;
    let params = app.getPageParams();
    
    if(params) {
      local = { x: params.x, y: params.y };
      if(params.performance) performance = params.performance;
    }

    app.SETPAGETHIS(this);
    app.setMsgNum(this);
    
    this.setData({
      searchVal: "",
      showUniverse: performance == "HIGH",
      showUniverse_an_end: performance != "HIGH" }, () => {
        if(local) {
          universeScrollNode.toPosition(local.x, local.y);
        }
      });
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  onLoad(options) {
    app.updataManager();

    universeScrollNode = this.selectComponent('#UniverseScroll');
    popupNode = this.selectComponent("#popup");
    promptNode = this.selectComponent("#prompt");

    // 全局刷新页面
    app.watch(false, 'refresh', this.onLoad);
    this.getHobbyList();
  },
  // 分享
  onShareAppMessage(e) {
    let obj = UTIL.getNodeSetData(e, 'universeutilobj');
    let key = UTIL.getNodeSetData(e, 'key');

    // 星域坐标分享
    if(key == 'universe_share') {
      let path = `/pages/pageLoad/index?performance=HIGH&x=${obj.x}&y=${obj.y}`;

      return {
        title: '我发现了一个有趣的坐标',
        imageUrl: '/images/loadPage.png',
        path: path
      }
    }
    // 分享爱好星球
    else if(key == 'hobbystar_share') {
      let path = `subIndex/pages/home/index?hobbyid=${obj.obj.hobbyInfo.id}`;

      return {
        title: '我发现了一个有趣的爱好',
        imageUrl: `${CONFIG.url.app}${API.celestialBody_}${obj.obj.id}${API._image}`,
        path: path
      }
    }
    // 分享用户星球
    else if(key == 'userstar_share') {
      let path = `/pages/pageLoad/index?performance=HIGH&x=${obj.obj.x}&y=${obj.obj.y}`;

      return {
        title: '我发现了一个有趣的人',
        imageUrl: `${CONFIG.url.app}${API.celestialBody_}${obj.obj.id}${API._image}`,
        path: path
      }
    }
    // 分享无主之地
    else if(key == 'unowned_share') {
      let path = `/pages/pageLoad/index?performance=HIGH&x=${obj.obj.x}&y=${obj.obj.y}`;
          
      return {
        title: '我发现了一个无主之地',
        imageUrl: `${CONFIG.url.app}${API.celestialBody_}${obj.obj.id}${API._image}`,
        path: path
      }
    }
  },
  onHide() {
    let { showUniverse } = this.data;

    if(showUniverse) {
      UTIL.setLocation(universeScrollNode.getCoordinate());
    }
  }
})
