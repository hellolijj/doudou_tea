const app = getApp()
const apiUrl = require('../../config.js').apiUrl
const https = require('../../util/douban.js');
Page({
  data: {
    head_img: '/images/default_head_circle.png',
    is_bind: '',
    user_type: 0,
  },
  onLoad: function (options) {
    let user_type = wx.getStorageSync('pingshifen_user_type')
    this.setData({user_type: user_type})
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      type: 'POST',
      data: {
        method: 'pingshifen.my.index'
      },
      success: res => {
        console.log(res)
        if (res.data.success == true) {
          this.setData({
            'head_img': res.data.data.avatar,
            'is_bind': res.data.data.is_bind,
          })
        } else {
          this.setData({
            'head_img': app.globalData.userInfo.avatar
          })
          wx.showToast({title: res.data.message,icon: 'none'})
        }
      }
    })
  },
  onShareAppMessage: function (res) {
    let school = app.globalData.userInfo.school
    let name = app.globalData.userInfo.name
    let user_type = app.globalData.userType
    let path = ''
    let invitation_code = ''
    if (!user_type || user_type == '0') {
      // todo 阻止未注册用户分享
      wx.showToast({ title: '未注册用户不能邀请', icon: 'none' })
      school = ''
      name = app.globalData.userInfo.nickname
    }
    if (user_type == 2) {
      https.post(apiUrl, {
        method: 'pingshifen.my.invite'
      }).then(res => {
        if (res.data.success == false) {
          wx.showToast({ title: res.data.message, icon: 'none' })
          return
        } else {
          if (invitor == 'teacher') {
            invitation_code = res.data.data.invitation_code
          }
        }
      })
      path = '/pages/index/index?invitor=teacher&code=' + invitation_code
    }
    if (user_type == 1) {
      path = '/pages/index/index?invitor=student'
    }
    return {
      title: school + name + '邀请你使用豆豆云助教小程序',
      path: path,
      imageUrl:'http://pingshif-img.stor.sinaapp.com/2018-02-21/share_use.jpg',
      success: function (res) {
      },
      fail: function (res) {
      }
    }
  },
  onShow: function () {

  },
  bindMyInfo() {
    let url = ''
    console.log(this)
    if (!this.data.is_bind) {
      url = '/pages/app/register/register'
    } else {
      url = '/pages/my/my_info'
    }
    wx.navigateTo({
      url: url,
    })
  }
})