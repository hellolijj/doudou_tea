const app = getApp()
const apiUrl = require('../../config.js').apiUrl
Page({
  data: {
    userInfo:{},
    sex_array: ['保密', '男', '女'],
  },
  onLoad() {
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.my.info'
      },
      success: res => {
        console.log(res)
        if (res.data.success == true) {
          if(res.data.data.user_type == 0) {
            wx.navigateTo({
              url: '/pages/app/register/register',
            })
          }
          this.setData({
            'userInfo':res.data.data,
            'user_type': res.data.data.user_type,
          })
        } else {
          wx.showToast({
            title: res.data.message,
          })
        }
      }
    })
    console.log(this.data)
  },
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      sourceType: ['camera', 'album'],
      sizeType: ['compressed', 'original'],
      count: 1,
      success: function (res) {
        console.log(res)
        that.setData({
          [`userInfo.head_img`]: res.tempFilePaths[0]
        })
      }
    })
  },
  bindTapName() {
    wx.showToast({
      title: '姓名不能修改',
      icon:'none'
    })
  },
  bindTapTel() {
    wx.showToast({
      title: '手机号不能修改',
      icon: 'none'
    })
  },
  bindTapSex() {
    // todo 修改性别
  },
  bindTapSchool() {
    wx.showToast({
      title: '学校暂不支持修改',
      icon: 'none'
    })
  },
  bindTapUserType() {
    wx.showToast({
      title: '用户类型暂不支持修改',
      icon: 'none'
    })
  },
  bindTapEnterYear() {
    wx.showToast({
      title: '入学年份暂不支持修改',
      icon: 'none'
    })
  },
  bindTapNumber() {
    wx.showToast({
      title: '学号暂不支持修改',
      icon: 'none'
    })
  }
})