const https = require('../../../util/douban.js')
Page({
  data: {
    question_set_lists: [],
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    // todo 去数据库拉去题库列表
    https.post('', {
      method: 'pingshifen.course.list_sets',
      course_id: wx.getStorageSync('pingshifen_current_course_id')
    }).then(res => {
      if (res.data.success == false) {
        wx.showToast({ title: res.data.message, icon: 'none' })
      } else {
        this.setData({ question_set_lists: res.data.data })
      }
    })

  },
  onShow() {
    wx.hideLoading()
  },
  // 选择题库
  choose_set(e) {
    let set_id = e.currentTarget.dataset.question_set_id
    wx.showModal({
      title: '确认',
      content: '你确认选择该题库作为课程题库？',
      success: res => {
        https.post('', {
          method: 'pingshifen.course.set_question_set',
          course_id: wx.getStorageSync('pingshifen_current_course_id'),
          set_id:set_id
        }).then(res => {
          if (res.data.success == false) {
            wx.showToast({ title: res.data.message, icon: 'none' })
          } else {
            wx.showToast({ title: '添加成功'})
          }
        })
      }
    })
  }
})