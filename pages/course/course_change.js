const { Tab, extend } = require('../../dist/index');
const apiUrl = require('../../config.js').apiUrl
const https = require('../../util/douban.js')

Page(extend({}, Tab, {
  data: {
    all_course: {
      list: [{
        id: 'locked',
        title: '已锁定'
      }, {
        id: 'is_using',
        title: '正在使用'
      }],
      selectedId: 'is_using'
    },
    self_count:1,
    
  },
  onLoad() {
    this.requestCourse()
  },

  requestCourse() {
    wx.showNavigationBarLoading()  
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.course.list_in_use',
      },
      method: 'POST',
      success: res => {
        if (res.data.success == true) {
          this.setData({
            courses_in_use: res.data.data
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
    https.post('', {
      method: 'pingshifen.course.list_in_lock',
    }).then(res => {
      if (res.data.success == true) {
        this.setData({ courses_in_lock: res.data.data})
      } else {
        this.setData({ courses_in_lock: []})
      }
      wx.hideLoading()
      wx.hideNavigationBarLoading()
    })
  },
  onPullDownRefresh: function () {
    this.requestCourse()
    wx.stopPullDownRefresh()
  },
  handleZanTabChange(e) {
    var selectedId = e.selectedId;
    this.setData({
      [`all_course.selectedId`]: selectedId
    });
  },
  
  // 切换课程
  course_change(e) {
    let course_id = e.currentTarget.dataset.current_course_id
    wx.setStorageSync('pingshifen_current_course_id', course_id)
    wx.reLaunch({
      url: '/pages/index/index?course_id=' + course_id,
    })  
  },

  // 出现action_sheet
  course_action(e) {
    let course_id = e.currentTarget.dataset.current_course_id
    wx.showActionSheet({
      itemList: ['选该课程未当前课程','课程详情'],
      success: res => {
        if (res.tapIndex == 0) {
          wx.setStorageSync('pingshifen_current_course_id', course_id)
          wx.reLaunch({
            url: '/pages/index/index',
          })
        } else if (res.tapIndex == 1) {
          wx.navigateTo({
            url: '/pages/course/course_create?course_id=' + course_id
          })
        }
      },
    })

  },

  // 加入课程
  bindCourseAdd() {
    wx.navigateTo({
      url: '/pages/course/course_add',
    })
  }
}));