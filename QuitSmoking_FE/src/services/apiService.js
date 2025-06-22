import { apiClient } from "./authService";
import config from "../config/config";

const apiService = {
  // User Profile
  getUserProfile: async () => {
    const response = await apiClient.get(config.endpoints.userProfile);
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await apiClient.put(
      config.endpoints.updateProfile,
      profileData
    );
    return response.data;
  },

  // Generic HTTP methods
  get: async (url) => {
    const response = await apiClient.get(url);
    return response.data;
  },

  post: async (url, data) => {
    const response = await apiClient.post(url, data);
    return response.data;
  },

  put: async (url, data) => {
    const response = await apiClient.put(url, data);
    return response.data;
  },

  delete: async (url) => {
    const response = await apiClient.delete(url);
    return response.data;
  },

  // Smoking Status
  getSmokingStatus: async () => {
    const response = await apiClient.get(config.endpoints.smokingStatus);
    return response.data;
  },

  createSmokingStatus: async (statusData) => {
    const response = await apiClient.post(
      config.endpoints.smokingStatus,
      statusData
    );
    return response.data;
  },

  updateSmokingStatus: async (statusData) => {
    const response = await apiClient.put(
      config.endpoints.smokingStatus,
      statusData
    );
    return response.data;
  },

  // Quit Plans
  getQuitPlans: async () => {
    const response = await apiClient.get(config.endpoints.quitPlans);
    return response.data;
  },

  createQuitPlan: async (planData) => {
    const response = await apiClient.post(config.endpoints.quitPlans, planData);
    return response.data;
  },

  updateQuitPlan: async (planId, planData) => {
    const response = await apiClient.put(
      `${config.endpoints.quitPlans}/${planId}`,
      planData
    );
    return response.data;
  },

  deleteQuitPlan: async (planId) => {
    const response = await apiClient.delete(
      `${config.endpoints.quitPlans}/${planId}`
    );
    return response.data;
  },

  generateQuitPlan: async (preferences) => {
    const response = await apiClient.post(
      `${config.endpoints.quitPlans}/generate`,
      preferences
    );
    return response.data;
  },

  // Daily Progress
  getDailyProgress: async (page = 0, size = 10) => {
    const response = await apiClient.get(
      `${config.endpoints.dailyProgress}?page=${page}&size=${size}`
    );
    return response.data;
  },

  createDailyProgress: async (progressData) => {
    const response = await apiClient.post(
      config.endpoints.dailyProgress,
      progressData
    );
    return response.data;
  },

  updateDailyProgress: async (progressId, progressData) => {
    const response = await apiClient.put(
      `${config.endpoints.dailyProgress}/${progressId}`,
      progressData
    );
    return response.data;
  },

  getProgressStats: async () => {
    const response = await apiClient.get(
      `${config.endpoints.dailyProgress}/stats`
    );
    return response.data;
  },

  // Achievements
  getAllAchievements: async () => {
    const response = await apiClient.get(config.endpoints.achievements);
    return response.data;
  },

  getUserAchievements: async () => {
    const response = await apiClient.get(config.endpoints.userAchievements);
    return response.data;
  },

  // Community
  getCommunityPosts: async (page = 0, size = 10) => {
    const response = await apiClient.get(
      `${config.endpoints.communityPosts}?page=${page}&size=${size}`
    );
    return response.data;
  },

  createCommunityPost: async (postData) => {
    const response = await apiClient.post(
      config.endpoints.communityPosts,
      postData
    );
    return response.data;
  },

  updateCommunityPost: async (postId, postData) => {
    const response = await apiClient.put(
      `${config.endpoints.communityPosts}/${postId}`,
      postData
    );
    return response.data;
  },

  deleteCommunityPost: async (postId) => {
    const response = await apiClient.delete(
      `${config.endpoints.communityPosts}/${postId}`
    );
    return response.data;
  },

  getPostComments: async (postId) => {
    const response = await apiClient.get(
      `${config.endpoints.communityComments}/${postId}`
    );
    return response.data;
  },

  createComment: async (postId, commentData) => {
    const response = await apiClient.post(
      `${config.endpoints.communityComments}/${postId}`,
      commentData
    );
    return response.data;
  },

  likePost: async (postId) => {
    const response = await apiClient.post(
      `${config.endpoints.communityPosts}/${postId}/like`
    );
    return response.data;
  },

  // Coach Consultation
  getConsultations: async (page = 0, size = 10) => {
    const response = await apiClient.get(
      `${config.endpoints.consultations}?page=${page}&size=${size}`
    );
    return response.data;
  },

  createConsultation: async (consultationData) => {
    const response = await apiClient.post(
      config.endpoints.consultations,
      consultationData
    );
    return response.data;
  },

  getChatMessages: async (consultationId, page = 0, size = 20) => {
    const response = await apiClient.get(
      `${config.endpoints.chatMessages}/${consultationId}?page=${page}&size=${size}`
    );
    return response.data;
  },

  sendMessage: async (consultationId, messageData) => {
    const response = await apiClient.post(`${config.endpoints.chatMessages}`, {
      consultationId,
      ...messageData,
    });
    return response.data;
  },

  markMessagesRead: async (consultationId, userId) => {
    const response = await apiClient.put(
      `${config.endpoints.chatMessages}/${consultationId}/mark-read?userId=${userId}`
    );
    return response.data;
  },

  // Membership
  getMembershipPlans: async () => {
    const response = await apiClient.get(config.endpoints.membershipPlans);
    return response.data;
  },

  getCurrentMembership: async () => {
    const response = await apiClient.get(
      `${config.endpoints.membership}/current`
    );
    return response.data;
  },

  registerFreeMembership: async () => {
    const response = await apiClient.post(config.endpoints.freeMembership);
    return response.data;
  },

  upgradeMembership: async (upgradeRequestData) => {
    // Nâng cấp lên một gói thành viên có phí
    // API có thể yêu cầu planId hoặc một payload chi tiết hơn
    // Dựa trên config, endpoint là `/api/membership/upgrade`, có thể cần truyền planId trong body hoặc URL.
    // Giả sử API nhận { planId: "..." } trong body
    const response = await apiClient.post(
      config.endpoints.upgradeMembership,
      upgradeRequestData
    );

    return response.data;
  },

  getMembershipTransactions: async () => {
    const response = await apiClient.get(
      `${config.endpoints.membership}/transactions`
    );
    return response.data;
  },

  // Notifications
  getNotifications: async (page = 0, size = 10) => {
    const response = await apiClient.get(
      `${config.endpoints.notifications}?page=${page}&size=${size}`
    );
    return response.data;
  },

  markNotificationRead: async (notificationId) => {
    const response = await apiClient.put(
      `${config.endpoints.notifications}/${notificationId}/read`
    );
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.put(
      `${config.endpoints.notifications}/mark-all-read`
    );
    return response.data;
  },

  // User Settings
  getUserSettings: async () => {
    const response = await apiClient.get(config.endpoints.userSettings);
    return response.data;
  },

  updateUserSettings: async (settings) => {
    const response = await apiClient.put(
      config.endpoints.userSettings,
      settings
    );
    return response.data;
  },

  // Dashboard Statistics
  getDashboardStats: async () => {
    const response = await apiClient.get("/api/dashboard/stats");
    return response.data;
  },
};

export default apiService;
