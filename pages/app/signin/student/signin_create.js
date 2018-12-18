var Zan = require('../../../../dist/index');
var formatDate = require('../../../../util/util.js').formatDate
var formatTime = require('../../../../util/util.js').formatTime
const apiUrl = require('../../../../config.js').apiUrl
Page(Object.assign({}, Zan.Switch, {
  data: {
    date: '',
    time: '',
    array: ['2', '3', '4', '5', '6', '7', '8'],
    index: 1,
    hasLocation: false,
    locationAddress: '获取当前位置',
    describe: '',
    latitude: '',
    longitude: '',
    radius: 500,
    title: '02月06日签到',
    is_locked: false,
    is_disabled: false,
  },
  onLoad() {
    let now = new Date()
    this.setData({
      date: formatDate(now.getTime()),
      time: formatTime(now.getTime(), 'minute'),
      title: formatDate(now.getTime(), 'mouth') + '签到',
    })
  },
  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  handleZanSwitchChange(e) {
    this.setData({
      checked: e.checked
    });
  },
  bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    })
  },
  bindGetLocation: function(e) {
    var that = this
    wx.getLocation({
      success: function(res) {
        that.setData({
          hasLocation: true,
          altitude: true,
          latitude: res.latitude,
          longitude: res.longitude,
        })
        wx.request({ // 百度地图API，将微信获得的经纬度传给百度，获得城市等信息
          url: 'https://api.map.baidu.com/geocoder/v2/?ak=GAKrXdS2lPhNejYKnvfalheyoiTqcnWG&location=' + res.latitude + ',' + res.longitude + '&output=json&coordtype=gcj02',
          data: {},
          header: {
            'Content-Type': 'application/json'
          },
          success: function (f) {
            wx.showToast({
              title: '位置获取成功',
              icon: 'none'
            })
            that.setData({
              latitude: res.latitude,
              longitude: res.longitude,
              locationAddress: f.data.result.sematic_description,
            })
          },
          fail: function () { wx.showToast({ title: '获取位置信息失败！', }) },
        })
      },
    })
  },
  formSubmit: function(e) {
    console.log(e)
    if (this.data.is_locked == true) {
      return
    }
    wx.showLoading({
      title: '提交中...',
    })
    this.setData({
      is_locked: true
    })
    let title = e.detail.value.title
    let radius = e.detail.value.radius
    let address = this.data.locationAddress
    let describe = e.detail.value.describe
    let last_time = this.data.array[this.data.index] * 60 //持续时间（秒）
    let latitude = this.data.latitude
    let longitude = this.data.longitude
    let cid = wx.getStorageSync('pingshifen_current_course_id');
    if (!title) {
      wx.showToast({
        title: '签到名称不能为空',
        icon: 'none'
      })
      this.setData({
        is_locked: false
      })
      return
    }
    if (!this.data.date || !this.data.time) {
      wx.showToast({
        title: '签到日期不能为空',
        icon: 'none'
      })
      this.setData({
        is_locked: false
      })
      return
    }
    let start_time_str = (this.data.date + ' ' + this.data.time).replace(/-/g, '/')
    let start_time = new Date(start_time_str).getTime() / 1000;
    console.log(start_time_str)
    console.log(start_time)
    let end_time = start_time + last_time;
    if (!start_time || !last_time) {
      wx.showToast({
        title: '签到时间错误',
        icon: 'none',
      })
      this.setData({
        is_locked: false
      })
      return
    }
    // 签到地理位置
    if (!!describe) {
      address = describe
    }
    if (!latitude || !longitude || !radius) {
      wx.showToast({
        title: '签到地理位置错误',
        icon: 'none',
      })
      this.setData({
        is_locked: false
      })
      return
    }
    if (!cid) {
      wx.showToast({
        title: '课程信息错误',
        icon: 'none',
      })
      this.setData({
        is_locked: false
      })
      return
    }
    // 发起签到
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.signin.create',
        title: title,
        cid: cid,
        start_time: start_time,
        end_time: end_time,
        title: title,
        address: address,
        latitude: latitude,
        longitude: longitude,
        radius: radius,
      },
      method: 'POST',
      success: res => {
        wx.hideLoading()
        this.setData({
          is_locked: false
        })
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
          })
        } else {
          wx.showToast({
            title: '签到创建成功',
          })
          this.setData({
            is_disabled: true
          })
          setTimeout(function() {
            // 此处不能用relaunch ，这样新的页面没有返回页面
            wx.redirectTo({
              url: '/pages/app/signin/student/signin',
            })
          }, 1500)
        }
      },
    })
  }
}));