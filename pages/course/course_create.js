const apiUrl = require('../../config.js').apiUrl
const https = require('../../util/douban.js')
const imgUploadUrl = require('../../config.js').imgUploadUrl
Page({
  data: {
    course_id:0,
    course_img: '/images/default_head_circle.png',
    course_name: '',
    course_class_name: '',
    course_remark: '',
    course_question_set_title:'',
    course_status:'1',
    is_lock: false,    //is_lock用于防止用户多次提交
    page_status: 0,    //  0 教师创建课程   1 教师update课程 2 学生查看课程信息
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showNavigationBarLoading()
    wx.showLoading({title: '加载中',})
    let user_type = wx.getStorageSync('pingshifen_user_type');
    if (options.course_id) {
      this.setData({course_id:options.course_id})
      if (user_type == 1) {
        this.setData({ page_status: 2 });
        wx.setNavigationBarTitle({
          title: '课程详情',
        })
      } else {
        this.setData({ page_status: 1 });
        wx.setNavigationBarTitle({
          title: '更新课程详情',
        })
      }
      https.post(apiUrl, {
        method: 'pingshifen.course.get_info',
        course_id: options.course_id,
      }).then((res) => {
        if (res.data.success == true) {
          this.setData({
            course_img: res.data.data.logo,
            course_name: res.data.data.name,
            course_class_name: res.data.data.class_name,
            course_remark: res.data.data.remark,
            course_student_count: res.data.data.count,
            course_status:res.data.data.status,
          })
          if (res.data.data.question_set_title) {
            this.setData({ course_question_set_title: res.data.data.question_set_title})
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
        wx.hideLoading()
        wx.hideNavigationBarLoading()
      })
    }
  },
  bindCourseImg() {
    if (this.data.page_status == 2) {
      return
    }
    var obj = this
    wx.showActionSheet({
      itemList: ['使用默认封面', '从相册中选取'],
      success: function (res) {
        if (res.tapIndex == 0) {
          obj.setData({
            course_img: '/images/default_head_circle.png',
          })
        }
        if (res.tapIndex == 1) {
          wx.chooseImage({
            sourceType: ['camera', 'album'],
            sizeType: ['compressed', 'original'],
            count: 1,
            success: res => {
              wx.uploadFile({
                url: imgUploadUrl,
                filePath: res.tempFilePaths[0],
                name: 'file',
                formData: { 'path': 'wxchat' },//附件数据，这里为路径
                success: res => {
                  console.log(res)
                  let result = JSON.parse(res.data);//字符串转化为json;
                  if (result.success == true) {
                    obj.setData({
                      course_img: result.data
                    })
                  } else {
                    wx.showToast({
                      title: result.message,
                      icon: 'none',
                    })
                  }
                },
                fail: res => {
                  wx.showToast({
                    title: '图片上传失败',
                    icon: 'none'
                  })
                }
              })
            },
            fail: res => {
              wx.showToast({
                title: '图片选取失败',
                icon: 'none',
              })
            }
          })
        }
      }
    });
  },
  bindCoureName() {
    if (this.data.page_status == 2) {
      return
    }
    wx.navigateTo({
      url: '/pages/course/course_name?course_name=' + this.data.course_name,
    })
  },
  bindCoureClassName() {
    if (this.data.page_status == 2) {
      return
    }
    wx.navigateTo({
      url: '/pages/course/course_class_name?course_class_name=' + this.data.course_class_name,
    })
  },
  bindCoreseRemark() {

    wx.navigateTo({
      url: '/pages/course/course_remark?course_remark=' + this.data.course_remark,
    })
  },

  // 创建课程
  bindCourseCearte() {
    if (this.data.page_status == 2) {
      return
    }
    // 锁机制，意外多次点击
    if (this.data.is_lock == true) {
      return
    }
    this.setData({ is_lock: true })
    if (!this.data.course_img || !this.data.course_name || !this.data.course_class_name) {
      wx.showModal({
        title: "提示",
        content: "课程相关内容不能为空",
        showCancel: false,
        confirmText: "确定"
      })
      this.setData({ is_lock: false })
      return
    }
    wx.showLoading({
      title: '课程创建中',
    })
    
    wx.request({
      url: apiUrl,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': 'PHPSESSID=' + wx.getStorageSync('pingshifen_PHPSESSID')
      },
      data: {
        method: 'pingshifen.course.create',
        course_name: this.data.course_name,
        course_img: this.data.course_img,
        course_class_name: this.data.course_class_name,
        course_remark: this.data.course_remark,
      },
      method: 'POST',
      success: res => {
        this.setData({ is_lock: false })
        wx.hideLoading();
        if (res.data.success == false) {
          wx.showToast({
            title: res.data.message, icon: 'none'
          })
          return
        } else {
          wx.setStorageSync('pingshifen_current_course_id', res.data.data)
          wx.reLaunch({
            url: '/pages/index/index',
          })
        }
      }
    })
  },
  // 查看班级成员
  bindCoureClassStudent(e) {
    let course_id = e.currentTarget.dataset.current_course_id
    if(!course_id) {
      course_id = wx.getStorageSync('pingshifen_current_course_id')
    }
    wx.navigateTo({
      url: '/pages/course/class_student?course_id=' + course_id,
    })
  },
  bindCoureQuetionBank() {
    if (this.data.page_status == 2) {
      return
    }
    wx.navigateTo({
      url: '/pages/app/question/list',
    })
  },
  // 更新课程信息
  bindCourseUpdate() {
    // 锁机制，意外多次点击
    if (this.data.is_lock == true) {
      return
    }
    this.setData({ is_lock: true })
    if (!this.data.course_img || !this.data.course_name || !this.data.course_class_name) {
      wx.showModal({
        title: "提示",
        content: "课程相关内容不能为空",
        showCancel: false,
        confirmText: "确定"
      })
      this.setData({ is_lock: false })
      return
    }
    wx.showLoading({
      title: '修改课程信息',
    })
    https.post(apiUrl,{
      method: 'pingshifen.course.update',
      course_id: wx.getStorageSync('pingshifen_current_course_id'),
      course_name: this.data.course_name,
      course_img: this.data.course_img,
      course_class_name: this.data.course_class_name,
      course_remark: this.data.course_remark,
    }).then(res => {
      this.setData({ is_lock: false })
      wx.hideLoading();
      if(res.data.success == false) {
        wx.showToast({
          title: res.data.message,icon:'none',
        })
      } else {
        wx.showToast({
          title: '更新成功',
        })
      }
    })
  },
  course_status(e) {
    let status = e.detail.value
    let operate = ''
    if (status == true) {
      operate = '锁定'
    } else {
      operate = '开启'
    }
    wx.showModal({
      title: '确定？',
      content: '你确定要' + operate + '本课程吗？',
      success: re => {
        if (re.cancel) {
          if(this.data.course_status == 1) {
            this.setData({ course_status: 1})
          } else {
            this.setData({ course_status: 2})
          }
          wx.showToast({ title: '操作取消', icon: 'none' })
        } else {
          https.post('',{
            method:'pingshifen.course.set_status',
            course_id: wx.getStorageSync('pingshifen_current_course_id'),
            course_status:this.data.course_status,
          }).then(res => {
            if(res.data.success == false) {
              // 还原操作
              if (this.data.course_status == 1) {
                this.setData({ course_status: 1 })
              } else {
                this.setData({ course_status: 2 })
              }
              wx.showToast({ title: res.data.message, icon: 'none' })
              
            } else {
              wx.showToast({ title: '设置成功'})
            }
          })
        }
      }
    })
  }
  
})