var push = require('/util/pushsdk.js');  //小程序 小神推插件
const loginUrl = require('./config').loginUrl
const check3RdUrl = require('./config').check3RdUrl
const setSessionUrl = require('./config').setSessionUrl
const wxPromisify = require('./util/util.js').wxPromisify
const codeUrl = require('./config').loginUrl
//aaaaa
App({
  onLaunch: function () {
    let userInfo;
    wx.clearStorageSync()
    this.Check = this.login_wx()
    console.log(this.Check)
  },
  Check: null,
  Login: null,

  // 获取用户信息无需登陆状态
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  // 微信登陆
  login_wx: function () {
    let that = this;
    var promise = new Promise(function (resolve, reject) {
      wx.login({
        success: function (res) {
          if (res.code) {
            that._sendCode(res.code);
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
          resolve(res.code)
        },
        fail: function (res) {
          console.log('login fail: ' + res.errMsg);
        }
      })
    })
    return promise
  },
  _sendCode: function (code) {

    let that = this;
    var obj = this;
    let addTime = Date.now();
    this.sendRequest({
      hideLoading: true,
      url: '/index.php/Api/Weixin/code_to_openid',
      data: {
        code: code,
        from:'teacher'
      },
      success: function (res) {
        if (res.status == 0) {

        }
        that.setSessionKey(res.data);
        // 2表示没有注册
        if (res.is_register == 0) {
          wx.showModal({
            title: '提示',
            content: '使用“豆豆云助教”先完成绑定',
            showCancel: false,
            confirmText: "确定",
            success: function (res) {
              wx.navigateTo({
                url: '/pages/app/register/userlogin',
              })
            }
          })
        } else {
          wx.setStorageSync('pingshifen_user_type', res.is_register)
          wx.setStorageSync('userInfo', res.user_info)
          obj.globalData.hasLogin = true
          obj.globalData.userInfo = res.user_info
          obj.globalData.userType = res.user_info.type
        }
      },
      fail: function (res) {
        console.log('_sendCode fail');
      }
    })
  },

  sendRequest: function (param, customSiteUrl) {
    let that = this;
    let data = param.data || {};
    let header = param.header;
    let requestUrl;
    if (param.method) {
      if (param.method.toLowerCase() == 'post') {
        data = this._modifyPostParam(data);
        header = header || {
          'content-type': 'application/x-www-form-urlencoded;',
        }
      }
      param.method = param.method.toUpperCase();
    }

    if (!param.hideLoading) {
      this.showToast({
        title: '请求中...',
        icon: 'loading'
      });
    }
    if (customSiteUrl) {
      requestUrl = customSiteUrl + param.url;
    } else {
      requestUrl = this.globalData.siteBaseUrl + param.url;
    }
    wx.request({
      url: requestUrl,
      data: data,
      method: param.method || 'GET',
      header: header || {
        'content-type': 'application/json',
      },

      success: function (res) {
        if (res.statusCode && res.statusCode != 200) {
          that.showModal({
            content: '' + res.errMsg
          });
          typeof param.successStatusAbnormal == 'function' && param.successStatusAbnormal(res.data);
          return;
        }
        if (res.data.status) {
          if (res.data.status == 2 || res.data.status == 401) {
            that.goLogin({
              success: function () {
                that.sendRequest(param, customSiteUrl);
              },
              fail: function () {
                typeof param.successStatusAbnormal == 'function' && param.successStatusAbnormal(res.data);
              }
            });
            return;
          }
          if (res.data.status != 0) {

            that.showModal({
              content: '' + res.data.data,
              confirm: function () {
                typeof param.successShowModalConfirm == 'function' && param.successShowModalConfirm(res.data);
              }
            });
            typeof param.successStatusAbnormal == 'function' && param.successStatusAbnormal(res.data);
            return;
          }
        }
        typeof param.success == 'function' && param.success(res.data);
      },
      fail: function (res) {
        switch (res.errMsg) {
          case 'request:fail url not in domain list': res.errMsg = '请配置正确的请求域名'; break;
          default: break;
        }
        that.showModal({
          content: '请求失败 ' + res.errMsg
        })
        typeof param.fail == 'function' && param.fail(res.data);
      },
      complete: function (res) {
        typeof param.complete == 'function' && param.complete(res.data);
      }
    });
  },
  setSessionKey: function (session_key) {
    this.globalData.sessionKey = session_key;

    this.setStorage({
      key: 'pingshifen_PHPSESSID',
      data: session_key
    })

    wx.setStorageSync('pingshifen_PHPSESSID', session_key)
  },
  setStorage: function (options) {
    options = options || {};
    wx.setStorage({
      key: options.key || '',
      data: options.data || '',
      success: function () {
        typeof options.success === 'function' && options.success();
      },
      fail: function () {
        typeof options.fail === 'function' && options.fail();
      },
      complete: function () {
        typeof options.complete === 'function' && options.complete();
      }
    })
  },
  showModal: function (param) {
    wx.showModal({
      title: param.title || '提示',
      content: param.content,
      showCancel: param.showCancel || false,
      cancelText: param.cancelText || '取消',
      cancelColor: param.cancelColor || '#000000',
      confirmText: param.confirmText || '确定',
      confirmColor: param.confirmColor || '#3CC51F',
      success: function (res) {
        if (res.confirm) {
          typeof param.confirm == 'function' && param.confirm(res);
        } else {
          typeof param.cancel == 'function' && param.cancel(res);
        }
      },
      fail: function (res) {
        typeof param.fail == 'function' && param.fail(res);
      },
      complete: function (res) {
        typeof param.complete == 'function' && param.complete(res);
      }
    })
  },

  _sendUserInfo: function (userInfo) {
    let that = this;
    this.sendRequest({
      hideLoading: true,
      url: '/index.php/Api/Weixin/login',
      method: 'post',
      data: {
        nickname: userInfo['nickName'],
        gender: userInfo['gender'],
        city: userInfo['city'],
        province: userInfo['province'],
        country: userInfo['country'],
        avatarUrl: userInfo['avatarUrl']
      },
      success: function (res) {
        that.setUserInfoStorage(res.data.user_info);
        that.setIsLogin(true);
      },
      fail: function (res) {
      }
    })
  },
  _modifyPostParam: function (obj) {
    let query = '';
    let name, value, fullSubName, subName, subValue, innerObj, i;

    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this._modifyPostParam(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this._modifyPostParam(innerObj) + '&';
        }
      } else if (value !== undefined && value !== null) {
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }
    return query.length ? query.substr(0, query.length - 1) : query;
  },
  setUserInfoStorage: function (info) {
    for (let key in info) {
      this.globalData.userInfo[key] = info[key];
    }
    this.setStorage({
      key: 'userInfo',
      data: this.globalData.userInfo
    })
  },

  globalData: {
    hasLogin: false, // 是否登陆
    userInfo: null,
    userType: '',
    appId: 'mPxWOXi4p4',
    tabBarPagePathArr: '["/pages/o9j42s2GS3_page10000/o9j42s2GS3_page10000","/pages/o9j42s2GS3_page10006/o9j42s2GS3_page10006","/pages/o9j42s2GS3_page10004/o9j42s2GS3_page10004"]',
    homepageRouter: 'o9j42s2GS3_page10000',
    formData: null,
    userInfo: {},
    systemInfo: null,
    sessionKey: '',
    notBindXcxAppId: false,
    waimaiTotalNum: 0,
    waimaiTotalPrice: 0,
    takeoutLocate: {},
    takeoutRefresh: false,
    isLogin: false,
    locationInfo: {
      latitude: '',
      longitude: '',
      address: ''
    },
    getDistributionInfo: '',
    getDistributorInfo: '',
    PromotionUserToken: '',
    previewGoodsOrderGoodsInfo: [],
    goodsAdditionalInfo: {},
    urlLocationId: '',
    turnToPageFlag: false,
    wxParseOldPattern: '_listVesselRichText_',
    cdnUrl: 'http://cdn.jisuapp.cn',
    defaultPhoto: 'http://cdn.jisuapp.cn/zhichi_frontend/static/webapp/images/default_photo.png',
    // siteBaseUrl: 'https://xcx.zhichiweiye.com',
    // siteBaseUrl: 'http://127.0.0.1/pingshifen',
    // siteBaseUrl: 'http://192.168.1.214/appoint',

    siteBaseUrl: 'https://pingshif.applinzi.com',

    appTitle: '国教预约',
    appDescription: '国教系统预约平台',
    appLogo: 'http://img.zhichiwangluo.com/zcimgdir/album/file_5ac5774ba3fc4.jpg'
  }
})