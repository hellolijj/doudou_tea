const https = require('../../../../util/douban.js');

if (!Object.assign) {
  Object.assign = require('../../../../util/object-assign.js')
}

//获取应用实例
var app = getApp();
Page({
  data: {
    isLoading:false,
    subject:'kemu1',
    column:[{},{},{class:'num'}]
  },
  onLoad (params) {
    this.data.subject = params.subject;
    this.data.type = params.type;
    var that = this;
    https.classify('1.0?method=pingshifen.question.special&course_id=' + wx.getStorageSync('pingshifen_current_course_id')).then((data) =>{
      if(data.data.status == 1){
        data = data.data.data;
        this.data.column[0].option = data[0];
        this.data.column[1].option = data[1];
        this.data.column[2].option = data[2];
        this.data.isLoading = true;
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
  onUnload(){//页面卸载

  }
});