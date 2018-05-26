Page({
  data: {
    course_class_name:'',
  },
  onShow() {
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面
    this.setData({
      course_class_name: prevPage.data.course_class_name
    })
  },
  formSubmit(e) {
    let course_class_name = e.detail.value.course_class_name
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      course_class_name: course_class_name
    })
    wx.navigateBack()
  }

})