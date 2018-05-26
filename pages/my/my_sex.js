Page({
  data: {
    items: [
      { value: '1', name: '男' },
      { value: '2', name: '女', checked: 'true' },
    ]
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)

    var items = this.data.items;
    for (var i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value == e.detail.value
    }

    this.setData({
      items: items
    });
  },
  submit: function (e) {
    wx.navigateBack();
  }
})