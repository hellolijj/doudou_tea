Component({
  // 组件属性
  properties: {
    //输入框密码位数
    value_length: {
      type: Number,
      value: 0,
      // 监听输入框密码变化
      observer: function (newVal, oldVal) {
        let that = this;
        // 当输入框的值等于6时（发起支付等...）
        if (newVal == 6) {
          // 引用组件页面的自定义函数
          that.triggerEvent('valueSix', { current_value: that.data.current_value}, {})
          // 回到初始样式
          that.setData({
            get_focus: false,
            value_length: 0,
            input_value: ""
          });
        }
      }
    },
    //输入框聚焦状态
    get_focus: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
      }
    },
    //输入框初始内容
    input_value: {
      type: String,
      value: "",
      observer: function (newVal, oldVal) {

      }
    },
    //输入框聚焦样式 
    focus_class: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
      }
    },
    //输入框格子数
    value_num: {
      type: Array,
      value: [1],
      observer: function (newVal, oldVal) {
      }
    },
    //输入框高度
    height: {
      type: String,
      value: "50px",
      observer: function (newVal, oldVal) {
      }
    },
    //输入框宽度
    width: {
      type: String,
      value: "80%",
      observer: function (newVal, oldVal) {
      }
    },
  },
  // 初始化数据
  data: {
    current_value:'',
    current_1_value:'',
    current_2_value: '',
    current_3_value: '',
    current_4_value: '',
    current_5_value: '',
    current_6_value: '',
  },
  // 组件方法
  methods: {
    // 获得焦点时
    get_focus() {
      let that = this;
      that.setData({
        focus_class: true
      })
    },

    // 失去焦点时
    blur() {
      let that = this;
      that.setData({
        focus_class: false
      })
    },

    // 点击聚焦
    set_focus() {
      let that = this;
      that.setData({
        get_focus: true
      })
    },

    // 获取输入框的值
    get_value(data) {
      let that = this;
      let value_length = data.detail.value.length;
      that.setData({
        value_length: value_length,
        current_value: data.detail.value,
        current_1_value: data.detail.value.substr(0,1),
        current_2_value: data.detail.value.substr(1,1),
        current_3_value: data.detail.value.substr(2,1),
        current_4_value: data.detail.value.substr(3,1),
        current_5_value: data.detail.value.substr(4,1),
        current_6_value: data.detail.value.substr(5,1),
      });
    },
    valueSix(data) {
      console.log(data)
    }
    
  }
})
