import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import config from "../config/config.js";

console.log("HomePage: Đối tượng 'config' sau khi import:", config);
// Thêm console log chi tiết hơn để kiểm tra cấu trúc của 'endpoints'
console.log("HomePage: config.API_BASE_URL:", config?.API_BASE_URL);
console.log("HomePage: config.endpoints:", config?.endpoints);
console.log(
  "HomePage: config.endpoints.userProfile:",
  config?.endpoints?.userProfile
);

if (
  !config ||
  !config.API_BASE_URL ||
  !config.endpoints ||
  !config.endpoints.userProfile
) {
  console.error(
    "LỖI CẤU HÌNH API: Đối tượng 'config' hoặc các thuộc tính cần thiết của nó đang bị thiếu/không hợp lệ!"
  );
  console.error(
    "Vấn đề nằm ở việc tải file config.js hoặc nội dung của nó. Vui lòng xem hướng dẫn khắc phục bên dưới."
  );
}

const HomePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userFetchError, setUserFetchError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUserProfile = async () => {
      setUserLoading(true);
      setUserFetchError(null);
      try {
        // Kiểm tra lại config trước khi sử dụng để xây dựng URL, đảm bảo nó không undefined
        if (
          !config ||
          !config.API_BASE_URL ||
          !config.endpoints ||
          !config.endpoints.userProfile
        ) {
          const missingConfigPart = !config
            ? "config object"
            : !config.API_BASE_URL
            ? "config.API_BASE_URL"
            : !config.endpoints
            ? "config.endpoints"
            : "config.endpoints.userProfile";
          throw new Error(
            `Cấu hình API bị thiếu: ${missingConfigPart}. Vui lòng kiểm tra file config.js và đường dẫn import.`
          );
        }

        const apiUrl = `${config.API_BASE_URL}${config.endpoints.userProfile}`;
        console.log("HomePage: Đang gọi API User Profile với URL:", apiUrl);
        console.log("HomePage: Sử dụng Token:", token);

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
        console.log("HomePage: Dữ liệu người dùng nhận được:", response.data);
      } catch (err) {
        console.error(
          "HomePage: Lỗi khi lấy thông tin người dùng (chi tiết):",
          err
        );
        const errorMessage =
          err.message ||
          err.response?.data?.message ||
          "Không thể tải thông tin người dùng.";
        setUserFetchError(errorMessage);

        if (err.response) {
          console.error("HomePage: Mã trạng thái HTTP:", err.response.status);
          console.error("HomePage: Dữ liệu phản hồi lỗi:", err.response.data);
        }

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          console.warn(
            "HomePage: Token không hợp lệ hoặc đã hết hạn. Đang đăng xuất."
          );
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserProfile();

    const animateRankingBars = () => {
      const bars = document.querySelectorAll(".bar");
      const rankingSection = document.querySelector(".ranking-section");

      if (rankingSection) {
        const rect = rankingSection.getBoundingClientRect();
        const isVisible =
          rect.top < window.innerHeight - 100 && rect.bottom > 100;
        bars.forEach((bar) => bar.classList.toggle("active", isVisible));
      }
    };

    window.addEventListener("scroll", animateRankingBars);
    animateRankingBars();

    return () => window.removeEventListener("scroll", animateRankingBars);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 shadow-sm">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            {/* Phần bên trái: Luôn hiển thị thông báo "Đăng ký ngay..." */}
            <span className="font-medium">
              Đăng ký ngay để nhận tư vấn miễn phí từ chuyên gia
            </span>

            {/* Phần bên phải: Nút Đăng xuất và thông tin người dùng */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-1.5 rounded-full bg-white text-emerald-600 hover:bg-gray-100 transition-all font-medium"
              >
                Đăng xuất
              </button>
              {userLoading ? (
                <span className="font-medium">Đang tải...</span>
              ) : userFetchError ? (
                <span className="font-medium text-red-200">
                  Lỗi: {userFetchError}
                </span>
              ) : userData ? (
                <span className="font-medium">
                  Xin chào, {userData.username} ({userData.role})
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="bg-white">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-4">
            <div className="flex items-center gap-10">
              <img
                src="/images/icon.png"
                alt="Logo"
                className="w-16 h-16 object-contain transform scale-200 -ml-16"
              />
              <ul className="flex gap-8">
                {["Trang chủ", "Tư vấn", "Thống kê", "Cộng đồng", "Hỗ trợ"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-700 hover:text-emerald-600 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="text-gray-700">
              Hotline:{" "}
              <span className="font-bold text-emerald-600">1800 1234</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
                Hỗ trợ cai nghiện thuốc lá vì một cuộc sống khỏe mạnh hơn.
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Chúng tôi hiểu rằng cai nghiện thuốc lá là một hành trình đầy
                thách thức. Với đội ngũ chuyên gia giàu kinh nghiệm, chúng tôi
                cam kết đồng hành cùng bạn trên con đường hướng tới một cuộc
                sống không khói thuốc.
              </p>
              <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-all font-medium shadow-lg hover:shadow-xl">
                Nhận tư vấn miễn phí
              </button>
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

        {/* Ranking Section */}
        <section className="ranking-section bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Ranking content here */}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Về chúng tôi</h3>
                <p className="text-gray-400 leading-relaxed">
                  Chúng tôi là đơn vị tiên phong trong việc hỗ trợ cai nghiện
                  thuốc lá tại Việt Nam, với sứ mệnh mang lại cuộc sống khỏe
                  mạnh cho cộng đồng.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>📍 Đường Tô Ký, Quận 12, TP.HCM</li>
                  <li>📞 1800 1234</li>
                  <li>📧 support@cainghienthuocla.vn</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Kết nối</h3>
                <div className="flex gap-4">
                  {/* Add social media icons here */}
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; 2025 Cai Nghiện Thuốc Lá. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;
