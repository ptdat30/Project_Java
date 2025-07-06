import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { motion, AnimatePresence } from 'framer-motion';

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
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const smokingStatusData = {
        tobaccoType: selectedTobaccoType,
        tobaccoBrand: selectedTobaccoBrand === "Khác" ? otherTobaccoBrand : selectedTobaccoBrand,
        numberOfCigarettes: parseInt(numberOfCigarettes),
        unit: selectedUnit,
        smokingDurationYears: parseInt(smokingDurationYears),
        healthIssue: selectedHealthIssue,
        costPerPack: costPerPack ? parseFloat(costPerPack) : null,
        recordDate: new Date().toISOString().split('T')[0],
        recorUpdate: new Date().toISOString().split('T')[0]
      };

      const response = await apiService.post(
          `/api/smoking-status/user/${user.id}`,
          smokingStatusData
      );

      setSubmitSuccess(true);

      setTimeout(() => {
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white"
        >
          <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="text-green-600 text-6xl mb-4"
            >
              ✓
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Lưu thông tin thành công!</h2>
            <p className="text-gray-600">Thông tin tình trạng hút thuốc của bạn đã được lưu.</p>
          </div>
        </motion.div>
    );
  }

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white"
      >
        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
          <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-center mb-8 text-green-800"
          >
            VỀ VIỆC HÚT THUỐC CỦA BẠN
          </motion.h2>

          {/* Error message */}
          <AnimatePresence>
            {errors.submit && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                >
                  {errors.submit}
                </motion.div>
            )}
          </AnimatePresence>

          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
          >
            {/* Tobacco Type Selection */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-green-100"
            >
              <h3 className="text-lg font-medium mb-3 text-green-700">Bạn hút (hoặc đã hút) loại thuốc gì?</h3>
              <div className="space-y-3">
                {["cigarettes", "rustic", "vape"].map((type) => (
                    <motion.label
                        key={type}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center p-2 rounded-lg hover:bg-green-50 cursor-pointer"
                    >
                      <input
                          type="radio"
                          name="tobaccoType"
                          checked={selectedTobaccoType === type}
                          onChange={() => handleTobaccoTypeChange(type)}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="text-gray-700">
                    {type === "cigarettes" && "Thuốc lá (Cigarettes)"}
                        {type === "rustic" && "Thuốc lào (Rustic tobacco)"}
                        {type === "vape" && "Thuốc lá điện tử (Vape)"}
                  </span>
                    </motion.label>
                ))}
              </div>
            </motion.div>

            {/* Amount per day */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-green-100"
            >
              <h3 className="text-lg font-medium mb-3 text-green-700">Số lượng (xấp xỉ) mà bạn hút (hoặc đã hút) một ngày?</h3>
              <div className="flex">
                <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="number"
                    placeholder="Số lượng trong một ngày"
                    value={numberOfCigarettes}
                    onChange={(e) => setNumberOfCigarettes(e.target.value)}
                    className={`flex-grow p-3 bg-green-50 rounded-l-md border-none focus:outline-none focus:ring-2 focus:ring-green-300 text-sm ${
                        errors.numberOfCigarettes ? 'border-red-500' : ''
                    }`}
                />
                <div className="relative">
                  <motion.button
                      whileHover={{ backgroundColor: '#e5f5e0' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={toggleUnitDropdown}
                      className="bg-green-50 p-3 rounded-r-md flex items-center justify-between min-w-[90px] cursor-pointer text-sm border-l border-green-100"
                  >
                    <span className="text-green-800">Đơn vị: {selectedUnit}</span>
                    <motion.i
                        animate={{ rotate: isUnitDropdownOpen ? 180 : 0 }}
                        className="fas fa-chevron-down ml-1 text-xs text-green-600"
                    ></motion.i>
                  </motion.button>
                  <AnimatePresence>
                    {isUnitDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md py-1 z-10 border border-green-100"
                        >
                          {["Gói", "Gam", "ML"].map((unit) => (
                              <motion.div
                                  key={unit}
                                  whileHover={{ backgroundColor: '#f0fdf4' }}
                                  onClick={() => selectUnit(unit)}
                                  className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm text-green-800"
                              >
                                {unit}
                              </motion.div>
                          ))}
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {errors.numberOfCigarettes && (
                  <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-1"
                  >
                    {errors.numberOfCigarettes}
                  </motion.p>
              )}
              <p className="text-xs text-gray-500 mt-1 text-right">Bắt buộc điền vào</p>
            </motion.div>

            {/* Tobacco Brand */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-green-100"
            >
              <h3 className="text-lg font-medium mb-3 text-green-700">Loại thuốc bạn hút (hoặc đã hút)?</h3>
              <div className="relative">
                <motion.button
                    whileHover={{ backgroundColor: '#e5f5e0' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleTobaccoTypeDropdown}
                    className={`w-full bg-green-50 p-3 rounded-md flex items-center justify-between cursor-pointer text-sm ${
                        errors.tobaccoBrand ? 'border border-red-500' : ''
                    }`}
                >
                <span className={selectedTobaccoBrand ? "text-green-800" : "text-gray-500"}>
                  {selectedTobaccoBrand || "Jet, Hero..."}
                </span>
                  <motion.i
                      animate={{ rotate: isTobaccoTypeDropdownOpen ? 180 : 0 }}
                      className="fas fa-chevron-down text-xs text-green-600"
                  ></motion.i>
                </motion.button>
                <AnimatePresence>
                  {isTobaccoTypeDropdownOpen && (
                      <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md py-1 z-10 border border-green-100 max-h-60 overflow-y-auto"
                      >
                        {["Jet", "Hero", "Marlboro", "555", "Thăng Long", "Vinataba"].map((brand) => (
                            <motion.div
                                key={brand}
                                whileHover={{ backgroundColor: '#f0fdf4' }}
                                onClick={() => {
                                  setSelectedTobaccoBrand(brand);
                                  setIsTobaccoTypeDropdownOpen(false);
                                }}
                                className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm text-green-800"
                            >
                              {brand}
                            </motion.div>
                        ))}
                        <div className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm">
                          <div className="flex items-center">
                            <span className="text-green-800">Khác:</span>
                            <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="text"
                                className="ml-2 p-1 border rounded flex-grow border-green-200 focus:outline-none focus:ring-1 focus:ring-green-300"
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
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {errors.tobaccoBrand && (
                  <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-1"
                  >
                    {errors.tobaccoBrand}
                  </motion.p>
              )}
            </motion.div>

            {/* Smoking Duration */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-green-100"
            >
              <h3 className="text-lg font-medium mb-3 text-green-700">Bạn đã hút được bao lâu?</h3>
              <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  placeholder="bao nhiêu năm"
                  value={smokingDurationYears}
                  onChange={(e) => setSmokingDurationYears(e.target.value)}
                  className={`w-full p-3 bg-green-50 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-green-300 text-sm ${
                      errors.smokingDurationYears ? 'border border-red-500' : ''
                  }`}
              />
              {errors.smokingDurationYears && (
                  <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-1"
                  >
                    {errors.smokingDurationYears}
                  </motion.p>
              )}
              <p className="text-xs text-gray-500 mt-1 text-right">Bắt buộc điền vào</p>
            </motion.div>

            {/* Cost per pack (optional) */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-green-100"
            >
              <h3 className="text-lg font-medium mb-3 text-green-700">Giá tiền mỗi gói thuốc (VND) - Tùy chọn</h3>
              <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  placeholder="Ví dụ: 25000"
                  value={costPerPack}
                  onChange={(e) => setCostPerPack(e.target.value)}
                  className="w-full p-3 bg-green-50 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-green-300 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Để tính toán số tiền tiết kiệm được</p>
              <p className="text-xs text-gray-500 mt-1 text-right">Bắt buộc điền vào</p>
            </motion.div>

            {/* Health Issues */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-green-100"
            >
              <h3 className="text-lg font-medium mb-3 text-green-700">Bạn có gặp vấn đề sức khỏe nào sau khi hút không?</h3>
              <div className="relative">
                <motion.button
                    whileHover={{ backgroundColor: '#e5f5e0' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleHealthIssueDropdown}
                    className="w-full bg-green-50 p-3 rounded-md flex items-center justify-between cursor-pointer text-sm"
                >
                <span className={selectedHealthIssue ? "text-green-800" : "text-gray-500"}>
                  {selectedHealthIssue || "Khó thở, ho,..."}
                </span>
                  <motion.i
                      animate={{ rotate: isHealthIssueDropdownOpen ? 180 : 0 }}
                      className="fas fa-chevron-down text-xs text-green-600"
                  ></motion.i>
                </motion.button>
                <AnimatePresence>
                  {isHealthIssueDropdownOpen && (
                      <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md py-1 z-10 border border-green-100 max-h-60 overflow-y-auto"
                      >
                        {["Ho thường xuyên", "Khó thở", "Đau ngực", "Mất vị giác/khứu giác", "Mệt mỏi", "Không có triệu chứng nào"].map((issue) => (
                            <motion.div
                                key={issue}
                                whileHover={{ backgroundColor: '#f0fdf4' }}
                                onClick={() => {
                                  setSelectedHealthIssue(issue);
                                  setIsHealthIssueDropdownOpen(false);
                                }}
                                className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm text-green-800"
                            >
                              {issue}
                            </motion.div>
                        ))}
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">Bắt buộc điền vào</p>
            </motion.div>

            {/* Submit Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-medium text-lg cursor-pointer whitespace-nowrap shadow-md ${
                    isLoading
                        ? 'bg-green-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="rounded-full h-5 w-5 border-b-2 border-white mr-2"
                    ></motion.div>
                    Đang lưu...
                  </div>
              ) : (
                  'Hoàn thành'
              )}
            </motion.button>

            {/* Footer Text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-gray-600 mt-4"
            >
              Điều này cho phép chúng tôi trình bày số tiền bạn tiết kiệm được bằng cách cai hút thuốc.
            </motion.p>
          </motion.div>
        </main>
      </motion.div>
  );
};

export default GhiNhanTinhTrang;