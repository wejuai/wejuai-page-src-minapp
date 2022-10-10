// product/commpents/star/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 只读
    onlyRead: {
      type: Boolean,
      value: false
    },
    // 最大个数
    max: {
      type: Number,
      value: 5
    },
    // 显示个数
    value: {
      type: Number,
      value: 0,
      observer(val) {
        this.setData({ num: val })
      }
    },
    // 星星宽度
    width: {
      type: Number,
      value: 36
    },
    // 显示数值
    showNum: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    num: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 选中数量改变
    changeNum(e) {
      let id = e.target.dataset.id;
      let num = id;
      let onlyRead = this.data.onlyRead;

      if (!onlyRead) {
        this.setData({ num });
        this.triggerEvent("changeNum", { num })
      }
    }
  },

  lifetimes: {
    attached() {
      let { value: num } = this.data;
      this.setData({ num })
    }
  }
})
