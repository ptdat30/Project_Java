import React, { useState, useEffect } from 'react';

const GhiNhanTinhTrang = () => {
  const [selectedTobaccoType, setSelectedTobaccoType] = useState("cigarettes");
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("Gói");
  const [isTobaccoTypeDropdownOpen, setIsTobaccoTypeDropdownOpen] = useState(false);
  const [isHealthIssueDropdownOpen, setIsHealthIssueDropdownOpen] = useState(false);
  const [isFirstMenuOpen, setIsFirstMenuOpen] = useState(false);
  const [selectedTobaccoBrand, setSelectedTobaccoBrand] = useState("");
  const [selectedHealthIssue, setSelectedHealthIssue] = useState("");
  const [otherTobaccoBrand, setOtherTobaccoBrand] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest('.menu-container')) {
        setIsFirstMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTobaccoTypeChange = (type) => {
    setSelectedTobaccoType(type);
  };
  const toggleUnitDropdown = () => {
    setIsUnitDropdownOpen(!isUnitDropdownOpen);
  };
  const selectUnit = (unit) => {
    setSelectedUnit(unit);
    setIsUnitDropdownOpen(false);
  };
  const toggleTobaccoTypeDropdown = () => {
    setIsTobaccoTypeDropdownOpen(!isTobaccoTypeDropdownOpen);
  };
  const toggleHealthIssueDropdown = () => {
    setIsHealthIssueDropdownOpen(!isHealthIssueDropdownOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="bg-black text-white py-3 flex justify-between items-center px-8">
          <div className="flex-1"></div>
          <p className="text-sm flex-1 text-center">ĐĂNG KÍ NGAY ĐỂ NHẬN LỜI KHUYÊN HỮU ÍCH TỪ CHUYÊN GIA</p>
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <button className="bg-yellow-100 text-gray-800 px-6 py-1.5 rounded-md border border-yellow-300 cursor-pointer hover:bg-yellow-200 transition-colors duration-200 whitespace-nowrap !rounded-button">ĐĂNG NHẬP</button>
            <button className="bg-blue-400 text-white px-6 py-1.5 rounded-md cursor-pointer hover:bg-blue-500 transition-colors duration-200 whitespace-nowrap !rounded-button">ĐĂNG KÍ</button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-2">
                <i className="fas fa-smoking-ban text-white text-xl"></i>
              </div>
              <div className="text-gray-700">
                <h1 className="text-lg font-medium">Hỗ trợ cai nghiện</h1>
                <h2 className="text-lg font-medium">Thuốc lá</h2>
              </div>
            </div>
            <nav className="hidden md:flex space-x-4">
              <div className="relative menu-container group">
                <button
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer whitespace-nowrap !rounded-button"
                >
                  CHỨC NĂNG <i className="fas fa-chevron-down ml-1 text-xs"></i>
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white shadow-lg rounded-md py-1 z-10 transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Khai báo tình trạng</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Lập kế hoạch</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Đăng kí thành viên</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thông báo định kì</a>
                </div>
              </div>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer whitespace-nowrap !rounded-button">
                CHỨC NĂNG <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer whitespace-nowrap !rounded-button">
                CHỨC NĂNG <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer whitespace-nowrap !rounded-button">
                CHỨC NĂNG <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer whitespace-nowrap !rounded-button">
                CHỨC NĂNG <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
            </nav>
          </div>
          <div className="flex items-center">
            <p className="text-sm text-gray-600">HOTLINE TƯ VẤN: <span className="font-bold text-red-500">123456789</span></p>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-8">VỀ VIỆC HÚT THUỐC CỦA BẠN</h2>
        <div className="space-y-8">
          {/* Tobacco Type Selection */}
          <div>
            <h3 className="text-lg font-medium mb-3">Bạn hút (hoặc đã hút) loại thuốc gì?</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tobaccoType"
                  checked={selectedTobaccoType === "cigarettes"}
                  onChange={() => handleTobaccoTypeChange("cigarettes")}
                  className="mr-2"
                />
                <span>Thuốc lá (Cigarettes)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tobaccoType"
                  checked={selectedTobaccoType === "rustic"}
                  onChange={() => handleTobaccoTypeChange("rustic")}
                  className="mr-2"
                />
                <span>Thuốc lào (Rustic tobacco)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tobaccoType"
                  checked={selectedTobaccoType === "vape"}
                  onChange={() => handleTobaccoTypeChange("vape")}
                  className="mr-2"
                />
                <span>Thuốc lá điện tử (Vape)</span>
              </label>
            </div>
          </div>
          {/* Amount per day */}
          <div>
            <h3 className="text-lg font-medium mb-3">Số lượng (xấp xỉ) mà bạn hút (hoặc đã hút) một ngày?</h3>
            <div className="flex">
              <input
                type="text"
                placeholder="Số lượng trong một ngày"
                className="flex-grow p-2 bg-gray-100 rounded-l-md border-none focus:outline-none text-sm"
              />
              <div className="relative">
                <button
                  onClick={toggleUnitDropdown}
                  className="bg-gray-100 p-2 rounded-r-md flex items-center justify-between min-w-[80px] cursor-pointer text-sm"
                >
                  <span>Đơn vị: {selectedUnit}</span>
                  <i className="fas fa-chevron-down ml-1 text-xs"></i>
                </button>
                {isUnitDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md py-1 z-10">
                    <div onClick={() => selectUnit("Gói")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Gói</div>
                    <div onClick={() => selectUnit("Gam")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Gam</div>
                    <div onClick={() => selectUnit("ML")} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">ML</div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">Bắt buộc điền vào</p>
          </div>
          {/* Tobacco Brand */}
          <div>
            <h3 className="text-lg font-medium mb-3">Loại thuốc bạn hút (hoặc đã hút)?</h3>
            <div className="relative">
              <button
                onClick={toggleTobaccoTypeDropdown}
                className="w-full bg-gray-100 p-2 rounded-md flex items-center justify-between cursor-pointer text-sm"
              >
                <span>{selectedTobaccoBrand || "Jet, Hero..."}</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              {isTobaccoTypeDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md py-1 z-10">
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Jet</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Hero</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Marlboro</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">555</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Thăng Long</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Vinataba</div>
                  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                    <div className="flex items-center">
                      <span>Khác:</span>
                      <input
                        type="text"
                        className="ml-2 p-1 border rounded flex-grow"
                        placeholder="Nhập loại thuốc khác"
                        value={otherTobaccoBrand}
                        onChange={(e) => setOtherTobaccoBrand(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            setSelectedTobaccoBrand(otherTobaccoBrand);
                            setIsTobaccoTypeDropdownOpen(false);
                            setOtherTobaccoBrand('');
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Smoking Duration */}
          <div>
            <h3 className="text-lg font-medium mb-3">Bạn đã hút được bao lâu?</h3>
            <input
              type="text"
              placeholder="bao nhiêu năm"
              className="w-full p-2 bg-gray-100 rounded-md border-none focus:outline-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">Bắt buộc điền vào</p>
          </div>
          {/* Health Issues */}
          <div>
            <h3 className="text-lg font-medium mb-3">Bạn có gặp vấn đề sức khỏe nào sau khi hút không?</h3>
            <div className="relative">
              <button
                onClick={toggleHealthIssueDropdown}
                className="w-full bg-gray-100 p-2 rounded-md flex items-center justify-between cursor-pointer text-sm"
              >
                <span>{selectedHealthIssue || "Khó thở, ho,..."}</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              {isHealthIssueDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md py-1 z-10">
                  <div onClick={() => {
                    setSelectedHealthIssue("Ho thường xuyên");
                    setIsHealthIssueDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Ho thường xuyên</div>
                  <div onClick={() => {
                    setSelectedHealthIssue("Khó thở");
                    setIsHealthIssueDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Khó thở</div>
                  <div onClick={() => {
                    setSelectedHealthIssue("Đau ngực");
                    setIsHealthIssueDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Đau ngực</div>
                  <div onClick={() => {
                    setSelectedHealthIssue("Mất vị giác/khứu giác");
                    setIsHealthIssueDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Mất vị giác/khứu giác</div>
                  <div onClick={() => {
                    setSelectedHealthIssue("Mệt mỏi");
                    setIsHealthIssueDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Mệt mỏi</div>
                  <div onClick={() => {
                    setSelectedHealthIssue("Không có triệu chứng nào");
                    setIsHealthIssueDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Không có triệu chứng nào</div>
                </div>
              )}
            </div>
          </div>
          {/* Submit Button */}
          <button className="w-full bg-green-500 text-white py-3 rounded-md font-medium text-lg cursor-pointer whitespace-nowrap !rounded-button">
            Hoàn thành
          </button>
          {/* Footer Text */}
          <p className="text-center text-gray-600 mt-4">
            Điều này cho phép chúng tôi trình bày số tiền bạn tiết kiệm được bằng cách cai hút thuốc.
          </p>
        </div>
      </main>
    </div>
  );
};

export default GhiNhanTinhTrang;