/**
 * 本地存储管理
 * 统一管理小程序的本地数据存储
 */

const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  USER_PREFERENCES: 'user_preferences',
  USER_LOCATION: 'user_location',
  SCENIC_CACHE: 'scenic_cache',
  FACILITIES_CACHE: 'facilities_cache',
  ROUTES_CACHE: 'routes_cache',
  FAVORITES: 'favorites',
  HISTORY: 'history',
  DRAFT_POST: 'draft_post',
  EMERGENCY_CONTACTS: 'emergency_contacts'
};

class Storage {
  /**
   * 保存数据到本地存储
   * @param {string} key - 存储键
   * @param {any} value - 存储值
   */
  static setItem(key, value) {
    try {
      const data = JSON.stringify({
        value,
        timestamp: Date.now()
      });
      wx.setStorageSync(key, data);
    } catch (error) {
      console.error('存储数据失败:', error);
    }
  }

  /**
   * 从本地存储获取数据
   * @param {string} key - 存储键
   * @param {number} expireTime - 过期时间（毫秒），0 表示不过期
   * @returns {any} 存储的值，过期返回 null
   */
  static getItem(key, expireTime = 0) {
    try {
      const data = wx.getStorageSync(key);
      if (!data) return null;

      const { value, timestamp } = JSON.parse(data);

      // 检查是否过期
      if (expireTime > 0 && Date.now() - timestamp > expireTime) {
        this.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      console.error('读取数据失败:', error);
      return null;
    }
  }

  /**
   * 删除指定键的数据
   * @param {string} key - 存储键
   */
  static removeItem(key) {
    try {
      wx.removeStorageSync(key);
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  }

  /**
   * 清空所有本地存储
   */
  static clear() {
    try {
      wx.clearStorageSync();
    } catch (error) {
      console.error('清空本地存储失败:', error);
    }
  }

  /**
   * 用户相关存储
   */
  static user = {
    setInfo: (userInfo) => {
      Storage.setItem(STORAGE_KEYS.USER_INFO, userInfo);
    },

    getInfo: () => {
      return Storage.getItem(STORAGE_KEYS.USER_INFO);
    },

    setPreferences: (preferences) => {
      Storage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
    },

    getPreferences: () => {
      return Storage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    },

    setLocation: (location) => {
      Storage.setItem(STORAGE_KEYS.USER_LOCATION, location);
    },

    getLocation: () => {
      return Storage.getItem(STORAGE_KEYS.USER_LOCATION);
    },

    setEmergencyContacts: (contacts) => {
      Storage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
    },

    getEmergencyContacts: () => {
      return Storage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS) || [];
    }
  };

  /**
   * 缓存相关存储
   */
  static cache = {
    setScenic: (scenicList) => {
      Storage.setItem(STORAGE_KEYS.SCENIC_CACHE, scenicList);
    },

    getScenic: () => {
      return Storage.getItem(STORAGE_KEYS.SCENIC_CACHE) || [];
    },

    setFacilities: (facilityId, facilities) => {
      const cache = Storage.getItem(STORAGE_KEYS.FACILITIES_CACHE) || {};
      cache[facilityId] = facilities;
      Storage.setItem(STORAGE_KEYS.FACILITIES_CACHE, cache);
    },

    getFacilities: (facilityId) => {
      const cache = Storage.getItem(STORAGE_KEYS.FACILITIES_CACHE) || {};
      return cache[facilityId] || [];
    },

    setRoutes: (scenicId, routes) => {
      const cache = Storage.getItem(STORAGE_KEYS.ROUTES_CACHE) || {};
      cache[scenicId] = routes;
      Storage.setItem(STORAGE_KEYS.ROUTES_CACHE, cache);
    },

    getRoutes: (scenicId) => {
      const cache = Storage.getItem(STORAGE_KEYS.ROUTES_CACHE) || {};
      return cache[scenicId] || [];
    },

    clearAll: () => {
      Storage.removeItem(STORAGE_KEYS.SCENIC_CACHE);
      Storage.removeItem(STORAGE_KEYS.FACILITIES_CACHE);
      Storage.removeItem(STORAGE_KEYS.ROUTES_CACHE);
    }
  };

  /**
   * 收藏相关存储
   */
  static favorite = {
    add: (type, id) => {
      const favorites = Storage.getItem(STORAGE_KEYS.FAVORITES) || {};
      if (!favorites[type]) {
        favorites[type] = [];
      }
      if (!favorites[type].includes(id)) {
        favorites[type].push(id);
        Storage.setItem(STORAGE_KEYS.FAVORITES, favorites);
      }
    },

    remove: (type, id) => {
      const favorites = Storage.getItem(STORAGE_KEYS.FAVORITES) || {};
      if (favorites[type]) {
        favorites[type] = favorites[type].filter(item => item !== id);
        Storage.setItem(STORAGE_KEYS.FAVORITES, favorites);
      }
    },

    get: (type) => {
      const favorites = Storage.getItem(STORAGE_KEYS.FAVORITES) || {};
      return favorites[type] || [];
    },

    isExists: (type, id) => {
      const favorites = Storage.getItem(STORAGE_KEYS.FAVORITES) || {};
      return favorites[type] && favorites[type].includes(id);
    }
  };

  /**
   * 历史记录相关存储
   */
  static history = {
    add: (type, item) => {
      const history = Storage.getItem(STORAGE_KEYS.HISTORY) || [];
      const newItem = {
        ...item,
        type,
        timestamp: Date.now()
      };
      // 避免重复，如果存在相同 ID 则更新时间戳
      const index = history.findIndex(h => h.id === item.id && h.type === type);
      if (index > -1) {
        history.splice(index, 1);
      }
      history.unshift(newItem);
      // 只保留最近 100 条记录
      if (history.length > 100) {
        history.pop();
      }
      Storage.setItem(STORAGE_KEYS.HISTORY, history);
    },

    get: (limit = 20) => {
      const history = Storage.getItem(STORAGE_KEYS.HISTORY) || [];
      return history.slice(0, limit);
    },

    getByType: (type, limit = 20) => {
      const history = Storage.getItem(STORAGE_KEYS.HISTORY) || [];
      return history.filter(h => h.type === type).slice(0, limit);
    },

    clear: () => {
      Storage.removeItem(STORAGE_KEYS.HISTORY);
    }
  };

  /**
   * 草稿相关存储
   */
  static draft = {
    setPost: (post) => {
      Storage.setItem(STORAGE_KEYS.DRAFT_POST, post);
    },

    getPost: () => {
      return Storage.getItem(STORAGE_KEYS.DRAFT_POST);
    },

    clearPost: () => {
      Storage.removeItem(STORAGE_KEYS.DRAFT_POST);
    }
  };
}

export default Storage;
