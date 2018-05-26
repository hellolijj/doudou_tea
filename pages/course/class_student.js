const apiUrl = require('../../config.js').apiUrl
const https =  require('../../util/douban.js')
Page({
  data: {
    student_list:null,
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    wx.showNavigationBarLoading()
    if(options.course_id) {
      // todo 去数据库拉去学生列表
      https.post(apiUrl, {
        method:'pingshifen.course.list_student',
        course_id: options.course_id
      }).then(res => {
        if(res.data.success == false) {
          wx.showToast({title: res.data.message,icon: 'none'})
        } else {
          this.setData({student_list:res.data.data})
        }
        wx.hideLoading()
        wx.hideNavigationBarLoading()
      })
    }
  },
  
  onPullDownRefresh: function () {
  
  },
})