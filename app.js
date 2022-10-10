import Api from './utils/api.js';
import config from "./utils/config.js";
import util from "./utils/util.js";
import lottie from 'lottie-miniprogram';

let userInfo = wx.getStorageSync('userInfo');
let methodObj = {};
// socket heart 计时器
let socket_heart_interval;
// socket 是否重新连接
let socket_reconnect;
// page this
let pageThat;
// 维持登陆状态 timeout
let maintainTimeout = false;
// 维持登陆请求时间间隔
let maintainTime = 1200000;
// 防止一秒内重复发起请求，储存上次请求地址和时间
let preQuest = {
  // 请求间隔时间
  interval: 1000,
  // 请求地址
  url: '',
  // 上次请求时间
  time: 0,
  // 上次请求的回调
  res: {}
};
// 所有消息通知id
let tmplIdsAll = {
  "审核结果通知": "xxxxxx",
  "新的回复提醒": "xxxxxx",
  "悬赏被选中消息": "xxxxxx",
  "悬赏到期通知": "xxxxxx",
};
// 本次小程序为访客模式
let notLogin = false;

App({
  onLaunch: function () {
    let _self = this;

    wx.getSystemInfo({
      success: function (res) {
        let modelmes = res.model;
        if (res.platform == "devtools") {
          _self.globalData.system = 'pc';
        } else if (res.platform == "ios") {            
          _self.globalData.system = 'ios';
          
          if (modelmes.search('iPhone X') != -1) {
            _self.globalData.isIphoneX = true
          }
        } else if (res.platform == "android") {            
          _self.globalData.system = 'android';
        }
      }
    })

    // 内存不足监听
    wx.onMemoryWarning((level) => {
      if(userInfo.performance == 'HIGH') {
        setTimeout(() => {
          _self._setUserFunction('LOW');
        }, 1500)
      }
    })
  },
  watch:function(obj, key ,method){
    obj = obj || getApp().globalData;

    if(!methodObj[key]) {
      methodObj[key] = [];
    }
    methodObj[key].push(method);
    // 监听 isLogin
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        this['_' + key] = value;
        methodObj[key].map(item => item(value));
      },
      get:function(){
        return this['_' + key]
      }
    })
  },
  globalData: {
    // 充值 type
    payType: 'WEIXIN_MINI_APP',
    // 提现 type
    channelType: 'WEIXIN',
    // 订单类型对照表
    orderTypes: {
      'ARTICLE': "文章",
      'CHARGE': "充值",
      'CASH_WITHDRAWAL': "提现",
      'CASH_WITHDRAWAL_RETURN': "提现退回",
      'REWARD_DEMAND': "发布悬赏",
      'ADD_REWARD': "增加悬赏金",
      'SELECTED_REWARD': "选定悬赏",
      'SYSTEM_ADD': "系统发放",
      'SYSTEM_SUB': "系统扣除",
      'REWARD_DEMAND_RETURN': "取消悬赏退回",
      'REWARD_DEMAND_COMPENSATE': "回答的悬赏取消补偿"
    },
    withdrawStatus: {
      'NOT_PASS': "审核未通过",
      'PASS': "审核通过",
      'UNTREATED': "未审核"
    },
    // 消息提示数量
    messageNum: 0,
    // socket状态
    socketStatus: 'closed',
    // 是否已授权
    isAccredit: false,
    // 登录的code
    loginCode: false,
    // 全局变量
    userInfo: wx.getStorageSync('userInfo') || {},
    // 设备视图宽度
    width: wx.getSystemInfoSync().windowWidth,
    // 设备视图高度
    height: wx.getSystemInfoSync().windowHeight,
    // 系统：pc、ios、android
    system: false,
    isIphoneX: false,
    // h5 postMessage 返回数据
    webLoginData: false,
    // 页面传参
    pageTransmitParams: {},
    // 无限宇宙背景数据
    universe: {
      // 每个格的宽度
      itemMapWidth: 2000,
      // 每个格的高度
      itemMapHeight: 2000,
      // km与px比率，0.5: 1km == 0.5px; 1: 1km == 1px
      rate: 1,
      // 坐标与km比率, 100: 1坐标 == 100km
      coordToKm: 100
    },
    // showLoading 数据集
    loading: {
      // 展示时间，确保展示时间不会太短
      showTime: 0,
      interval: 1000
    },
    // 收藏爱好的列表——需要长期维护
    attentionedHobby: [],
    // 性能相关
    functionObj: {
      // 临界值，ms，性能测试大于该值可切换探索模式
      critical:  3000
    },
    // 工具
    API: Api.httpUrl,
    CONFIG: config,
    UTIL: util,
    LOTTIE: lottie
  },
  // 强制更新
  updataManager: () => {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
    wx.showModal({
      title:'更新提示',
      content:'新版本已经准备好，是否马上重启小程序？',
      success:function (res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      }
    })
    })
    updateManager.onUpdateFailed(function () {
    // 新的版本下载失败
    })
  },
  // 小程序消息订阅
  wxSubscribeMessage: (keys) => {
    let tmplIds = [];

    keys.map(k => {
      tmplIds.push(tmplIdsAll[k]);
    })
    
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds, success(res) {
          console.log(res)
          Object.keys(tmplIdsAll).map(k => {
            if(res[tmplIdsAll[k]]) {
              if(res[tmplIdsAll[k]] == 'accept') {
                console.log(`用户同意订阅 ${k} 消息模板`);
              } else {
                // 'accept'表示用户同意订阅该条id对应的模板消息
                // 'reject'表示用户拒绝订阅该条id对应的模板消息
                // 'ban'表示已被后台封禁
                // 'filter'表示该模板因为模板标题同名被后台过滤
                console.log(`订阅 ${k} 消息模板失败，失败原因：${res[tmplIdsAll[k]]}`);
              }
            }
          });
          resolve(res);
        }, fail(err) {
          resolve(err);
        }
      })
    })
  },
  REQUEST: (url, method, data, wType, params = {}) => {
    let that = getApp();
    let time = new Date().getTime();
    
    let www = !wType ? 'accounts' : wType;
    let fullUrl = config.url[www] + url;

    let n = 0;

    // 不判断重复操作机制的接口
    let notToastRepetition = [
      that.globalData.API.getUser,
      that.globalData.API.getCelestialBodyStarDomain,
      that.globalData.API.matchingImage,
      that.globalData.API.imageCredentials + 'MESSAGE',
    ];

    const _hideLoading = () => {
      if((new Date().getTime() - that.globalData.loading.time) < that.globalData.loading.interval) {
        setTimeout(() => {
          wx.hideLoading();
        }, that.globalData.loading.interval - (new Date().getTime() - that.globalData.loading.time))
      } else {
        wx.hideLoading();
      }
    }
    const _request = (resolve, reject) => {
      if(preQuest.url == fullUrl
        && preQuest.data == JSON.stringify(data)
        && (time - preQuest.time) < preQuest.interval
        && preQuest.method == method
        && notToastRepetition.indexOf(url) < 0) {
        const data = preQuest.res[JSON.stringify(fullUrl)];
        return resolve(data);
      } else {
        preQuest.time = time;
        preQuest.url = fullUrl;
        preQuest.data = JSON.stringify(data);
        preQuest.method = method;
      }

      let header = {
        "Content-Type":"application/json",
        "Cookie": that.globalData.userInfo["Set-Cookie"]
      };
      if(params && params["x-server-name"]) {
        header["x-server-name"] = params["x-server-name"];
      }

      wx.request({
        url: fullUrl,
        method: method,
        data: data,
        header: header,
        success: function(res) {
          _hideLoading();

          that.maintainRequest();
          if (res.statusCode == 200) {
            preQuest.res[JSON.stringify(fullUrl)] = res;
            resolve(res);
          }else if (res.statusCode == '401'){
            if((n < 2 && !notLogin) || params.coerceLogin) {
              params.coerceLogin = false;
              that.LOGIN(() => {
                _request(resolve, reject);
              }, true, true);
              n ++
            } else {
              notLogin = true;
              resolve(res);
              // wx.showModal({
              //   title: '提示',
              //   content: '自动登录失败，请手动登录',
              //   showCancel: false,
              //   confirmText: '我知道了',
              //   success() {
              //     that.TOHOME()
              //   }
              // })
            }
          }else if (res.statusCode == '400') {
            if(!params || !params.notModal) {
              wx.showModal({
                title: '提示',
                showCancel: false,
                content: res.data.errorDescription
              })
            }
          }else if (res.statusCode == '404') {

          }else if (res.statusCode == '500') {
            wx.showToast({
              title: '服务器出错了',
              icon: 'none'
            })
            reject(res.data);
          }else {
            wx.showToast({
              title: res.data.errorDescription,
              icon: 'none'
            })
            reject(res.data);
          }
        },
        fail: (res => {
          wx.hideLoading();
          wx.showToast({
            title: '网络差，请稍后再试！',
            icon: 'none',
            duration: 1500
          })
          reject('网络差，请稍后再试！');
        })
      })
    }

    return new Promise((resolve, reject) => {
      if(params && params.showLoading) {
        that.globalData.loading.time = time;
        wx.showLoading({title: "加载中"});
      }
      _request(resolve, reject);
    })
  },
  UPLOADIMG: (type, filePath, cb, errCb) => {
    let app = getApp();
    const hash = new Date().getTime();
    const imgType = filePath.match(/\.(jpg|png)/g)[0];
    
    // 1、获取上传图片凭证
    app.REQUEST(app.globalData.API.imageCredentials + type, 'GET')
    .then(res => {
      // 2、上传阿里云
      wx.uploadFile({
        url: res.data.url,
        filePath: filePath,
        name: 'file',
        formData: {
          key: res.data.prefix + hash + imgType,
          policy: res.data.policy,
          OSSAccessKeyId: res.data.ossAccessKeyId,
          signature: res.data.signature,
          callback: res.data.callback
        },
        success: (_res) => {
          if (_res.statusCode === 200) {
            // 3、补全image
            app.REQUEST(app.globalData.API.matchingImage, 'POST', { ossKey: res.data.prefix + hash + imgType })
            .then(__res => {
              cb && cb(__res.data)
            });
          }
        },
        fail: err => {
          console.log(err);
          errCb && errCb(err)
        }
      });
    })
  },
  PAY: (response, suc, fai) => {
    let app = getApp();

    wx.requestPayment({
      timeStamp: response.timeStamp,
      nonceStr: response.nonceStr,
      package: response.package,
      signType: 'MD5',
      paySign: response.paySign,
      success(res) {
        /**支付成功后操作 */
        wx.requestSubscribeMessage({
          tmplIds: ['xxxxxx', "xxxxxx", "xxxxxx"],
          success(res) {
            console.log("订阅消息", res)
            if (res['xxxxxx'] == 'accept') {
              console.log("订单支付允许订阅")
            } else {
              console.log("订单支付取消订阅")
            }
            if (res['xxxxxx'] == 'accept') {
              console.log("退款允许订阅")
            } else {
              console.log("退款取消订阅")
            }
            if (res['xxxxxx'] == 'accept') {
              console.log("服务到期允许订阅")
            } else {
              console.log("服务到期取消订阅")
            }

          },
          complete() {
            suc && suc();
          }
        })
      },
      fail(res) {
        wx.showToast({
          title: '支付失败',
          icon: "none",
          duration: 1000,
          mask: true
        });
        
        fai && fai();
      }
    })
  },
  LOGIN: (callback, getUser = true, notToast) => {
    let app = getApp();

    !notToast && wx.showLoading({ title: "登陆中" });
    wx.login({
      success(res) {
        if(res.code) {
          let data = {
            code: res.code
          };

          app.globalData.loginCode = res.code;
          if(getUser) {
            app.REQUEST('/accounts/login/wx?code='+res.code, 'POST',data)
              .then(_res => {
                !notToast && wx.hideLoading();
                !notToast && wx.showToast({ title: '登陆成功', icon: "success" });
                let userInfo = {};
  
                userInfo["Set-Cookie"] = _res.header["Set-Cookie"];
                userInfo.performance = 'LOW';
              
                app.globalData.userInfo = userInfo;
                app.globalData.isAccredit = _res.data.hasUnionId;
  
                app.GETUSER(callback, true);
              }).catch(err => {
                wx.showToast({ title: '登陆失败', icon: "error" });
              })
          } else {
            callback(res.code)
          }
        }
      },
      fail(err) {
        wx.showToast({ title: '登陆失败', icon: "error" });
      }
    })
  },
  GETUSER: (callback, coerce) => {
    let app = getApp();

    if(
      app.globalData.userInfo &&
      app.globalData.userInfo.id &&
      app.globalData.userInfo.id != '' &&
      !coerce
      ) {
      callback && callback(app.globalData.userInfo);
    } else {
      app.REQUEST(app.globalData.API.getUser, 'GET')
        .then(res => {
          let userInfo = app.globalData.userInfo;

          app.globalData.userInfo = { ...userInfo, ...res.data };
          app.globalData.isAccredit = true;

          // app.globalData.userInfo = {};
          // app.globalData.isAccredit = false;

          wx.setStorageSync('userInfo', app.globalData.userInfo);
          // 打开socket通讯
          if(app.globalData.socketStatus === 'closed') {
            app.OPENSOCKET();
          }

          // 获取爱好列表
          app.setHobby().then(hobby => {
            callback && callback(app.globalData.userInfo);
          }).catch(err => {
            callback && callback({});
          })
        })
    }
  },
  // 授权手机号
  accreditPhone: (e) => {
    let app = getApp();
    let { API, UTIL } = app.globalData;
    let { encryptedData, iv } = e.detail;

    const phoneWxMini = (code) => {
      let data = { encryptedData, iv }

      if(code) { data.code = code };

      return new Promise((resolve, reject) => {
        app.REQUEST(API.phoneWxMini, "PUT", data, false, { notModal: true })
        .then(res => {
          if(res.statusCode == 200) {
            UTIL.toast('更新成功');
            app.GETUSER(() => {
              resolve(res);
            })
          } else {
            reject(res);
          }
        })
      })
    }

    return new Promise((resolve, reject) => {
      wx.checkSession({
        // session 未过期
        success() {
          console.log('session 未过期')
          phoneWxMini().then(resolve).catch(reject);
        },
        // session 已过期
        fail() {
          console.log('session 已过期')
          app.LOGIN(code => {
            phoneWxMini(code).then(resolve).catch(reject);
          }, false)
        }
      })
    })
  },
  // 性能测试
  FUNCTIONAL: (callback) => {
    let app = getApp();
    let critical = app.globalData.functionObj.critical;
    let startTime = new Date().getTime();

    // 目前默认都是高性能
    callback(true);
  },
  // 修改用户设备性能
  _setUserFunction: (val) => {
    let app = getApp();

    return new Promise((resolve, reject) => {
      app.REQUEST(app.globalData.API.performance + val, 'PUT')
      .then(res => {
        if(res.statusCode == 200) {
          app.globalData.userInfo.performance = val;
          wx.setStorageSync('userInfo', app.globalData.userInfo);
          resolve();
        }
      })
    })
  },
  // 回到首页
  TOHOME: (params) => {
    let app = getApp();
    params && app.setPageParams('/pages/home/index', params);
    wx.switchTab({ url: `/pages/home/index` })
  },
  // webSocket 相关
  OPENSOCKET() {
    let that = this;
    //心跳检测
    var heartCheck = {
      timeout: 30000,
      intervalObj: null,
      reset() {
        clearTimeout(this.intervalObj);
        return this;
      },
      start() {
        var self = this;
        this.intervalObj = setInterval(() => {
          that.SENDMESSAGE('heart');
        }, self.timeout);
      }
    }

    //打开时的动作
     wx.onSocketOpen(() => {
       console.log('WebSocket 已连接')
       heartCheck.reset().start();
       this.globalData.socketStatus = 'connected';
     })
     //断开时的动作
     wx.onSocketClose((err) => {
       console.log('WebSocket 已断开', err)
       this.globalData.socketStatus = 'closed';

       this._reconnect();
     })
     //报错时的动作
     wx.onSocketError(error => {
       console.error('socket error:', error)
     })
     // 监听服务器推送的消息
     wx.onSocketMessage(message => {
       //把JSONStr转为JSON
       message = message.data.replace(" ", "");
       if (typeof message != 'object') {
         message = message.replace(/\ufeff/g, "");
         var jj = JSON.parse(message);
         var messageNum = this.globalData.messageNum;
         message = jj;
         messageNum++;
         
         this.globalData.messageNum = messageNum;
         
         var tabbarObj = false;
         if(pageThat) tabbarObj = pageThat.getTabBar();
         if(tabbarObj) tabbarObj.setData({ messageNum });
         if(pageThat && pageThat.receiveMessage) pageThat.receiveMessage(message);
       }
       console.log("【websocket监听到消息】内容如下：", message);
     })
     
     if(this.globalData.userInfo.accountsId) {
      // 打开信道
      wx.connectSocket({
        url: config.url.socket + '/webSocket/' + this.globalData.userInfo.accountsId
      })
     }
  },
  //防止重复连接
  _reconnect() {
    let that = this;
    if(socket_reconnect) return;
    socket_reconnect = setTimeout(function () {
        that.OPENSOCKET();
        socket_reconnect = false;
    }, 3000);
  },
  //关闭信道
  CLOSESOCKET() {
    if (this.globalData.socketStatus === 'connected') {
      wx.closeSocket({
        success: () => {
          this.globalData.socketStatus = 'closed';
          socket_heart_interval && clearInterval(socket_heart_interval);
        }
      })
    }
  }, 
  //发送消息函数
  SENDMESSAGE(data, sucFn = ()=>{}, failFn = ()=>{}) {
    /**
      String recipient  接收人userId
      String message    文本消息内容
      String ossKey     如果是传的图片、语音、视频这里是文件的ossKey
      MediaType mediaType   这里是媒体文件的类型

      MediaType

      IMAGE
      VIDEO
      AUDIO
     */

    data = data || {}
    if (this.globalData.socketStatus === 'connected') {
      if(typeof data == 'object') {
        data = JSON.stringify(data);
      }
      wx.sendSocketMessage({
        data,
        success: sucFn,
        fail(err) {
          wx.showToast({ title: err, icon: 'none' });
          failFn(err);
        }
      });
    }
  },
  // 设置tabber数据
  SETTABBER(params) {
    pageThat.getTabBar().setData({...params})
  },
  // 设置页面this
  SETPAGETHIS(that) {
    pageThat = that;
  },
  setPageParams(url, params) {
    let that = getApp();

    that.globalData.pageTransmitParams[url] = params;
  },
  getPageParams() {
    let that = getApp();
    let pages = getCurrentPages();
    let currPage = null;
    if (pages.length) {
      currPage = pages[pages.length - 1];
    }
    let route = '/' + currPage.route
    const params = that.globalData.pageTransmitParams[route];
    that.globalData.pageTransmitParams[route] = undefined;

    return params;
  },
  setMsgNum(that) {
    const app = getApp();

    app.REQUEST(app.globalData.API.userMsgNum, "GET").then(res => {
      let { sendMsgUnreadNum, systemMsgUnreadNum } = res.data;
      let messageNum = Number(sendMsgUnreadNum) + Number(systemMsgUnreadNum);

      app.globalData.messageNum = messageNum;
      pageThat.getTabBar().setData({ messageNum })
    })
  },
  // 关注爱好
  addHobby(hobby) {
    const app = getApp();

    return new Promise((resolve, reject) => {
      app.REQUEST(app.globalData.API.hobbyAdd + hobby.id, "PUT", {}, false, {coerceLogin: true})
      .then(res => {
        if(res.statusCode == 200) {
          app.globalData.attentionedHobby.push(hobby);
          resolve(hobby);
        }
      })
    })
  },
  // 取消关注爱好
  reduceHobby(hobby) {
    const app = getApp();

    return new Promise((resolve, reject) => {
      app.REQUEST(app.globalData.API.hobbyReduce + hobby.id, "PUT")
      .then(res => {
        if(res.statusCode == 200) {
          let index = 0;
          app.globalData.attentionedHobby.map((item,idx) => {
            if(item.id == hobby.id) {
              index = idx;
            }
          });
          app.globalData.attentionedHobby.splice(index, 1);

          resolve(hobby);
        }
      })
    })
  },
  // 查询爱好是否已关注
  hasHobbyes(id) {
    const app = getApp();
    let hobby = false;

    app.globalData.attentionedHobby.map((item,idx) => {
      if(item.id == id) {
        hobby = item;
      }
    });

    return hobby;
  },
  // 更新关注的爱好
  setHobby() {
    const app = getApp();

    return new Promise((resolve, reject) => {
      if(this.globalData.userInfo && this.globalData.userInfo["Set-Cookie"]) {
        app.REQUEST(app.globalData.API.userHobbies, "GET")
        .then(res => {
          if(res.statusCode == 200) {
            app.globalData.attentionedHobby = res.data;
  
            resolve(app.globalData.attentionedHobby);
          }
        })
      }
      else {
        reject("未登录")
      }
    })
  },
  // 维持登陆
  maintainRequest() {
    let app = getApp();
    maintainTimeout && clearTimeout(maintainTimeout);
    
    maintainTimeout = setTimeout(() => {
      app.REQUEST(app.globalData.API.health, 'GET');
    }, maintainTime);
  }
})