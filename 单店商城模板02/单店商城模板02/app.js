//app.js
App({
  onLaunch: function () {
    var that = this;
    //  获取商城名称
    wx.setStorageSync('mallName', "拓语商城");

    // wx.request({
    //   url: 'https://api.it120.cc/'+ that.globalData.subDomain +'/config/get-value',
    //   data: {
    //     key: 'mallName'
    //   },
    //   success: function(res) {
    //     if (res.data.code == 0) {
    //       wx.setStorageSync('mallName', res.data.data.value);
    //     }
    //   }
    // })
    this.login();
  },
  
  login : function () {
    var that = this;
    var token = that.globalData.token;
    if (token) {
      wx.request({
        url: 'https://xcx.shty888.com/wxApi._tk', 
        data: {
          token: token
        },
        success: function (res) {
          if (res.data.expires_in < 1) {
            that.globalData.token = null;
            that.login();
          }
          if(res.statusCode==200){

            that.globalData.token = res.data.access_token;
            return;
          }
        }
      })
      return;
    }
    wx.login({
      success: function (res) {

        if (res.code) {
          that.registerUser();
          //发起网络请求
          wx.request({
            url: 'https://xcx.shty888.com/wxApi.login',
            data: {
              code: res.code
            }, 
          success: function (res) {
            if (res.errMsg=="request:ok"){ 
              that.globalData.session_key = res.data.data.session_key;
              that.globalData. openid = res.data.data.openid;

       
            }
            if (res.data.code == "10000") {
                // 去注册
                that.registerUser();
                return;
              }
              
              that.globalData.token = res.data.data.token;
              that.globalData.uid = res.data.data.uid;
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
 
      }
    })
  },
  registerUser: function () {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function (res) {
            var iv = res.iv;
            var encryptedData = res.encryptedData;
 
           var nickName = res.userInfo.nickName;
           var avatarUrl = res.userInfo.avatarUrl;
           var province = res.userInfo.province;
           var city = res.userInfo.city;
           var gender = res.userInfo.gender;
         
            // var wxUserInfo={
            //   nickName: nickName,
            //   avatarUrl: avatarUrl,
            //   province: province,
            //   city: city,
            //   gender: gender
            // }


           // 下面开始调用注册接口

            wx.request({
              url: 'https://xcx.shty888.com/wx.register',
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                code: code,
                nickName: nickName,
                avatarUrl: avatarUrl,
                province: province,
                city: city,
                gender: gender
              },

              success: (res) =>{
                
                wx.hideLoading();
                that.login();
              }
            })
          }
        })
      }
    })
  },
  sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString){
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
      method:'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        token: that.globalData.token,
        type:0,
        module:'order',
        business_id: orderId,
        trigger: trigger,
        template_id: template_id,
        form_id: form_id,
        url:page,
        postJsonString: postJsonString
      },
      success: (res) => {
        //console.log('*********************');
        //console.log(res.data);
        //console.log('*********************');
      }
    })
  },
  globalData:{
    userInfo:null,
    subDomain: "mall",
    version: "1.0",
    shareProfile: '百款精品商品，总有一款适合您' // 首页转发的时候话术
  }
  // 根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒
})
