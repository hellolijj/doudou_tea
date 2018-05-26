// pages/my/my_name.js
Page({
  submit: function(e) {
    console.log(e);
    wx.navigateBack();
  },
  getUserInfo: function(e) {
    wx.getUserInfo({
      withCredentials: true,
      lang: '',
      success: function(res) {
        console.log(res);
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  getPhoneNumber: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  } 
})