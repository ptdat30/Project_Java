import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Hiệu ứng cho các thanh xếp hạng
        const animateThanhXepHang = () => {
            const thanhs = document.querySelectorAll('.bar');
            const khuVucXepHang = document.querySelector('.ranking-bg');

            if (khuVucXepHang) {
                const rect = khuVucXepHang.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100 && rect.bottom > 100) {
                    thanhs.forEach(thanh => thanh.classList.add('active'));
                } else {
                    thanhs.forEach(thanh => thanh.classList.remove('active'));
                }
            }
        };

        window.addEventListener('scroll', animateThanhXepHang);
        animateThanhXepHang();

        return () => window.removeEventListener('scroll', animateThanhXepHang);
    }, [navigate]);

    const xuLyDangXuat = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Phần Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white">
                {/* Thanh thông báo trên cùng */}
                <div className="bg-[#181818] text-white text-center py-3">
                    <span className="tracking-wider text-base font-bold">
                        Đăng kí ngay để nhận lời khuyên hữu ích của chuyên gia tư vấn
                    </span>
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex gap-4">
                        <button
                            onClick={xuLyDangXuat}
                            className="px-6 py-1 rounded-full bg-[#f8f67c] text-black border-3 border-white hover:bg-[#e6e48a] transition-all"
                        >
                            ĐĂNG XUẤT
                        </button>
                    </div>
                </div>

                {/* Thanh điều hướng */}
                <nav className="flex justify-between items-center p-2">
                    <div className="flex items-center">
                        <div className="w-[70px] h-[70px] mr-5 ml-10 scale-[3]">
                            <img src="/images/icon.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <ul className="flex gap-4 mx-[50px]">
                            <li><a href="#" className="text-gray-700">Trang chủ</a></li>
                            <li><a href="#" className="text-gray-700">Tư vấn</a></li>
                            <li><a href="#" className="text-gray-700">Thống kê</a></li>
                            <li><a href="#" className="text-gray-700">Cộng đồng</a></li>
                            <li><a href="#" className="text-gray-700">Hỗ trợ</a></li>
                        </ul>
                    </div>
                    <div className="mr-4">
                        <span>HOTLINE TƯ VẤN: <b className="text-red-600">12345678</b></span>
                    </div>
                </nav>
            </header>

            {/* Phần Nội dung chính */}
            <main className="mt-[85px]">
                {/* Phần Hero */}
                <section className="flex p-10 gap-15 mt-[150px]">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-6">
                            Hỗ trợ cai nghiện thuốc lá: Vai trò thiết yếu trong bảo vệ sức khỏe cộng đồng
                        </h1>
                        <p className="text-lg mb-6">
                            Cai nghiện thuốc lá là một quá trình khó khăn đối với nhiều người do tính gây nghiện cao của nicotine.
                            Tuy nhiên, với sự hỗ trợ phù hợp từ gia đình, cộng đồng và các chuyên gia y tế, việc từ bỏ thuốc lá
                            hoàn toàn là điều hoàn toàn có thể đạt được.
                        </p>
                        <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-all">
                            TRẢI NGHIỆM KHÓA TƯ VẤN MIỄN PHÍ
                        </button>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="overflow-hidden rounded-lg">
                                <img
                                    src={`/images/hinh${num}.png`}
                                    alt={`Hình ${num}`}
                                    className="w-full h-[200px] object-cover hover:scale-108 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Phần Bảng xếp hạng */}
                <div className="ranking-bg w-full min-h-[800px] bg-gray-100 flex justify-center items-center">
                    {/* Nội dung bảng xếp hạng */}
                </div>

                {/* Phần Footer */}
                <footer className="bg-[#181818] text-white py-7 mt-10">
                    <div className="max-w-7xl mx-auto px-4 flex justify-between">
                        <div>
                            <h3 className="font-bold mb-4">Thông tin thêm:</h3>
                            <p>📍 Đường tổ kì, quận 12, thành phố hcm</p>
                            <p>📞 +84 123 456 78</p>
                            <p>📮 cainghienthuocla@gmail.com</p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Liên kết mạng xã hội:</h3>
                            <div className="flex gap-4">
                                {/* Icons mạng xã hội */}
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default HomePage;