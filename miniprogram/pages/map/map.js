// map/map.js - 地图指引模块
import API from '../../utils/api';
import Storage from '../../utils/storage';

Page({
  data: {
    statusBarHeight: 0,
    centerLocation: {
      latitude: 31.2304,
      longitude: 121.4737 // 上海市中心
    },
    scale: 14,
    markers: [],
    facilities: [],
    selectedFacility: null,
    loading: true,
    activeFilterType: 'all',
    facilityTypes: [
      { type: 'all', name: '全部', icon: '/images/icons/all.png' },
      { type: 'elevator', name: '电梯', icon: '/images/icons/elevator.png' },
      { type: 'ramp', name: '坡道', icon: '/images/icons/ramp.png' },
      { type: 'toilet', name: '厕所', icon: '/images/icons/toilet.png' },
      { type: 'parking', name: '停车位', icon: '/images/icons/parking.png' },
      { type: 'entrance', name: '入口', icon: '/images/icons/entrance.png' }
    ]
  },

  onLoad() {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });

    // 获取用户位置
    this.getUserLocation();
    // 加载设施数据
    this.loadFacilities();
  },

  /**
   * 获取用户当前位置
   */
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      highAccuracy: true,
      success: (res) => {
        this.setData({
          centerLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        // 保存用户位置到本地存储
        Storage.user.setLocation({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 加载景区设施数据
   */
  loadFacilities() {
    this.setData({ loading: true });
    
    // 先从缓存获取
    const cached = Storage.cache.getScenic();
    if (cached.length > 0) {
      this.processFacilities(cached);
      this.setData({ loading: false });
    }

    // 从云端获取最新数据
    API.scenic.getNearby(
      this.data.centerLocation,
      10000 // 10km范围
    )
    .then(res => {
      const scenics = res.data || [];
      Storage.cache.setScenic(scenics);
      this.processFacilities(scenics);
      this.setData({ loading: false });
    })
    .catch(err => {
      console.error('加载设施失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    });
  },

  /**
   * 处理并转换设施数据为地图标记
   */
  processFacilities(scenics) {
    const markers = [];
    const facilities = [];
    let markerId = 0;

    scenics.forEach(scenic => {
      if (scenic.facilities && Array.isArray(scenic.facilities)) {
        scenic.facilities.forEach(facility => {
          markers.push({
            id: markerId,
            latitude: facility.location.coordinates[1],
            longitude: facility.location.coordinates[0],
            title: facility.name,
            iconPath: this.getFacilityIcon(facility.type),
            width: 32,
            height: 32,
            callout: {
              content: facility.name,
              color: '#000000',
              fontSize: 12,
              borderRadius: 4,
              bgColor: '#FFFFFF',
              padding: 5,
              display: 'BYCLICK'
            },
            _data: facility
          });

          facilities.push({
            id: markerId,
            markerId,
            ...facility,
            scenicAreaId: scenic._id,
            scenicName: scenic.name
          });

          markerId++;
        });
      }
    });

    this.setData({
      markers,
      facilities
    });
  },

  /**
   * 获取设施类型对应的图标
   */
  getFacilityIcon(type) {
    const iconMap = {
      elevator: '/images/icons/marker-elevator.png',
      ramp: '/images/icons/marker-ramp.png',
      toilet: '/images/icons/marker-toilet.png',
      parking: '/images/icons/marker-parking.png',
      entrance: '/images/icons/marker-entrance.png'
    };
    return iconMap[type] || '/images/icons/marker-default.png';
  },

  /**
   * 点击地图标记
   */
  onMarkerTap(event) {
    const markerId = event.detail.markerId;
    const facility = this.data.facilities.find(f => f.markerId === markerId);
    if (facility) {
      this.setData({ selectedFacility: facility });
    }
  },

  /**
   * 点击地图空白处
   */
  onMapTap() {
    this.setData({ selectedFacility: null });
  },

  /**
   * 筛选设施类型
   */
  onFilterChange(event) {
    const type = event.currentTarget.dataset.type;
    this.setData({ activeFilterType: type });

    // 过滤标记
    if (type === 'all') {
      const markers = this.data.facilities.map((facility, index) => ({
        id: index,
        ...this.data.markers[index]
      }));
      this.setData({ markers });
    } else {
      const filteredFacilities = this.data.facilities.filter(f => f.type === type);
      const markers = filteredFacilities.map((facility, index) => {
        const original = this.data.markers.find(m => m.id === facility.markerId);
        return {
          id: index,
          ...original
        };
      });
      this.setData({ markers });
    }
  },

  /**
   * 定位用户
   */
  onLocateUser() {
    const mapContext = wx.createMapContext('map');
    mapContext.moveToLocation();
  },

  /**
   * 打开搜索
   */
  onSearch() {
    wx.navigateTo({
      url: '/pages/map-search/map-search'
    });
  },

  /**
   * 打开设置
   */
  onSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  /**
   * 导航到设施
   */
  onNavigate() {
    const facility = this.data.selectedFacility;
    if (!facility) return;

    wx.openLocation({
      latitude: facility.location.coordinates[1],
      longitude: facility.location.coordinates[0],
      name: facility.name,
      address: `${facility.scenicName} - ${facility.name}`
    });
  },

  /**
   * 查看设施详情
   */
  onViewDetail() {
    const facility = this.data.selectedFacility;
    if (!facility) return;

    wx.navigateTo({
      url: `/pages/facility-detail/facility-detail?id=${facility.id}`
    });
  }
});
