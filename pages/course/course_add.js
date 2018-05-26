const app = getApp()
const apiUrl = require('../../config.js').apiUrl
Page({
  data: {
    course_id:'',
    show_course: false,
    course: {},
    is_lock: false,
  },
  onLoad(options) {
    if(options.course_id) {
      this.search(options.course_id)
    }
  },
  // 当组件输入数字6位数时的自定义函数
  valueSix(e) {
    // 要么 检索不存在，要么该课程已经锁定，不能加入
    this.search(e.detail.current_value) 
  },

  // 检索课程
  search(course_id) {
    if(!course_id) {
      return 
    }
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.course.search',
        course_id: course_id,
      },
      method: 'POST',
      success: res => {
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
          })
        } else {
          this.setData({
            show_course: true,
            course: res.data.data,
            course_id: course_id
          })
        }
      }
    })
  },
  // 重新检索
  research() {
    this.setData({
      show_course: false,
      course: {},
      course_id: '',
    })
  },

  // 加入课程
  course_add() {
    let course_id = this.data.course_id
    this.course_add_logic(course_id)
  },

  // 加入140533课程
  course_add_140533() {
    this.course_add_logic(140533)
  },
  course_add_140529() {
    this.course_add_logic(140529)
  },
  course_add_logic(course_id) {
    if (this.data.is_lock == true) {
      return
    }
    wx.showLoading({
      title: '加入课程...',
    })
    this.setData({ is_lock: true })
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.course.add',
        course_id: course_id,
      },
      method: 'POST',
      success: res => {
        console.log(res)
        wx.hideLoading()
        this.setData({
          is_lock: false
        })
        if (res.data.success == true) {
          wx.showToast({
            title: '课程添加成功',
            icon: 'success',
            duration: 3000
          })
          wx.setStorageSync('pingshifen_current_course_id', res.data.data)
          setTimeout(function () {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
          })
        }
      }
    })
  }
})
