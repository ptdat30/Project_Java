import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

// Component GhiNhanTinhTrang nhận một prop 'onComplete'
const GhiNhanTinhTrang = ({ onComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [selectedTobaccoType, setSelectedTobaccoType] = useState("cigarettes");
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("Gói");
  const [isTobaccoTypeDropdownOpen, setIsTobaccoTypeDropdownOpen] = useState(false);
  const [isHealthIssueDropdownOpen, setIsHealthIssueDropdownOpen] = useState(false);
  const [isFirstMenuOpen, setIsFirstMenuOpen] = useState(false);
  const [selectedTobaccoBrand, setSelectedTobaccoBrand] = useState("");
  const [selectedHealthIssue, setSelectedHealthIssue] = useState("");
  const [otherTobaccoBrand, setOtherTobaccoBrand] = useState("");
  
  // Additional form fields
  const [numberOfCigarettes, setNumberOfCigarettes] = useState("");
  const [smokingDurationYears, setSmokingDurationYears] = useState("");
  const [costPerPack, setCostPerPack] = useState("");
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!numberOfCigarettes || numberOfCigarettes <= 0) {
      newErrors.numberOfCigarettes = "Vui lòng nhập số lượng thuốc hút mỗi ngày";
    }
    
    if (!smokingDurationYears || smokingDurationYears <= 0) {
      newErrors.smokingDurationYears = "Vui lòng nhập thời gian hút thuốc";
    }
    
    if (!selectedTobaccoBrand) {
      newErrors.tobaccoBrand = "Vui lòng chọn loại thuốc";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare data for API
      const smokingStatusData = {
        tobaccoType: selectedTobaccoType,
        tobaccoBrand: selectedTobaccoBrand === "Khác" ? otherTobaccoBrand : selectedTobaccoBrand,
        numberOfCigarettes: parseInt(numberOfCigarettes),
        unit: selectedUnit,
        smokingDurationYears: parseInt(smokingDurationYears),
        healthIssue: selectedHealthIssue,
        costPerPack: costPerPack ? parseFloat(costPerPack) : null,
        recordDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        recorUpdate: new Date().toISOString().split('T')[0]
      };

      console.log("Sending smoking status data:", smokingStatusData);

      // Call API to save smoking status
      const response = await apiService.post(
        `/api/smoking-status/user/${user.id}`,
        smokingStatusData
      );

      console.log("Smoking status saved successfully:", response);
      setSubmitSuccess(true);
      
      // Show success message briefly
      setTimeout(() => {
        // Call onComplete callback to notify parent component
        if (onComplete) {
          onComplete();
        }
      }, 1500);
      
    } catch (error) {
      console.error("Error saving smoking status:", error);
      setErrors({
        submit: error.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lưu thông tin thành công!</h2>
          <p className="text-gray-600">Thông tin tình trạng hút thuốc của bạn đã được lưu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-8">VỀ VIỆC HÚT THUỐC CỦA BẠN</h2>
        
        {/* Error message */}
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.submit}
          </div>
        )}
        
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
                type="number"
                placeholder="Số lượng trong một ngày"
                value={numberOfCigarettes}
                onChange={(e) => setNumberOfCigarettes(e.target.value)}
                className={`flex-grow p-2 bg-gray-100 rounded-l-md border-none focus:outline-none text-sm ${
                  errors.numberOfCigarettes ? 'border-red-500' : ''
                }`}
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
            {errors.numberOfCigarettes && (
              <p className="text-red-500 text-xs mt-1">{errors.numberOfCigarettes}</p>
            )}
            <p className="text-xs text-gray-500 mt-1 text-right">Bắt buộc điền vào</p>
          </div>
          
          {/* Tobacco Brand */}
          <div>
            <h3 className="text-lg font-medium mb-3">Loại thuốc bạn hút (hoặc đã hút)?</h3>
            <div className="relative">
              <button
                onClick={toggleTobaccoTypeDropdown}
                className={`w-full bg-gray-100 p-2 rounded-md flex items-center justify-between cursor-pointer text-sm ${
                  errors.tobaccoBrand ? 'border border-red-500' : ''
                }`}
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
            {errors.tobaccoBrand && (
              <p className="text-red-500 text-xs mt-1">{errors.tobaccoBrand}</p>
            )}
          </div>
          
          {/* Smoking Duration */}
          <div>
            <h3 className="text-lg font-medium mb-3">Bạn đã hút được bao lâu?</h3>
            <input
              type="number"
              placeholder="bao nhiêu năm"
              value={smokingDurationYears}
              onChange={(e) => setSmokingDurationYears(e.target.value)}
              className={`w-full p-2 bg-gray-100 rounded-md border-none focus:outline-none text-sm ${
                errors.smokingDurationYears ? 'border border-red-500' : ''
              }`}
            />
            {errors.smokingDurationYears && (
              <p className="text-red-500 text-xs mt-1">{errors.smokingDurationYears}</p>
            )}
            <p className="text-xs text-gray-500 mt-1 text-right">Bắt buộc điền vào</p>
          </div>
          
          {/* Cost per pack (optional) */}
          <div>
            <h3 className="text-lg font-medium mb-3">Giá tiền mỗi gói thuốc (VND) - Tùy chọn</h3>
            <input
              type="number"
              placeholder="Ví dụ: 25000"
              value={costPerPack}
              onChange={(e) => setCostPerPack(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded-md border-none focus:outline-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Để tính toán số tiền tiết kiệm được</p>
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
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 rounded-md font-medium text-lg cursor-pointer whitespace-nowrap !rounded-button ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </div>
            ) : (
              'Hoàn thành'
            )}
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