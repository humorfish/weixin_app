//index.js
import { baseUrl } from '../../utils/env.js'

//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false,

    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: 0,
    loadingMoreHidden: true,

    hasNoCoupons: true,
    coupons: [],
    searchInput: '',

    curPage: 1,
    pageSize: 20
  },
  onLoad: function () {
    var that = this;
    wx.setNavigationBarTitle({title: wx.getStorageSync('mallName')});

    wx.request({
      url: baseUrl + app.globalData.subDomain + '/banner/list',
      data: {
        key: 'mallName'
      },
      success: function(res) {
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
          that.setData({
            banners: res.data.data
          });
        }
      }
    });
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/category/all',
      success: function (res) {
        var categories = [{ id: 0, name: "全部" }];
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.setData({
          categories: categories,
          activeCategoryId: 0,
          curPage: 1
        });
        that.getGoodsList(0);
      }
    });
    that.getCoupons();
    that.getNotice();
  },
  getGoodsList: function (categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }

    var that = this;
    wx.showLoading({
      mask: true
    });
    wx.request({
      url: baseUrl + app.globalData.subDomain + '/shop/goods/list',
      data: {
        categoryId: categoryId,
        nameLike: that.data.searchInput,
        page: that.data.curPage,
        pageSize: that.data.pageSize
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.code == 404 || res.data.code == 700) {
          let newData = { loadingMoreHidden: false }
          if (!append) {
            newData.goods = []
          }
          that.setData(newData);
          return
        }
        let goods = [];
        if (append) {
          goods = that.data.goods
        }
        for (var i = 0; i < res.data.data.length; i++) {
          goods.push(res.data.data[i]);
        }
        that.setData({
          loadingMoreHidden: true,
          goods: goods,
        });
      }
    })
  },
  getNotice: function () {
    var that = this;
    wx.request({
      url: baseUrl + app.globalData.subDomain + '/notice/list',
      data: { pageSize: 5 },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  getCoupons: function () {
    var that = this;
    wx.request({
      url: baseUrl + app.globalData.subDomain + '/discounts/coupons',
      data: {
        type: ''
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.data
          });
        }
      }
    })
  },
  getCouponDetail: function () {
    
  },
  //事件处理函数
  swiperchange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    });
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
