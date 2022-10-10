// universe/compontents/universeUtil/index.js
const app = getApp();
const { UTIL, API } = app.globalData;

let promptNode;
let popupNode;
let popupPropNode;
let saveCoordinateParams = {};

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 操作栏集合
    // type：universe  hobbystar userstar
    // obj: {} 传入数据集
    universeUtilObj: {
      type: Object,
      value: { type: 'universe', obj: {} },
      observer(val) {
        // this.initial();
      }
    },
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    dialog: {
      show: false,
      content: "登陆后才可操作"
    },
    // 简介
    util_inshort: [],
    // 工具展示
    util_show: false,
    // 工具内部展示
    util_item_show: false,
    // 工具简介展示
    util_text_show: false,
    util_item_an: false,
    // 工具展示展开
    declareShow: true,
    // 触发坐标
    util_coordinate: {x: '???', y: '???'},
    // prompt 参数
    prompt: {},
    // popup 参数
    popup: {},
    // 记录的坐标列表
    skipList: [],
    // 选中的记录坐标
    skipSelect: {},
    // 道具列表
    propList: [],
    // 显示修改坐标input
    setNameInput: false,
    // inshort区域是否是 星域
    isUniverse: false,

    // 上方
    // 操作列表
    util_top_list: [],

    // 右方
    // 操作列表
    util_right_list: [],

    // 下方
    // 操作列表
    util_bottom_list: [],

    // 左方
    // 操作列表
    util_left_list: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 打开
    open() {
      promptNode = this.selectComponent("#prompt");
      popupNode = this.selectComponent("#popup");
      popupPropNode = this.selectComponent("#popupProp");
      this.initial();
    },
    // 关闭
    close(fn = function(){}) {
      this.setData({ util_item_show: false }, () => {
        setTimeout(() => {
          saveCoordinateParams = {};
          this.setData({ util_show: false }, fn)
        }, 300)
      });
      this.textClose();
    },
    // 工具简介显示
    textOpen() {
      UTIL.an_opacity_out_in(
        this,
        { show: 'util_text_show', animation: 'util_item_an' },
        true,
        300,
        0.99
        );
    },
    // 工具简介隐藏
    textClose() {
      UTIL.an_opacity_out_in(
        this,
        { show: 'util_text_show', animation: 'util_item_an' },
        false,
        300
        );
    },
    // 初始化工具栏
    initial() {
      let { universeUtilObj } = this.data;
      let { type, obj } = universeUtilObj;
      let json = { util_inshort: [] };

      json.util_show = false;

      // 点击星域
      if(type == 'universe') {
        json.util_right_list = [
          // 进入
          { icon: '../../../icon/universe/icn_dingwei_dangqian@2x.png', key: 'universe_touser', alone: true },
          // 分享坐标
          { icon: '../../../icon/universe/icn-fenxiang@2x.png', label: '分享', declare: '将用户分享给好友', key: 'universe_share', button: true, first: true },
          // 生成带二维码的截图
          { icon: '../../../icon/universe/icn-jietu@2x.png', label: '截图', declare: '生成带有二维码的截图', key: 'userstar_screenshot' }
        ]
        json.util_bottom_list = [

        ]
        json.util_left_list = [
          // // 回到我的星球
          // { icon: 'icon-huidaozhuye', label: '回到', declare: '回到自己的星球位置', key: 'universe_touser' },
          // // 跳转到标记的坐标点
          // { icon: 'icon-tiaozhuan', label: '定位', declare: '跳转到标记的坐标位置', key: 'universe_skip' },
        ]

        json.util_inshort.push({
          src: '../../../icon/universe/zuobiao.png',
          text: `坐标：${obj.x} , ${obj.y}`
        });
      }
      // 点击爱好星球
      else if(type == 'HOBBY') {
        json.util_right_list = [
          // 进入星球
          { icon: '../../../icon/universe/icn_dingwei@2x.png', key: 'hobbystar_in' },
          // 分享爱好星球
          { icon: '../../../icon/universe/icn-fenxiang@2x.png', label: '分享', declare: '将爱好分享给好友', key: 'hobbystar_share', button: true },
          // 生成带二维码的截图
          { icon: '../../../icon/universe/icn-jietu@2x.png', label: '截图', declare: '生成带有二维码的截图', key: 'hobbystar_screenshot' }
        ]
        json.util_bottom_list = []
        json.util_left_list = []

        json.util_coordinate = { x: obj.x, y: obj.y};

        json.util_inshort.push({
          src: '../../../icon/universe/aihao.png',
          text: `爱好：${obj.hobbyInfo.name}`
        });
        json.util_inshort.push(({
          src: '../../../icon/universe/zuobiao.png',
          text: `坐标：${obj.x} , ${obj.y}`
        }));
        json.util_inshort.push({
          src: '../../../icon/universe/banjing.png',
          text: `半径：${obj.size}Km`
        });

        let hobby = app.hasHobbyes(obj.hobbyInfo.id);
        
        if(hobby.inShort && hobby.inShort != '') {
          json.util_inshort.push({
            text: hobby.inShort
          });
        }
      }
      // 点击用户星球
      else if(type == 'USER') {
        json.util_right_list = [
          // 进入
          { icon: '../../../icon/universe/icn_dingwei_dangqian@2x.png', key: 'userstar_in', alone: true },
          // 分享用户星球
          { icon: '../../../icon/universe/icn-fenxiang@2x.png', label: '分享', declare: '将用户分享给好友', key: 'userstar_share', button: true, first: true },
          // 生成带二维码的截图
          { icon: '../../../icon/universe/icn-jietu@2x.png', label: '截图', declare: '生成带有二维码的截图', key: 'userstar_screenshot' }
        ]
        json.util_bottom_list = [

        ]
        json.util_left_list = []

        json.util_coordinate = { x: obj.x, y: obj.y};

        json.util_inshort.push({
          src: '../../../icon/universe/yonghu.png',
          text: `用户：${obj.userInfo.nickname}`
        });
        json.util_inshort.push({
          src: '../../../icon/universe/zuobiao.png',
          text: `坐标：${obj.x} , ${obj.y}`
        });
        json.util_inshort.push({
          src: '../../../icon/universe/banjing.png',
          text: `半径：${obj.size}Km`
        });

        this.getOtherUserInfo(obj).then(res => {
          if(app.globalData.userInfo.id != obj.userInfo.id) {
            if(res.follow) {
              // 取消关注
              json.util_right_list.push({ icon: '../../../icon/shoucang.png', label: '取消关注', declare: '取消关注用户', key: 'userstar_un_attention' })
            } else {
              // 关注
              json.util_right_list.push({ icon: '../../../icon/shoucang.png', label: '关注', declare: '关注用户，并可在“定位”中跳转到该用户所在坐标', key: 'userstar_attention' })
            }
          }
          
          if(res.inShort && res.inShort != '') {
            json.util_inshort.push({
              text: res.inShort
            });
          }
          this.setData(json);
        })
      }
      // 点击无主星球
      else if(type == 'UNOWNED') {
        json.util_right_list = [
          // 分享用户星球
          { icon: '../../../icon/universe/icn-fenxiang@2x.png', label: '分享', declare: '将用户分享给好友', key: 'userstar_share', button: true, first: true },
          // 生成带二维码的截图
          { icon: '../../../icon/universe/icn-jietu@2x.png', label: '截图', declare: '生成带有二维码的截图', key: 'userstar_screenshot' }
        ]
        json.util_bottom_list = [
        ]
        json.util_left_list = [
        ]

        json.util_coordinate = { x: obj.x, y: obj.y};

        json.util_inshort.push({
          text: `无主之地`
        });
        json.util_inshort.push({
          src: '../../../icon/universe/zuobiao.png',
          text: `坐标：${obj.x} , ${obj.y}`
        });
        json.util_inshort.push({
          src: '../../../icon/universe/banjing.png',
          text: `半径：${obj.size}Km`
        });
      }

      json.isUniverse = type == 'universe';

      // 所有类型下都有的工具
      json.util_bottom_list = [
        ...json.util_bottom_list,
        // 进入个人中心
        { icon: 'icon-gerenzhongxin-zhong', label: '个人中心', declare: '进入到个人中心', key: 'all_user' },
        // 切换低版本
        { icon: 'icon-jianjie', label: '简洁版', declare: '将探索模式切换为节省性能的简洁版', key: 'all_concise' },
        // 消息
        { icon: 'icon-pinglun1', label: '消息', declare: '打开消息页', key: 'all_messages' },
      ];

      if(this.data.util_show) {
        this.textClose();
        this.close(() => {
          json.util_show = true;
          json.util_item_show = true;
          this.textOpen();
          this.setData(json);
        })
      } else {
        json.util_show = true;
        json.util_item_show = true;
        this.textOpen();
        this.setData(json);
      }
    },
    // 工具点击事件
    utilClick(e) {
      let key = UTIL.getNodeSetData(e, 'key');
      let idx = UTIL.getNodeSetData(e, 'idx');
      let { universeUtilObj } = this.data;

      // 星域 分享坐标
      if(key == 'universe_share') {
        // universe/pages/home 页面处理
      }
      // 星域 生成带二维码的截图
      else if(key == 'universe_screenshot') {
        UTIL.toast('开发中')
      }
      // 星域 储存当前坐标点
      else if(key == 'universe_tab') {
        this.saveCoordinate();
      }
      // 星域 弹出道具弹窗，（目前都是空的）
      else if(key == 'universe_prop') {
        this.openProp('universe');
      }
      // 星域 回到我的星球
      else if(key == 'universe_touser') {
        this.toUserStar();
      }
      // 星域 跳转到标记的坐标点
      else if(key == 'universe_skip') {
        this.openSkipList();
      }
      // 爱好 分享爱好星球
      else if(key == 'hobbystar_share') {
        // universe/pages/home 页面处理
      }
      // 爱好 生成带二维码的截图
      else if(key == 'hobbystar_screenshot') {
        UTIL.toast('开发中')
      }
      // 爱好 关注爱好
      else if(key == 'hobbystar_attention') {
        this.attentionHobby(idx);
      }
      // 爱好 取消关注爱好
      else if(key == 'hobbystar_un_attention') {
        this.unAttentionHobby(idx);
      }
      // 爱好 弹出道具弹窗，（目前都是空的）
      else if(key == 'hobbystar_prop') {
        this.openProp('hobbystar');
      }
      // 爱好 进入爱好子站
      else if(key == 'hobbystar_in') {
        this.toHobby();
      }
      // 用户 分享用户星球
      else if(key == 'userstar_share') {
        // universe/pages/home 页面处理
      }
      // 用户 生成带二维码的截图
      else if(key == 'userstar_screenshot') {
        UTIL.toast('开发中')
      }
      // 用户 关注用户
      else if(key == 'userstar_attention') {
        this.attentionUser(idx)
      }
      // 用户 取消关注用户
      else if(key == 'userstar_un_attention') {
        this.unAttentionUser(idx)
      }
      // 用户 弹出道具弹窗，（目前都是空的）
      else if(key == 'userstar_prop') {
        this.openProp('userstar');
      }
      // 用户 进入用户中心
      else if(key == 'userstar_in') {
        this.toUser();
      }
      // 无主之地 分享
      else if(key == 'unowned_share') {
        // universe/pages/home 页面处理
      }
      // 无主之地 生成带二维码的截图
      else if(key == 'unowned_screenshot') {
        UTIL.toast('开发中')
      }
      // 无主之地 弹出道具弹窗，（目前都是空的）
      else if(key == 'unowned_prop') {
        this.openProp('unowned');
      }
      // 所有 进入消息列表
      else if(key == 'all_messages') {
        this.toMessages();
      }
      // 所有 切换简洁版
      else if(key == 'all_concise') {
        this.switchConcise();
      }
      // 所有 进入个人中心
      else if(key == 'all_user') {
        this.toUser(true);
      }

      this.triggerEvent('utilItem', { key, obj: universeUtilObj })
    },

    // 获取他人用户信息
    getOtherUserInfo(obj) {
      return new Promise((resolve, reject) => {
        let id = obj.userInfo.id;
        app.REQUEST(`${API.getOtherUser}${id}`, 'GET', {}, 'app')
          .then(res => {
            let { statusCode, data } = res;
            if(statusCode == 200) {
              resolve(data);
            }
          })
      })
    },

    // 切换简洁版
    switchConcise() {
      app._setUserFunction('LOW').then(res => {
        app.TOHOME();
      })
    },
    // 跳转消息页面
    toMessages() {
      wx.switchTab({ url: '/pages/message/index' })
    },
    // 跳转爱好子站
    toHobby() {
      let { universeUtilObj } = this.data;
      let { hobbyInfo } = universeUtilObj.obj;
      let url = "/subIndex/pages/home/index";

      hobbyInfo.x = universeUtilObj.obj.x;
      hobbyInfo.y = universeUtilObj.obj.y;
      
      this.triggerEvent('closestar');
      setTimeout(() => {
        app.setPageParams(url, hobbyInfo);
        wx.navigateTo({
          url: `${url}?hobbyid=${hobbyInfo.id}`
        });
      }, 300);
    },
    // 跳转个人中心
    toUser(isMe) {
      let { universeUtilObj } = this.data;
      let { userInfo: authorInfo } = universeUtilObj.obj;
      let userInfo = app.globalData.userInfo;

      this.triggerEvent('closestar');
      if(isMe || userInfo.id == authorInfo.id) {
        wx.switchTab({ url: '/pages/user/index' })
      } else {
        wx.navigateTo({ url: '/user/pages/otherInfo/index?id=' + authorInfo.id })
      }
    },
    // 跳转个人星球
    toUserStar() {
      let that = this;

      wx.showModal({
        content: '即将定位到自己的星球，当前坐标不会保存',
        confirmText: '定位',
        cancelText: '稍等',
        success(res) {
          if(res.confirm) {
            that.triggerEvent('touserstar');
            that.close();
          }
        }
      })
    },
    // 关注用户
    attentionUser(idx) {
      let { universeUtilObj, util_right_list } = this.data;
      let { userInfo } = universeUtilObj.obj;
      
      if(app.globalData.userInfo && app.globalData.userInfo.id) {
        app.REQUEST(API.postFollow + userInfo.id, 'POST')
          .then(res => {
            let { statusCode, data } = res;
            if(statusCode == 200) {
              util_right_list[idx] = { icon: '../../../icon/shoucang.png', label: '取消关注', declare: '取消关注用户', key: 'userstar_un_attention' };
  
              this.setData({ util_right_list }, () => {
                UTIL.toast('已关注')
              })
            }
          })
      }
      else {
        this.showDialog();
      }
    },
    // 取消关注用户
    unAttentionUser(idx) {
      let { universeUtilObj, util_right_list } = this.data;
      let { userInfo } = universeUtilObj.obj;
      
      app.REQUEST(API.postUnFollow + userInfo.id, 'POST')
        .then(res => {
          let { statusCode, data } = res;
          if(statusCode == 200) {
            util_right_list[idx] = { icon: '../../../icon/shoucang.png', label: '关注', declare: '关注用户，并可在“定位”中跳转到该用户所在坐标', key: 'userstar_attention' };

            this.setData({ util_right_list }, () => {
              UTIL.toast('已取消关注')
            })
          }
        })

    },
    // 提示登录
    showDialog() {
      let { dialog } = this.data;
      dialog.show = true;
      this.setData({ dialog });
    },
    // 登录回调
    dialogConfirm() {
      let { dialog } = this.data;
      dialog.show = false;
      this.setData({ dialog });
    },
    // 关注爱好
    attentionHobby(idx) {
      let { universeUtilObj, util_right_list } = this.data;
      let { hobbyInfo } = universeUtilObj.obj;
      
      if(app.globalData.userInfo && app.globalData.userInfo.id) {
        app.addHobby(hobbyInfo).then(res => {
          util_right_list[idx] = { icon: '../../../icon/shoucang.png', label: '取消关注', declare: '取消关注爱好', key: 'hobbystar_un_attention' };
  
          this.setData({ util_right_list }, () => {
            UTIL.toast('已关注')
          })
        })
      }
      else {
        this.showDialog();
      }
    },
    // 取消关注爱好
    unAttentionHobby(idx) {
      let { universeUtilObj, util_right_list } = this.data;
      let { hobbyInfo } = universeUtilObj.obj;
      
      app.reduceHobby(hobbyInfo).then(res => {
        util_right_list[idx] = { icon: '../../../icon/shoucang.png', label: '关注', declare: '关注爱好，并可在“定位”中跳转到该爱好所在坐标', key: 'hobbystar_attention' };

        this.setData({ util_right_list }, () => {
          UTIL.toast('已取消关注')
        })
      })
    },
    // 保存坐标
    saveCoordinate() {
      let { universeUtilObj } = this.data;
      let { type, x, y, hobbyInfo } = universeUtilObj.obj;
      let prompt = {};

      x = Math.round(x);
      y = Math.round(y);

      saveCoordinateParams = { x, y };
      
      // 星域坐标
      if(universeUtilObj.type == 'universe') {
        prompt = {
          title: '记录坐标', confirmText: '记录',
          callBackKey: 'save', label: `${x} , ${y}`
        }
      }
      // 用户
      else if(universeUtilObj.type == 'USER') {
        console.log(`用户：${hobbyInfo.name}  坐标：${x} , ${y}`)
      }
      // 爱好
      else if(type == 'HOBBY') {
        console.log(`爱好：${hobbyInfo.name}  坐标：${x} , ${y}`)
      }

      this.setData({ prompt }, () => {
        promptNode.open();
      });
    },
    // 打开记录的坐标点列表
    openSkipList() {
      let popup = {
        title: '记录的坐标', confirmText: '定位',
        callBackKey: 'skip'
      };
      
      app.REQUEST(API.coordinate, 'GET')
      .then(res => {
        if(res.statusCode == 200) {
          let skipList = res.data;
          this.setData({ popup, skipList }, () => {
            popupNode.open();
          })
        }
      })
    },
    // 打开道具列表
    openProp(type) {
      let popupProp = {
        title: '可使用的道具', confirmText: '使用',
        callBackKey: 'use'
      };
      
      this.setData({ popupProp }, () => {
        popupPropNode.open();
      })
    },
    // 选择收藏坐标
    selectSkip(e) {
      let { skipList, skipSelect } = this.data;
      let idx = UTIL.getNodeSetData(e, 'idx');

      if(skipList[idx].id != skipSelect.id) {
        this.setData({ skipSelect: skipList[idx], setNameInput: false });
      }
    },
    // 点击修改坐标名称
    skipNameChange(e) {
      this.setData({ setNameInput: true });
    },
    // 保存坐标修改
    skipNameSave(e) {
      let { skipList } = this.data;
      let { value } = e.detail;
      let id = UTIL.getNodeSetData(e, 'id');
      let idx = UTIL.getNodeSetData(e, 'idx');
      let params = { id, name: value };

      app.REQUEST(API.coordinateName, 'PUT', params)
        .then(res => {
          skipList[idx].name = value;
          this.setData({ setNameInput: false, skipList });
        })
    },
    // 点击删除坐标
    skipDelete(e) {
      let id = UTIL.getNodeSetData(e, 'id');

    },
    
    // 收藏坐标 || 修改坐标 弹窗回调
    promptConfirm(e) {
      let { confirm, value, callBackKey } = e.detail;

      if(confirm) {
        let params = {
          x: Number(saveCoordinateParams.x),
          y: Number(saveCoordinateParams.y),
          name: value
        }
        app.REQUEST(API.coordinate, 'POST', params)
          .then(res => {
            if(res.statusCode == 200) {
              promptNode.close();
              UTIL.toast('记录成功');
            }
          })
      }
    },
    // 坐标列表 弹窗回调
    popupConfirm(e) {
      let { confirm, value, callBackKey } = e.detail;
      let data = this.data.skipSelect;

      if(confirm) {
        this.triggerEvent('skip', data);
      }
      popupNode.close();
      this.setData({ skipSelect: {} });
    },
    // 道具列表 弹窗回调 
    popupPropConfirm(e) {

    },

    // 切换操作说明展开
    switchUtilText() { 
      let { declareShow } = this.data;

      declareShow = !declareShow;
      this.setData({ declareShow })
    }
  }
})
