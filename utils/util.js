const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const random = (min, max) => {
  return parseInt(Math.random()*(max-min+1)+min,10);
}

const numInt = (str) => {
  console.log(str, parseInt(str))
  return parseInt(str)
}

/**
 * 获取数据真实类型
 * @param {*} type 
 * @return {String} 数据真实类型
 */
const objType = type =>(/^\[object\s(.*)\]$/.exec(Object.prototype.toString.call(type)))[1];

/**
 * 为对象添加默认值
 * @param {Object} defaultObj 默认 { key: [ ['需要使用默认值的检测关键字', ...], defaultValue ] }
 * @param {Object} obj 需要设置默认值的对象
 */
const setObejctDefault = (defaultObj, obj) => {
  Object.keys(defaultObj).forEach(key => {
    if(obj[key] === null || obj[key] === undefined) {
      if(objType(defaultObj[key][0]) === 'Array' && defaultObj[key][0].length > 1) {
        defaultObj[key][0].map(k => {
          if(obj[key] === k) {
            obj[key] = defaultObj[key][1];
          }
        })
      }
      else {
        obj[key] = defaultObj[key][1];
      }
    }
  })
  return obj;
}

/**
 * 从对象数组中返回匹配的对象
 * @param {Array} arr 需要匹配的数组
 * @param {Object} find 匹配规则
 */
const findObj = (arr, find) => {
  let obj = {};
  arr.map(item => {
    Object.keys(find).forEach(key => {
      if(item[key] == find[key]) {
        obj = item;
      }
    })
  });
  return obj;
}
const findObjIdx = (arr, find) => {
  let idx = -1;
  
  arr.every((item, i) => {
    let is = true;
    idx = i;
    Object.keys(find).forEach(key => {
      if(item[key] != find[key]) {
        is = false
        idx = -1;
      }
    })
    console.log(is, item, find)
    // if(is) {
      return !is;
    // }
  });
  return idx;
}

/**
 * 毫秒转字符串
 * @param {Number} t 毫秒
 * @param {Number} i 返回类型
 * @param {String} s 间隔符
 */
const dateToStr = (t, i, s) => {
  if (!t || t == '' || t < 10000) {
    return '暂无'
  }

  if (objType(t) == 'String'){
    if(t.indexOf('年') > -1) {
      t = t.replace(/(\d{4}).(\d{1,2}).(\d{1,2}).+/mg, '$1/$2/$3');
    }
    else if(t.indexOf('-') > -1) {
      var reg = getRegExp("-", "g");
      t = t.replace(reg, '/');
    }
  }

  var time = new Date(t);
  var year = time.getFullYear();
  var month = time.getMonth() + 1;
  var date = time.getDate();
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var seconds = time.getSeconds();

  year = year < 0 || isNaN(year) ? 0 : year;
  month = month < 0 || isNaN(month) ? 0 : month;
  date = date < 0 || isNaN(date) ? 0 : date;
  hours = hours < 0 || isNaN(hours) ? 0 : hours;
  minutes = minutes < 0 || isNaN(minutes) ? 0 : minutes;
  seconds = seconds < 0 || isNaN(seconds) ? 0 : seconds;

  year = year < 10 ? '0' + year : year;
  month = month < 10 ? '0' + month : month;
  date = date < 10 ? '0' + date : date;
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  
  var ss = s ? [s, s] : ['年', '月', '日'];

  if (!i) {
    return (
      year + ss[0] +
      month + ss[1] +
      date + " " +
      hours + ":" +
      minutes
    )
  } 
  else if (i == 1) {
    return (
      year + ss[0] +
      month + ss[1] +
      date
    )
  }
  else if (i == 2) {
    return (
      year + ss[0] +
      month + ss[1] +
      date + " " +
      hours + ":" +
      minutes + ":" +
      seconds
    )
  }
  else if (i == 3) {
    return (
      year + ss[0] +
      month + ss[1] +
      date + " " +
      hours + ":" +
      minutes
    )
  }
};

/**
 * 返回上一页
 * @param {Object} data 返回上一页设置的 data
 * @param {Boolean} resfer 返回上一页是否调用 resfer
 * @param {Boolean} callBack 返回上一页是否调用 callBack
 * @param {Boolean} num 返回页面数量
 * @param {Boolean} notBack 是否不返回
 */
const toBack = (data, resfer, callBack, num, notBack) => {
  num = num || 2;
  let pages = getCurrentPages();
  let prevPage = pages[pages.length - num];        

  (data && !callBack) && prevPage.setData(data);
  (resfer && prevPage.resfer) && prevPage.resfer();
  (callBack && prevPage.callBack) && prevPage.callBack(data);

  if(!notBack) {
    wx.navigateBack({
      delta: num - 1
    })
  }
};

/**
 * 动画 - 淡出淡入
 * @param {this} that data对象
 * @param {Object} keys setData的key集合，{ show: 控制页面显示隐藏的key，animation：动画key }
 * @param {Boolean} show 淡出/淡入
 * @param {Number} duration 执行时间 ms
 */
const an_opacity_out_in = (that, keys, show, duration = 300, opacity = 1) => {
  opacity = show ? opacity : 0;
  var animation = wx.createAnimation({
    duration, timingFunction: 'ease'
  });

  animation.opacity(opacity).step();

  var json = {};
  json[keys.animation] = animation.export();

  if(show) {
    let showJson = {};
    showJson[keys.show] = true;

    that.setData(showJson, () => {
      that.setData(json);
    })
  } else {
    that.setData(json, () => {
      setTimeout(() => {
        let showJson = {};
        showJson[keys.show] = false
        that.setData(showJson)
      }, duration)
    });
  }
};

/**
 * 动画 - 底部滑入\滑出
 * @param {this} that data对象
 * @param {Object} keys setData的key集合，{ show: 控制页面显示隐藏的key，animation：动画key }
 * @param {Boolean} show 淡出/淡入
 * @param {Number} duration 执行时间 ms
 */
const an_translateY_out_in = (that, keys, show, duration = 300) => {
  var y = show ? 0 : '100%';
  var animation = wx.createAnimation({
    duration, timingFunction: 'ease'
  });

  animation.translateY(y).step();

  var json = {};
  json[keys.animation] = animation.export();

  if(show) {
    let showJson = {};
    showJson[keys.show] = true;

    that.setData(showJson, () => {
      that.setData(json);
    })
  } else {
    that.setData(json, () => {
      setTimeout(() => {
        let showJson = {};
        showJson[keys.show] = false
        that.setData(showJson)
      }, duration)
    });
  }
};
/**
 * 动画 - 底部左/右侧滑入/滑出
 * @param {this} that data对象
 * @param {Object} keys setData的key集合，{ show: 控制页面显示隐藏的key，animation：动画key }
 * @param {Boolean} show 淡出/淡入
 * @param {Number} duration 执行时间 ms
 */
const an_translateX_out_in = (that, keys, show, duration = 300) => {
  var x = show ? 0 : '100%';
  var animation = wx.createAnimation({
    duration, timingFunction: 'ease'
  });

  animation.translateX(x).step();

  var json = {};
  json[keys.animation] = animation.export();

  if(show) {
    let showJson = {};
    showJson[keys.show] = true;

    that.setData(showJson, () => {
      that.setData(json);
    })
  } else {
    that.setData(json, () => {
      setTimeout(() => {
        let showJson = {};
        showJson[keys.show] = false
        that.setData(showJson)
      }, duration)
    });
  }
};


/**
 * 动画 - 折叠/展开
 * @param {this} that data对象
 * @param {Object} keys setData的key集合，{ show: 控制页面显示隐藏的key，animation：动画key }
 * @param {Boolean} height 折叠/展开
 * @param {Number} duration 执行时间 ms
 */
const an_height_open_fold = (that, keys, height, duration = 300) => {
  var animation = wx.createAnimation({
    duration, timingFunction: 'ease'
  });

  animation.height(height).step();

  var json = {};
  json[keys.animation] = animation.export();

  that.setData(json);
};

/**
 * 设置数字缩略
 * @param {Number} n 数字
 * @param {Number} max 数字最大限制
 * @param {String} s 超出最大限制的占位符
 */
const number_max = (n = 0, max = 999, s = '+') => {
  if(typeof n == 'String') {
    n = parseInt(n);
  }
  if(n > max) {
    n = max + s
  }

  return n;
}

/**
 * 获取触发事件节点的自定义属性
 * @param {NodeObject} e 节点对象
 * @param {String} key 自定义属性key
 */
const getNodeSetData = (e, key) => {
  if(e) {
    if(!key) {
      return
    }
    
    if(
      e.currentTarget !== undefined &&
      e.currentTarget.dataset[key] !== undefined
    ) {
      return e.currentTarget.dataset[key];
    }
    if(
      e.target !== undefined &&
      e.target.dataset[key] !== undefined
    ) {
      return e.target.dataset[key];
    }
    return console.error('获取自定义 '+ key +' 失败');
  }
  console.error('获取自定义属性失败，传入元素节点 = ' + e);
}

/**
 * 针对单一系统执行的方法
 * @param {String} platform   系统类型：'ios'、'android'、'pc'
 * @param {Function} callBack 与输入的系统类型匹配时需要执行的方法
 * @param {Function} elseCallBack 与输入的系统类型不匹配需要执行的方法
 */
const systemFunction = (platform, callBack, elseCallBack) => {
  var app = getApp();
  
  if(
    app.globalData.system == platform
    // || app.globalData.system == 'pc'
  ) {
    callBack && callBack();
  } else {
    elseCallBack && elseCallBack();
  }
}

/**
 * 星域单位转换
 * @param {Number} fromKey 被转化的单位下标 ['coord', 'km', 'px', 'rpx']
 * @param {Number} toKey 转化到的单位下标
 * @param {Number} num 转化数据
 */
const unitConversion = (fromKey = 0, toKey = 1, num)  => {
  var app = getApp();
  var rate = app.globalData.universe.rate;
  var coordToKm = app.globalData.universe.coordToKm;
  var rule1 = [
    n => { return n * coordToKm },
    n => { return n },
    n => { return n / rate },
    n => { return n / 2 / rate },
  ]
  var rule2 = [
    n => { return n / coordToKm },
    n => { return n },
    n => { return n * rate },
    n => { return n * 2 * rate }
  ]
  
  return rule2[toKey](rule1[fromKey](num))
}

/**
 * 把A对象多个属性复制生成一个新对象B
 * @param {*} obj A对象
 * @param {*} arr 需要复制的属性
 * @return B对象
 */
const pick = (obj, arr) => {
  return arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {});
}

/**
 * 日期转化格式
 * @param t 日期
 * @param i 返回类型
 * @param s 间隔符
 */
const msgTimeSwitch = (t, i, s) => {
  if (!t || t == '' || t < 10000) {
    return '暂无'
  }

  if (t.constructor == 'String'){
    var reg = getRegExp("-", "g");
    t = t.replace(reg, '/');
  }

  var nowTime = new Date();
  var nowYear = nowTime.getFullYear();
  var nowMonth = nowTime.getMonth() + 1;
  var nowDate = nowTime.getDate();

  var time = new Date(t);
  var year = time.getFullYear();
  var month = time.getMonth() + 1;
  var date = time.getDate();
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var seconds = time.getSeconds();

  year = year < 0 || isNaN(year) ? 0 : year;
  month = month < 0 || isNaN(month) ? 0 : month;
  date = date < 0 || isNaN(date) ? 0 : date;
  hours = hours < 0 || isNaN(hours) ? 0 : hours;
  minutes = minutes < 0 || isNaN(minutes) ? 0 : minutes;
  seconds = seconds < 0 || isNaN(seconds) ? 0 : seconds;

  year = year < 10 ? '0' + year : year;
  month = month < 10 ? '0' + month : month;
  date = date < 10 ? '0' + date : date;
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  
  var ss = s ? [s, s] : ['年', '月', '日'];

  if (!i) {
    return (
      year + ss[0] +
      month + ss[1] +
      date + " " +
      hours + ":" +
      minutes
    )
  } 
  else if (i == 1) {
    return (
      year + ss[0] +
      month + ss[1] +
      date
    )
  }
  else if (i == 2) {
    return (
      year + ss[0] +
      month + ss[1] +
      date + " " +
      hours + ":" +
      minutes + ":" +
      seconds
    )
  }
  else if (i == 3) {
    return (
      year + ss[0] +
      month + ss[1] +
      date + " " +
      hours + ":" +
      minutes
    )
  }
  else if (i == 4) {
    return (
      month + ss[1] +
      date
    )
  }
  else if (i == 5) {
    if(year + month + date == nowYear + nowMonth + nowDate) {
      return (
        hours + ":" +
        minutes
      )
    }
    else {
      return (
        year + ss[0] +
        month + ss[1] +
        date + " " +
        hours + ":" +
        minutes
      )
    }
  }
}

/**
 * 提示
 * @param {String} msg 提示文本
 */
const toast = (msg, ms = 2000) => {
  wx.showToast({ title: msg, icon: 'none', duration: ms })
}

/**
 * options转为 path参数
 * @param {Object} options参数
 */
const objToPath = obj => {
  if(Object.prototype.toString.call(obj) == '[object Object]') {
    let s = '';
    let i = 0;
    Object.keys(obj).map(k => {
      let p = i > 0 ? '&' : '';
      s += `${p}${k}=${obj[k]}`;
      i ++;
    })
    return s;
  }
}

const setLocation = loca => {
  wx.setStorage({
    data: loca,
    key: 'location',
  })
}

const getLocation = () => {
  return wx.getStorageSync("location")
}

/**
 * 数字缩进
 * @param num 
 */
const numAbb = function(n) {
  if(isNaN(n)) {
    return 0;
  }
	if(n < 1000) {
		return n;
	}
	else if(n >= 10000000) {
		return (n / 10000000).toFixed(2) + 'kw';
	}
	else if(n >= 1000000) {
		return (n / 1000000).toFixed(2) + 'bw';
	}
	else if(n >= 10000) {
		return (n / 10000).toFixed(2) + 'w';
	}
	else if(n >= 1000) {
		return (n / 1000).toFixed(2) + 'k';
	}
}

module.exports = {
  formatTime, random, numInt, setObejctDefault, objType, findObj, dateToStr, pick, findObjIdx, objToPath, numAbb,
  toBack, number_max, getNodeSetData, unitConversion,
  an_opacity_out_in, an_translateY_out_in, an_translateX_out_in, an_height_open_fold,
  systemFunction, msgTimeSwitch, toast, setLocation, getLocation
}
