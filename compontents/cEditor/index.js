// compontents/editor/index.js
const app = getApp();
const { UTIL } = app.globalData;
const query = wx.createSelectorQuery();

let EditorContext;
let editorTimeout = true;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: String,
    "readOnly": {
      type: Boolean,
      value: false
    },
    // 点击图片时显示图片大小控件
    "showImgSize": {
      type: Boolean,
      value: true
    },
    // 点击图片时显示工具栏控件
    "showImgToolbar": {
      type: Boolean,
      value: true
    },
    // 点击图片时显示修改尺寸控件
    "showImgResize": {
      type: Boolean,
      value: true
    },
    imageType: {
      type: String,
      value: 'ARTICLE'
    },
    html: {
      type: String,
      value: '',
      observer(html) {
        this.switchHtml(html);
      }
    }
  },

  options: {
    addGlobalClass: true
  },

  externalClasses: ['ext-class'],

  /**
   * 组件的初始数据
   */
  data: {
    // 工具组
    utilFonts: { show: false, active: ['text'] },
    // 是否获取焦点
    isFocus: false,
    bottom: 0,
    htmlArr: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 转换html
    switchHtml(html) {
      console.log(html);
      let imgs = html.match(/<img src=".+?" alt="插图">/g) || [];
      html = html.replace(/<img src=".+?" alt="插图">/g, "&&&&_&&&&");
      let htmls = html.split("&&&&_&&&&") || [];
      console.log(html, imgs, htmls);
      let len = htmls.length > imgs.length ? htmls.length : imgs.length;
      let htmlArr = [];

      for(let i = 0; i < len; i++) {
        let obj = {};
        if(htmls[i]) {
          obj = { type: 'editor', html: htmls[i] };
          htmlArr.push(obj);
        }
        if(imgs[i]) {
          let img = imgs[i].match(/https:\/\/media\.wejuai\.com.+?\.(jpg|png)/);
          if(img && img[0]) {
            obj = { type: 'image', src: img[0], style: "" };
            htmlArr.push(obj);
          }
        }
      }
      this.setData({ htmlArr }, () => {
        htmlArr.map((item, idx) => {
          if(item.type == "editor") {
            wx.createSelectorQuery().in(this)
              .select('#editor_'+idx ).context(res => {
                if(res) {
                  EditorContext = res.context;
                  EditorContext.setContents({ html: item.html })
                }
              }).exec()
          }
        })
      })
    },
    loadImg(e) {
      let { htmlArr } = this.data;
      let idx = UTIL.getNodeSetData(e, 'idx');
      let w_h = (e.detail.width / e.detail.height).toFixed(2);

      if(htmlArr[idx]) {
        htmlArr[idx].style = `width: calc( 100vw - 40rpx );height: calc( ( 100vw - 40rpx ) / ${w_h} );`;
        this.setData({ htmlArr });
      }
    },
    previewImg(e) {
      let { htmlArr } = this.data;
      let src = UTIL.getNodeSetData(e, 'src');
      let imgList = [];
      
      htmlArr.map(item => {
        if(item.type == 'image') {
          imgList.push(item.src);
        }
      })
      wx.previewImage({
        current: src, urls: imgList
      }, true);
    },
    // 切换显示字体大小设置
    cutFonts() {
      let { utilFonts } = this.data;
      
      utilFonts.show = !utilFonts.show;
      this.setData({ utilFonts });
    },
    // 隐藏显示字体大小设置
    hideFonts() {
      let { utilFonts } = this.data;
      
      utilFonts.show = false;
      this.setData({ utilFonts });
    },
    // 手动失去焦点
    manualBlur() {
      EditorContext.blur();
      this.setData({ isFocus: false });
    },
    // 编辑器初始化完成时触发
    ready(e) {
      let { html } = this.data;
      let top = 0;
      let that = this;
      this.triggerEvent('ready', e);

      this.onKeyboardHeightChange(res => {
        setTimeout(() => {
          // that.setData({ bottom: res.height });
          console.log(res)
          // wx.pageScrollTo({ scrollTop: top })
        }, res.duration)
      })
      wx.createSelectorQuery().in(this)
        .select('#editor').context(res => {
          if(res) {
            EditorContext = res.context;
          }
        }).exec()
        wx.createSelectorQuery().in(this)
          .select('#editor').boundingClientRect(rect => {
            if(rect) {
              top = rect.top;
            }
          }).exec()
    },
    //监听键盘高度变化
    onKeyboardHeightChange(fn) {
      wx.onKeyboardHeightChange(res => {
        fn && fn(res);
      })
    },
    // 编辑器获取焦点时触发
    focus(e,a) {
      this.setData({ isFocus: true})
    },
    // 编辑器失去焦点时触发
    blur(e) {
      if(editorTimeout) {
        this.setData({ isFocus: false });
        editorTimeout = true;
      }
      this.triggerEvent('blur', e);
    },
    // 编辑器内容改变时触发
    editorInput(e) {
      this.triggerEvent('input', e);
    },
    // 通过 Context 方法改变编辑器内样式时触发，返回选区已设置的样式
    statusChange(e) {
      this.triggerEvent('statusChange', e);
    },
    // 点击工具
    utilClick(e) {
      let id = UTIL.getNodeSetData(e, 'id');

      editorTimeout = false;
      // this.utilSelectType('click', id);
      switch(id) {
        // 插入图片
        case 'uploadImg':
          this.uploadImg();
          break;
        // 标题
        case 'title':
          this.addTitle();
          break;
        // 小标题
        case 'minTitle':
          this.addMinTitle();
          break;
        // 撤销
        case 'revocation':
          this.revocation();
          break;
        // 撤销
        case 'recover':
          this.recover();
          break;
        // 斜体
        case 'italic':
          this.italic();
          break;
        // 下划线
        case 'underline':
          this.underline();
          break;
        // 删除线
        case 'strike':
          this.strike();
          break;
      }
    },
    // 更新编辑器工具区选中
    utilSelectType(key, id) {
      let { util } = this.data;

      if(key == 'carriage') {

      } else {
        let i = util.findIndex(o => { return o.id == id });

        if(util[i].select) {
          util[i].is = !util[i].is;
        }
      }

      this.setData({ util });
    },
    // 插入图片
    uploadImg() {
      let that = this;
      let { imageType } = that.data;

      this.hideFonts();
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          let tempFilePaths = res.tempFilePaths;
          
          try {
            let filePath = tempFilePaths[0];

            wx.showLoading({ title: '上传图片' })
            app.UPLOADIMG(imageType, filePath, res => {
              UTIL.toast('上传成功');
              EditorContext.insertImage({
                src: res.url, alt: "插图",
              })
            }, err => {
              wx.hideLoading();
              wx.showToast({ title: '上传失败', icon: 'error' })
            });
          }
          catch (err) {

          }
        }
      })
    },
    // 插入标题
    addTitle() {
      let { utilFonts } = this.data;
      utilFonts.active = ['h1'];
      this.setData({ utilFonts });
      EditorContext.format('header', 'H1');
      this.hideFonts();
    },
    // 插入小标题
    addMinTitle() {
      let { utilFonts } = this.data;
      utilFonts.active = ['h2'];
      this.setData({ utilFonts });
      EditorContext.format('header', 'H2');
      this.hideFonts();
    },
    // 插入副标题
    addSubTitle() {
      let { utilFonts } = this.data;
      utilFonts.active = ['h3'];
      this.setData({ utilFonts });
      EditorContext.format('header', 'H3');
      this.hideFonts();
    },
    // 插入正文
    addText() {
      let { utilFonts } = this.data;
      utilFonts.active = ['text'];
      this.setData({ utilFonts });
      EditorContext.removeFormat();
      this.hideFonts();
    },
    // 加粗
    blod() {
      let { utilFonts } = this.data;
      let blod_i = utilFonts.active.indexOf('blod');
      let italic_i = utilFonts.active.indexOf('italic');
      
      if(blod_i > -1) {
        EditorContext.format('fontWeight', '400');
        utilFonts.active.splice(blod_i, 1);
      }
      else if(italic_i > -1) {
        EditorContext.format('fontWeight', '600');
        utilFonts.active.push('blod');
      }
      else {
        EditorContext.format('fontWeight', '600');
        utilFonts.active = ['blod', 'text'];
      }

      this.setData({ utilFonts });
      this.hideFonts();
    },
    // 斜体
    italic() {
      let { utilFonts } = this.data;
      let blod_i = utilFonts.active.indexOf('blod');
      let italic_i = utilFonts.active.indexOf('italic');
      
      if(italic_i > -1) {
        EditorContext.format('fontStyle', 'normal');
        utilFonts.active.splice(italic_i, 1);
      }
      else if(blod_i > -1) {
        EditorContext.format('fontStyle', 'italic');
        utilFonts.active.push('italic');
      }
      else {
        EditorContext.format('fontStyle', 'italic');
        utilFonts.active = ['italic', 'text'];
      }

      this.setData({ utilFonts });
      this.hideFonts();
    },
    // 下划线
    underline() {
      EditorContext.format('underline');
    },
    // 删除线
    strike() {
      EditorContext.format('strike');
    },
    // 撤销 
    revocation() {
      EditorContext.undo();
    },
    // 恢复
    recover() {
      EditorContext.redo();
    },
    // 获取 editor contents
    getEditorContents() {
      return new Promise((resolve, reject) => {
        EditorContext.getContents({
          success(res) {
            resolve(res);
          }
        })
      })
    }
  },
  /**
   * 生命周期
   */
  lifetimes: {
    attached() {

    }
  }
})
