import componentsConfig from './config'
const apiUrl = require('../../config.js').apiUrl
const https = require('../../util/douban.js');
var app = getApp();
Page({
  data: {
    list: componentsConfig,
    examInlets: [],
    // 默认课程
    current_course: {
      id: 140520,
      name: '豆豆云助教',
      logo: '/images/gailvlun_book_img.jpeg',
      count: 12312,
      teacher: {
        name: '435大四狗',
        school: '浙江工商大学',
      },
      course_count:0,
    },
    hideLoading:false
  },
  onLoad: function (options) {
    wx.showNavigationBarLoading()  
    let user_type = wx.getStorageSync('pingshifen_user_type')
    if (typeof(options) == "object" && options.invitor!='' && user_type == 0){
      let invitation_code = 0;
      if (options.invitation_code) { 
        invitation_code = options.invitation_code
      }
      if (!user_type || user_type == 0) {
        wx.navigateTo({
          url: "/pages/app/register/register?code=" + invitation_code,
        })
      }
    }
    let obj = this
    let course_id = ''
    if (typeof (options) == "object") {
      course_id = options.course_id
    }
    app.Check.then(function (value) {
      if(app.Login) {
        app.Login.then(function(v) {
          obj.getCurrentCourse(course_id)
        })
      } else {
        obj.getCurrentCourse(course_id)
      }
      
    }, function (error) {
    });
  },
  onShareAppMessage: function(res){
    if (false == this.check_register()) { return }
    let name = app.globalData.userInfo.name
    let user_type = wx.getStorageSync('pingshifen_current_course_id');
    if (!user_type || user_type == 0) {
      wx.showToast({title: '你还没有注册，不能邀请',icon: 'none'})
      return
    }
    console.log(app.globalData)
    let course = this.data.current_course.name
    let course_id = this.data.current_course.id
    return {
      title: name + '邀请你加入' + course +'课程',
      path: '/pages/index/index?course_id='+course_id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getCurrentCourse(course_id = '') {
    let current_course_id = course_id
    if (!current_course_id) {
      current_course_id = wx.getStorageSync('pingshifen_current_course_id');
    }
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.course.current',
        current_course_id: current_course_id,
      },
      method: 'POST',
      success: res => {
        if (res.data.success == false) {
          // 判断是否邀请加入
          if(res.data.message == 'NO_JOIN') {
            wx.showModal({
              title: '提示',
              content: '你还没有加入该课程，加入该课程？',
              success: function (e) {
                if (e.confirm) {
                  wx.navigateTo({
                    url: '/pages/course/course_add?course_id=' + current_course_id,
                  })
                }
              }
            })
          } else {
            wx.showToast({ title: res.data.message, icon: 'none' })
          }
        } else {
          this.setData({
            current_course: res.data.data,
          })
          if (res.data.data.question[0].titleTota) {
            this.setData({ examInlets: res.data.data.question})
          }
          if (!current_course_id) {
            wx.setStorageSync('pingshifen_current_course_id', res.data.data.id)
          }
          wx.setNavigationBarTitle({
            title: this.data.current_course.name
          })
        }
        wx.hideNavigationBarLoading()
        this.setData({hideLoading:true})
      }
    })
  },
  onPullDownRefresh: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    })
    this.onLoad()
    wx.stopPullDownRefresh({})
  },
  changCourse: function () {
    if (false == this.check_register()) { return }
    let itemList = ['创建课程', '加入课程', '切换课程', '课程详情']
    let obj = this
    let user_type = wx.getStorageSync('pingshifen_user_type')
    wx.showActionSheet({
      itemList: itemList,
      success: function (res) {
        if (res.tapIndex == 0) {
          if (user_type == 1) {
            wx.showToast({
              title: '该功能仅教师用户使用',
              icon: 'none'
            })
          } else if (user_type == 2) {
            wx.navigateTo({
              url: '/pages/course/course_create',
            })
          } else {
            wx.showToast({
              title: '请先完成信息绑定',
              icon: 'none'
            })
          }
        }
        if (res.tapIndex == 1) {
          wx.navigateTo({
            url: '/pages/course/course_add',
          })
        }
        if (res.tapIndex == 2) {
          wx.navigateTo({
            url: '/pages/course/course_change',
          })
        }
        if (res.tapIndex == 3) {
          wx.navigateTo({
            url: '/pages/course/course_create?course_id=' + obj.data.current_course.id
          })
        }
      }
    });
  },
  bindUrlToSignin: function () {
    if (false == this.check_register()) { return }
    wx.navigateTo({
      url: '/pages/app/signin/student/signin',
    })
  },
  // 资料下载
  bindUrlToDownload: function () {
    if (false == this.check_register()) { return }
    this .check_register()
    wx.navigateTo({
      url: '/pages/course/course_change',
    })
  },
  // 随堂测试
  bindUrlToCourseTest: function () {
    if (false == this.check_register()) { return }
    wx.navigateTo({
      url: `/pages/app/answer/answer_simulate_tip/simulate_tip?subject=subject&type=mnks`
    });
  },
  // 收藏
  bindUrlToStore: function (e) {
    if (false == this.check_register()) { return }
    var that = this,
      subject = e.currentTarget.dataset.urlparem,
      collection = e.currentTarget.dataset.collection - 0;
    if (!!collection) {
      wx.navigateTo({
        url: `/pages/app/answer/answer_info/info?subject=subject&type=wdsc`
      })
    } else {
      if (!app.globalData.hasLogin) {
        wx.showModal({
          title: '提示',
          content: '您未登录，无法看到收藏',
          showCancel: true,
          cancelText: '知道了',
          confirmText: '去登录',
          success: function (res) {

          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '未发现您的收藏',
          showCancel: false,
          confirmText: '知道了',
          success: function (res) {

          }
        })
      }
    }
  },
  // 错题
  bindUrlToWrong: function (e) {
    if (false == this.check_register()) {return}
    var subject = e.currentTarget.dataset.urlparem,
      answerError = e.currentTarget.dataset.answererror - 0;
    if (!!answerError) {
      wx.navigateTo({
        url: `/pages/app/answer/answer_info/info?subject=${subject}&type=wdct`
      })
    } else {
      if (!app.globalData.hasLogin) {
        wx.showModal({
          title: '提示',
          content: '您未登录，无法看到错题',
          showCancel: true,
          cancelText: '知道了',
          cancelColor: '#00bcd5',
          confirmText: '去登录',
          confirmColor: '#00bcd5',
          success: function (res) {
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '恭喜您，暂无错题。',
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#00bcd5',
          success: function (res) {
          }
        })
      }
    }
  },
  check_register() {
    let user_type = wx.getStorageSync('pingshifen_user_type')
    if (!user_type || user_type == 0) {
      wx.showToast({ title: '请先完成信息绑定', icon: 'none' })
      return false
    }
  },
  //顺序练习
  exercise(e) { 
    if (false == this.check_register()) { return }
    console.log(e)
    let type = e.currentTarget.dataset.type
    let subject = this.data.examInlets[0].subject
    var _url = ''
    if (type == 'sxlx') {
      _url = "/pages/app/answer/answer_info/info?subject=" + subject + "&type=sxlx"
    } else if(type == 'zjlx') {
      _url = '/pages/app/answer/answer_chapter/chapter?subject='+subject+'&type=zjlx'
    } else if(type == 'zylx') {
      _url = '/pages/app/answer/answer_info/info?subject='+subject+'&type=sjlx'
    } else if (type == 'ztlx') {
      _url = '/pages/app/answer/answer_classify/classify?subject=' + subject+'&type=zxlx'
    }
    console.log(_url)
    wx.navigateTo({
      url: _url,
    })
  }
})