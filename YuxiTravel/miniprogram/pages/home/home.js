Page({
  data: {
    datalist: []
  },
  //获取数据库recommend中的元素
  onLoad() {
    wx.cloud.database().collection('recommend')
      .get()
      .then(res => {
        console.log("获取成功", res)
        this.setData({
          datalist: res.data
        })
      })
      .catch(res => {
        console.log("获取失败", res)
      })
  },
  //跳转到详情页
  goDetail(event) {
    console.log("点击获取的数据", event.currentTarget.dataset.item._id)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + event.currentTarget.dataset.item._id,
    })
  },

// 生命周期函数--监听页面加载
// onLoad:function(options){
//   wx.cloud.database().collection('recommend').count()
//   .then(res =>{
//     console.log('数据总条数',res)
//   })
// },

  //页面触底事件的处理函数
  onReachBottom: function () {
    var _this = this
    if (_this.data.hasMoreData) {
      _this.setData({
        page: _this.data.page + 1
      })
      _this.getCouponList('加载更多数据')
    } else {
      wx.showToast({
        title: '暂时就这么多了~',
        icon:'none'
      })
    }
  },


})