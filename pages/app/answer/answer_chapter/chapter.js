const https = require('../../../../util/douban.js');

if(!Object.assign) {
  Object.assign = require('../../../../util/object-assign.js')
}

//获取应用实例
var app = getApp();
Page({
  data: {
    column:[{
      class:'num',
      option:[
      ]
    }],
  },
  onLoad (params) {
    wx.showLoading({
      title: '加载中',
    })
    this.data.subject = params.subject;
    this.data.type = params.type;
    var that = this;
  

    https.chapter('1.0?method=pingshifen.question.chapter&course_id=' + wx.getStorageSync('pingshifen_current_course_id'),{subject:params.subject,type:params.type}).then((data) =>{
      if(data.data.status == 1){
        that.data.subject = params.subject;
        that.data.column[0].option = data.data.data;
        that.setData(that.data);
      } else {
        wx.showModal({
          tip: '提示',
          content: data.data.data,
          showCancel: false,
          confirmText: '知道了',
          success: function (res) {
            wx.navigateBack()
          }
        })
      }
    })
     this.setData(this.data);   
  },
  onShow() {
    wx.hideLoading()
  },
  onUnload(){//页面卸载

  }
});