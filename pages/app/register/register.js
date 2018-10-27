const Zan = require('../../../dist/index');
const getUserTelUrl = require('../../../config.js').getUserTelUrl;
const apiUrl = require('../../../config.js').apiUrl;
var app = getApp();
Page(Object.assign({}, Zan.TopTips, {
  data: {
    name: '',
    tel: '',
    school: '',
    num: '',
    // invitationCode: '', //邀请码
  },
  getUserSchool() {
    wx.navigateTo({
      url: '/pages/my/my_school',
    })
  },
  changeName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  changeTel(e) {
    this.setData({
      tel: e.detail.value
    })
  },
  // 用户验证码
  // changeInvitationCode(e) {
  //   this.setData({
  //     invitationCode: e.detail.value,
  //   })
  // },
  bindSubmit(e) {
    if (!this.data.name) {
      this.showZanTopTips('姓名不能为空');
      return
    }
    if (!this.data.tel) {
      this.showZanTopTips('手机号不能为空');
      return
    }
    if (!this.data.school) {
      this.showZanTopTips('学校不能为空');
      return
    }
    // 注册成为教师用户
    // if (!this.data.invitationCode) {
    //   this.showZanTopTips('请输入邀请码')
    //   return
    // }
    wx.showLoading({
      title: '绑定中',
    })
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.teacher.bind',
        name: this.data.name,
        tel: this.data.tel,
        school: this.data.school,
        invitation_code: 'IEEE',
        user_type: 'teacher',
      },
      method: 'POST',
      success: res => {
        console.log(res)
        wx.hideLoading()
        if (res.data.success == true) {
          wx.showToast({
            title: res.data.message,icon: 'success',
          })
          wx.setStorageSync('pingshifen_user_type', '2')
          wx.reLaunch({
            url: '/pages/index/index',
          })
        } else {
          wx.showToast({ title: res.data.message, icon: 'none', })
        }
      }
    })
  },
}));
