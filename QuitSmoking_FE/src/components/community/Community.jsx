import React, { useState, useEffect } from 'react';
// import AuthService from "../../services/authService.js"; // Removed due to resolution error
import { Link } from 'react-router-dom';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);
  const user = { firstName: "Mock", lastName: "Mock", username: "mockuser" };
  return { isAuthenticated, loading, user };
};


const Community = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedPostType, setSelectedPostType] = useState('');
  const [postTypes, setPostTypes] = useState([]);
  // const Username = AuthService.getCurrentUser()?.username;

  // States cho loading/error của posts và leaderboard (mock data nên có thể giữ false)
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState(null);

  // Thêm states cho loading/error của postTypes
  const [loadingPostTypes, setLoadingPostTypes] = useState(true); // Ban đầu là true vì sẽ fetch
  const [errorPostTypes, setErrorPostTypes] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // useEffect để fetch post types và khởi tạo dữ liệu mock
  useEffect(() => {
    let isMounted = true;

    // Mock data for leaderboard
    setLeaderboard([
      { id: 1, name: "Nguyễn Văn An", days: 365, savings: 18250000, avatar: "/images/1.png", badge: "🥇" },
      { id: 2, name: "Trần Thị Mai", days: 298, savings: 14900000, avatar: "/images/20.png", badge: "🥈" },
      { id: 3, name: "Lê Hoàng Nam", days: 256, savings: 12800000, avatar: "/images/22.png", badge: "🥉" },
      { id: 4, name: "Phạm Thị Lan", days: 189, savings: 9450000, avatar: "/images/hinh1.png", badge: "🏆" },
      { id: 5, name: "Võ Minh Khoa", days: 156, savings: 7800000, avatar: "/images/hinh2.png", badge: "⭐" },
      { id: 6, name: "Đặng Thị Hoa", days: 134, savings: 6700000, avatar: "/images/hinh3.png", badge: "💪" },
      { id: 7, name: "Bùi Văn Đức", days: 112, savings: 5600000, avatar: "/images/hinh4.png", badge: "🌟" },
      { id: 8, name: "Hoàng Thị Kim", days: 89, savings: 4450000, avatar: "/images/bvlq2.png", badge: "✨" }
    ]);


    // Thay đổi logic fetchPostTypes
    const initializePostTypes = () => {
      // Dựa trên các button lọc có sẵn, đây là các PostType mà bạn có thể muốn hiển thị
      const availablePostTypes = ['ACHIEVEMENT_SHARE', 'MOTIVATION', 'QUESTION', 'ADVICE'];
      setPostTypes(availablePostTypes);
      if (availablePostTypes.length > 0) {
        setSelectedPostType(availablePostTypes[0]); // Đặt giá trị mặc định
      }
      setLoadingPostTypes(false);
    };

    const fetchPostData = async () => {
      try {
        setLoadingPosts(true);
        setErrorPosts(null);

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

        // Check if the response has content before parsing as JSON
        const text = await response.text(); // Read as text first
        if (!text) {
          throw new Error('Server returned an empty response.');
        }

        const jsonData = JSON.parse(text); // Parse as JSON only if content exists
        console.log(jsonData);

        const mappedJson = jsonData.content.map(post => ({
          id: post.id,
          commentsCount: post.commentsCount,
          content: post.content,
          createdAt: new Date(post.createdAt).toLocaleDateString(),
          likesCount: post.likesCount,
          postType: post.postType,
          title: post.title,
          pictureUrl: post.pictureUrl,
          username: post.username,
        }));

        if (isMounted) {
          setPosts(mappedJson);
        }
      } catch (error) {
        if (isMounted) {
          setErrorPosts('Không thể tải bài viết: ' + error.message);
          console.error('Error fetching posts:', error);
        }
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    };

    fetchPostData().then(() => setLoadingPosts(false));
    initializePostTypes(); // Gọi hàm khởi tạo loại bài viết thay vì fetch API

    return () => {
      isMounted = false;
    };
  }, []);

  const getFilteredPosts = () => {
    if (selectedFilter === 'ALL') return posts;
    return posts.filter(post => post.postType === selectedFilter);
  };

  const filterPosts = getFilteredPosts();

  // Hàm format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm xử lý khi gửi bài viết mới
  const handleSubmitPost = async () => {
    if (!newPost.trim() || !selectedPostType || !newTitle.trim()) return;
    const now = new Date();
    try {
      const token = localStorage.getItem('jwt_token'); // Lấy token từ localStorage
      if (!token) {
        throw new Error('User not authenticated');
      }
      const newPostData = {
        content: newPost,
        postType: selectedPostType,
        title: newTitle,
        // Bạn có thể không cần gửi createdAt từ frontend nếu backend tự tạo
        // createdAt: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      };
      const response = await fetch('http://localhost:8080/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPostData),
      });

      const responseData = await response.json(); // Server giờ trả về JSON

      if (response.ok) {
        console.log(responseData.message); // Truy cập thuộc tính 'message' từ JSON
        // Tạo đối tượng bài viết mới với cấu trúc tương tự như khi fetch
        // Đảm bảo các trường như 'id', 'commentsCount', 'likesCount', 'createdAt', 'username', 'pictureUrl'
        // được cung cấp bởi server hoặc mock cho mục đích hiển thị ngay lập tức.
        // Ở đây, tôi đang giả định server trả về đối tượng bài viết hoàn chỉnh.
        const createdPost = {
          id: responseData.id, // Giả sử server trả về id của bài viết mới
          commentsCount: 0, // Mặc định là 0 khi mới tạo
          content: newPost,
          createdAt: new Date().toLocaleDateString(), // Ngày tạo hiện tại
          likesCount: 0, // Mặc định là 0 khi mới tạo
          postType: selectedPostType,
          title: newTitle,
          pictureUrl: user.pictureUrl || "/images/default-avatar.png", // Sử dụng avatar của user hoặc default
          username: user.username, // Sử dụng username từ useAuth hook
        };

        setPosts(prevPosts => [createdPost, ...prevPosts]); // Thêm bài viết mới vào đầu danh sách
        setNewPost('');
        setNewTitle('');
        setSelectedPostType(''); // Reset loại bài viết đã chọn sau khi đăng
      } else {
        // Log thông báo lỗi từ thuộc tính 'error' của JSON
        console.error('Failed to create post:', responseData.error);
        throw new Error('Failed to create post: ' + responseData.error);
      }
    } catch (e) {
      console.error("Error creating post", e);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              👥 Cộng Đồng QuitSmoking
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kết nối, chia sẻ và hỗ trợ lẫn nhau trong hành trình cai nghiện thuốc lá
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2">
              <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === 'posts'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-green-50'
                  }`}
              >
                📝 Bài viết
              </button>
              <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === 'leaderboard'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-green-50'
                  }`}
              >
                🏆 Bảng xếp hạng
              </button>
            </div>
          </div>

          {activeTab === 'posts' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                  {/* Create Post */}
                  {isAuthenticated && (
                      <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                          ✍️ Chia sẻ với cộng đồng
                        </h3>
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Tiêu đề của bạn " className="w-full p-4 border rounded-lg border-gray-200 mb-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"></input>
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Hôm nay bạn cảm thấy thế nào? Chia sẻ tiến trình, câu chuyện hay mẹo hay của bạn..."
                            className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows="4"
                        />
                        <div className="flex justify-between items-center mt-4">
                          {loadingPostTypes && <p className="text-gray-500">Đang tải loại bài viết...</p>}
                          {errorPostTypes && <p className="text-red-500">Lỗi tải loại bài viết.</p>}
                          {!loadingPostTypes && !errorPostTypes && postTypes.length > 0 && (
                              <div className="flex flex-wrap gap-2"> {/* Changed from select to div with buttons */}
                                {postTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedPostType(type)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            selectedPostType === type
                                                ? 'bg-green-600 text-white' // Highlight selected
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // Default style
                                        }`}
                                    >
                                      {type}
                                    </button>
                                ))}
                              </div>
                          )}

                          <button
                              onClick={handleSubmitPost}
                              disabled={!newPost.trim() || !selectedPostType || !newTitle.trim()} // Disable if title is empty
                              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Đăng bài
                          </button>
                        </div>
                      </div>
                  )}

                  {/* Phần lọc bài viết */}
                  <div className="flex flex-wrap gap-2 my-4">
                    <button
                        onClick={() => setSelectedFilter('ALL')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedFilter === 'ALL'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      ALL
                    </button>
                    <button
                        onClick={() => setSelectedFilter('ACHIEVEMENT_SHARE')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedFilter === 'ACHIEVEMENT_SHARE'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                    >
                      ACHIEVEMENT_SHARE
                    </button>
                    <button
                        onClick={() => setSelectedFilter('MOTIVATION')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedFilter === 'MOTIVATION'
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      MOTIVATION
                    </button>
                    <button
                        onClick={() => setSelectedFilter('QUESTION')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedFilter === 'QUESTION'
                                ? 'bg-purple-500 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                    >
                      QUESTION
                    </button>
                    <button
                        onClick={() => setSelectedFilter('ADVICE')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedFilter === 'ADVICE'
                                ? 'bg-green-500 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                      ADVICE
                    </button>
                  </div>

                  {/* Posts */}
                  <div className="space-y-6">
                    {loadingPosts && <div className="text-center text-gray-500">Đang tải bài viết...</div>}
                    {errorPosts && <div className="text-center text-red-500">{errorPosts}</div>}
                    {!loadingPosts && !errorPosts && filterPosts.length === 0 && (
                        <div className="text-center text-gray-500">Chưa có bài viết nào trong danh mục này.</div>
                    )}
                    {!loadingPosts && !errorPosts && filterPosts.length > 0 && filterPosts.map(post => (
                        <div key={post.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
                          {/* Post Header */}
                          <div className="flex items-start space-x-4 mb-4">
                            <img
                                src={post.pictureUrl || "/images/default-avatar.png"} // Fallback for pictureUrl
                                alt={post.username}
                                className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-gray-800">{post.username}</h4>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Active Member
                          </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>🗓️ {post.createdAt}</span>
                              </div>
                            </div>
                            <div className="text-right">
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
                            <h5 className="font-bold text-lg">{post.title}</h5>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {post.content}
                            </p>
                          </div>

                          {/* Post Actions */}
                          <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition duration-300">
                              <span>❤️</span>
                              <span>{post.likesCount}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition duration-300">
                              <span>💬</span>
                              <span>{post.commentsCount}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition duration-300">
                              <span>🔗</span>
                              <span>Chia sẻ</span>
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Thống kê cộng đồng</h3>
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
                  </div>

                  {/* Top Contributors */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">⭐ Người đóng góp tích cực</h3>
                    {loadingLeaderboard && <div className="text-center text-gray-500">Đang tải bảng xếp hạng...</div>}
                    {errorLeaderboard && <div className="text-center text-red-500">{errorLeaderboard}</div>}
                    {!loadingLeaderboard && !errorLeaderboard && leaderboard.length === 0 && (
                        <div className="text-center text-gray-500">Không có dữ liệu bảng xếp hạng.</div>
                    )}
                    {!loadingLeaderboard && !errorLeaderboard && leaderboard.length > 0 && (
                        <div className="space-y-3">
                          {leaderboard.slice(0, 5).map((member, index) => (
                              <div key={member.id} className="flex items-center space-x-3">
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
                              </div>
                          ))}
                        </div>
                    )}
                  </div>

                  {/* Resources */}
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📚 Tài nguyên hữu ích</h3>
                    <div className="space-y-3">
                      <Link to="/plan" className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300">
                        <div className="font-medium text-gray-800">🎯 Lập kế hoạch cai thuốc</div>
                        <div className="text-sm text-gray-600">Tạo lộ trình phù hợp với bạn</div>
                      </Link>
                      <Link to="/coach-consultation" className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300">
                        <div className="font-medium text-gray-800">👨‍⚕️ Tư vấn chuyên gia</div>
                        <div className="text-sm text-gray-600">Nhận hỗ trợ từ chuyên gia</div>
                      </Link>
                      <Link to="/achievements" className="block p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300">
                        <div className="font-medium text-gray-800">🏆 Huy hiệu thành tích</div>
                        <div className="text-sm text-gray-600">Xem tiến trình và thành tựu</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>)}

          {activeTab === 'leaderboard' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                    <h2 className="text-2xl font-bold text-center">🏆 Bảng Xếp Hạng Cộng Đồng</h2>
                    <p className="text-center text-green-100 mt-2">Những người hùng trong hành trình cai nghiện thuốc lá</p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {leaderboard.slice(0, 3).map((member, index) => (
                          <div
                              key={member.id}
                              className={`text-center p-6 rounded-xl ${
                                  index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300' :
                                      index === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300' :
                                          'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300'
                              }`}
                          >
                            <div className="text-4xl mb-2">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                            <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-lg"
                            />
                            <h3 className="font-bold text-gray-800">{member.name}</h3>
                            <p className="text-lg font-bold text-green-600 mt-2">{member.days} ngày</p>
                            <p className="text-sm text-gray-600">{formatCurrency(member.savings)} tiết kiệm</p>
                          </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {leaderboard.slice(3).map((member, index) => (
                          <div key={member.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
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
                          </div>
                      ))}\
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default Community;