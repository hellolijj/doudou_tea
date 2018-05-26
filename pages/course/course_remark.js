Page({
  data: {
    course_remark: '',
  },
  onShow() {
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面
    this.setData({
      course_remark: prevPage.data.course_remark
    })
  },
  formSubmit(e) {
    let course_remark = e.detail.value.course_remark
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      course_remark: course_remark
    })
    wx.navigateBack()
  }
});
