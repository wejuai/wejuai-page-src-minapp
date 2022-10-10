// compontents/bgMap/index.js
const app = getApp();
const { width: windowWidth, height: windowHeight, system, UTIL } = app.globalData;
const { itemMapWidth, itemMapHeight } = app.globalData.universe;
// 地图的星域宽高(px => km)
const itemUniverseWidth = UTIL.unitConversion(2, 1, itemMapWidth);
const itemUniverseHeight = UTIL.unitConversion(2, 1, itemMapHeight);

// 当次滚动事件是不是首次加载的自动居中
var centerScroll = true;
// 滚动对象
var scrollObj = {};
// 是否正在重新设置滚动位置
var isSetScrolling = false;

let universeUtilNode;
let openStarNode;
let isPosition = false;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    position: {
      type: Object,
      value: {},
      observer(val) {
        if(val.x && val.y) {
          isPosition = true
          this.toPosition(val.x, val.y);
        }
        else {
          isPosition = false;
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dev: false,
    // 传递给wxml的this
    that: false,
    // 滚动数据集
    scroll: {
      // 滚动初始居中位置
      top: (itemMapHeight * 3 - windowHeight) / 2,
      left: (itemMapWidth * 3 - windowWidth) / 2,
      // 滚动过渡动画
      withAnimation: false,
      // 触发无限滚动阈值(ios因为只有抬起手指才会触发滚动事件，所以需要更大的触发阈值)
      refresherThreshold: system == 'ios' ? itemMapHeight / 2 : 500,
    },
    // 九宫格key集合
    universeArr: [
      'top_left', 'top_middle', 'top_right',
      'middle_left', 'middle_middle', 'middle_right',
      'bottom_left', 'bottom_middle', 'bottom_right',
    ],
    // 九宫格的数据集合
    universeObj: {
      // 宇宙九宫格总宽度
      width: itemMapWidth * 3,
      // 宇宙九宫格总高度
      height: itemMapHeight * 3,
      // 每个格的宽度
      itemMapWidth: itemMapWidth,
      // 每个格的高度
      itemMapHeight: itemMapHeight,
    },
    // 九宫格每个地图的数据集
    map_top_left: {
      // key，与 this.data中的key相同
      key: 'map_top_left',
      // 宇宙背景
      background: '/images/universe/loadImage.png',
      // 针对页面坐标: 左上(x, y)，右上，右下，左下
      position: [ [0, 0], [itemMapWidth, 0], [itemMapWidth, itemMapHeight], [0, itemMapHeight] ],
      // 针对宇宙坐标: 左上(x, y)，右上，右下，左下
      coordinate: false
    },
    map_top_middle: {
      key: 'map_top_middle',
      background: '/images/universe/loadImage.png',
      position: [ [itemMapWidth, 0], [itemMapWidth * 2, 0], [itemMapWidth * 2, itemMapHeight], [itemMapWidth, itemMapHeight] ],
      coordinate: false
    },
    map_top_right: {
      key: 'map_top_right',
      background: '/images/universe/loadImage.png',
      position: [ [itemMapWidth * 2, 0], [itemMapWidth * 3, 0], [itemMapWidth * 3, itemMapHeight], [itemMapWidth * 2, itemMapHeight] ],
      coordinate: false
    },
    map_middle_left: {
      key: 'map_middle_left',
      background: '/images/universe/loadImage.png',
      position: [ [0, itemMapHeight], [itemMapWidth, itemMapHeight], [itemMapWidth, itemMapHeight * 2], [0, itemMapHeight * 2] ],
      coordinate: false
    },
    map_middle_middle: {
      key: 'map_middle_middle',
      background: '/images/universe/loadImage.png',
      position: [ [itemMapWidth, itemMapHeight], [itemMapWidth * 2, itemMapHeight], [itemMapWidth * 2, itemMapHeight * 2], [itemMapWidth, itemMapHeight * 2] ],
      coordinate: []
    },
    map_middle_right: {
      key: 'map_middle_middle',
      background: '/images/universe/loadImage.png',
      position: [ [itemMapWidth * 2, itemMapHeight], [itemMapWidth * 3, itemMapHeight], [itemMapWidth * 3, itemMapHeight * 2], [itemMapWidth * 2, itemMapHeight * 2] ],
      coordinate: false
    },
    map_bottom_left: {
      key: 'map_bottom_left',
      background: '/images/universe/loadImage.png',
      position: [ [0, itemMapHeight * 2], [itemMapWidth, itemMapHeight * 2], [itemMapWidth, itemMapHeight * 3], [0, itemMapHeight * 3] ],
      coordinate: false
    },
    map_bottom_middle: {
      key: 'map_bottom_middle',
      background: '/images/universe/loadImage.png',
      position: [ [itemMapWidth, itemMapHeight * 2], [itemMapWidth * 2, itemMapHeight * 2], [itemMapWidth * 2, itemMapHeight * 3], [itemMapWidth, itemMapHeight * 3] ],
      coordinate: false
    },
    map_bottom_right: {
      key: 'map_bottom_middle',
      background: '/images/universe/loadImage.png',
      position: [ [itemMapWidth * 2, itemMapHeight * 2], [itemMapWidth * 3, itemMapHeight * 2], [itemMapWidth * 3, itemMapHeight * 3], [itemMapWidth * 2, itemMapHeight * 3] ],
      coordinate: false
    },
    // ios 地图加载等待动画
    ios_map_loading_top: { animation: false, show: false },
    ios_map_loading_right: { animation: false, show: false },
    ios_map_loading_bottom: { animation: false, show: false },
    ios_map_loading_left: { animation: false, show: false },
    // 本人星球数据
    myStarInfo: {},
    // 展示详情的星球信息
    detailStarInfo: {},
    // 每个星域内爱好/用户星球的数据集
    hobby_top_left: [],
    hobby_top_middle: [],
    hobby_top_right: [],
    hobby_middle_left: [],
    hobby_middle_middle: [],
    hobby_middle_right: [],
    hobby_bottom_left: [],
    hobby_bottom_middle: [],
    hobby_bottom_right: [],

    // 星星相关
    // 星星是否展开
    starInfoShow: false,
    // 展开的星星详情
    starInfo: {},

    // 操作栏集合
    // type：universe  hobbystar userstar
    // obj: {} 传入数据集
    universeUtilObj: {
      type: 'universe',
      obj: {}
    },
    // 操作栏展开
    utilShow: false,
    // 标记点的位置
    target: { top: 0, left: 0 }
  },

  options:{
    styleIsolation:'apply-shared'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 滚动事件(设置Android的无限滚动)
    bindscroll(e) {
      let that = this;
      let { scrollLeft, scrollTop } = e.detail;
      let { scroll, hobbyList, universeObj }  = this.data;
      let direction, iosMapLoadingKey;

      scrollObj = e.detail;
      
      // 除了自动居中的滚动事件外的其他滚动回调
      if(!centerScroll) {
        // 防止重复触发设置滚动位置
        if(!isSetScrolling) {
          if(scrollTop < scroll.refresherThreshold) {
            direction = 'top';
            iosMapLoadingKey = 'ios_map_loading_top';
            isSetScrolling = true;
          }
          if(scrollLeft > (universeObj.width - windowWidth - scroll.refresherThreshold)) {
            direction = 'right';
            iosMapLoadingKey = 'ios_map_loading_right';
            isSetScrolling = true;
          }
          if(scrollTop > (universeObj.height - windowHeight - scroll.refresherThreshold)) {
            direction = 'bottom';
            iosMapLoadingKey = 'ios_map_loading_bottom';
            isSetScrolling = true;
          }
          if(scrollLeft < scroll.refresherThreshold) {
            direction = 'left';
            iosMapLoadingKey = 'ios_map_loading_left';
            isSetScrolling = true;
          }

          // 滚动触发了阈值
          if(direction) {
            UTIL.systemFunction('ios', () => {
              !that.data[iosMapLoadingKey].show && that.setIosMapLoading(iosMapLoadingKey, true);
            })
            this.scrollTouch(direction, iosMapLoadingKey);
          }
  
          e.detail.guideShow = this.data.guideShow;

          this.starInfoClose();
          this.triggerEvent('scroll', e.detail);
        }
      } else {
        centerScroll = false;
      }
    },
    // 切换地图
    scrollTouch(direction, iosMapLoadingKey) {
      let { scroll } = this.data;
      let top, left;
      let that = this;

      isSetScrolling = true;
      
      function setScroll() {
        switch(direction) {
          case 'top':
            top = scrollObj.scrollTop + itemMapHeight;
            left = scrollObj.scrollLeft;

            that.moveStarList('top', () => {
              that.getStarList('top_middle')
              .then(() => {
                return that.getStarList('top_left')
              })
              .then(() => {
                return that.getStarList('top_right')
              })
            })
            break;
          case 'bottom':
            top = scrollObj.scrollTop - itemMapHeight;
            left = scrollObj.scrollLeft;

            that.moveStarList('bottom', () => {
              that.getStarList('bottom_middle')
              .then(() => {
                return that.getStarList('bottom_left')
              })
              .then(() => {
                return that.getStarList('bottom_right')
              })
            })
            break;
          case 'left':
            top = scrollObj.scrollTop;
            left = scrollObj.scrollLeft + itemMapWidth;
            
            that.moveStarList('left', () => {
              that.getStarList('middle_left')
              .then(() => {
                return that.getStarList('top_left')
              })
              .then(() => {
                return that.getStarList('bottom_left')
              })
            })
            break;
          case 'right':
            top = scrollObj.scrollTop;
            left = scrollObj.scrollLeft - itemMapWidth;
            
            that.moveStarList('right', () => {
              that.getStarList('middle_right')
              .then(() => {
                return that.getStarList('top_right')
              })
              .then(() => {
                return that.getStarList('bottom_right')
              })
            })
            break;
        }
        
        that.setData({ scroll: { ...scroll, top, left} }, () => {
          isSetScrolling = false;
          
          UTIL.systemFunction('ios', () => {
            setTimeout(() => {
              that.setIosMapLoading(iosMapLoadingKey, false);
            }, 1000)
          })
        })
      }
      
      UTIL.systemFunction('ios', () => {
        setTimeout(setScroll, 1000);
      }, () => {
        setScroll();
      })
    },
    // 控制ios地图加载等待动画
    setIosMapLoading(key, show) {
      let that = this;
      UTIL.an_opacity_out_in(that, { animation: key + '.animation', show: key + '.show' }, show);
    },
    // 获取星域内的星球列表
    getStarList(mapKey) {
      let { API } = app.globalData;
      let { map_middle_middle } = this.data;
      // 我的星域范围坐标
      let [ coordinate_top_left, coordinate_top_right, coordinate_bottom_right, coordinate_bottom_left ] = map_middle_middle.coordinate;

      let universe_top_left, universe_top_right, universe_bottom_right, universe_bottom_left;
      let itemUniverseWidthCoord = UTIL.unitConversion(1, 0, itemUniverseWidth);
      let itemUniverseHeightCoord = UTIL.unitConversion(1, 0, itemUniverseHeight);

      switch(mapKey) {
        case 'top_left':
          universe_top_left = [ coordinate_top_left[0] - itemUniverseWidthCoord, coordinate_top_left[1] + itemUniverseHeightCoord ];
          universe_top_right = [ coordinate_top_left[0], coordinate_top_left[1] + itemUniverseHeightCoord ];
          universe_bottom_right = [ coordinate_top_left[0], coordinate_top_left[1] ];
          universe_bottom_left = [ coordinate_top_left[0] - itemUniverseWidthCoord, coordinate_top_left[1] ];
          break;
        case 'top_middle':
          universe_top_left = [ coordinate_top_left[0], coordinate_top_left[1] + itemUniverseHeightCoord ];
          universe_top_right = [ coordinate_top_right[0], coordinate_top_right[1] + itemUniverseHeightCoord ];
          universe_bottom_right = [ coordinate_top_right[0], coordinate_top_right[1] ];
          universe_bottom_left = [ coordinate_top_left[0], coordinate_top_left[1] ];
          break;
        case 'top_right':
          universe_top_left = [ coordinate_top_right[0], coordinate_top_right[1] + itemUniverseHeightCoord ];
          universe_top_right = [ coordinate_top_right[0] + itemUniverseWidthCoord, coordinate_top_right[1] + itemUniverseHeightCoord ];
          universe_bottom_right = [ coordinate_top_right[0] + itemUniverseWidthCoord, coordinate_top_right[1] ];
          universe_bottom_left = [ coordinate_top_right[0], coordinate_top_right[1] ];
          break;
        case 'middle_left':
          universe_top_left = [ coordinate_top_left[0] - itemUniverseWidthCoord, coordinate_top_left[1] ];
          universe_top_right = [ coordinate_top_left[0], coordinate_top_left[1] ];
          universe_bottom_right = [ coordinate_top_left[0], coordinate_bottom_left[1] ];
          universe_bottom_left = [ coordinate_top_left[0] - itemUniverseWidthCoord, coordinate_bottom_left[1] ];
          break;
        case 'middle_middle':
          universe_top_left = coordinate_top_left;
          universe_top_right = coordinate_top_right;
          universe_bottom_right = coordinate_bottom_right;
          universe_bottom_left = coordinate_bottom_left;
          break;
        case 'middle_right':
          universe_top_left = [ coordinate_top_right[0], coordinate_top_right[1] ];
          universe_top_right = [ coordinate_top_right[0] + itemUniverseWidthCoord, coordinate_top_right[1] ];
          universe_bottom_right = [ coordinate_bottom_right[0] + itemUniverseWidthCoord, coordinate_bottom_right[1] ];
          universe_bottom_left = [ coordinate_bottom_right[0], coordinate_bottom_right[1] ];
          break;
        case 'bottom_left':
          universe_top_left = [ coordinate_bottom_left[0] - itemUniverseWidthCoord, coordinate_bottom_left[1] ];
          universe_top_right = [ coordinate_bottom_left[0], coordinate_bottom_left[1] ];
          universe_bottom_right = [ coordinate_bottom_left[0], coordinate_bottom_left[1] - itemUniverseHeightCoord ];
          universe_bottom_left = [ coordinate_bottom_left[0] - itemUniverseWidthCoord, coordinate_bottom_left[1] - itemUniverseHeightCoord ];
          break;
        case 'bottom_middle':
          universe_top_left = [ coordinate_bottom_left[0], coordinate_bottom_left[1] ];
          universe_top_right = [ coordinate_bottom_right[0], coordinate_bottom_right[1] ];
          universe_bottom_right = [ coordinate_bottom_right[0], coordinate_bottom_right[1] - itemUniverseHeightCoord ];
          universe_bottom_left = [ coordinate_bottom_left[0], coordinate_bottom_left[1] - itemUniverseHeightCoord ];
          break;
        case 'bottom_right':
          universe_top_left = [ coordinate_bottom_right[0], coordinate_bottom_right[1] ];
          universe_top_right = [ coordinate_bottom_right[0] + itemUniverseWidthCoord, coordinate_bottom_right[1] ];
          universe_bottom_right = [ coordinate_bottom_right[0] + itemUniverseWidthCoord, coordinate_bottom_right[1] - itemUniverseHeightCoord ];
          universe_bottom_left = [ coordinate_bottom_right[0], coordinate_bottom_right[1] - itemUniverseHeightCoord ];
          break;
      }
      
      let data = {
        maxX: universe_top_right[0], maxY: universe_top_right[1],
        minX: universe_bottom_left[0], minY: universe_bottom_left[1]
      };
      let pro = new Promise((resolve, reject) => {
        app.REQUEST(API.getCelestialBodyStarDomain, 'GET', data, 'app')
        .then(res => {
          let json = {};
          let mapObj = this.data['map_' + mapKey];

          mapObj.coordinate = [universe_top_left, universe_top_right, universe_bottom_right, universe_bottom_left];
          
          json['hobby_' + mapKey] = res.data;
          json['map_' + mapKey] = mapObj;
          this.setData(json, () => { resolve(res) })
        })
      })
      return pro;
    },
    // 现有星域内数据转移
    moveStarList(direction, callBack) {
      let that = this;
      let hobby = {};
      let map = UTIL.pick(that.data, [
        'map_top_left', 'map_top_middle', 'map_top_right',
        'map_middle_left', 'map_middle_middle', 'map_middle_right',
        'map_bottom_left', 'map_bottom_middle', 'map_bottom_right'
      ]);

      let moveArr_1 = [];
      
      switch(direction) {
        case 'top':
          moveArr_1 = [
            ['bottom_left', 'middle_left'],
            ['bottom_middle', 'middle_middle'],
            ['bottom_right', 'middle_right'],
            ['middle_left', 'top_left'],
            ['middle_middle', 'top_middle'],
            ['middle_right', 'top_right']
          ]
          break;
        case 'right':
          moveArr_1 = [
            ['top_left', 'top_middle'],
            ['middle_left', 'middle_middle'],
            ['bottom_left', 'bottom_middle'],
            ['top_middle', 'top_right'],
            ['middle_middle', 'middle_right'],
            ['bottom_middle', 'bottom_right']
          ]
          break;
        case 'bottom':
          moveArr_1 = [
            ['top_left', 'middle_left'],
            ['top_middle', 'middle_middle'],
            ['top_right', 'middle_right'],
            ['middle_left', 'bottom_left'],
            ['middle_middle', 'bottom_middle'],
            ['middle_right', 'bottom_right']
          ]
          break;
        case 'left':
          moveArr_1 = [
            ['top_right', 'top_middle'],
            ['middle_right', 'middle_middle'],
            ['bottom_right', 'bottom_middle'],
            ['top_middle', 'top_left'],
            ['middle_middle', 'middle_left'],
            ['bottom_middle', 'bottom_left']
          ]
          break;
      }

      moveArr_1.map(item => {
        hobby[`hobby_` + item[0]] = that.data['hobby_' + item[1]];
        map[`map_` + item[0]].coordinate = that.data['map_' + item[1]].coordinate;
      })

      let json = { ...hobby, ...map };
      this.setData(json, callBack);
    },
    // 获取本人星球信息
    getMyStar() {
      let { API, userInfo } = app.globalData;
      
      // 登录状态
      if(userInfo && userInfo.id) {
        let data = {
          id: userInfo.id,
          type: 'USER'
        }
    
        let pro = new Promise((resolve, reject) => {
          app.REQUEST(API.getCelestialBody, 'GET', data, 'app')
          .then(res => {
            let myStarInfo = res.data;
          
            if(isPosition) {
              this.setData({ myStarInfo });
            }
            else {
              this.setCentralPoint(myStarInfo.x, myStarInfo.y)
                .then(res => {
                  this.setData({ myStarInfo }, resolve);
                })
            }
          })
        })
        return pro
      }
      // 未登录状态
      else {
        let myStarInfo = { x: 0, y: 0 };
        
        let pro = new Promise((resolve, reject) => {
          this.setCentralPoint(myStarInfo.x, myStarInfo.y)
            .then(res => {
              this.setData({ myStarInfo }, resolve);
            })
        });
        return pro;
      }
    },
    // 设置某个坐标为中心点
    setCentralPoint(x, y) {
      let { unitConversion } = UTIL;
      let { map_middle_middle } = this.data;
      let itemUniverseWidthCoord = unitConversion(1, 0, itemUniverseWidth);
      let itemUniverseHeightCoord = unitConversion(1, 0, itemUniverseHeight);
      
      map_middle_middle.coordinate = [
        // 我的星域左上角
        [x - (itemUniverseWidthCoord / 2), y + (itemUniverseHeightCoord / 2)],
        // 我的星域右上角
        [x + (itemUniverseWidthCoord / 2), y + (itemUniverseHeightCoord / 2)],
        // 我的星域右下角
        [x + (itemUniverseWidthCoord / 2), y - (itemUniverseHeightCoord / 2)],
        // 我的星域左下角
        [x - (itemUniverseWidthCoord / 2), y - (itemUniverseHeightCoord / 2)],
      ];

      let pro = new Promise((resolve, reject) => {
        this.setData({ map_middle_middle }, resolve)
      })
      return pro;
    },

    // 跳转到规定宇宙坐标
    toPosition(x, y) {
      let that = this;

      this.position(itemMapHeight * 3 / 2, itemMapWidth * 3 / 2);
      this.setCentralPoint(x, y)
        .then(res => {
          isPosition = false;
          return that.getStarList('middle_middle')
        })
        .then(res => {
          return that.getStarList('top_left')
        })
        .then(res => {
          return that.getStarList('top_middle')
        })
        .then(res => {
          return that.getStarList('top_right')
        })
        .then(res => {
          return that.getStarList('middle_left')
        })
        .then(res => {
          return that.getStarList('middle_right')
        })
        .then(res => {
          return that.getStarList('bottom_left')
        })
        .then(res => {
          return that.getStarList('bottom_middle')
        })
        .then(res => {
          return that.getStarList('bottom_right')
        })
    },

    // 跳转子站
    toHobby(e) {
      let hobbyid = e.target.dataset.hobby.id;
      wx.navigateTo({
        url: "/subIndex/pages/home/index?hobbyid=" + hobbyid
      });
    },

    // 背景定位
    position(top, left) {
      let scroll = this.data.scroll;

      top = top - (windowHeight / 2);
      left = left - (windowWidth / 2);
      if(top < 0) {
        top = 0;
      }
      else if(top > (scrollObj.height - windowHeight)) {
        top = scrollObj.height - windowHeight
      }
      if(left < 0) {
        left = 0;
      }
      else if(left > (scrollObj.width - windowWidth)) {
        left = scrollObj.width - windowWidth;
      }

      this.setData({
        scroll: { ...scroll, left, top }
      })
    },

    // 星星展开
    starInfoOpen(e) {
      let info = e.detail;
      let universeUtilObj = {
        type: info.type,
        obj: info
      }

      openStarNode = info.node;
      this.setData({
        starInfoShow: true, utilShow: true, universeUtilObj
      }, () => {
        universeUtilNode.open();
      })
    },
    // 星星收起
    starInfoClose(e) {
      let { starInfoShow } = this.data;
      
      if(openStarNode) {
        openStarNode.close();
        openStarNode = false;
      }
      if(starInfoShow) {
        universeUtilNode.close();
        this.setData({ starInfoShow: false, utilShow: false })
      }
    },

    // 点击宇宙设置标记点
    openUtil(e) {
      let { utilShow } = this.data;
      let coordinate_top_left = this.data.map_top_left.coordinate[0];
      let { scrollLeft, scrollTop } = scrollObj;
      let { x: left, y: top } = e.detail;
      let target = {
        top: top + scrollTop, left: left + scrollLeft
      };
      let obj = {
        x: parseFloat(coordinate_top_left[0] + parseFloat(UTIL.unitConversion(2, 0, left + scrollLeft))).toFixed(2),
        y: parseFloat(coordinate_top_left[1] - parseFloat(UTIL.unitConversion(2, 0, top + scrollTop))).toFixed(2)
      };

      let universeUtilObj = { type: 'universe', obj };
      this.triggerEvent('scroll', {});
      this.setData({ universeUtilObj }, () => {
        if(utilShow) {
          universeUtilNode.close();
          this.setData({ utilShow: false })
        } else {
          universeUtilNode.open();
          this.setData({ utilShow: true, target })
        }
      })
    },
    // 通过坐标设置标记点
    setTarget(x, y, type) {
      let coordinate_top_left = this.data.map_top_left.coordinate[0];
      let { scrollLeft, scrollTop } = scrollObj;
      let target = {
        top: UTIL.unitConversion(0, 2, y - coordinate_top_left[1]),
        left: UTIL.unitConversion(0, 2, x - coordinate_top_left[0])
      };
      let obj = { x, y };

      let universeUtilObj = { type: 'universe', obj };
      this.triggerEvent('scroll', {});
      this.setData({ universeUtilObj }, () => {
        universeUtilNode.open();
        let json = { utilShow: true };
        if(type == 'universe') {
          json.target = target;
        }
        this.setData(json)
      })
    },
    // 回到本人星球
    toUserStar() {
      let { myStarInfo } = this.data;

      UTIL.toast('正在定位...');
      this.setData({ utilShow: false });
      setTimeout(() => {
        this.toPosition(myStarInfo.x, myStarInfo.y);
      }, 500)
    },
    // 跳转到收藏的坐标点
    toSkip(e) {
      let { x, y } = e.detail;

      this.toPosition(x, y);
      this.setTarget(x, y);
    },
    // 获取屏幕中心点坐标
    getCoordinate() {
      let coordinate_top_left = this.data.map_top_left.coordinate[0];
      let { scrollLeft, scrollTop } = scrollObj;
      
      let obj = {
        x: parseFloat(coordinate_top_left[0] + parseFloat(UTIL.unitConversion(2, 0, app.globalData.width / 2 + scrollLeft))).toFixed(2),
        y: parseFloat(coordinate_top_left[1] - parseFloat(UTIL.unitConversion(2, 0, app.globalData.height / 2 + scrollTop))).toFixed(2)
      };
      return obj;
    },
    // 初始化
    init() {
      let that = this;
      let { userInfo } = app.globalData;

      that.getMyStar()
      .then(res => {
        return that.getStarList('middle_middle')
      })
      .then(res => {
        return that.getStarList('top_left')
      })
      .then(res => {
        return that.getStarList('top_middle')
      })
      .then(res => {
        return that.getStarList('top_right')
      })
      .then(res => {
        return that.getStarList('middle_left')
      })
      .then(res => {
        return that.getStarList('middle_right')
      })
      .then(res => {
        return that.getStarList('bottom_left')
      })
      .then(res => {
        return that.getStarList('bottom_middle')
      })
      .then(res => {
        return that.getStarList('bottom_right')
      })
    }
  },

  lifetimes: {
    ready() {
      let that = this;

      universeUtilNode = this.selectComponent("#universeUtil");
      // this.init();
    },
  }
})
