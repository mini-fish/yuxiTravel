Page({

  data: {
    userinfo: {}, //储存用户信息
    openid: "",
    navState: 0, //导航状态
    swHeight: "", //轮播图高度
    arr: [], //存放所有景点的数组
    arr1: [],
    
  },
  // 登录操作
  onGotUserInfo: function(e) {
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
        // 查询user表中是否已经存在该用户，根据openid
        const userList = wx.cloud.database().collection('user')
          .get()
          .then(res => {
            console.log("查询用户列表成功", res)
            const currOpenid = that.data.userinfo.openid 
            console.log(currOpenid)
            // filter过滤数组函数
            var hasUser = res.data.filter(function(item) {
              console.log(item)
              if (item.openid == currOpenid) {
                return item
              }
            })
            console.log(hasUser)
            if (hasUser.length == 0) {  //是一个新用户,插入user表中
              that.getUserInfo()
            }
          })
          .catch(res => {
            console.log("查询用户列表失败", res)
          })
          
      }, 
      fail: res => {
        console.log("云函数调用失败")
      }
    })
  },
  onLoad: function(options) {
    const ui = wx.getStorageSync('userinfo')
    this.setData({
      userinfo: ui,
      openid: ui.openid
    })
    // this.getUserInfo()
    
    
  },

  // 查询收藏
  getCollectionList: function (list1) {
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('hot').where({
      _id: _.in(list1)
    })
      .get()
      .then(res => {
        console.log("查询收藏成功", res)
        this.setData({
          arr: res.data,
        })
      })
      .catch(res => {
        console.log("查询收藏失败", res)
      })
  },

  //查询浏览
  getViewList: function(list2) {
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('hot').where({
      _id: _.in(list2)
    })
      .get()
      .then(res => {
        console.log("查询浏览成功", res)
        this.setData({
          arr1: res.data,
        })
      })
      .catch(res => {
        console.log("查询浏览失败", res)
      })
  },

  //新用户登录时，获取用户信息并存入数据库
  getUserInfo: function() {
    const ui = wx.getStorageSync('userinfo')
    const collectionList = []  //收藏列表
    const viewList = []  //浏览列表
    wx.cloud.database().collection('user').add({
        data: {
          openid: ui.openid,
          userinfo: ui,
          collectionList: collectionList,
          viewList: viewList
        }
      })
      .then(res => {
        console.log("存入成功", res)
      })
      .catch(res => {
        console.log("存入失败", res)
      })
  },


  //底部滑动
  //监听滑块
  bindchange(e) {
    // console.log(e.detail.current)
    let index = e.detail.current;
    this.setData({
      navState: index
    })
  },
  //点击导航
  navSwitch: function(e) {
    // console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index;
    this.setData({
      navState: index
    })
  },



  //页面显示
  onShow: function() {
    const ui = wx.getStorageSync('userinfo')
    var currUser = ''
    const that = this
    console.log(this.openid)
    //登录态存在执行查询景点收藏和浏览记录
    if(ui.openid){
    wx.cloud.database().collection('user').where({
      openid: ui.openid
    })
      .get()
      .then(res => {
        console.log("查询当前成功", res)
        currUser = res.data[0]
        // 调用收藏的景点
        that.getCollectionList(currUser.collectionList)
        // 调用浏览的景点
        that.getViewList(currUser.viewList)
      })
      .catch(res => {
        console.log("查询当前失败", res)
      })
    }
    
    


    // 调用收藏的景点
    // this.getCollectionList()
    // const arr = wx.cloud.database().collection('hot')
    // arr.where({
    //     shoucang: true
    //   })
    //   .get()
    //   .then(res => {
    //     console.log("获取成功", res)
    //     this.setData({
    //       arr: res.data,
    //     })
    //   })
    //   .catch(res => {
    //     console.log("获取失败", res)
    //   })

    // 调用浏览的景点
    // const arr1 = wx.cloud.database().collection('hot')
    // arr1.where({
    //   liulan: 0
    // })
    //   .get()
    //   .then(res => {
    //     console.log("获取成功", res)
    //     this.setData({
    //       arr1: res.data,
    //     })
    //   })
    //   .catch(res => {
    //     console.log("获取失败", res)
    //   })
  },

  // 获取用户收藏的景点
  // getCollectionList: function() {
  //   const arr = wx.cloud.database().collection('hot').where({
  //       shoucang: true
  //     })
  //     .get()
  //     .then(res => {
  //       console.log("获取成功", res)
  //       this.setData({
  //         arr: res.data,
  //       })
  //     })
  //     .catch(res => {
  //       console.log("获取失败", res)
  //     })
  //   return arr
  // },



  // 获取用户浏览过的景点
  // getViewList: function() {
  //   const db = wx.cloud.database()
  //   const _ = db.command
  //   const arr1 = db.collection('hot').where({
  //       // gt 方法用于指定一个 "大于" 条件，此处 _.gt(30) 是一个 "大于 30" 的条件
  //       liulan: _.gt(0)
  //     })
  //     .get()
  //     .then(res => {
  //       console.log("获取成功", res)
  //       this.setData({
  //         arr1: res.data,
  //       })
  //     })
  //     .catch(res => {
  //       console.log("获取失败", res)
  //     })

  //   return arr1
  // },

  //点击跳转到相应页面
  goDetail(event) {
    console.log("点击获取的数据", event.currentTarget.dataset.item._id)
    wx.navigateTo({
      url: '/pages/hot-detail/hot-detail?id=' + event.currentTarget.dataset.item._id,
    })
  },







  //页面触底事件的处理函数
  onReachBottom: function() {
    var _this = this
    if (_this.data.hasMoreData) {
      _this.setData({
        page: _this.data.page + 1
      })
      _this.getCouponList('加载更多数据')
    } else {
      wx.showToast({
        title: '没了呀QAQ~',
        icon: 'none'
      })
    }
  },


})