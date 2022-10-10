const app = getApp();
const { width: windowWidth, height: windowHeight, system, UTIL } = app.globalData;
const { itemMapWidth, itemMapHeight } = app.globalData.universe;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 星球信息
    info: {
      type: 'Object',
      value: {},
      observer(val) {
        this.resize();
      }
    },
    // 星球所在区域星域数据集
    itemUniverse: {
      type: 'Object',
      value: {}
    },
    // z-index
    zIndex: {
      type: 'Number',
      value: 100
    }
  },
  options:{
    styleIsolation:'apply-shared'
  },

  /**
   * 组件的初始数据
   */
  data: {
    size: {
      width: 20,
      height: 20
    },
    maxSize: {
      top: 0,
      left: 0
    },
    // 背景显示
    backGroundShow: false,
    backGroundAn: false,
    starInfoShow: false,
    // 星球背景加载完毕
    starLoadEnd: false
  },

  lifetimes: {
    attached() {
      // let size = { width: 20, height: 20, top: 0, left: 0 };
      // let { itemUniverse, info} = this.data;
      
      // if(info.size) {
      //   size.height = size.width = UTIL.unitConversion(1, 2, info.size);
      // }
      
      // // 计算星球相对于星域的页面定位
      // if(itemUniverse) {
      //   size.left = UTIL.unitConversion(0, 2, info.x - itemUniverse.coordinate[0][0]) - (size.width / 2);
      //   size.top = UTIL.unitConversion(0, 2, itemUniverse.coordinate[0][1] - info.y) - (size.height / 2);
      // }

      // this.setData({ size })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 
    resize() {
        let size = { width: 20, height: 20, top: 0, left: 0 };
        let { itemUniverse, info} = this.data;
        
        if(info.size) {
          size.height = size.width = UTIL.unitConversion(1, 2, info.size) * 2;
        }
        
        // 计算星球相对于星域的页面定位
        if(itemUniverse) {
          size.left = UTIL.unitConversion(0, 2, info.x - itemUniverse.coordinate[0][0]) - (size.width / 2);
          size.top = UTIL.unitConversion(0, 2, itemUniverse.coordinate[0][1] - info.y) - (size.height / 2);
        }

        this.setData({ size })
    },
    // 
    starBackgroundLoadEnd() {
      this.setData({ starLoadEnd: true });
    },
    // 点击小星星
    starClick(e) {
      let { x, y } = e.detail;
      let { maxSize } = this.data;
      
      maxSize.top = y;
      maxSize.left = x;

      this.setData({ maxSize }, this.open);
    },
    // 打开
    open() {
      let that = this;
      let info = this.data.info;
      info.node = that;
      this.triggerEvent('infoShow', info);

      this.setData({ starInfoShow: true }, () => {
        UTIL.an_opacity_out_in(
          this,
          { show: 'backGroundShow', animation: 'backGroundAn' },
          true,
          400,
          0.7
          );
      });
    },
    // 关闭
    close() {
      this.setData({ starInfoShow: false }, () => {
        setTimeout(() => {
          UTIL.an_opacity_out_in(
            this,
            { show: 'backGroundShow', animation: 'backGroundAn' },
            false,
            400
            );

          this.triggerEvent('infoHide', this.data.info);
        }, 600)
      });
    }
  }
})
