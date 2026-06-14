/**
 * API 请求封装
 * 统一管理所有云函数调用
 */

class API {
  /**
   * 调用云函数
   * @param {string} name - 云函数名称
   * @param {object} data - 请求数据
   * @returns {Promise}
   */
  static callFunction(name, data = {}) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name,
        data,
        success: res => {
          if (res.result.code === 0 || res.result.success) {
            resolve(res.result);
          } else {
            reject(new Error(res.result.message || '请求失败'));
          }
        },
        fail: err => {
          console.error(`云函数 ${name} 调用失败:`, err);
          reject(err);
        }
      });
    });
  }

  /**
   * 景区相关接口
   */
  static scenic = {
    // 搜索景区
    search: (filter, page = 1) => {
      return API.callFunction('searchScenic', { filter, page });
    },

    // 获取景区详情
    getDetail: (scenicAreaId) => {
      return API.callFunction('getScenicDetail', { scenicAreaId });
    },

    // 获取推荐景区
    getRecommendation: (userLocation, userPreferences, limit = 10) => {
      return API.callFunction('getRecommendation', {
        userLocation,
        userPreferences,
        limit
      });
    },

    // 获取附近景区
    getNearby: (location, radius = 5000) => {
      return API.callFunction('getNearbyScenic', { location, radius });
    }
  };

  /**
   * 设施相关接口
   */
  static facility = {
    // 搜索设施
    search: (scenicAreaId, type, filter, page = 1) => {
      return API.callFunction('searchFacilities', {
        scenicAreaId,
        type,
        filter,
        page
      });
    },

    // 获取设施详情
    getDetail: (facilityId) => {
      return API.callFunction('getFacilityDetail', { facilityId });
    },

    // 获取景区内所有设施
    getByScenicArea: (scenicAreaId) => {
      return API.callFunction('getFacilitiesByScenicArea', { scenicAreaId });
    },

    // 获取设施统计
    getStats: (scenicAreaId) => {
      return API.callFunction('getFacilityStats', { scenicAreaId });
    }
  };

  /**
   * 路线规划相关接口
   */
  static route = {
    // 规划路线
    plan: (startPoint, endPoints, preferences) => {
      return API.callFunction('planRoute', {
        startPoint,
        endPoints,
        preferences
      });
    },

    // 获取路线详情
    getDetail: (routeId) => {
      return API.callFunction('getRouteDetail', { routeId });
    },

    // 获取推荐路线
    getRecommended: (scenicAreaId, userPreferences, limit = 5) => {
      return API.callFunction('getRecommendedRoutes', {
        scenicAreaId,
        userPreferences,
        limit
      });
    },

    // 评价路线
    rate: (routeId, rating, review) => {
      return API.callFunction('rateRoute', { routeId, rating, review });
    },

    // 收藏路线
    favorite: (routeId) => {
      return API.callFunction('favoriteRoute', { routeId });
    },

    // 取消收藏
    unfavorite: (routeId) => {
      return API.callFunction('unfavoriteRoute', { routeId });
    }
  };

  /**
   * 用户相关接口
   */
  static user = {
    // 获取用户信息
    getProfile: () => {
      return API.callFunction('getUserProfile', {});
    },

    // 更新用户偏好
    updatePreferences: (preferences) => {
      return API.callFunction('updateUserPreferences', { preferences });
    },

    // 获取用户历史
    getHistory: (page = 1, limit = 20) => {
      return API.callFunction('getUserHistory', { page, limit });
    },

    // 获取用户收藏
    getFavorites: (type, page = 1, limit = 20) => {
      return API.callFunction('getUserFavorites', { type, page, limit });
    },

    // 更新用户信息
    updateProfile: (userInfo) => {
      return API.callFunction('updateUserProfile', { userInfo });
    },

    // 添加紧急联系人
    addEmergencyContact: (contact) => {
      return API.callFunction('addEmergencyContact', { contact });
    },

    // 删除紧急联系人
    removeEmergencyContact: (contactId) => {
      return API.callFunction('removeEmergencyContact', { contactId });
    }
  };

  /**
   * 社区相关接口
   */
  static community = {
    // 获取社区帖子
    getPosts: (category, page = 1, limit = 20, sortBy = 'latest') => {
      return API.callFunction('getCommunityPosts', {
        category,
        page,
        limit,
        sortBy
      });
    },

    // 获取帖子详情
    getPostDetail: (postId) => {
      return API.callFunction('getCommunityPostDetail', { postId });
    },

    // 创建帖子
    createPost: (post) => {
      return API.callFunction('createCommunityPost', { post });
    },

    // 删除帖子
    deletePost: (postId) => {
      return API.callFunction('deleteCommunityPost', { postId });
    },

    // 点赞帖子
    likePost: (postId) => {
      return API.callFunction('likePost', { postId });
    },

    // 取消点赞
    unlikePost: (postId) => {
      return API.callFunction('unlikePost', { postId });
    },

    // 获取评论
    getComments: (postId, page = 1, limit = 20) => {
      return API.callFunction('getPostComments', {
        postId,
        page,
        limit
      });
    },

    // 添加评论
    addComment: (postId, comment) => {
      return API.callFunction('addPostComment', { postId, comment });
    },

    // 删除评论
    deleteComment: (commentId) => {
      return API.callFunction('deletePostComment', { commentId });
    }
  };

  /**
   * 反馈相关接口
   */
  static feedback = {
    // 提交设施问题反馈
    submitFacilityIssue: (facilityId, type, description, photos) => {
      return API.callFunction('submitFeedback', {
        type: 'facility_issue',
        facilityId,
        issueType: type,
        description,
        photos
      });
    },

    // 获取反馈列表
    getFeedbacks: (status, page = 1, limit = 20) => {
      return API.callFunction('getFeedbacks', { status, page, limit });
    },

    // 获取反馈详情
    getFeedbackDetail: (feedbackId) => {
      return API.callFunction('getFeedbackDetail', { feedbackId });
    }
  };

  /**
   * 上传文件
   * @param {string} filePath - 本地文件路径
   * @param {string} cloudPath - 云端路径
   * @returns {Promise}
   */
  static uploadFile(filePath, cloudPath) {
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => {
          resolve(res);
        },
        fail: err => {
          console.error('文件上传失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 下载文件
   * @param {string} fileID - 云文件 ID
   * @returns {Promise}
   */
  static downloadFile(fileID) {
    return new Promise((resolve, reject) => {
      wx.cloud.downloadFile({
        fileID,
        success: res => {
          resolve(res);
        },
        fail: err => {
          console.error('文件下载失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 删除文件
   * @param {array} fileList - 文件 ID 列表
   * @returns {Promise}
   */
  static deleteFile(fileList) {
    return new Promise((resolve, reject) => {
      wx.cloud.deleteFile({
        fileList,
        success: res => {
          resolve(res);
        },
        fail: err => {
          console.error('文件删除失败:', err);
          reject(err);
        }
      });
    });
  }
}

export default API;
