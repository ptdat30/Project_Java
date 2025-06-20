import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Component GhiNhanTinhTrang nhận một prop 'onComplete'
const GhiNhanTinhTrang = ({ onComplete }) => {
  const [selectedTobaccoType, setSelectedTobaccoType] = useState("cigarettes");
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("Gói");
  const [isTobaccoTypeDropdownOpen, setIsTobaccoTypeDropdownOpen] = useState(false);
  const [isHealthIssueDropdownOpen, setIsHealthIssueDropdownOpen] = useState(false);
  const [isFirstMenuOpen, setIsFirstMenuOpen] = useState(false);
  const [selectedTobaccoBrand, setSelectedTobaccoBrand] = useState("");
  const [selectedHealthIssue, setSelectedHealthIssue] = useState("");
  const [otherTobaccoBrand, setOtherTobaccoBrand] = useState("");
  const navigate = useNavigate(); // Khởi tạo hook navigate

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

  const handleSubmit = () => {
    // Logic để lưu dữ liệu của form ghi nhận tình trạng ở đây (nếu có)
    // Ví dụ: gửi lên API, lưu vào localStorage, v.v.
    console.log("Dữ liệu ghi nhận tình trạng:", {
      selectedTobaccoType,
      selectedUnit,
      selectedTobaccoBrand: selectedTobaccoBrand === "Khác" ? otherTobaccoBrand : selectedTobaccoBrand,
      selectedHealthIssue
      // ... thêm các trường dữ liệu khác từ form của bạn
    });

    // Gọi hàm onComplete được truyền từ App.jsx
    // Điều này sẽ thông báo cho App.jsx rằng form đã được hoàn thành
    if (onComplete) {
      onComplete();
    }
    // Không cần navigate ở đây nữa, vì App.jsx sẽ xử lý việc điều hướng
    // sau khi onComplete được gọi và trạng thái được cập nhật.
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-8">VỀ VIỆC HÚT THUỐC CỦa BẠN</h2>
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
                  <div onClick={() => {
                    setSelectedTobaccoBrand("Jet");
                    setIsTobaccoTypeDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Jet</div>
                  <div onClick={() => {
                    setSelectedTobaccoBrand("Hero");
                    setIsTobaccoTypeDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Hero</div>
                  <div onClick={() => {
                    setSelectedTobaccoBrand("Marlboro");
                    setIsTobaccoTypeDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Marlboro</div>
                  <div onClick={() => {
                    setSelectedTobaccoBrand("555");
                    setIsTobaccoTypeDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">555</div>
                  <div onClick={() => {
                    setSelectedTobaccoBrand("Thăng Long");
                    setIsTobaccoTypeDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Thăng Long</div>
                  <div onClick={() => {
                    setSelectedTobaccoBrand("Vinataba");
                    setIsTobaccoTypeDropdownOpen(false);
                  }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">Vinataba</div>
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
          <button
            onClick={handleSubmit} // Gọi handleSubmit khi click
            className="w-full bg-green-500 text-white py-3 rounded-md font-medium text-lg cursor-pointer whitespace-nowrap !rounded-button"
          >
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