import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Community = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  useEffect(() => {
    setPosts([
      {
        id: 1,
        author: {
          name: "Nguyễn Văn An",
          avatar: "/images/1.png",
          days: 365,
          level: "Master Quitter"
        },
        content: "Hôm nay tròn 1 năm tôi không hút thuốc! Cảm ơn cộng đồng đã luôn động viên và hỗ trợ. Cuộc sống của tôi thay đổi hoàn toàn - sức khỏe tốt hơn, tinh thần thoải mái và tiết kiệm được rất nhiều tiền. Ai đang bắt đầu hành trình thì đừng bỏ cuộc nhé! 💪",
        category: "milestone",
        likes: 127,
        comments: 23,
        timeAgo: "2 giờ trước",
        image: "/images/suckhoe.png"
      },
      {
        id: 2,
        author: {
          name: "Trần Thị Mai",
          avatar: "/images/20.png", 
          days: 45,
          level: "Rising Star"
        },
        content: "Tuần này khó khăn quá! Stress công việc khiến tôi rất muốn hút thuốc. Nhưng nhờ ứng dụng nhắc nhở và các tips từ anh chị trong group mà tôi vượt qua được. Cảm ơn mọi người rất nhiều! 🙏",
        category: "support",
        likes: 89,
        comments: 15,
        timeAgo: "5 giờ trước"
      },
      {
        id: 3,
        author: {
          name: "Lê Hoàng Nam",
          avatar: "/images/22.png",
          days: 156,
          level: "Dedicated Quitter"
        },
        content: "Chia sẻ 5 tips giúp tôi vượt qua cơn thèm thuốc:\n1. Uống nước lạnh ngay khi thèm\n2. Tập thở sâu 10 lần\n3. Đi bộ 5-10 phút\n4. Gọi điện cho bạn bè\n5. Nhắc nhở bản thân lý do bỏ thuốc\nHy vọng hữu ích cho mọi người! 💡",
        category: "tips",
        likes: 156,
        comments: 31,
        timeAgo: "1 ngày trước"
      },
      {
        id: 4,
        author: {
          name: "Phạm Thị Lan",
          avatar: "/images/hinh1.png",
          days: 12,
          level: "Newbie Fighter"
        },
        content: "Ngày thứ 12 không hút thuốc! Thật sự khó khăn hơn tôi tưởng nhưng tôi sẽ không bỏ cuộc. Cảm ơn mọi người đã like và comment động viên post trước của tôi. Tiếp tục chiến đấu! 🔥",
        category: "progress",
        likes: 67,
        comments: 12,
        timeAgo: "3 giờ trước"
      },
      {
        id: 5,
        author: {
          name: "Dr. Nguyễn Minh",
          avatar: "/images/hinh2.png",
          days: 1825,
          level: "Expert Advisor"
        },
        content: "📚 Bài viết mới: 'Tác động của thuốc lá đến hệ tim mạch và quá trình phục hồi'. Nghiên cứu cho thấy chỉ sau 20 phút không hút thuốc, nhịp tim và huyết áp đã bắt đầu trở về bình thường. Sau 1 năm, nguy cơ bệnh tim giảm 50%. Hãy nhớ rằng cơ thể có khả năng tự phục hồi tuyệt vời!",
        category: "education",
        likes: 203,
        comments: 45,
        timeAgo: "6 giờ trước",
        image: "/images/bvlq1.jpg"
      }
    ]);

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
  }, []);

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '📋' },
    { id: 'milestone', name: 'Cột mốc', icon: '🎯' },
    { id: 'support', name: 'Hỗ trợ', icon: '🤝' },
    { id: 'tips', name: 'Mẹo hay', icon: '💡' },
    { id: 'progress', name: 'Tiến trình', icon: '📈' },
    { id: 'education', name: 'Giáo dục', icon: '📚' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSubmitPost = () => {
    if (!newPost.trim()) return;
    
    const post = {
      id: Date.now(),
      author: {
        name: user?.firstName + " " + user?.lastName || "Người dùng",
        avatar: "/images/1.png",
        days: 30,
        level: "Active Member"
      },
      content: newPost,
      category: selectedCategory === 'all' ? 'support' : selectedCategory,
      likes: 0,
      comments: 0,
      timeAgo: "Vừa xong"
    };
    
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const filteredPosts = selectedCategory === 'all' ? posts : posts.filter(post => post.category === selectedCategory);

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
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Hôm nay bạn cảm thấy thế nào? Chia sẻ tiến trình, câu chuyện hay mẹo hay của bạn..."
                    className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="4"
                  />
                  <div className="flex justify-between items-center mt-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      {categories.filter(cat => cat.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSubmitPost}
                      disabled={!newPost.trim()}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Đăng bài
                    </button>
                  </div>
                </div>
              )}

              {!isAuthenticated && (
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Tham gia cộng đồng ngay!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Đăng nhập để chia sẻ câu chuyện và nhận được sự hỗ trợ từ cộng đồng
                  </p>
                  <Link
                    to="/register"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition duration-300 inline-block"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              )}

              {/* Category Filter */}
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-green-50 shadow-sm'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <div className="space-y-6">
                {filteredPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
                    {/* Post Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-gray-800">{post.author.name}</h4>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {post.author.level}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>🗓️ {post.author.days} ngày không hút thuốc</span>
                          <span>⏰ {post.timeAgo}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.category === 'milestone' ? 'bg-yellow-100 text-yellow-700' :
                          post.category === 'support' ? 'bg-blue-100 text-blue-700' :
                          post.category === 'tips' ? 'bg-purple-100 text-purple-700' :
                          post.category === 'progress' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {categories.find(c => c.id === post.category)?.icon} {categories.find(c => c.id === post.category)?.name}
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post image"
                          className="mt-4 rounded-lg max-w-full h-auto shadow-md"
                        />
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition duration-300">
                        <span>❤️</span>
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition duration-300">
                        <span>💬</span>
                        <span>{post.comments}</span>
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
          </div>
        )}

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
                  ))}
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
