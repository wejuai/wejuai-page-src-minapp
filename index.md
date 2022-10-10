<!-- 页面路径 -->
### 主包
  - pages      
    - user     个人中心首页
    - message  消息列表
    - home     首页
    - pageLoad 登录页
    - cropper  图片剪裁页

### 分包 
  - essay     文章相关
    -  info    文章详情
    -  draft   草稿
    -  upData  新建、编辑文章
    -  list    文章列表

  - group     悬赏相关
    -  info    悬赏详情
    -  upData  新建、编辑悬赏
    -  list    悬赏列表
  
  - subIndex  子站相关
    -  home    子站首页

  - user      个人中心
    - userInfo  编辑/查看 登录用户/其他用户 个人信息
    - integral  我的积分
    - detail    积分明细
    - attention 关注列表
    - buyed     已购文章列表
    - collect  
    - draft     草稿箱 
    - follow    关注用户列表
    - hobby     爱好列表
    - otherInfo 他人用户中心
    - withdraw  交易明细

  - message   消息相关
    - chatRoom    用户聊天室
    - sysChatRoom 系统聊天室

### compontents
  - comments  评论框组件
  - comInfo   评论详情（子级评论）
  - cropper   图片剪裁
  - Image     图片组件，网络图片统一使用 Image 组件
  - dialog    登录组件(在 custom-tab-bar 中已进行全局配置)，请求返回 401 会自动调起登录
      - 引用：<wxc-dialog wx:if="{{!isLogin}}" class="wxc-dialog" bindcancel="onCancel" bindconfirm="onLoad"></wxc-dialog>
          isLogin：app.globalData.isLogin
          bindcancel: 点击取消登录的回调
          bindconfirm: 授权登录后的回调
      - 使用需求：再需要判断登录的页面内引用
  - scroll    触底加载组件
      - 参数：
        ```
          scrollTop：滚动位置（切换标签保存之前位置）
          scrollWithAnimation: 在设置滚动条位置时使用动画过渡
          current: 当前页
          pages: 总页数
        ```
        - 回调
          ```
            bindloadList: 加载列表的请求（首次 || 加载更多）
          ```
  - essayListItem 文章列表卡片组件
  - groupListItem 悬赏列表卡片组件
  - star       星级评价组件
  - loadItem   加载占位组件
  - screen    列表页搜索和排序筛选条组件

### custom-tab-bar
  - 自定义 tabbar

### lib
  - style
      - iconfont.wxss 阿里字体图标库
  
### utils
  - api       接口统一储存
  - config    配置信息
  - utils     全局工具

### app.js
  - isLogin   通过 wx.getStorageSync('userInfo') 判断用户是否已登录
  - userInfo  登录的用户信息
  - isIphoneX 当前登录设备是否为 iphoneX（底部适配）
  - preQuest  限制相同地址的请求间隔不得小于1秒（防止重复提交）
  - REQUEST   请求二次封装
      - ```
        getApp().REQUEST(url, method, data, wType)
        url: 请求地址
        method：请求方式['GET', 'POST', 'PUT', 'DELETE']
        data: 上传参数
        wType: 使用的服务器地址[config.url], 默认：'account'
        params: 其他需要单独处理的参数
          "x-server-name": 爱好id，访问子站内的列表时需要
        ```
  - PAY       调起微信支付，参数：后台返回的支付参数
  - LOGIN     登录，参数：回调
  - FUNCTIONAL 设备性能测试（目前全部返回高性能）
  - _setUserFunction  修改用户设备性能
      - 参数：upData(是否更新用户线上信息), val(性能值：1/2), app(getApp)
  - TOHOME      回到首页(自动判断回到home还是lowHome)
  - LOTTIE    Lottie 是 Airbnb 开发的一款能够为原生应用添加动画效果的开源工具

### app.wxss
  - 全局样式
  - 项目统一色值管理

### 备注
  - 性能检测机制
    ```
     性能值     - NEW：新用户，未进行测试； HIGH：高性能，探索模式； LOW：低性能，基础模式 
     新用户进入 - 默认为高性能，进入探索模式
     自动切换   - 探索模式下包内存警告，自动切换为基础版，并自动更新服务器用户数据中心的性能为 2 
     手动切换   - 切换探索模式，进行性能测试，通过测试切换探索模式，并自动更新服务器用户数据中心的性能为 1
                 切换基础模式，直接切换为基础模式，并自动更新服务器用户数据中心的性能为 2
    ```

  - iphoneX 样式兼容建议使用
      - padding-bottom: env(safe-area-inset-bottom); /* 兼容 iOS >= 11.2 */
      - padding-bottom: constant(safe-area-inset-bottom); /* 兼容 iOS < 11.2 */
  - 登录后回调
      - 在需要回调的页面 onLoad 事件中添加一下代码
      ```
        app.watch('refresh', this.onLoad);
      ```

  - 登录规则优化
      - 目前登录不用额外处理，检测到接口返回 code == 401 系统自动执行登录流程，登录成功后自动请求之前未完成的接口
      
### 脱敏配置
  - 项目内所有敏感配置已使用 “xxxxxx” 替代，开发者可自行搜索替换
  - `app.js` 内 
    - `tmplIdsAll`、 `wx.requestSubscribeMessage tmplIds` 需要订阅的消息模板的 id 的集合，一次调用最多可订阅3条消息（注意：iOS客户端7.0.6版本、Android客户端7.0.7版本之后的一次性订阅/长期订阅才支持多个模板消息，iOS客户端7.0.5版本、Android客户端7.0.6版本之前的一次订阅只支持一个模板消息）消息模板 id 在[微信公众平台(mp.weixin.qq.com)-功能 - 订阅消息]中配置。每个 tmplId 对应的模板标题需要不相同，否则会被过滤。
  - `package.json` 内 
    - `repository url` 为项目git地址
  - `project.config.json` 内 
    - `appid` 为项目appid
  - `utils/config.js` 内 
    - `CONFIG url` 为项目服务器接口地址
      - `accounts`  
      - `app`       
      - `socket`    websocket通信地址
      - `media`     静态资源存储地址