var push = require('/util/pushsdk.js');  //小程序 小神推插件
const loginUrl = require('./config').loginUrl
const check3RdUrl = require('./config').check3RdUrl
const setSessionUrl = require('./config').setSessionUrl
const wxPromisify = require('./util/util.js').wxPromisify
App({
  onLaunch: function () {
    this.checkaotu();
    // 检查登陆
    this.Check = this.autologin()
  },
  Check: null,
  Login: null,
  autologin() {
    var obj = this;
    var rd3_session = wx.getStorageSync('pingshifen_3rd_session');
    var promise = new Promise(function (resolve, reject) {
      wx.request({
        url: check3RdUrl,
        header: {
          'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
        },
        data: {
          rd3_session: rd3_session
        },
        success: function (res) {
          //检验服务端用户是否过期
          if (res.data.success == true) {
            if (res.data.data) {
              console.log(res)
              obj.globalData.hasLogin = true
              obj.globalData.userInfo = res.data.data
              obj.globalData.userType = res.data.data.type
              wx.setStorageSync('pingshifen_user_type', res.data.data.type)
            } else {
              obj.getUserInfo()
            }
          } else {
            obj.Login = obj.login_wx()
          }
          resolve('1234567890')
        },
      })
    })
    return promise
  },
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
    var obj = this;
    var promist = new Promise(function (resolve, reject) {
      wx.login({
        success: function (res) {
          var code = res['code'];
          wx.getUserInfo({
            success: function (info) {
              var rawData = info['rawData'];
              var signature = info['signature'];
              var encryptedData = info['encryptedData'];
              var iv = info['iv'];
              wx.request({
                url: loginUrl,
                data: {
                  "code": code,
                  "rawData": rawData,
                  "signature": signature,
                  'iv': iv,
                  'encryptedData': encryptedData,
                  'from':'teacher',
                },
                success: function (res) {
                  if (res.statusCode != 200) {
                    wx.showModal({
                      title: '登录失败'
                    });
                  }
                  if (res.data.success == true) {
                    obj.globalData.hasLogin = true;
                    obj.globalData.userInfo = res.data.data;
                    wx.setStorageSync('pingshifen_user_type', res.data.data.type)
                    wx.setStorageSync('pingshifen_3rd_session', res.data.data.session3rd)
                    wx.setStorageSync('pingshifen_PHPSESSID', res.data.data.session_id);
                  } else {
                    wx.showToast({
                      title: '登陆失败' + res.data.message,
                      icon: 'none'
                    })
                  }
                  typeof func == "function" && func(res.data);
                  resolve('1234567890')
                }
              });
            }
          });
        }
      })
      
    })
    return promist
  },

  // 判断是否同意授权过
  checkaotu() {
    var obj = this;
    //获取用户授权设置
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          // this.getUserInfo();
        } else {
          //没有配置授权，调起授权
          wx.authorize({
            scope: 'scope.userInfo',
            success: res => {
              // this.getUserInfo();
            },
            fail: res => {
              wx.showModal({
                title: '权限失败',
                content: '你取消了获取用户信息授权',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        // obj.getUserInfo();
                      }
                    });
                  } else if (res.cancel) {
                    obj.checkaotu();
                  }
                }
              });
            },
          })
        }
      }
    })
  },
  globalData: {
    hasLogin: false, // 是否登陆
    userInfo: null,
    userType: '',
  }
})