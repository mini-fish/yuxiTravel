let app = getApp();
Page({
  data: {
    dataList: [],
    userinfo: {} //储存用户信息
  },
  onLoad() {
    let that = this;
    wx.cloud.database().collection('friends')
      .orderBy('createTime', 'desc') //按发布视频排序
      .get({
        success(res) {
          console.log("请求成功", res)
          that.setData({
            dataList: res.data
          })
        },
        fail(res) {
          console.log("请求失败", res)
        }
      })
  },
  // 预览图片
  previewImg: function (e) {
    let imgData = e.currentTarget.dataset.img;
    console.log("eeee", imgData[0])
    console.log("图片s", imgData[1])
    wx.previewImage({
      //当前显示图片
      current: imgData[0],
      //所有图片
      urls: imgData[1]
    })
  },



  // 获取用户信息
  onGotUserInfo: function (e) {
    const that = this
    wx.cloud.callFunction({
      name: "getopenid",
      success: res => {
        console.log("云函数调用成功")
        //获取用户信息
        that.setData({
          openid: res.result.openid,
          userinfo: e.detail.userInfo
        })
        that.data.userinfo.openid = that.data.openid
        console.log("userinfo", that.data.userinfo)
        wx.setStorageSync("userinfo", that.data.userinfo)
      },
      fail: res => {
        console.log("云函数调用失败")
      }
    })
  },
  onShow: function (options) {
    const ui = wx.getStorageSync('userinfo')
    this.setData({
      userinfo: ui,
      openid: ui.openid
    })
  },

})