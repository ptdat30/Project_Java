import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SmokingStatsChart from "./settings/SmokingStatsChart.jsx"; // Import component biểu đồ

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 12547,
    successRate: 78,
    moneySaved: 2841950000,
    daysSmokeFree: 89456,
  });

  // State cho animations
  const [isLoaded, setIsLoaded] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  // Animation effects
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    const featuresTimer = setTimeout(() => setFeaturesVisible(true), 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(featuresTimer);
    };
  }, []);

  // Giữ lại newsArticles và smokingStats ở đây
  const [newsArticles, setNewsArticles] = useState([
    {
      id: 1,
      title: "Tác hại khôn lường của thuốc lá đến sức khỏe",
      excerpt:
          "Bài viết chi tiết về các bệnh tật mà thuốc lá gây ra như ung thư phổi, tim mạch...",
      source: "Báo Sức Khỏe & Đời Sống",
      date: "20/05/2025",
      link: "https://suckhoedoisong.vn/tac-hai-khon-luong-cua-thuoc-la-den-suc-khoe.htm",
      image: "/images/bvlq1.jpg",
    },
    {
      id: 2,
      title: "Hút thuốc lá thụ động: Nguy cơ tiềm ẩn cho người thân",
      excerpt:
          "Tìm hiểu về những ảnh hưởng nghiêm trọng của khói thuốc lá đến những người xung quanh...",
      source: "VNExpress",
      date: "10/05/2025",
      link: "https://vnexpress.net/hut-thuoc-la-thu-dong-nguy-co-tiem-an-cho-nguoi-than-4000000.html",
      image: "/images/bvlq2.png",
    },
    {
      id: 3,
      title: "Kinh tế Việt Nam thiệt hại hàng nghìn tỷ đồng vì thuốc lá",
      excerpt:
          "Phân tích về gánh nặng kinh tế do chi phí y tế và mất năng suất lao động vì thuốc lá...",
      source: "Báo Lao Động",
      date: "01/05/2025",
      link: "https://laodong.vn/kinh-te/kinh-te-viet-nam-thiet-hai-hang-nghin-ty-dong-vi-thuoc-la-1000000.html",
      image: "/images/bvlq3.webp",
    },
  ]);

  const [smokingStats, setSmokingStats] = useState({
    deathsPerYearVietnam: "khoảng 40.000",
    healthcareCostsVietnam: "hơn 23.000 tỷ VND/năm",
    diseasesCaused: [
      "Ung thư (phổi, vòm họng, thực quản, bàng quang...)",
      "Bệnh tim mạch (đau tim, đột quỵ)",
      "Bệnh phổi tắc nghẽn mãn tính (COPD)",
      "Hen suyễn",
      "Tiểu đường",
      "Vô sinh",
    ],
  });

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
        <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-12">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Contact Information */}
            <div className="flex flex-col space-y-4 transform hover:scale-105 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Thông tin thêm:
              </h3>
              <div className="flex items-center hover:text-green-400 transition-colors duration-300">
                <img
                    src="/images/map_icon.png"
                    alt="Location"
                    className="w-6 h-6 mr-3 hover:scale-110 transition-transform duration-300"
                />
                <span>
                70 Đ. Tô Ký, Tân Chánh Hiệp, Quận 12, Hồ Chí Minh (
                <a
                    href="https://www.google.com/maps/place/Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+H%E1%BB%8Dc+Giao+Th%C3%B4ng+V%E1%BA%ADn+T%E1%BA%A3i+Th%C3%A0nh+Ph%E1%BB%91+H%E1%BB%93+Ch%C3%AD+Minh+(UTH)+-+C%C6%A1+s%E1%BB%9F+3/@10.8657455,106.615543,17z/data=!3m1!4b1!4m6!3m5!1s0x31752b2a11844fb9:0xbed3d5f0a6d6e0fe!8m2!3d10.8657455!4d106.6181179!16s%2Fg%2F11h5mfgrph?entry=ttu&g_ep=EgoyMDI1MDYxNy4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-emerald-400 hover:underline transition-colors duration-300"
                >
                  Vị Trí Trên Google Maps
                </a>
                )
              </span>
              </div>
              <div className="flex items-center hover:text-green-400 transition-colors duration-300">
                <img
                    src="/images/phone_icon.png"
                    alt="Phone"
                    className="w-6 h-6 mr-3 hover:scale-110 transition-transform duration-300"
                />
                <span>09-123-45678</span>
              </div>
              <div className="flex items-center hover:text-green-400 transition-colors duration-300">
                <img
                    src="/images/email_icon.png"
                    alt="Email"
                    className="w-6 h-6 mr-3 hover:scale-110 transition-transform duration-300"
                />
                <span>QuitSmoking@gmail.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-start lg:items-end">
              <h3 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Liên kết mạng xã hội:
              </h3>
              <div className="flex space-x-6">
                <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform hover:scale-125 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/50"
                >
                  <img
                      src="/images/fb_icon.jpg"
                      alt="Facebook"
                      className="w-12 h-12 rounded-full border-2 border-transparent hover:border-green-400"
                  />
                </a>
                <a
                    href="https://www.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform hover:scale-125 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/50"
                >
                  <img
                      src="/images/ytb_icon.jpg"
                      alt="YouTube"
                      className="w-12 h-12 rounded-full border-2 border-transparent hover:border-green-400"
                  />
                </a>
                <a
                    href="https://www.tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform hover:scale-125 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/50"
                >
                  <img
                      src="/images/tiktok_icon.jpg"
                      alt="TikTok"
                      className="w-12 h-12 rounded-full border-2 border-transparent hover:border-green-400"
                  />
                </a>
                <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transform hover:scale-125 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/50"
                >
                  <img
                      src="/images/linkedin_icon.jpg"
                      alt="LinkedIn"
                      className="w-12 h-12 rounded-full border-2 border-transparent hover:border-green-400"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm mt-8 border-t border-gray-700 pt-8">
            <p className="hover:text-green-400 transition-colors duration-300">
              <a href="https://ptdat30.github.io/digital-cv-portfolio/" target="_blank" rel="noopener noreferrer" className="hover:text-green-500">
              © {new Date().getFullYear()} The QuitSmoking application was developed by F4_VanTai's team
              </a>
            </p>
          </div>
        </footer>
    );
  };
  // --- END Footer Component ---

  return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-12 items-center w-full">
            <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'} w-full`}> 
              <h1 className="text-lg xs:text-xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 sm:mb-6 leading-tight">
                Hỗ trợ cai nghiện thuốc lá vì một cuộc sống khỏe mạnh hơn.
              </h1>
              <p className="text-sm xs:text-base sm:text-lg text-gray-600 mb-3 sm:mb-8 leading-relaxed">
                Chúng tôi hiểu rằng cai nghiện thuốc lá là một hành trình đầy
                thách thức. Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi cam
                kết đồng hành cùng bạn trên con đường hướng tới một cuộc sống
                không khói thuốc.
              </p>
              <div className="flex justify-center sm:justify-start w-full">
                <Link
                  to="/membership"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 xs:px-4 sm:px-8 py-2 xs:py-3 sm:py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-green-500/25 text-xs xs:text-sm sm:text-base w-auto text-center"
                >
                  <span className="flex items-center justify-center">
                    ✨ Trải nghiệm tư vấn miễn phí 30 ngày
                  </span>
                </Link>
              </div>
            </div>
            <div className={`grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} w-full mt-4 sm:mt-0`}> 
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className="overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 group w-full"
                  style={{
                    animationDelay: `${num * 200}ms`,
                  }}
                >
                  <img
                    src={`/images/hinh${num}.png`}
                    alt={`Hình minh họa ${num}`}
                    className="w-full h-20 xs:h-24 sm:h-32 md:h-40 object-cover group-hover:scale-110 transition-transform duration-500 max-w-full rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-10 sm:py-20 bg-white w-full">
          <div className="container mx-auto px-2 sm:px-6 w-full">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 sm:mb-4">
                Tại Sao Chọn Chúng Tôi?
              </h2>
              <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Hệ thống hỗ trợ toàn diện với phương pháp khoa học và cộng đồng
                nhiệt tình
              </p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-full">
              {[
                {
                  icon: "/images/giadinh.png",
                  title: "Kế Hoạch Cá Nhân",
                  description:
                      "Lập kế hoạch cai thuốc phù hợp với hoàn cảnh và mục tiêu cá nhân của bạn",
                  gradient: "from-green-500 to-emerald-600",
                },
                {
                  icon: "/images/baovemoitruong.png",
                  title: "Theo Dõi Tiến Trình",
                  description:
                      "Ghi nhận và theo dõi tiến trình hàng ngày với thống kê chi tiết và động lực",
                  gradient: "from-emerald-500 to-teal-600",
                },
                {
                  icon: "/images/yeucaubacsi.png",
                  title: "Tư Vấn Chuyên Gia",
                  description:
                      "Nhận hỗ trợ từ đội ngũ huấn luyện viên và chuyên gia y tế có kinh nghiệm",
                  gradient: "from-teal-500 to-green-600",
                },
                {
                  icon: "/images/choembe.png",
                  title: "Cộng Đồng Hỗ Trợ",
                  description:
                      "Kết nối với cộng đồng những người cùng chí hướng và chia sẻ kinh nghiệm",
                  gradient: "from-green-500 to-teal-600",
                },
                {
                  icon: "/images/tietkiemtien.png",
                  title: "Tiết Kiệm Chi Phí",
                  description:
                      "Theo dõi số tiền tiết kiệm được và lập kế hoạch sử dụng hiệu quả",
                  gradient: "from-emerald-500 to-green-600",
                },
                {
                  icon: "/images/caithienmui.png",
                  title: "Cải Thiện Sức Khỏe",
                  description:
                      "Theo dõi sự cải thiện sức khỏe qua từng giai đoạn bỏ thuốc lá",
                  gradient: "from-teal-500 to-emerald-600",
                },
              ].map((feature, index) => (
                  <div
                      key={index}
                      className={`relative overflow-hidden bg-gradient-to-br ${feature.gradient} rounded-2xl p-4 sm:p-8 hover:shadow-2xl transition-all duration-500 text-center group transform hover:scale-105 hover:-translate-y-2 ${
                          featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{
                        animationDelay: `${index * 150}ms`,
                        transitionDelay: `${index * 150}ms`,
                      }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                      <div className="mb-4 sm:mb-6">
                        <img
                            src={feature.icon}
                            alt={feature.title}
                            className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 mx-auto group-hover:scale-125 transition-transform duration-500 filter drop-shadow-lg max-w-full"
                        />
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-4 group-hover:text-yellow-200 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-white/90 leading-relaxed group-hover:text-white transition-colors duration-300 text-sm sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* News and Statistics Section */}
        <section className="py-10 sm:py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50 w-full">
          <div className="container mx-auto px-2 sm:px-6 w-full">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 sm:mb-4">
                📊 Thống Kê Thực Tế
              </h2>
              <p className="text-base sm:text-xl text-gray-600">
                Những con số báo động về tác hại của thuốc lá
              </p>
            </div>

            {/* Sử dụng component biểu đồ tại đây */}
            <div className="w-full max-w-full sm:max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-2 xs:p-4 sm:p-8 mb-6 sm:mb-12 border border-green-100 overflow-x-auto">
              <SmokingStatsChart
                  deathsPerYear={smokingStats.deathsPerYearVietnam}
                  healthcareCosts={smokingStats.healthcareCostsVietnam}
                  diseases={smokingStats.diseasesCaused}
              />
              <div className="mt-4 sm:mt-6 p-2 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  📋 <strong>Nguồn tham khảo:</strong> Báo Sức Khỏe & Đời Sống, VNExpress, Báo Lao Động.
                  <br />
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    (Lưu ý: Các số liệu phụ trợ trong biểu đồ là giả định để minh họa sự so sánh)
                  </span>
                </p>
              </div>
            </div>

            {/* News Articles */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-full">
              {newsArticles.map((article, index) => (
                  <a
                      key={article.id}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group block transform hover:scale-105 hover:-translate-y-2 w-full"
                      style={{
                        animationDelay: `${index * 200}ms`,
                      }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-28 xs:h-32 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500 max-w-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-3 xs:p-4 sm:p-6">
                      <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1 sm:mb-3 group-hover:text-green-600 transition-colors duration-300 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs sm:text-base text-gray-600 mb-2 sm:mb-4 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium group-hover:text-green-600 transition-colors duration-300">
                            {article.source}
                          </span>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] sm:text-xs">
                          {article.date}
                        </span>
                      </div>
                    </div>
                  </a>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <Link
                  to="/membership"
                  className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-green-500/25 w-full sm:w-auto text-center"
              >
                <span className="flex items-center justify-center">
                  🚀 Đăng Ký Thành Viên Ngay
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 sm:py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden w-full">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-white/5 opacity-50"></div>

          <div className="container mx-auto px-2 sm:px-6 text-center relative z-10 w-full">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">
              ✨ Sẵn Sàng Bắt Đầu Hành Trình Mới?
            </h2>
            <p className="text-base sm:text-xl mb-4 sm:mb-8 text-white/90 max-w-2xl mx-auto">
              Hãy để chúng tôi đồng hành cùng bạn trong việc xây dựng một cuộc
              sống khỏe mạnh và hạnh phúc hơn.
            </p>

            {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                  <Link
                      to="/register"
                      className="bg-white text-green-600 px-4 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-green-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto text-center"
                  >
                    🎯 Đăng Ký Miễn Phí
                  </Link>
                  <Link
                      to="/membership"
                      className="border-2 border-white text-white px-4 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-center"
                  >
                    💎 Xem Gói Premium
                  </Link>
                </div>
            ) : (
                <Link
                    to="/plan"
                    className="bg-white text-green-600 px-4 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-green-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl inline-block w-full sm:w-auto text-center"
                >
                  📋 Lập Kế Hoạch Cai Thuốc
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