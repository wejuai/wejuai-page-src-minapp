const app = getApp();
const { UTIL, API, userInfo } = app.globalData;

Component({
  properties: {
    width: {
      type: String
    },
    height: {
      type: String
    },
    readOnly: {
      type: Boolean,
      value: false
    },
    insertPicture: {
      type: Boolean,
      value: true
    },
    placeholder: {
      type: String,
      value: '输入文字...'
    },
    imageType: {
      type: String,
      value: 'ARTICLE'
    },
    html: {
      type: String,
      value: "",
      observer(html) {
        if (html) {
          this.createSelectorQuery().select('#editor').context((res) => {
            this.editorCtx = res.context
            this.editorCtx.setContents({
              html,
              fail: (err) => {
                console.log(`内容回显失败：${err}`);
              }
            })
          }).exec()
        }
      }
    }
  },
  data: {
    formats: {},
    readOnly: false,
    // editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false
  },
  ready() {
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({
      isIOS
    })
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)

    })
  },
  methods: {
    readOnlyChange() {
      this.setData({
        readOnly: !this.data.readOnly
      })
    },
    updatePosition(keyboardHeight) {
      const toolbarHeight = 100
      const {
        windowHeight,
        platform
      } = wx.getSystemInfoSync()
      // let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
      this.setData({
        // editorHeight,
        keyboardHeight
      })
    },
    calNavigationBarAndStatusBar() {
      const systemInfo = wx.getSystemInfoSync()
      const {
        statusBarHeight,
        platform
      } = systemInfo
      const isIOS = platform === 'ios'
      const navigationBarHeight = isIOS ? 44 : 48
      return statusBarHeight + navigationBarHeight
    },
    onEditorReady() {
      const that = this
      //组件使用createSelectorQuery加上in(this)
      wx.createSelectorQuery().in(that).select('#editor').context(function (res) {
        that.editorCtx = res.context
      }).exec()
    },
    undo() {
      this.editorCtx.undo()
    },
    redo() {
      this.editorCtx.redo()
    },
    blur() {
      this.editorCtx.blur()
    },
    format(e) {
      let {
        name,
        value
      } = e.target.dataset
      if (!name) return
      // console.log('format', name, value)
      if (name === "backgroundColor" && value === "#ff0000") { //设置字体颜色为白色
        this.editorCtx.format("color", "#ffffff")
      }
      if (name === "backgroundColor" && value === "#ffffff") {
        this.editorCtx.format("color", "#000000")
      }
      if (name === "color") { //清除字体样式
        this.editorCtx.removeFormat()
      }
      this.editorCtx.format(name, value)

    },
    onStatusChange(e) {
      const formats = e.detail
      this.setData({
        formats
      })
    },
    insertDivider() {
      this.editorCtx.insertDivider({
        success: function () {
          console.log('insert divider success')
        }
      })
    },
    clear() {
      this.editorCtx.clear({
        success: function (res) {
          console.log("clear success")
        }
      })
    },
    removeFormat() {
      this.editorCtx.removeFormat()
    },
    insertDate() {
      const date = new Date()
      const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
      this.editorCtx.insertText({
        text: formatDate
      })
    },
    insertImage() {
      // this.triggerEvent('insertImage'); //触发父组件方法
      let that = this;
      let { imageType } = that.data;

      wx.chooseImage({
        count: 9,
        // count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          let tempFilePaths = res.tempFilePaths;
          
          try {
            wx.showLoading({ title: `上传图片 1/${tempFilePaths.length}` });

            let loadImg = function(i) {
              if(i >= tempFilePaths.length) {
                wx.hideLoading();
                UTIL.toast('上传成功');
                return;
              };
              app.UPLOADIMG(imageType, tempFilePaths[i], res => {
                that.editorCtx.insertImage({ src: res.url, alt: "插图" });
                wx.showLoading({ title: `上传图片 ${i+1}/${tempFilePaths.length}` });
                loadImg(i + 1);
              }, err => {
                if(i + 1 == tempFilePaths.length) {
                  wx.hideLoading();
                  wx.showToast({ title: '上传失败', icon: 'error' })
                }
              });
            };
            loadImg(0);
          }
          catch (err) {

          }
        }
      })
    },
    insertSrc(src) { //接受图片返回地址
      this.editorCtx.insertImage({
        src,
        data: {
          id: 'abcd',
          role: 'god'
        },
        width: '80%',
        fail: (err) => {
          console.log(`图片插入失败：${err}`);
        }
      })
    },
    getContent(e) { //获得文本内容
      this.triggerEvent('Content', {
        content: e.detail
      })
    },
    setHtml(html) { //回显
      if (html) {
        this.createSelectorQuery().select('#editor').context((res) => {
          this.editorCtx = res.context
          this.editorCtx.setContents({
            html,
            fail: (err) => {
              console.log(`内容回显失败：${err}`);
            }
          })
        }).exec()
      }
    },
  }
})