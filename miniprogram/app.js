// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'wheelchair-app-prod',
        traceUser: true,
      });
    }

    // 检查用户登录状态
    this.checkLogin();

    // 初始化全局数据
    this.initGlobalData();
  },

  checkLogin() {
    const that = this;
    wx.cloud.callFunction({
      name: 'getUserProfile',
      data: {},
      success: res => {
        console.log('用户已登录:', res.result);
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = res.result;
      },
      fail: err => {
        console.log('用户未登录:', err);
        this.globalData.isLoggedIn = false;
        // 跳转到登录/首页
      }
    });
  },

  initGlobalData() {
    // 初始化全局变量
    this.globalData = {
      isLoggedIn: false,
      userInfo: null,
      userLocation: null,
      userPreferences: {
        wheelchairType: 'manual', // manual or electric
        maxSlope: 8, // 度数
        mobilityLevel: 'intermediate' // beginner, intermediate, advanced
      },
      lastUpdateTime: 0,
      // 缓存常用数据
      scenicsCache: [],
      facilitiesCache: {},
      routesCache: {}
    };
  },

  // 获取用户位置
  getUserLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        highAccuracy: true,
        success: res => {
          this.globalData.userLocation = {
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          };
          resolve(res);
        },
        fail: err => {
          console.error('获取位置失败:', err);
          reject(err);
        }
      });
    });
  },

  // 全局错误处理
  onError(msg) {
    console.error('全局错误:', msg);
  }
});
