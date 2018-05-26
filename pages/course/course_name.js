Page({
  data: {
    course_name: '',
  },
  onShow() {
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面
    this.setData({
      course_name: prevPage.data.course_name
    })
  },
  formSubmit(e) {
    let course_name = e.detail.value.course_name
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];   //当前页面
    let prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      course_name: course_name
    })
    wx.navigateBack()
  }
});
