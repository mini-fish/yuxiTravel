 let shoucang = false //使收藏默认状态为false
 let ID = ''
 let app = getApp()
 Page({
   data: {
     datail: '',
     imgUrl: "../../images/collect.png",
     showModal: false,
     pinglun: [], //评论数组
     content: '',
     userinfo: {}, //储存用户信息
   },
   onLoad(options) {
     ID = options.id //将从数据库获取到的id赋值给全局ID
     console.log("详情页接受的id", ID)
     console.log(wx)
     wx.cloud.database().collection("hot")
       .doc(ID)
       .get()
       .then(res => {
         console.log("详情页获取成功", res)
         shoucang = res.data.shoucang
         this.setData({
           detail: res.data,
           imgUrl: shoucang ? "../../images/collect1.png" : "../../images/collect.png",
           pinglun: res.data.pinglun
         })
       })
       .catch(res => {
         console.log("详情页获取失败", res)
       })

     // 进入到详情页中，浏览记录增加
     const currUserOpenid = wx.getStorageSync('userinfo').openid
     // 查询当前用户的收藏
     const currUser = wx.cloud.database().collection('user').where({
         openid: currUserOpenid
       })
       .get()
       .then(res => {
         console.log("查询当前成功", res)
         var hasView = res.data[0].viewList
         const db = wx.cloud.database()
         const _ = db.command
         let viewIndex = hasView.indexOf(ID)
         if (viewIndex == -1) {
           hasView.push(ID)
           wx.cloud.database().collection('user').where({
               "_openid": currUserOpenid
             })
             .update({
               data: {
                 viewList: _.set(hasView)
               }
             })
             .then(res => {
               console.log("改变收藏状态成功", res)
             })
             .catch(res => {
               console.log("改变收藏状态失败", res)
             })
         }
       })
       .catch(res => {
         console.log("查询当前失败", res)
       })
   },


   //收藏
   clickMe() {
     this.setData({
       imgUrl: shoucang ? "../../images/collect.png" : "../../images/collect1.png"
     })
     shoucang = !shoucang
     //收藏请求
     wx.cloud.callFunction({ //调用云函数
       name: "caozuo",
       data: {
         id: ID,
         action: "shoucang",
         shoucang: shoucang,

       }
     })
     const currUserOpenid = wx.getStorageSync('userinfo').openid
     // 查询当前用户的收藏
     const currUser = wx.cloud.database().collection('user').where({
         openid: currUserOpenid
       })
       .get()
       .then(res => {
         console.log("查询当前成功", res)
         var hasCollection = res.data[0].collectionList
         const db = wx.cloud.database()
         const _ = db.command
         if (shoucang) { //收藏
           hasCollection.push(ID)
           wx.cloud.database().collection('user').where({
               "_openid": currUserOpenid
             })
             .update({
               data: {
                 collectionList: _.set(hasCollection)
               }
             })
             .then(res => {
               console.log("改变收藏状态成功", res)
             })
             .catch(res => {
               console.log("改变收藏状态失败", res)
             })
         } else { //取消收藏
           const currIndex = hasCollection.indexOf(ID) //当前ID在数组中的下标
           hasCollection.splice(currIndex, 1)
           wx.cloud.database().collection('user').where({
               "_openid": currUserOpenid
             })
             .update({
               data: {
                 collectionList: _.set(hasCollection)
               }
             })
             .then(res => {
               console.log("改变收藏状态成功", res)
             })
             .catch(res => {
               console.log("改变收藏状态失败", res)
             })
         }


       })
       .catch(res => {
         console.log("查询当前失败", res)
       })

   },

   //评论

   // 获取用户信息
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
       },
       fail: res => {
         console.log("云函数调用失败")
       }
     })
   },
   //弹出隐藏评论区
   submit: function() {
     this.setData({
       showModal: true
     })
   },
   preventTouchMove: function() {},
   go: function() {
     this.setData({
       showModal: false
     })
   },
   //获取用户输入的评论内容
   getContent(event) {
     this.setData({
       content: event.detail.value
       //  console.log("获取输入的值", content)
     })
   },
   //发表评论
   fabiao() {
     let content = this.data.content
     if (content.length < 5) {
       wx.showToast({
         icon: "none",
         title: '评论太短了亲~',
       })
       return
     }
     let pinglunItem = {}
     //  pinglunItem.name = '你龙哥'
     pinglunItem.content = content
     //将新添加的评论加到数组前面
     let pinglunArr = this.data.pinglun
     pinglunArr.unshift(pinglunItem)
     // console.log("添加后的评论数组",pinglunArr)
     wx.showLoading({
       title: '发表中...',
     })
     wx.cloud.callFunction({
       name: "caozuo",
       data: {
         action: "fabiao",
         id: ID,
         pinglun: pinglunArr
       }
     }).then(res => {
       console.log("发表成功", res)
       this.setData({
         pinglun: pinglunArr,
         content: ''
       })
       wx.hideLoading()
     }).catch(res => {
       console.log("发表失败", res)
       wx.hideLoading()
     })

   },

   // 获取用户信息
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
       },
       fail: res => {
         console.log("云函数调用失败")
       }
     })
   },
   //获取用户信息
   onShow: function() {
     const ui = wx.getStorageSync('userinfo')
     this.setData({
       userinfo: ui,
       openid: ui.openid
     })
     //浏览时间
     const db = wx.cloud.database()
     const _ = db.command
     console.log(_)
     db.collection("hot").doc(ID).update({
         data: {
           date: app.getNowFormatDate()
         }
       })
       .then(res => {
         console.log("成功", res)
       })
       .catch(res => {
         console.log("失败", res)
       })
       //收藏时间
     db.collection("hot").where({
       shoucang:true
       })
       .update({
         data: {
           date1: app.getNowFormatDate()
         }
       })
       .then(res => {
         console.log("成功", res)
       })
       .catch(res => {
         console.log("失败", res)
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
         title: '用户不给力，暂时就这么多了~',
         icon: 'none'
       })
     }
   },

 })