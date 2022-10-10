//index.js
//获取应用实例
const app = getApp();
const { UTIL, API } = app.globalData;

Page({
  data: {
    // 基本信息
    userInfo: {},
    // 其他用户信息
    otherUserInfo: {},
    // 性别列表
    sexPicker: [
      { key: 'MAN', label: '男' },
      { key: 'WOMAN', label: '女' },
      { key: 'INTERSEX', label: '其他' },
    ],
    // 是否可以编辑
    isSet: true,
    newDate: new Date()
  },

  // 获取登录用户信息
  getUser() {
    let that = this;
    let { sexPicker } = that.data;
    return app.REQUEST(API.getUser, 'GET')
    .then(res => {
      let user = UTIL.setObejctDefault({
        sex: [[''], 'INTERSEX'],
        location: [[''], '未知'],
        birthday: [[''], '未知'],
        inShort: [[''], '什么都没写']
      }, res.data);

      if(user.birthday != '未知') {
        user.birthdayStr = UTIL.dateToStr(user.birthday, 1, '-');
      } else {
        user.birthdayStr = user.birthday;
      }
      user.sexLabel = UTIL.findObj(sexPicker, { key: user.sex }).label;
      user.sexIdx = UTIL.findObjIdx(sexPicker, { key: user.sex });

      this.setData({ userInfo: user });
      return new Promise((resolve, reject) => {
        resolve(res);
      })
    })
  },
  // 获取其他用户信息
  getOtherUser(id) {
    app.REQUEST(API.getOtherUser, 'GET', { id: id }, 'app')
    .then(res => {
      this.setData({ otherUserInfo: res.data, isSet: false })
    })
  },

  // 跳转图片剪裁页面
  toCropper(e) {
    let type = e.target.dataset.type;

    wx.navigateTo({
      url: `/pages/cropper/index?type=${type}`
    })
  },

  // 修改昵称
  changeNickName(e) {
    let { value } = e.detail;
    let { userInfo } = this.data;

    userInfo.nickName = value;
    this.setData({ userInfo })
  },
  // 修改性别
  changeSex(e) {
    let { value } = e.detail;
    let { userInfo, sexPicker } = this.data;

    userInfo.sexLabel = sexPicker[value].label;
    userInfo.sex = sexPicker[value].key;
    this.setData({ userInfo })
  }, 
  // 修改所在地
  changeLocation(e) {
    let { value } = e.detail;
    let { userInfo } = this.data;

    userInfo.location = value;
    this.setData({ userInfo })
  },
  // 修改生日
  changeBirthday(e) {
    let { value } = e.detail;
    let { userInfo } = this.data;

    userInfo.birthdayStr = value;
    userInfo.birthday = new Date(value).getTime();
    this.setData({ userInfo })
  },
  // 修改简介
  changeInShort(e) {
    let { value } = e.detail;
    let { userInfo } = this.data;

    userInfo.inShort = value;
    this.setData({ userInfo })
  },
  // 更新用户封面
  updataCover(id) {
    return app.REQUEST(API.updatacover + id, 'PUT').then(res => {
      return new Promise((resolve, reject) => {
        resolve(res);
      })
    })
  },
  // 更新用户头像
  updataHeadImage(id) {
    return app.REQUEST(API.updataheadImage + id, 'PUT').then(res => {
      return new Promise((resolve, reject) => {
        resolve(res);
      })
    })
  },

  // 保存
  save() {
    let that = this;
    let { API } = app.globalData;
    let { cover, headImage } = this.data;
    let { birthday, inShort, location, nickName, sex } = this.data.userInfo;

    
    birthday = UTIL.dateToStr(birthday, 1, '-');
    birthday = new Date(birthday).getTime();
    let data = {
      birthday, inShort, location, nickName, sex
    };

    let callBack = () => {
      app.REQUEST(API.getUser, 'PUT', data)
      .then(res => {
        if(res.statusCode == 200) {
          UTIL.toast('修改成功')
          UTIL.toBack(false, true);
        }
      })
    }
    
    if(cover) {
      that.updataCover(cover.id).then(() => {
        if(headImage) {
          that.updataHeadImage(headImage.id).then(() => {
            callBack();
          })
        }
      })
    }
    else if(headImage) {
      that.updataHeadImage(headImage.id).then(() => {
        callBack();
      })
    }
    else {
      callBack();
    }
  },
  // 取消
  cancel() {
    UTIL.toBack(false, true);
  },
  
  callBack(e) {
    let { userInfo } = this.data;
    let json = {};

    if(e.type == 'COVER') {
      userInfo.cover = e.url;
      json.cover = e;
    }
    if(e.type == 'HEAD_IMAGE') {
      userInfo.headImage = e.url;
      json.headImage = e;
    }
    json.userInfo = userInfo;
    this.setData(json)
  },

  onLoad: function (options) {
    let that = this;
    let otherId = options.otherId;

    that.getUser().then(user => {
      if(otherId && otherId != user.id) {
        that.getOtherUser(otherId)
      }
    })
  },
  onShow() {

  }
})
