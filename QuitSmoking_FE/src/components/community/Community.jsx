import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import AvatarFromName from '../common/AvatarFromName';
import useMembershipError from "../../hooks/useMembershipError";
import MembershipUpgradeModal from "../common/MembershipUpgradeModal";
import CommentSection from '../community/CommentSection';
import axios from 'axios';

const Community = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, checkAuthSync, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('');
  const [postTypes, setPostTypes] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState(null);
  const [loadingPostTypes, setLoadingPostTypes] = useState(true);
  const [errorPostTypes, setErrorPostTypes] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Sử dụng hook xử lý lỗi membership
  const { showUpgradeModal, errorMessage, handleApiError, closeUpgradeModal } = useMembershipError();
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showGuestActionModal, setShowGuestActionModal] = useState(false);
  const [guestActionMessage, setGuestActionMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    setLeaderboard([
      { id: 1, name: "Nguyễn Văn An", days: 365, savings: 18250000, avatar: "/images/bvlq1.jpg", badge: "🥇" },
      { id: 2, name: "Trần Thị Mai", days: 298, savings: 14900000, avatar: "/images/bvlq2.png", badge: "🥈" },
      { id: 3, name: "Lê Hoàng Nam", days: 256, savings: 12800000, avatar: "/images/bvlq3.webp", badge: "🥉" },
      { id: 4, name: "Phạm Thị Lan", days: 189, savings: 9450000, avatar: "/images/hinh1.png", badge: "🏆" },
      { id: 5, name: "Võ Minh Khoa", days: 156, savings: 7800000, avatar: "/images/hinh2.png", badge: "⭐" },
      { id: 6, name: "Đặng Thị Hoa", days: 134, savings: 6700000, avatar: "/images/hinh3.png", badge: "💪" },
      { id: 7, name: "Bùi Văn Đức", days: 112, savings: 5600000, avatar: "/images/hinh4.png", badge: "🌟" },
      { id: 8, name: "Hoàng Thị Kim", days: 89, savings: 4450000, avatar: "/images/bvlq2.png", badge: "✨" }
    ]);

    const initializePostTypes = () => {
      const availablePostTypes = ['ACHIEVEMENT_SHARE', 'MOTIVATION', 'QUESTION', 'ADVICE'];
      setPostTypes(availablePostTypes);
      if (availablePostTypes.length > 0) {
        setSelectedPostType(availablePostTypes[0]);
      }
      setLoadingPostTypes(false);
    };

    const fetchPostData = async () => {
      try {
        setLoadingPosts(true);
        setErrorPosts(null);

        if (authLoading) return;

        const token = localStorage.getItem('jwt_token');
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:8080/api/community/posts', {
          headers: headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP Error: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const text = await response.text();
        if (!text) {
          throw new Error('Server returned an empty response.');
        }

        const jsonData = JSON.parse(text);

        const mappedJson = jsonData.content.map(post => ({
          id: post.id,
          commentsCount: post.commentsCount,
          content: post.content,
          createdAt: new Date(post.createdAt).toLocaleDateString(),
          likesCount: post.likesCount,
          postType: post.postType,
          title: post.title,
          pictureUrl: post.avatarUrl
              ? (post.avatarUrl.startsWith("http")
                  ? post.avatarUrl
                  : `http://localhost:8080${post.avatarUrl}`)
              : null,
          username: post.username,
          firstName: post.firstName,
          lastName: post.lastName,
          role: post.role,
          membershipPlanId: post.membershipPlanId,
        }));

        if (isMounted) {
          setPosts(mappedJson);
        }
      } catch (error) {
        if (isMounted) {
          setErrorPosts('Không thể tải bài viết: ' + error.message);
        }
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    };

    if (!authLoading) {
      fetchPostData();
    }

    initializePostTypes();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const getFilteredPosts = () => {
    if (selectedFilter === 'ALL') return posts;
    return posts.filter(post => post.postType === selectedFilter);
  };

  const filterPosts = getFilteredPosts();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSubmitPost = async () => {
    if (!isAuthenticated || (user && user.role === 'GUEST' && (!user.membership || user.membership.id === 'FREE_TRIAL_PLAN'))) {
      alert("Bạn không có quyền đăng bài. Vui lòng nâng cấp gói thành viên.");
      navigate('/membership');
      return;
    }

    if (!newPost.trim() || !selectedPostType || !newTitle.trim()) return;
    const now = new Date();
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw new Error('User not authenticated');
      }
      const newPostData = {
        content: newPost,
        postType: selectedPostType,
        title: newTitle,
      };
      const response = await fetch('http://localhost:8080/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPostData),
      });

      const responseData = await response.json();

      if (response.ok) {
        const createdPost = {
          id: responseData.id,
          commentsCount: 0,
          content: newPost,
          createdAt: new Date().toLocaleDateString(),
          likesCount: 0,
          postType: selectedPostType,
          title: newTitle,
          pictureUrl: user.pictureUrl
              ? (user.pictureUrl.startsWith("http")
                  ? user.pictureUrl
                  : `http://localhost:8080${user.pictureUrl}`)
              : null,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          membershipPlanId: user.membershipPlanId,
        };

        setPosts(prevPosts => [createdPost, ...prevPosts]);
        setNewPost('');
        setNewTitle('');
        setSelectedPostType('');
      } else {
        console.error('Failed to create post:', responseData.error);
        throw new Error('Failed to create post: ' + responseData.error);
      }
    } catch (e) {
      console.error("Error creating post", e);
    }
  };

  // Thêm hàm xác định danh hiệu và màu sắc
  const getUserBadge = (role, membershipPlanId) => {
    if (role === 'ADMIN') return { label: 'Quản trị viên', color: 'bg-red-100 text-red-700' };
    if (role === 'COACH') return { label: 'Huấn luyện viên', color: 'bg-blue-100 text-blue-700' };
    if (role === 'MEMBER') {
      if (membershipPlanId === 'PLAN90DAYS') return { label: 'Thành viên VIP', color: 'bg-yellow-100 text-yellow-800' };
      if (membershipPlanId === 'PLAN60DAYS') return { label: 'Thành viên Premium', color: 'bg-purple-100 text-purple-700' };
      // FREE_TRIAL_PLAN, PLAN30DAYS hoặc khác
      return { label: 'Thành viên', color: 'bg-green-100 text-green-700' };
    }
    if (role === 'GUEST') return { label: 'Khách', color: 'bg-gray-100 text-gray-700' };
    return { label: 'Thành viên', color: 'bg-green-100 text-green-700' };
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      await axios.delete(`http://localhost:8080/api/community/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeleteMessage('Đã xóa bài viết thành công!');
    } catch (err) {
      setDeleteMessage('Lỗi khi xóa bài viết!');
    } finally {
      setShowDeleteModal(false);
      setTimeout(() => setDeleteMessage(''), 2000);
    }
  };

  // Hàm mở modal khi guest click vào chức năng bị hạn chế
  const handleGuestAction = (message) => {
    setGuestActionMessage(message);
    setShowGuestActionModal(true);
  };

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8"
      >
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-green-800 mb-4">
              👥 Cộng Đồng QuitSmoking
            </h1>
            <p className="text-xl text-green-700 max-w-3xl mx-auto">
              Kết nối, chia sẻ và hỗ trợ lẫn nhau trong hành trình cai nghiện thuốc lá
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-8"
          >
            <div className="bg-white rounded-lg shadow-md p-1 flex space-x-1">
              {['posts', 'leaderboard'].map((tab) => (
                  <motion.button
                      key={tab}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                          activeTab === tab
                              ? 'bg-green-600 text-white shadow-md'
                              : 'text-gray-600 hover:bg-green-50'
                      }`}
                  >
                    {tab === 'posts' ? '📝 Bài viết' : '🏆 Bảng xếp hạng'}
                  </motion.button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
                <motion.div
                    key="posts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-4 gap-8"
                >
                  {/* Main Content */}
                  <div className="lg:col-span-3 space-y-8 w-full">
                    {/* Create Post */}
                    {isAuthenticated && user && user.role !== 'GUEST' && (
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-green-100"
                        >
                          <h3 className="text-lg font-bold text-green-800 mb-4">
                            ✍️ Chia sẻ với cộng đồng
                          </h3>
                          <motion.input
                              whileFocus={{ scale: 1.01 }}
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              placeholder="Tiêu đề của bạn"
                              className="w-full p-3 sm:p-4 border rounded-lg border-green-200 mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-lg"
                          />
                          <motion.textarea
                              whileFocus={{ scale: 1.01 }}
                              value={newPost}
                              onChange={(e) => setNewPost(e.target.value)}
                              placeholder="Hôm nay bạn cảm thấy thế nào? Chia sẻ tiến trình, câu chuyện hay mẹo hay của bạn..."
                              className="w-full p-3 sm:p-4 border border-green-200 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base sm:text-lg"
                              rows="4"
                          />
                          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-4 gap-2 sm:gap-0">
                            {loadingPostTypes && <p className="text-gray-500">Đang tải loại bài viết...</p>}
                            {errorPostTypes && <p className="text-red-500">Lỗi tải loại bài viết.</p>}
                            {!loadingPostTypes && !errorPostTypes && postTypes.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
                                  {postTypes.map(type => (
                                      <motion.button
                                          key={type}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => setSelectedPostType(type)}
                                          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                                              selectedPostType === type
                                                  ? 'bg-green-600 text-white shadow-sm'
                                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                                          }`}
                                      >
                                        {type}
                                      </motion.button>
                                  ))}
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmitPost}
                                disabled={!newPost.trim() || !selectedPostType || !newTitle.trim()}
                                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md w-full sm:w-auto"
                            >
                              Đăng bài
                            </motion.button>
                          </div>
                        </motion.div>
                    )}

                    {/* Post Filters */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-2 my-4"
                    >
                      {['ALL', 'ACHIEVEMENT_SHARE', 'MOTIVATION', 'QUESTION', 'ADVICE'].map((filter) => (
                          <motion.button
                              key={filter}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedFilter(filter)}
                              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                                  selectedFilter === filter
                                      ? filter === 'ALL' ? 'bg-green-600 text-white' :
                                          filter === 'ACHIEVEMENT_SHARE' ? 'bg-yellow-500 text-white' :
                                              filter === 'MOTIVATION' ? 'bg-blue-500 text-white' :
                                                  filter === 'QUESTION' ? 'bg-purple-500 text-white' :
                                                      'bg-green-500 text-white'
                                      : filter === 'ALL' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                          filter === 'ACHIEVEMENT_SHARE' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                              filter === 'MOTIVATION' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                  filter === 'QUESTION' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                                                      'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                          >
                            {filter}
                          </motion.button>
                      ))}
                    </motion.div>

                    {/* Posts List */}
                    <div className="space-y-6">
                      {loadingPosts && (
                          <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center text-gray-500"
                          >
                            Đang tải bài viết...
                          </motion.div>
                      )}

                      {errorPosts && (
                          <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center text-red-500"
                          >
                            {errorPosts}
                          </motion.div>
                      )}

                      {!loadingPosts && !errorPosts && filterPosts.length === 0 && (
                          <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center text-gray-500"
                          >
                            Chưa có bài viết nào trong danh mục này.
                          </motion.div>
                      )}

                      {!loadingPosts && !errorPosts && filterPosts.length > 0 && (
                          <AnimatePresence>
                            {filterPosts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -3 }}
                                    className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition duration-300 border border-green-100 w-full"
                                >
                                  {/* Post Header */}
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                                    {post.pictureUrl ? (
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            src={post.pictureUrl.startsWith("http")
                                                ? post.pictureUrl
                                                : `http://localhost:8080${post.pictureUrl}`}
                                            alt={post.username}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                                        />
                                    ) : (
                                        <motion.div whileHover={{ scale: 1.05 }}>
                                          <AvatarFromName
                                              firstName={post.firstName || post.username?.split(' ')[0]}
                                              lastName={post.lastName || post.username?.split(' ')[1] || ''}
                                              size={48}
                                              className="border-2 border-green-200"
                                          />
                                        </motion.div>
                                    )}
                                    <div className="flex-1 w-full">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                                        <h4 className="font-bold text-gray-800 text-base sm:text-lg">{post.username}</h4>
                                        {(() => {
                                          const badge = getUserBadge(post.role, post.membershipPlanId);
                                          return (
                                            <span className={`text-xs px-2 py-1 rounded-full mt-1 sm:mt-0 font-semibold ${badge.color}`}>
                                              {badge.label}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1">
                                        <span>🗓️ {post.createdAt}</span>
                                      </div>
                                    </div>
                                    <div className="text-right mt-2 sm:mt-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.postType === 'ACHIEVEMENT_SHARE' ? 'bg-yellow-100 text-yellow-700' :
                      post.postType === 'MOTIVATION' ? 'bg-blue-100 text-blue-700' :
                          post.postType === 'QUESTION' ? 'bg-purple-100 text-purple-700' :
                              post.postType === 'ADVICE' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
              }`}>
                {postTypes.find(type => type === post.postType)}
              </span>
                                    </div>
                                  </div>

                                  {/* Post Content */}
                                  <div className="mb-4">
                                    <h5 className="font-bold text-base sm:text-lg text-green-800">{post.title}</h5>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                                      {post.content}
                                    </p>
                                  </div>

                                  {/* Post Actions */}
                                  <div className="flex flex-wrap items-center space-x-4 space-y-2 sm:space-y-0 pt-4 border-t border-gray-100">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`flex items-center space-x-2 text-gray-600 transition duration-300 ${user && user.role === 'GUEST' ? 'opacity-60 cursor-not-allowed' : 'hover:text-red-500'}`}
                                        onClick={user && user.role === 'GUEST' ? () => handleGuestAction('Bạn cần đăng ký thành viên để thả tim bài viết!') : undefined}
                                        disabled={user && user.role === 'GUEST'}
                                    >
                                      <span className="text-lg">❤️</span>
                                      <span className="text-sm">{post.likesCount}</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`flex items-center space-x-2 transition duration-300 ${user && user.role === 'GUEST' ? 'opacity-60 cursor-not-allowed' : expandedPostId === post.id ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
                                        onClick={user && user.role === 'GUEST' ? () => handleGuestAction('Bạn cần đăng ký thành viên để bình luận!') : () => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                        disabled={user && user.role === 'GUEST'}
                                    >
                                      <span className="text-lg">💬</span>
                                      <span className="text-sm">Bình luận</span>
                                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{post.commentsCount}</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`flex items-center space-x-2 text-gray-600 transition duration-300 ${user && user.role === 'GUEST' ? 'opacity-60 cursor-not-allowed' : 'hover:text-purple-500'}`}
                                        onClick={user && user.role === 'GUEST' ? () => handleGuestAction('Bạn cần đăng ký thành viên để chia sẻ bài viết!') : undefined}
                                        disabled={user && user.role === 'GUEST'}
                                    >
                                      <span className="text-lg">🔗</span>
                                      <span className="text-sm">Chia sẻ</span>
                                    </motion.button>

                                    {user && user.role === 'ADMIN' && (
                                      <button
                                        onClick={() => { setShowDeleteModal(true); setPostToDelete(post.id); }}
                                        className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold hover:bg-red-200 transition"
                                      >
                                        Xóa
                                      </button>
                                    )}
                                  </div>

                                  {/* Expanded Comment Section */}
                                  {expandedPostId === post.id && user && user.role !== 'GUEST' && (
                                      <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="mt-4"
                                      >
                                        <CommentSection postId={post.id} />
                                      </motion.div>
                                  )}
                                </motion.div>
                            ))}
                          </AnimatePresence>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-xl shadow-md p-6 border border-green-100"
                    >
                      <h3 className="text-lg font-bold text-green-800 mb-4">📊 Thống kê cộng đồng</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thành viên hoạt động</span>
                          <span className="font-bold text-green-600">12,547</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bài viết hôm nay</span>
                          <span className="font-bold text-blue-600">156</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thành công trong tháng</span>
                          <span className="font-bold text-purple-600">1,234</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Top Contributors */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-xl shadow-md p-6 border border-green-100"
                    >
                      <h3 className="text-lg font-bold text-green-800 mb-4">⭐ Người đóng góp tích cực</h3>
                      {loadingLeaderboard && <div className="text-center text-gray-500">Đang tải bảng xếp hạng...</div>}
                      {errorLeaderboard && <div className="text-center text-red-500">{errorLeaderboard}</div>}
                      {!loadingLeaderboard && !errorLeaderboard && leaderboard.length === 0 && (
                          <div className="text-center text-gray-500">Không có dữ liệu bảng xếp hạng.</div>
                      )}
                      {!loadingLeaderboard && !errorLeaderboard && leaderboard.length > 0 && (
                          <div className="space-y-3">
                            {leaderboard.slice(0, 5).map((member, index) => (
                                <motion.div
                                    key={member.id}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center space-x-3 p-2 hover:bg-green-50 rounded-lg transition duration-300"
                                >
                                  <div className="text-lg">{member.badge}</div>
                                  <img
                                      src={member.avatar}
                                      alt={member.name}
                                      className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">{member.name}</p>
                                    <p className="text-xs text-gray-500">{member.days} ngày</p>
                                  </div>
                                </motion.div>
                            ))}
                          </div>
                      )}
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -3 }}
                        className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 border border-green-200 shadow-md"
                    >
                      <h3 className="text-lg font-bold text-green-800 mb-4">📚 Tài nguyên hữu ích</h3>
                      <div className="space-y-3">
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300"
                        >
                          <Link to="/plan" className="block w-full h-full">
                            <div className="font-medium text-gray-800">🎯 Lập kế hoạch cai thuốc</div>
                            <div className="text-sm text-gray-600">Tạo lộ trình phù hợp với bạn</div>
                          </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300"
                        >
                          <Link to="/coach-consultation" className="block w-full h-full">
                            <div className="font-medium text-gray-800">👨‍⚕️ Tư vấn chuyên gia</div>
                            <div className="text-sm text-gray-600">Nhận hỗ trợ từ chuyên gia</div>
                          </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ x: 5 }}
                            className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300"
                        >
                          <Link to="/achievements" className="block w-full h-full">
                            <div className="font-medium text-gray-800">🏆 Huy hiệu thành tích</div>
                            <div className="text-sm text-gray-600">Xem tiến trình và thành tựu</div>
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
            )}

            {activeTab === 'leaderboard' && (
                <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl mx-auto"
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-100">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                      <h2 className="text-2xl font-bold text-center">🏆 Bảng Xếp Hạng Cộng Đồng</h2>
                      <p className="text-center text-green-100 mt-2">Những người hùng trong hành trình cai nghiện thuốc lá</p>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {leaderboard.slice(0, 3).map((member, index) => (
                            <motion.div
                                key={member.id}
                                whileHover={{ scale: 1.03 }}
                                className={`text-center p-6 rounded-xl ${
                                    index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300' :
                                            'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300'
                                }`}
                            >
                              <div className="text-4xl mb-2">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </div>
                              <motion.img
                                  whileHover={{ scale: 1.1 }}
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-lg"
                              />
                              <h3 className="font-bold text-gray-800">{member.name}</h3>
                              <p className="text-lg font-bold text-green-600 mt-2">{member.days} ngày</p>
                              <p className="text-sm text-gray-600">{formatCurrency(member.savings)} tiết kiệm</p>
                            </motion.div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {leaderboard.slice(3).map((member, index) => (
                            <motion.div
                                key={member.id}
                                whileHover={{ x: 5 }}
                                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition duration-300"
                            >
                              <div className="text-2xl mr-4">#{index + 4}</div>
                              <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-green-200"
                              />
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{member.name}</h4>
                                <p className="text-sm text-gray-600">{member.days} ngày không hút thuốc</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{formatCurrency(member.savings)}</p>
                                <p className="text-sm text-gray-500">tiết kiệm</p>
                              </div>
                              <div className="ml-4 text-2xl">{member.badge}</div>
                            </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Membership Upgrade Modal */}
          <MembershipUpgradeModal 
            isOpen={showUpgradeModal}
            onClose={closeUpgradeModal}
            message={errorMessage}
          />

          {/* Modal xác nhận xóa bài viết */}
          {showDeleteModal && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 relative">
                <h3 className="text-lg font-semibold text-red-700 mb-4">Xác nhận xóa bài viết</h3>
                <p className="mb-6 text-gray-700">Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleDeletePost(postToDelete)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thông báo xóa thành công/lỗi */}
          {deleteMessage && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100]">
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
                {deleteMessage}
              </div>
            </div>
          )}

          {/* Modal thông báo cho guest */}
          <MembershipUpgradeModal isOpen={showGuestActionModal} onClose={() => setShowGuestActionModal(false)} message={guestActionMessage} />
        </div>
      </motion.div>
    );
};

export default Community;