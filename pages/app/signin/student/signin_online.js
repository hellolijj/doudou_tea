const { Tab, Switch, extend } = require('../../../../dist/index');
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
    is_checked: true,
    signin_online: {
      now: '',
      location: '',
      latitude: '',
      longitude: '',
    },
    is_locked: false,
    signin_record_items:[],
    signin_record_count:0,
  },
  onLoad(option) {
    let signin_id = option.signin_id
    let course_id = wx.getStorageSync('pingshifen_current_course_id')
    let user_type = wx.getStorageSync('pingshifen_user_type')
    if (!signin_id || !user_type || !course_id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      return
    }
    this.setData({ user_type: user_type, signin_id: signin_id, course_id: course_id })
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
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        } else {
          this.setData({
            signin_management: res.data.data
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
    setInterval(function () {
      now += 1000
      obj.setData({
        [`signin_online.now`]: formatTime(now)
      })
    }, 1000)
    wx.getLocation({
      success: function (res) {
        console.log(res)
        obj.setData({
          [`signin_online.latitude`]: res.latitude,
          [`signin_online.longitude`]: res.longitude,
        })
      },
      fail: function (res) {
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
    this.setData({is_locked: true})
    wx.showLoading({
      title: '签到中...',
    })
    let course_id = this.data.course_id
    let signin_id = this.data.signin_id
    let latitude = this.data.signin_online.latitude
    let longitude = this.data.signin_online.longitude
    if (!course_id || !signin_id || !latitude || !longitude) {
      wx.showToast({ title: '参数错误', icon: 'none', })
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
        this.setData({is_locked: false})
        wx.hideLoading()
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        } else {
          wx.showToast({title: '签到成功'})
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
      data:{
        method: 'pingshifen.signin.list_all_record',
        signin_id: this.data.signin_id,
      },
      success: res => {
        if(res.data.success == false) {
          wx.showToast({title: res.data.message,icon: 'none'})
        } else {
          this.setData({
            signin_record_items: res.data.data,
            [`signin.list[0].title`]: '已签到（' + res.data.data.finish.length+'人）',
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
    this.setData({ is_lock: true })
    wx.showActionSheet({
      itemList: ['对‘'+ studnet_name +'‘操作?', '代签','请假'],
      success: function (res) {
        wx.showLoading({title: '加载中',})
        let operation = ''
        if(res.tapIndex == 1) { 
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
              title: res.data.message, icon: 'none',
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
    this.setData({ is_lock: true })
    wx.showActionSheet({
      itemList: ['对‘' + studnet_name + '‘操作?', '缺到'],
      success: function (res) {
        wx.showLoading({ title: '加载中', })
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
              title: res.data.message, icon: 'none',
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
  }
}));
