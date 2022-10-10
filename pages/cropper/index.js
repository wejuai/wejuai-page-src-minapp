// pages/cropper/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 默认图片地址
    src:'',
    // 上传图片type
    type: false,
    width:0,
    height: 0,
    top: 0,
    proportion: {
      COVER: 1.78,
      ARTICLE_HEAD: 1.78,
      HEAD_IMAGE: 1,
    }, //宽高比
    btns: [
      {
        key: 'save',
        class: 'main',
        text: '保存'
      },
      {
        key: 'cancel',
        class: 'cancel',
        text: '取消'
      },
    ]
  },
  
  cropperload(e){
      console.log("cropper初始化完成");
  },
  loadimage(e){
      console.log("图片加载完成",e.detail);
      wx.hideLoading();
      //重置图片角度、缩放、位置
      this.cropper.imgReset();
  },
  clickcut(e) {
      console.log(e.detail);
      this.cropper.upload()
      //点击裁剪框阅览图片
      // wx.previewImage({
      //     current: e.detail.url, // 当前显示图片的http链接
      //     urls: [e.detail.url] // 需要预览的图片http链接列表
      // })
  },
  btnClick(e) {
    let img = e.detail;
    if(img.key == 'save') {
      this.saveImg(img)
    }
    else if(img.key == 'cancel') {
      this.cancelImg()
    }
  },
  // 保存图片
  saveImg(res) {
    let that = this;
    let { type } = that.data;

    app.UPLOADIMG(type, res.tempFilePath, img => {
      img.type = type;
      app.globalData.UTIL.toBack(img, false, true);
    })
  },
  // 取消
  cancelImg() {
    app.globalData.UTIL.toBack(false, false)
  },
  // 更新用户封面
  updataCover(id) {
    return app.REQUEST(app.globalData.API.updatacover + id, 'PUT').then(res => {
      return new Promise((resolve, reject) => {
        UTIL.toast('更新成功')
        resolve(res);
      })
    })
  },
  // 更新用户头像
  updataHeadImage(id) {
    return app.REQUEST(app.globalData.API.updataheadImage + id, 'PUT').then(res => {
      return new Promise((resolve, reject) => {
        UTIL.toast('更新成功')
        resolve(res);
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let src = options.src;
    let type = options.type;
    let json = {};
    
    //获取到image-cropper实例
    this.cropper = this.selectComponent("#image-cropper");
    if(src && src != '') {
      wx.showLoading({ title: '加载中' });
      this.setData({ src });
    }
    if(type && type != '') {
      json.type = type;
    }

    this.setData(json);
    wx.getSystemInfo({
      success(res) {
        let width = res.windowWidth;
        let height = width / that.data.proportion[type];
        let top = (res.windowHeight - height) / 2;
        that.setData({ width, height, top })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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