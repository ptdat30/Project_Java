import React, { useState, useEffect } from 'react';

const LapKeHoach = () => {
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [cigarettesPerDay, setCigarettesPerDay] = useState('');
  const [pricePerPack, setPricePerPack] = useState('');
  const [selectedReasons, setSelectedReasons] = useState(new Set());

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pointLeft {
        0%, 100% { transform: translateX(0) translateY(-50%); }
        50% { transform: translateX(10px) translateY(-50%); }
      }
      @keyframes pointRight {
        0%, 100% { transform: translateX(0) translateY(-50%); }
        50% { transform: translateX(-10px) translateY(-50%); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50">
        <div className="bg-black text-white py-2 px-4 flex justify-center items-center text-sm relative">
          <div className="text-center">ĐĂNG KÍ NGAY ĐỂ NHẬN LỜI KHUYÊN HỮU ÍCH TỪ BÁC SĨ</div>
          <div className="absolute right-4 flex gap-4">
            <button className="!rounded-button bg-yellow-500 hover:bg-yellow-600 transition-colors duration-300 px-4 py-1 text-black cursor-pointer whitespace-nowrap">ĐĂNG NHẬP</button>
            <button className="!rounded-button bg-blue-500 hover:bg-blue-600 transition-colors duration-300 px-4 py-1 cursor-pointer whitespace-nowrap text-white">ĐĂNG KÍ</button>
          </div>
        </div>
        <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <i className="fas fa-smoking-ban text-red-500 text-2xl"></i>
            <span className="font-semibold text-gray-800">Hỗ trợ cai nghiện Thuốc lá</span>
          </div>
          <nav className="flex gap-6">
            <div className="relative group">
              <div className="flex items-center gap-1 cursor-pointer">
                <span>CHỨC NĂNG</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
              <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50">
                {['Khai báo tình trạng', 'Lập kế hoạch', 'Đăng kí thành viên', 'Thông báo định kì'].map((item, index) => (
                  <div key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{item}</div>
                ))}
              </div>
            </div>
            {Array(4).fill('CHỨC NĂNG').map((item, index) => (
              <div key={index} className="flex items-center gap-1 cursor-pointer">
                <span>{item}</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <i className="fas fa-phone-alt text-green-500"></i>
            <span>HOTLINE TƯ VẤN: 123456789</span>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="pt-32 px-6 max-w-[1280px] mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 w-full">
          <h2 className="bg-black text-white py-3 -mx-8 px-8 text-2xl font-bold mb-6">
            CHỌN NGÀY BẮT ĐẦU KẾ HOẠCH
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Hãy chọn ngày vào khoảng mấy tuần tiếp theo để bạn có thời gian chuẩn bị trước khi bước vào tuần kế hoạch, hoặc nếu bạn đã sẵn sàng bạn có thể chọn các ngày dưới đây:
          </p>
          <div className="mb-4">
            <p className="font-medium mb-4">Khi nào bạn thực hiện kế hoạch?</p>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedDate === 'today'}
                  onChange={() => setSelectedDate('today')}
                  className="w-4 h-4"
                />
                <span>Hôm nay</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedDate === 'tomorrow'}
                  onChange={() => setSelectedDate('tomorrow')}
                  className="w-4 h-4"
                />
                <span>Ngày mai</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedDate === 'custom'}
                  onChange={() => setSelectedDate('custom')}
                  className="w-4 h-4"
                />
                <span>Chọn ngày của tôi</span>
                {selectedDate === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 ml-2"
                  />
                )}
              </label>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 w-full">
          <h2 className="bg-black text-white py-3 -mx-8 px-8 text-2xl font-bold mb-6">
            BẠN CHI TRẢ BAO NHIÊU CHO VIỆC HÚT THUỐC?
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Nhập số lượng bạn hút trong một gói và số lượng gói bạn hút sẽ cho bạn biết được số tiền bạn tiết kiệm được khi bắt đầu thực hiện kế hoạch cai thuốc:
          </p>
          <div className="flex flex-col gap-4 max-w-4xl">
            <div className="flex items-center gap-4">
              <i className="fas fa-calculator text-2xl text-gray-400"></i>
              <div className="flex items-center gap-2 text-lg">
                <span>Tôi hút khoảng</span>
                <input
                  type="number"
                  value={cigarettesPerDay}
                  onChange={(e) => setCigarettesPerDay(e.target.value)}
                  className="border border-gray-300 rounded w-24 px-2 py-1 text-center text-lg"
                  min="0"
                />
                <span>điếu thuốc một ngày.</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <i className="fas fa-calculator text-2xl text-gray-400"></i>
              <div className="flex items-center gap-2 text-lg">
                <span>Tôi dành khoảng</span>
                <input
                  type="number"
                  value={pricePerPack}
                  onChange={(e) => setPricePerPack(e.target.value)}
                  className="border border-gray-300 rounded w-24 px-2 py-1 text-center text-lg"
                  step="0.01"
                  min="0"
                />
                <span>nghìn cho một bao thuốc.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 w-full mt-8 mb-8">
          <h2 className="bg-black text-white py-3 -mx-8 px-8 text-2xl font-bold mb-6">
            TẠI SAO BẠN LẠI BỎ THUỐC?
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Biết được mục đích cai nghiện sẽ giúp bạn giữ vững động lực để tiếp tục cai thuốc trong những tình huống khó khăn hay thêm khát,...
          </p>
          <p className="font-medium mb-4 text-lg">Lý do tôi muốn bỏ thuốc:</p>
          <div className="grid grid-cols-5 gap-6">
            {[
              { text: 'Cải thiện sức khoẻ', image: '/QuitSmoking_FE/public/images/suckhoe.png' },
              { text: 'Cho gia đình, bạn bè', image: 'https://readdy.ai/api/search-image?query=Happy%20diverse%20family%20and%20friends%20gathering%20together%20outdoors%2C%20warm%20natural%20lighting%2C%20genuine%20smiles%20and%20laughter&width=200&height=200&seq=2&orientation=squarish' },
              { text: 'Yêu cầu của bác sĩ', image: 'https://readdy.ai/api/search-image?query=Professional%20doctor%20in%20white%20coat%20holding%20medical%20clipboard%2C%20medical%20consultation%20scene%20in%20modern%20clinic&width=200&height=200&seq=3&orientation=squarish' },
              { text: 'Tiết kiệm tiền', image: 'https://readdy.ai/api/search-image?query=Pink%20piggy%20bank%20with%20investment%20text%20and%20coins%2C%20financial%20savings%20concept%20on%20neutral%20background&width=200&height=200&seq=4&orientation=squarish' },
              { text: 'Bảo vệ môi trường', image: 'https://readdy.ai/api/search-image?query=Hands%20holding%20young%20plant%20with%20green%20leaves%2C%20environmental%20conservation%20concept%20against%20blurred%20nature&width=200&height=200&seq=5&orientation=squarish' },
              { text: 'Cải thiện mùi, ngoại hình', image: 'https://readdy.ai/api/search-image?query=Young%20woman%20with%20fresh%20glowing%20skin%20and%20flowing%20hair%20against%20soft%20natural%20background&width=200&height=200&seq=6&orientation=squarish' },
              { text: 'Cho em bé', image: 'https://readdy.ai/api/search-image?query=Cute%20baby%20wearing%20sunglasses%20and%20stylish%20outfit%2C%20adorable%20child%20portrait%20against%20white%20background&width=200&height=200&seq=7&orientation=squarish' },
              { text: 'Kiểm soát bản thân', image: 'https://readdy.ai/api/search-image?query=Confident%20young%20man%20looking%20determined%2C%20self%20control%20and%20personal%20development%20concept&width=200&height=200&seq=8&orientation=squarish' },
              { text: 'Tương lai tốt hơn', image: 'https://readdy.ai/api/search-image?query=Silhouette%20of%20person%20standing%20looking%20at%20modern%20city%20skyline%20at%20sunset%2C%20future%20success%20concept&width=200&height=200&seq=9&orientation=squarish' },
              { text: 'Cho thú cưng', image: 'https://readdy.ai/api/search-image?query=Adorable%20puppies%20together%20in%20basket%2C%20cute%20pets%20on%20yellow%20background&width=200&height=200&seq=10&orientation=squarish' }
            ].map((item, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
                onClick={() => {
                  const newSelected = new Set(selectedReasons);
                  if (newSelected.has(index)) {
                    newSelected.delete(index);
                  } else {
                    newSelected.add(index);
                  }
                  setSelectedReasons(newSelected);
                }}
              >
                <img
                  className="w-full h-full object-cover"
                  src={item.image}
                  alt={item.text}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-center font-medium text-lg px-4">{item.text}</span>
                </div>
                {selectedReasons.has(index) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80">
                    <i className="fas fa-check text-white text-5xl"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 w-full mt-8 mb-8">
          <h2 className="bg-black text-white py-3 -mx-8 px-8 text-2xl font-bold mb-6">
            KHI NÀO BẠN LÊN CƠN THÈM KHÁT
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Sau khi bạn cai thuốc, một số địa điểm, tình huống và cảm xúc nhất định có thể khiến bạn khó duy trì việc cai thuốc. Sử dụng danh sách này để tìm ra lý do khiến bạn muốn hút thuốc. Chúng tôi sẽ cung cấp cho bạn các chiến lược giúp bạn kiểm soát được việc hút thuốc.
          </p>
          <div className="flex gap-8">
            <div className="flex-1 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-bold mb-4">TÌNH HUỐNG</h3>
              <div className="flex flex-col gap-4">
                {[
                  'Được mời một điếu thuốc',
                  'Uống rượu hoặc đi đến quán bar',
                  'Đi dự tiệc hoặc sự kiện xã hội khác',
                  'Ở gần những người hút thuốc hoặc sử dụng sản phẩm thuốc lá khác',
                  'Nhìn thấy người khác hút thuốc',
                  'Ngửi thấy khói thuốc lá'
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center group-hover:border-gray-400">
                      <input
                        type="checkbox"
                        className="hidden"
                      />
                      <i className="fas fa-check text-green-500 hidden"></i>
                    </div>
                    <span className="text-lg">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex-1 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-bold mb-4">CẢM XÚC</h3>
              <div className="flex flex-col gap-4">
                {[
                  'Tức giận',
                  'Lo lắng, bồn chồn',
                  'Phấn khởi, hạnh phúc',
                  'Cô đơn',
                  'Buồn, thất vọng',
                  'Căng thẳng hoặc quá tải'
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center group-hover:border-gray-400">
                      <input
                        type="checkbox"
                        className="hidden"
                      />
                      <i className="fas fa-check text-green-500 hidden"></i>
                    </div>
                    <span className="text-lg">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 w-full mt-8 mb-8">
          <h2 className="bg-black text-white py-3 -mx-8 px-8 text-2xl font-bold mb-6">
            BẮT ĐẦU KẾ HOẠCH CỦA BẠN
          </h2>
          <div className="relative flex flex-col items-center justify-center py-12">
            <div className="relative">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black text-2xl font-bold py-4 px-12 !rounded-button transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative z-10"
                onClick={() => {
                  // Handle start plan click
                  console.log('Start plan clicked');
                }}
              >
                BẮT ĐẦU NÀO
              </button>
              <div className="absolute -left-48 top-1/2 -translate-y-1/2 animate-[pointLeft_1s_ease-in-out_infinite]">
                <img
                  src="https://readdy.ai/api/search-image?query=3D%20rendered%20pointing%20hand%20gesture%20with%20natural%20skin%20tone%20pointing%20right%20against%20transparent%20background&width=150&height=100&seq=11&orientation=landscape"
                  alt="Pointing hand"
                  className="w-32 h-auto transform -rotate-12"
                />
              </div>
              <div className="absolute -right-48 top-1/2 -translate-y-1/2 animate-[pointRight_1s_ease-in-out_infinite]">
                <img
                  src="https://readdy.ai/api/search-image?query=3D%20rendered%20pointing%20hand%20gesture%20with%20natural%20skin%20tone%20pointing%20left%20against%20transparent%20background&width=150&height=100&seq=12&orientation=landscape"
                  alt="Pointing hand"
                  className="w-32 h-auto transform rotate-12"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LapKeHoach;