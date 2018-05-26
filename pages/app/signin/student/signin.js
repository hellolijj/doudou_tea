var Zan = require('../../../../dist/index')
const apiUrl = require('../../../../config.js').apiUrl
const app = getApp()
Page(Object.assign({}, Zan.Tab, {
  data: {
    signin_list: {
      list: [
        {
          id: 'before_start',
          title: '尚未开始'
        }, {
          id: 'is_doing',
          title: '正在进行'
        }, {
          id: 'is_done',
          title: '已经结束'
        }],
      selectedId: 'is_doing'
    },
    signin_items: {
      before_start: [],
      is_doing: [],
      is_done: [],
    }
  },
  onLoad() {
    wx.showLoading({
      title: '加载中...',
    })
    let user_type = wx.getStorageSync('pingshifen_user_type');
    if (!user_type) {
      wx.showToast({
        title: '用户类型错误',
        icon: 'none'
      })
    } else {
      this.setData({
        user_type: user_type
      })
    }
    this.list_all_item()
  },
  onPullDownRefresh: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    })
    this.list_all_item()
    wx.stopPullDownRefresh()
  },
  handleZanTabChange(e) {
    var selectedId = e.selectedId;
    this.setData({
      [`signin_list.selectedId`]: selectedId
    });
  },

  // 更新所有的签到列表
  list_all_item() {
    let cid = wx.getStorageSync('pingshifen_current_course_id')
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.signin.list_all_item',
        cid: cid,
      },
      method: 'POST',
      success: res => {
        wx.hideLoading()
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        } else {
          this.setData({
            signin_items: res.data.data
          })
        }
      },
    })

  },
  signin_online(e) {
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      'url': '/pages/app/signin/student/signin_online?signin_id=' + e.currentTarget.dataset.signin_id
    })
  },
  bindSigninCreate: function () {
    wx.navigateTo({
      url: './signin_create',
    })
  }
}));
