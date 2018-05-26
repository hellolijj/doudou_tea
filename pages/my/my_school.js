const apiUrl = require('../../config.js').apiUrl;
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    schools:[
    ]
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    console.log(e)
    this.setData({
      inputVal: e.detail.value
    });
    wx.request({
      url: apiUrl,
      header: {'Cookie':'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')},
      data:{
        method:'pingshifen.school.search',
        s_name: e.detail.value,
      },
      success: res => {
        this.setData({
          schools: res.data.data
        });
      }
    })
  },
  search: function () {

  },
  tapSelect: function(e) {
    let selectedSchool = e.currentTarget.dataset.currentSchool;
    if (selectedSchool) {
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];   //当前页面
      var prevPage = pages[pages.length - 2];  //上一个页面
      prevPage.setData({
        school: selectedSchool
      })
      wx.navigateBack()
    }
  }
});