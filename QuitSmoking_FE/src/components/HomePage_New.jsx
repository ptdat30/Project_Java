import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 12547,
    successRate: 78,
    moneySaved: 2841950000,
    daysSmokeFree: 89456,
  });

  const [leaderboard, setLeaderboard] = useState([
    {
      id: 1,
      name: "Nguyễn Văn An",
      days: 365,
      savings: 18250000,
      avatar: "/images/1.png",
    },
    {
      id: 2,
      name: "Trần Thị Mai",
      days: 298,
      savings: 14900000,
      avatar: "/images/20.png",
    },
    {
      id: 3,
      name: "Lê Hoàng Nam",
      days: 256,
      savings: 12800000,
      avatar: "/images/22.png",
    },
    {
      id: 4,
      name: "Phạm Thị Lan",
      days: 189,
      savings: 9450000,
      avatar: "/images/hinh1.png",
    },
    {
      id: 5,
      name: "Võ Minh Khoa",
      days: 156,
      savings: 7800000,
      avatar: "/images/hinh2.png",
    },
  ]);

  const [blogs, setBlogs] = useState([
    {
      id: 1,
      title: "10 Lợi ích tuyệt vời khi bỏ thuốc lá",
      excerpt:
        "Khám phá những thay đổi tích cực mà cơ thể bạn sẽ trải qua sau khi bỏ thuốc...",
      author: "Dr. Nguyễn Minh",
      date: "15/06/2025",
      image: "/images/suckhoe.png",
      readTime: "5 phút",
    },
    {
      id: 2,
      title: "Cách vượt qua cơn thèm thuốc hiệu quả",
      excerpt:
        "Những phương pháp được chứng minh khoa học giúp bạn kiểm soát cơn thèm...",
      author: "TS. Trần Văn Long",
      date: "12/06/2025",
      image: "/images/kiemsoattothon.png",
      readTime: "7 phút",
    },
    {
      id: 3,
      title: "Tiết kiệm tiền và cải thiện cuộc sống",
      excerpt:
        "Tính toán cụ thể số tiền bạn có thể tiết kiệm và sử dụng chúng thế nào...",
      author: "Lê Thị Hoa",
      date: "10/06/2025",
      image: "/images/tietkiemtien.png",
      readTime: "4 phút",
    },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // --- BEGIN Footer Component (đã gộp vào đây) ---
  const Footer = () => {
    return (
      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Contact Information */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold text-white mb-2">Thông tin thêm:</h3>
            <div className="flex items-center">
              {/* Địa chỉ - Đảm bảo icon này có sẵn tại /images/location-icon.png và là icon màu đỏ bạn muốn */}
              <img src="/images/map_icon.png" alt="Location" className="w-6 h-6 mr-3" />
              <span>
                Đường tô kí, quận 12, thành phố hcm (
                <a
                  href="https://www.google.com/maps/place/Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+H%E1%BB%8Dc+Giao+Th%C3%B4ng+V%E1%BA%ADn+T%E1%BA%A3i+Th%C3%A0nh+Ph%E1%BB%91+H%E1%BB%93+Ch%C3%AD+Minh+(UTH)+-+C%C6%A1+s%E1%BB%9F+3/@10.8657455,106.615543,17z/data=!3m1!4b1!4m6!3m5!1s0x31752b2a11844fb9:0xbed3d5f0a6d6e0fe!8m2!3d10.8657455!4d106.6181179!16s%2Fg%2F11h5mfgrph?entry=ttu&g_ep=EgoyMDI1MDYxNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  bản đồ hướng dẫn tại đây
                </a>
                )
              </span>
            </div>
            <div className="flex items-center">
              {/* Điện thoại - Đảm bảo icon này có sẵn tại /images/phone-icon.png và là icon màu đỏ bạn muốn */}
              <img src="/images/phone_icon.png" alt="Phone" className="w-6 h-6 mr-3" />
              <span>09-123-45678</span>
            </div>
            <div className="flex items-center">
              {/* Email - Đảm bảo icon này có sẵn tại /images/email-icon.png và là icon màu đỏ bạn muốn */}
              <img src="/images/email_icon.png" alt="Email" className="w-6 h-6 mr-3" />
              <span>cainghiethuocla@gmail.com</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-start lg:items-end">
            <h3 className="text-xl font-bold text-white mb-4">Liên kết mạng xã hội:</h3>
            <div className="flex space-x-6">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <img src="/images/fb_icon.jpg" alt="Facebook" className="w-10 h-10 transform hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                <img src="/images/ytb_icon.jpg" alt="YouTube" className="w-10 h-10 transform hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                <img src="/images/tiktok_icon.jpg" alt="TikTok" className="w-10 h-10 transform hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <img src="/images/linkedin_icon.jpg" alt="LinkedIn" className="w-10 h-10 transform hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} CaiNghienThuocLa. All rights reserved.
        </div>
      </footer>
    );
  };
  // --- END Footer Component ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
              Hỗ trợ cai nghiện thuốc lá vì một cuộc sống khỏe mạnh hơn.
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Chúng tôi hiểu rằng cai nghiện thuốc lá là một hành trình đầy
              thách thức. Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi cam
              kết đồng hành cùng bạn trên con đường hướng tới một cuộc sống
              không khói thuốc.
            </p>
            <Link
              to="/membership"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Trải nghiệm tư vấn miễn phí 30 ngày
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all"
              >
                <img
                  src={`/images/hinh${num}.png`}
                  alt={`Hình minh họa ${num}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Tại Sao Chọn Chúng Tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống hỗ trợ toàn diện với phương pháp khoa học và cộng đồng
              nhiệt tình
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "/images/giadinh.png",
                title: "Kế Hoạch Cá Nhân",
                description:
                  "Lập kế hoạch cai thuốc phù hợp với hoàn cảnh và mục tiêu cá nhân của bạn",
              },
              {
                icon: "/images/baovemoitruong.png",
                title: "Theo Dõi Tiến Trình",
                description:
                  "Ghi nhận và theo dõi tiến trình hàng ngày với thống kê chi tiết và động lực",
              },
              {
                icon: "/images/yeucaubacsi.png",
                title: "Tư Vấn Chuyên Gia",
                description:
                  "Nhận hỗ trợ từ đội ngũ huấn luyện viên và chuyên gia y tế có kinh nghiệm",
              },
              {
                icon: "/images/choembe.png",
                title: "Cộng Đồng Hỗ Trợ",
                description:
                  "Kết nối với cộng đồng những người cùng chí hướng và chia sẻ kinh nghiệm",
              },
              {
                icon: "/images/tietkiemtien.png",
                title: "Tiết Kiệm Chi Phí",
                description:
                  "Theo dõi số tiền tiết kiệm được và lập kế hoạch sử dụng hiệu quả",
              },
              {
                icon: "/images/caithienmui.png",
                title: "Cải Thiện Sức Khỏe",
                description:
                  "Theo dõi sự cải thiện sức khỏe qua từng giai đoạn bỏ thuốc lá",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition duration-300 text-center group"
              >
                <div className="mb-6">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-16 h-16 mx-auto group-hover:scale-110 transition duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              🏆 Bảng Xếp Hạng Thành Tích
            </h2>
            <p className="text-xl text-gray-600">
              Những người hùng đang dẫn đầu hành trình cai thuốc lá
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6">
                <h3 className="text-center text-2xl font-bold">
                  Top 5 Thành Viên Xuất Sắc
                </h3>
              </div>

              <div className="p-6">
                {leaderboard.map((member, index) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 rounded-lg mb-4 ${
                      index === 0
                        ? "bg-yellow-50 border border-yellow-200"
                        : index === 1
                        ? "bg-gray-50 border border-gray-200"
                        : index === 2
                        ? "bg-orange-50 border border-orange-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${
                          index === 0
                            ? "bg-yellow-400 text-yellow-900"
                            : index === 1
                            ? "bg-gray-400 text-gray-900"
                            : index === 2
                            ? "bg-orange-400 text-orange-900"
                            : "bg-green-400 text-green-900"
                        }`}
                      >
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : index + 1}
                      </div>

                      <div className="flex items-center">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-green-200"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {member.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {member.days} ngày không hút thuốc
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(member.savings)}
                      </div>
                      <div className="text-sm text-gray-500">tiết kiệm</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 px-6 py-4 text-center">
                <Link
                  to={isAuthenticated ? "/community" : "/register"}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Xem bảng xếp hạng đầy đủ →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              📚 Blog Chia Sẻ Kinh Nghiệm
            </h2>
            <p className="text-xl text-gray-600">
              Những bài viết hữu ích từ chuyên gia và cộng đồng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                    {blog.readTime}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition duration-300">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {blog.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium">{blog.author}</span>
                    </div>
                    <span>{blog.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/community"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
            >
              Xem Tất Cả Bài Viết
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Sẵn Sàng Bắt Đầu Hành Trình Mới?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Hãy để chúng tôi đồng hành cùng bạn trong việc xây dựng một cuộc
            sống khỏe mạnh và hạnh phúc hơn.
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transform hover:scale-105 transition duration-300"
              >
                Đăng Ký Miễn Phí
              </Link>
              <Link
                to="/membership"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-green-600 transition duration-300"
              >
                Xem Gói Premium
              </Link>
            </div>
          ) : (
            <Link
              to="/plan"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transform hover:scale-105 transition duration-300 inline-block"
            >
              Lập Kế Hoạch Cai Thuốc
            </Link>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default HomePage;