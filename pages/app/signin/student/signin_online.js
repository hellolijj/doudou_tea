const {
  Tab,
  Switch,
  extend
} = require('../../../../dist/index');
const apiUrl = require('../../../../config.js').apiUrl
const https = require('../../../../util/douban.js')
const formatTime = require('../../../../util/util.js').formatTime
Page(extend({}, Tab, Switch, {
  data: {
    signin: {
      list: [{
        id: 'signined',
        title: '已签到（0人）'
      }, {
        id: 'un_signin',
        title: '未签到（0人）',
      }],
      selectedId: 'signined',
      scroll: false,
      height: 45
    },
    current_show: 'signin_record',
    course_id: 0,
    signin_id: 0,
    user_type: 0,
    signin_management: {

    },
    is_checked: false,
    signin_online: {
      now: '',
      location: '',
      latitude: '',
      longitude: '',
    },
    is_locked: false,
    signin_record_items: [],
    signin_record_count: 0,
    time: ''
  },
  onLoad(option) {
    let signin_id = option.signin_id
    let signin_name = option.signin_name
    let course_id = wx.getStorageSync('pingshifen_current_course_id')
    let user_type = wx.getStorageSync('pingshifen_user_type')
    if (!signin_id || !user_type || !course_id) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      return
    }
    wx.setNavigationBarTitle({
      title: signin_name,
    })
    this.setData({
      user_type: user_type,
      signin_id: signin_id,
      course_id: course_id
    })
    this.signin_online_view()
    this.signin_record_view()
  },
  onPullDownRefresh() {
    this.signin_record_view()
    wx.stopPullDownRefresh()
  },

  handleZanTabChange(e) {
    var selectedId = e.selectedId;
    this.setData({
      [`signin.selectedId`]: selectedId
    });
  },
  bindSigninOnlineShow() {
    this.setData({
      current_show: 'signin_online',
    });
  },
  bindSigninRecordShow() {
    this.setData({
      current_show: 'signin_record',
    });
  },
  bindSigninManageShow() {
    this.signin_manage_view()
    this.setData({
      current_show: 'signin_manage',
    });
  },
  signin_manage_view() {
    let signin_id = this.data.signin_id
    let course_id = this.data.course_id
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      method: 'POST',
      data: {
        method: 'pingshifen.signin.get_management',
        signin_id: signin_id,
        course_id: course_id
      },
      success: res => {
        console.log(res)
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        } else {
          let status = true
          let timestamp = new Date().getTime() //1540539717139
          if (res.data.data.end_time <= timestamp / 1000) {
            status = false
          } else {
            status = true
          }
          this.setData({
            signin_management: res.data.data,
            is_checked: status,
            time: res.data.data.end_time_formate_time
          })
        }
      }
    })
  },
  handleZanSwitchChange(e) {
    console.log(e)
  },
  signin_online_view() {
    let obj = this
    let now = new Date().getTime()
    setInterval(function() {
      now += 1000
      obj.setData({
        [`signin_online.now`]: formatTime(now)
      })
    }, 1000)
    wx.getLocation({
      success: function(res) {
        console.log(res)
        obj.setData({
          [`signin_online.latitude`]: res.latitude,
          [`signin_online.longitude`]: res.longitude,
        })
      },
      fail: function(res) {
        wx.showToast({
          title: '获取位置信息失败',
          icon: 'none'
        })
      }
    })

  },
  signin_online() {
    if (this.data.is_locked == true) {
      return
    }
    this.setData({
      is_locked: true
    })
    wx.showLoading({
      title: '签到中...',
    })
    let course_id = this.data.course_id
    let signin_id = this.data.signin_id
    let latitude = this.data.signin_online.latitude
    let longitude = this.data.signin_online.longitude
    if (!course_id || !signin_id || !latitude || !longitude) {
      wx.showToast({
        title: '参数错误',
        icon: 'none',
      })
      return
    }
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      method: 'POST',
      data: {
        method: 'pingshifen.signin.signin_online',
        signin_id: signin_id,
        course_id: course_id,
        latitude: latitude,
        longitude: longitude,
      },
      success: res => {
        this.setData({
          is_locked: false
        })
        wx.hideLoading()
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '签到成功'
          })
          this.setData({
            current_show: 'signin_record',
          });
          this.signin_record_view()
        }
      }
    })
  },
  signin_record_view() {
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      method: 'POST',
      data: {
        method: 'pingshifen.signin.list_all_record',
        signin_id: this.data.signin_id,
      },
      success: res => {
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        } else {
          this.setData({
            signin_record_items: res.data.data,
            [`signin.list[0].title`]: '已签到（' + res.data.data.finish.length + '人）',
            [`signin.list[1].title`]: '未签到（' + res.data.data.undo.length + '人）',
            signin_record_count: res.data.total_count,
          })
          wx.hideLoading()
        }
      }

    })
  },
  signin_replace(e) {
    let studnet_name = e.currentTarget.dataset.student_name
    let student_id = e.currentTarget.dataset.student_id
    let signin_id = this.data.signin_id
    let course_id = this.data.course_id
    this.setData({
      is_lock: true
    })
    wx.showActionSheet({
      itemList: ['对‘' + studnet_name + '‘操作?', '代签', '请假'],
      success: function(res) {
        wx.showLoading({
          title: '加载中',
        })
        let operation = ''
        if (res.tapIndex == 1) {
          operation = 'replace'
        } else if (res.tapIndex == 2) {
          operation = 'leave'
        } else {
          wx.hideLoading();
          return false
        }
        https.post('', {
          method: 'pingshifen.signin.replace',
          course_id: course_id,
          signin_id: signin_id,
          student_id: student_id,
          operation: operation,
        }).then(res => {
          wx.hideLoading();
          if (res.data.success == false) {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
            })
          } else {
            wx.showToast({
              title: '操作成功',
            })
            wx.startPullDownRefresh()
            this.signin_record_view()
            wx.stopPullDownRefresh()
          }
        })
      },
    })
  },
  signin_undo(e) {
    let studnet_name = e.currentTarget.dataset.student_name
    let student_id = e.currentTarget.dataset.student_id
    let signin_id = this.data.signin_id
    let course_id = this.data.course_id
    this.setData({
      is_lock: true
    })
    wx.showActionSheet({
      itemList: ['对‘' + studnet_name + '‘操作?', '缺到'],
      success: function(res) {
        wx.showLoading({
          title: '加载中',
        })
        let operation = ''
        if (res.tapIndex == 1) {
          operation = 'absence'
        } else {
          wx.hideLoading();
          return false
        }
        https.post('', {
          method: 'pingshifen.signin.replace',
          course_id: course_id,
          signin_id: signin_id,
          student_id: student_id,
          operation: operation,
        }).then(res => {
          wx.hideLoading();
          if (res.data.success == false) {
            wx.showToast({
              title: res.data.message,
              icon: 'none',
            })
          } else {
            wx.showToast({
              title: '操作成功',
            })
            wx.startPullDownRefresh()
            this.signin_record_view()
            wx.stopPullDownRefresh()
          }
        })
      },
    })
  },
  signin_abolish(e) {
    let that = this
    wx.showModal({
      title: '警告',
      content: '废除签到？此操作不可逆！',
      success: function(res) {
        if (res.confirm) {
          let cid = wx.getStorageSync('pingshifen_current_course_id')
          wx.request({
            url: apiUrl,
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
            },
            data: {
              method: 'pingshifen.signin.abolish',
              signin_id: that.data.signin_id,
            },
            method: 'POST',
            success: res => {
              if (res.data.success) {
                wx.switchTab({
                  url: '/pages/index/index',
                })
              } else {
                wx.showModal({
                  title: '失败',
                  content: '废除失败',
                  showCancel: false,
                  confirmText: '知道了',
                })
              }
            }
          })
        }
      }
    })
  },
  signin_status(e) {
    wx.showModal({
      title: '敬请期待',
      content: '功能还没做完',
      showCancel: false,
      confirmText: '知道了',
    })
    this.setData({
      is_checked: this.data.is_checked
    })
    // let that = this
    // console.log(e.detail.value)
    // wx.request({
    //   url: apiUrl,
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded',
    //     'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
    //   },
    //   data: {
    //     method: 'pingshifen.signin.change_status',
    //     signin_id: that.data.signin_id,
    //     status: e.detail.value
    //   },
    //   method: 'POST',
    //   success: res => {
    //     console.log(res)
    //     // if (res.data.success) {
    //     //   wx.switchTab({
    //     //     url: '/pages/index/index',
    //     //   })
    //     // } else {
    //     //   wx.showModal({
    //     //     title: '失败',
    //     //     content: '废除失败',
    //     //     showCancel: false,
    //     //     confirmText: '知道了',
    //     //   })
    //     // }
    //   }
    // })
  },
  signin_extend(e) {
    //处理延长至哪个时间戳
    var that = this
    let start = parseInt(this.data.signin_management.start_time)
    let end_time_str = (this.data.signin_management.start_time_formate_date + ' ' + e.detail.value).replace(/-/g, '/')
    let end = new Date(end_time_str).getTime() / 1000;
    if (start >= end) {
      wx.showModal({
        title: '提示',
        content: '截止时间需迟于开始时间',
        showCancel: false,
        confirmText: '知道了',
      })
      return
    }
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.signin.signin_extend',
        signin_id: that.data.signin_id,
        end_time: end
      },
      method: 'POST',
      success: res => {
        if (res.data.success) {
          wx.showToast({
            title: '修改成功',
          })
          this.setData({
            time: e.detail.value
          })
        } else {
          wx.showToast({
            title: '修改失败',
            icon: 'fail'
          })
        }
      }
    })
  }
}));