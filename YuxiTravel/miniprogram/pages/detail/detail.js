Page({
  onLoad(options) {
    console.log("详情页接受的id", options.id)
    wx.cloud.database().collection("recommend")
      .doc(options.id)
      .get()
      .then(res => {
        console.log("详情页获取成功", res)
        this.setData({
          detail: res.data
        })
      })
      .catch(res => {
        console.log("详情页获取失败", res)
      })
  }
})