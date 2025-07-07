import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import apiService from "../../services/apiService";
import { motion } from 'framer-motion';

const PlanPage = () => {
  const navigate = useNavigate(); // Khởi tạo useNavigate

  // State variables for form inputs
  const [startDate, setStartDate] = useState("today"); // 'today', 'tomorrow', 'custom'
  const [customDate, setCustomDate] = useState(""); // For specific custom date
  const [cigarettesPerDay, setCigarettesPerDay] = useState("");
  const [pricePerPack, setPricePerPack] = useState("");
  const [selectedReasons, setSelectedReasons] = useState([]); // Array of selected reason indices
  const [selectedTriggers, setSelectedTriggers] = useState([]); // Array of selected trigger IDs (e.g., "situation-0", "emotion-1")
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard'); // hoặc '/ghinhantinhtrang' nếu bạn muốn
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, navigate]);
  const [errors, setErrors] = useState({});

  // Thêm ref cho từng trường
  const customDateRef = useRef(null);
  const cigarettesPerDayRef = useRef(null);
  const pricePerPackRef = useRef(null);
  const reasonsRef = useRef(null);
  const triggersRef = useRef(null);

  // Define the full list of reasons to quit with their titles and images
  // Dữ liệu này phải được định nghĩa ở đây để có thể truy cập trong handleStartPlan
  const allReasons = [
    { title: "Cải thiện sức khoẻ", image: "/images/suckhoe.png" },
    { title: "Cho gia đình, bạn bè", image: "/images/giadinh.png" },
    { title: "Yêu cầu của bác sĩ", image: "/images/yeucaubacsi.png" },
    { title: "Tiết kiệm tiền", image: "/images/tietkiemtien.png" },
    { title: "Bảo vệ môi trường", image: "/images/baovemoitruong.png" },
    { title: "Cải thiện mùi, ngoại hình", image: "/images/caithienmui.png" },
    { title: "Cho em bé", image: "/images/choembe.png" },
    {
      title: "Kiểm soát bản thân",
      image:
        "https://readdy.ai/api/search-image?query=Person%20looking%20in%20mirror%20with%20determined%20expression%2C%20self%20improvement%20concept&width=200&height=200&seq=9&orientation=squarish",
    },
    { title: "Tương lai tốt hơn", image: "/images/tuonglaitothon.png" },
    { title: "Cho thú cưng", image: "/images/chothucung.png" },
  ];

  // Define the full list of situation triggers
  const allSituationTriggers = [
    "Được mời một điếu thuốc",
    "Uống rượu hoặc đi đến quán bar",
    "Đi dự tiệc hoặc sự kiện xã hội khác",
    "Ở gần những người hút thuốc hoặc sử dụng sản phẩm thuốc lá khác",
    "Nhìn thấy người khác hút thuốc",
    "Ngửi thấy khói thuốc lá",
  ];

  // Define the full list of emotion triggers
  const allEmotionTriggers = [
    "Tức giận",
    "Lo lắng, bồn chồn",
    "Phấn khởi, hạnh phúc",
    "Cô đơn",
    "Buồn, thất vọng",
    "Căng thẳng hoặc quá tải",
  ];

  // Handler for start date radio button changes
  const handleDateOptionChange = (option) => {
    setStartDate(option);
    setShowDatePicker(option === "custom"); // Simplified condition
  };

  // Handler for cigarettes per day input
  const handleCigarettesChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    setCigarettesPerDay(value);
  };

  // Handler for price per pack input
  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, ""); // Allow digits and a single dot
    // Ensure only one decimal point
    if (value.split('.').length > 2) {
      return;
    }
    setPricePerPack(value);
  };

  // Handler for selecting/deselecting reasons to quit
  const handleReasonSelect = (index) => {
    if (selectedReasons.includes(index)) {
      setSelectedReasons(selectedReasons.filter((id) => id !== index));
    } else {
      setSelectedReasons([...selectedReasons, index]);
    }
  };

  // Handler for selecting/deselecting craving triggers
  const handleTriggerSelect = (trigger, type) => {
    const triggerId = `${type}-${trigger}`;
    if (selectedTriggers.includes(triggerId)) {
      setSelectedTriggers(selectedTriggers.filter((id) => id !== triggerId));
    } else {
      setSelectedTriggers([...selectedTriggers, triggerId]);
    }
  };

  // Validate trước khi gửi
  const validateForm = () => {
    const newErrors = {};
    if (startDate === "custom" && !customDate) {
      newErrors.customDate = "Vui lòng chọn ngày bắt đầu.";
    }
    if (!cigarettesPerDay) {
      newErrors.cigarettesPerDay = "Vui lòng nhập số điếu thuốc mỗi ngày.";
    }
    if (!pricePerPack) {
      newErrors.pricePerPack = "Vui lòng nhập giá một bao thuốc.";
    }
    if (selectedReasons.length === 0) {
      newErrors.selectedReasons = "Vui lòng chọn ít nhất một lý do bỏ thuốc.";
    }
    if (selectedTriggers.length === 0) {
      newErrors.selectedTriggers = "Vui lòng chọn ít nhất một tình huống/cảm xúc gây thèm thuốc.";
    }
    setErrors(newErrors);
    // Scroll đến trường lỗi đầu tiên nếu có
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        if (newErrors.customDate && customDateRef.current) {
          customDateRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          customDateRef.current.focus && customDateRef.current.focus();
        } else if (newErrors.cigarettesPerDay && cigarettesPerDayRef.current) {
          cigarettesPerDayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          cigarettesPerDayRef.current.focus && cigarettesPerDayRef.current.focus();
        } else if (newErrors.pricePerPack && pricePerPackRef.current) {
          pricePerPackRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          pricePerPackRef.current.focus && pricePerPackRef.current.focus();
        } else if (newErrors.selectedReasons && reasonsRef.current) {
          reasonsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (newErrors.selectedTriggers && triggersRef.current) {
          triggersRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
    return Object.keys(newErrors).length === 0;
  };

  // Main handler to start the quit plan and send data to backend
  const handleStartPlan = async () => {
    if (!validateForm()) return;
    let actualStartDate;
    if (startDate === "today") {
      actualStartDate = new Date().toISOString().split("T")[0];
    } else if (startDate === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      actualStartDate = tomorrow.toISOString().split("T")[0];
    } else {
      actualStartDate = customDate;
    }

    // --- Xử lý selectedReasons để tạo JSON string cho 'selectedReasonsJson' ---
    // Chuyển đổi mảng các index thành chuỗi JSON
    const selectedReasonsJsonString = JSON.stringify(selectedReasons);

    // Chuỗi lý do cho trường 'reason' (lydocaythuoc)
    // Lấy tiêu đề của các lý do đã chọn và nối chúng lại
    const reasonTitles = selectedReasons.map(index => allReasons[index].title);
    const reasonStringForBackend = reasonTitles.length > 0
      ? reasonTitles.join(', ') // Nối các tên lý do
      : "Không có lý do cụ thể"; // Giá trị mặc định nếu không chọn gì


    // --- Xử lý selectedTriggers để tạo JSON string cho 'selectedTriggersJson' ---
    const actualSelectedTriggers = selectedTriggers.map(triggerId => {
        const [type, index] = triggerId.split('-');
        if (type === 'situation') {
            return allSituationTriggers[parseInt(index)];
        } else if (type === 'emotion') {
            return allEmotionTriggers[parseInt(index)];
        }
        return '';
    }).filter(Boolean); // Filter out any empty strings if an invalid type appears
    const selectedTriggersJsonString = JSON.stringify(actualSelectedTriggers);

    // Prepare the data payload for the backend
    const planData = {
      startDate: actualStartDate,
      cigarettesPerDay: parseInt(cigarettesPerDay, 10),
      pricePerPack: parseFloat(pricePerPack),
      
      reason: reasonStringForBackend, // Gán chuỗi tên lý do đã xử lý

      selectedReasonsJson: selectedReasonsJsonString, // Gán chuỗi JSON của mảng index
      selectedTriggersJson: selectedTriggersJsonString, // Gán chuỗi JSON của mảng triggers

      initialSmokingHabit: String(cigarettesPerDay), // Backend yêu cầu String
      quittingPhases: "Giai đoạn 1", // Giá trị mặc định hoặc có thể thêm input cho người dùng
      targetQuitDate: actualStartDate, // Hoặc tính toán ngày mục tiêu dựa trên logic
    };

    try {
      await apiService.createQuitPlan(planData);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Lỗi khi lưu kế hoạch:", error.response ? error.response.data : error.message);

      if (error.response) {
        alert(`Lỗi: ${error.response.status} - ${error.response.data.message || 'Có lỗi xảy ra từ máy chủ.'}`);
      } else if (error.request) {
        alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc CORS.");
      } else {
        alert("Có lỗi không xác định xảy ra khi gửi kế hoạch. Vui lòng thử lại.");
      }
    }
  };

  const lightGreen = "#49b08b";

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lưu kế hoạch thành công!</h2>
          <p className="text-gray-600">Bạn sẽ được chuyển sang bước lập lịch tiếp theo.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-2 sm:py-8 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* First Section - Choose Start Date */}
        <div className="mb-6 sm:mb-8 bg-white rounded-lg overflow-hidden shadow">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-2 sm:py-3 px-2 sm:px-4 text-center">
            <h2 className="text-lg sm:text-xl font-bold">CHỌN NGÀY BẮT ĐẦU KẾ HOẠCH</h2>
          </div>
          <div className="p-4 sm:p-8 bg-gray-50">
            {/* Hiển thị lỗi customDate */}
            {errors.customDate && <div className="text-red-600 text-sm mb-2">{errors.customDate}</div>}
            <p className="mb-4 sm:mb-6 text-gray-800 text-base sm:text-lg">
              Hãy chọn ngày vào khoảng mấy tuần tiếp theo để bạn có thời gian
              chuẩn bị trước khi bước vào tuần kế hoạch, hoặc nếu bạn đã sẵn
              sàng bạn có thể chọn các ngày dưới đây:
            </p>
            <div className="mt-2 sm:mt-4">
              <p className="font-medium mb-2 sm:mb-3 text-gray-800">
                Khi nào bạn thực hiện kế hoạch?
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="today"
                    name="startDate"
                    className="h-5 w-5 text-blue-600"
                    checked={startDate === "today"}
                    onChange={() => handleDateOptionChange("today")}
                  />
                  <label
                    htmlFor="today"
                    className="ml-2 text-gray-800 cursor-pointer"
                  >
                    Hôm nay
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="tomorrow"
                    name="startDate"
                    className="h-5 w-5 text-blue-600"
                    checked={startDate === "tomorrow"}
                    onChange={() => handleDateOptionChange("tomorrow")}
                  />
                  <label
                    htmlFor="tomorrow"
                    className="ml-2 text-gray-800 cursor-pointer"
                  >
                    Ngày mai
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="custom"
                    name="startDate"
                    className="h-5 w-5 text-blue-600"
                    checked={startDate === "custom"}
                    onChange={() => handleDateOptionChange("custom")}
                  />
                  <label
                    htmlFor="custom"
                    className="ml-2 text-gray-800 cursor-pointer"
                  >
                    Chọn ngày của tôi
                  </label>
                </div>
                {showDatePicker && (
                  <div className="ml-7 mt-2">
                    <input
                      type="date"
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 !rounded-button"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      ref={customDateRef}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Second Section - Smoking Cost */}
        <div className="bg-white rounded-lg overflow-hidden shadow mb-6 sm:mb-8">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-2 sm:py-3 px-2 sm:px-4 text-center">
            <h2 className="text-lg sm:text-xl font-bold">
              BẠN CHI TRẢ BAO NHIÊU CHO VIỆC HÚT THUỐC?
            </h2>
          </div>
          <div className="p-4 sm:p-8 bg-gray-50">
            {/* Hiển thị lỗi cigarettesPerDay, pricePerPack */}
            {errors.cigarettesPerDay && <div className="text-red-600 text-sm mb-2">{errors.cigarettesPerDay}</div>}
            {errors.pricePerPack && <div className="text-red-600 text-sm mb-2">{errors.pricePerPack}</div>}
            <p className="mb-4 sm:mb-6 text-gray-800 text-base sm:text-lg">
              Nhập số lượng bạn hút trong một gói và số lượng gói bạn hút sẽ cho
              bạn biết được số tiền bạn tiết kiệm được khi bắt đầu thực hiện kế
              hoạch cai thuốc.
            </p>
            <div className="bg-white p-4 sm:p-8 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
                <div className="w-full sm:w-32 flex-shrink-0">
                  <img
                    src="https://readdy.ai/api/search-image?query=A%20simple%20calculator%20icon%20with%20basic%20buttons%20and%20display%20screen%2C%20minimalist%20design%2C%20clean%20lines%2C%20soft%20gray%20background%2C%20professional%20look%2C%20suitable%20for%20a%20quit%20smoking%20app%20interface&width=100&height=100&seq=1&orientation=squarish"
                    alt="Calculator"
                    className="w-full h-auto max-w-full"
                  />
                </div>
                <div className="flex-grow ml-0 sm:ml-4 w-full">
                  <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                    <span className="text-gray-800 mr-0 sm:mr-3 text-base sm:text-lg">
                      Tôi hút khoảng
                    </span>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 w-full sm:w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 !rounded-button text-base sm:text-lg"
                      value={cigarettesPerDay}
                      onChange={handleCigarettesChange}
                      placeholder="0"
                      ref={cigarettesPerDayRef}
                    />
                    <span className="text-gray-800 ml-0 sm:ml-2 text-base sm:text-lg">
                      điếu thuốc một ngày.
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
                    <span className="text-gray-800 mr-0 sm:mr-3 text-base sm:text-lg">
                      Tôi dành khoảng
                    </span>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 w-full sm:w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 !rounded-button text-base sm:text-lg"
                      value={pricePerPack}
                      onChange={handlePriceChange}
                      placeholder="0.00"
                      ref={pricePerPackRef}
                    />
                    <span className="text-gray-800 ml-0 sm:ml-2 text-base sm:text-lg">
                      cho một bao thuốc.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Third Section - Reasons to Quit */}
        <div className="bg-white rounded-lg overflow-hidden shadow mb-6 sm:mb-8">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-2 sm:py-3 px-2 sm:px-4 text-center">
            <h2 className="text-lg sm:text-xl font-bold">TẠI SAO BẠN LẠI BỎ THUỐC?</h2>
          </div>
          <div className="p-4 sm:p-8 bg-gray-50">
            {/* Hiển thị lỗi selectedReasons */}
            {errors.selectedReasons && <div className="text-red-600 text-sm mb-2">{errors.selectedReasons}</div>}
            <p className="mb-4 sm:mb-6 text-gray-800 text-base sm:text-lg">
              Biết được mục đích cai nghiện sẽ giúp bạn giữ vững động lực để
              tiếp tục cai thuốc trong những tình huống khó khăn hay thèm
              khát,...
            </p>
            <div className="mb-2 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
                Lý do tôi muốn bỏ thuốc:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4" ref={reasonsRef}>
                {[
                  {
                    title: "Cải thiện sức khoẻ",
                    image:
                      "/images/suckhoe.png",
                  },
                  {
                    title: "Cho gia đình, bạn bè",
                    image:
                      "/images/giadinh.png",
                  },
                  {
                    title: "Yêu cầu của bác sĩ",
                    image:
                      "/images/yeucaubacsi.png",
                  },
                  {
                    title: "Tiết kiệm tiền",
                    image:
                      "/images/tietkiemtien.png",
                  },
                  {
                    title: "Bảo vệ môi trường",
                    image:
                      "/images/baovemoitruong.png",
                  },
                  {
                    title: "Cải thiện mùi, ngoại hình",
                    image:
                      "/images/caithienmui.png",
                  },
                  {
                    title: "Cho em bé",
                    image:
                      "/images/choembe.png",
                  },
                  {
                    title: "Kiểm soát bản thân",
                    image:
                      "https://readdy.ai/api/search-image?query=Person%20looking%20in%20mirror%20with%20determined%20expression%2C%20self%20improvement%20concept&width=200&height=200&seq=9&orientation=squarish",
                  },
                  {
                    title: "Tương lai tốt hơn",
                    image:
                      "/images/tuonglaitothon.png",
                  },
                  {
                    title: "Cho thú cưng",
                    image:
                      "/images/chothucung.png",
                  },
                ].map((reason, index) => (
                  <div
                    key={index}
                    onClick={() => handleReasonSelect(index)}
                    className={`rounded-lg p-4 border transition-all cursor-pointer ${
                      selectedReasons.includes(index)
                        ? "border-green-600 bg-green-100 shadow-md"
                        : "border-gray-200 hover:border-gray-300 bg-white shadow-sm"
                    }`}
                  >
                    <div className="aspect-square rounded-full overflow-hidden mb-3 relative">
                      <img
                        src={reason.image}
                        alt={reason.title}
                        className="w-full h-full object-cover"
                      />
                      {selectedReasons.includes(index) && (
                        <div className="absolute top-1 right-1 bg-green-600 rounded-full p-1.5 flex items-center justify-center shadow-md">
                          <i className="fas fa-check text-white text-xs"></i>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-sm font-medium text-gray-800">
                      {reason.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fourth Section - Craving Triggers */}
        <div className="bg-white rounded-lg overflow-hidden shadow mb-6 sm:mb-8">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-2 sm:py-3 px-2 sm:px-4 text-center">
            <h2 className="text-lg sm:text-xl font-bold">
              KHI NÀO BẠN LÊN CƠN THÈM KHÁT
            </h2>
          </div>
          <div className="p-4 sm:p-8 bg-gray-50">
            {/* Hiển thị lỗi selectedTriggers */}
            {errors.selectedTriggers && <div className="text-red-600 text-sm mb-2">{errors.selectedTriggers}</div>}
            <p className="mb-4 sm:mb-6 text-gray-800 text-base sm:text-lg">
              Sau khi bạn cai thuốc, một số địa điểm, tình huống và cảm xúc
              nhất định có thể khiến bạn khó duy trì việc cai thuốc. Sử dụng
              danh sách này để tìm ra lý do khiến bạn muốn hút thuốc. Chúng
              tôi sẽ cung cấp cho bạn các chiến lược giúp bạn kiểm soát được
              việc hút thuốc.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8" ref={triggersRef}>
              <div>
                <h3 className="text-xl font-semibold mb-4">TÌNH HUỐNG</h3>
                <div className="space-y-4">
                  {allSituationTriggers.map((situation, index) => ( // Sử dụng allSituationTriggers
                    <div
                      key={`situation-${index}`}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTriggers.includes(`situation-${index}`)
                          ? "bg-green-100 border-green-500"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleTriggerSelect(index, "situation")}
                    >
                      <div
                        className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center ${
                          selectedTriggers.includes(`situation-${index}`)
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedTriggers.includes(`situation-${index}`) && (
                          <i className="fas fa-check text-white"></i>
                        )}
                      </div>
                      <span className="flex-grow">{situation}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">CẢM XÚC</h3>
                <div className="space-y-4">
                  {allEmotionTriggers.map((emotion, index) => ( // Sử dụng allEmotionTriggers
                    <div
                      key={`emotion-${index}`}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTriggers.includes(`emotion-${index}`)
                          ? "bg-green-100 border-green-500"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleTriggerSelect(index, "emotion")}
                    >
                      <div
                        className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center ${
                          selectedTriggers.includes(`emotion-${index}`)
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedTriggers.includes(`emotion-${index}`) && (
                          <i className="fas fa-check text-white"></i>
                        )}
                      </div>
                      <span className="flex-grow">{emotion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Plan Button */}
        <div className="bg-white rounded-lg overflow-hidden shadow mb-6 sm:mb-8">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-2 sm:py-3 px-2 sm:px-4 text-center">
            <h2 className="text-lg sm:text-xl font-bold">BẮT ĐẦU KẾ HOẠCH</h2>
          </div>
          <div className="p-4 sm:p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[120px] sm:min-h-[200px]">
            <p className="text-gray-800 text-base sm:text-xl font-semibold mb-4 sm:mb-6 text-center">
              Bạn đã sẵn sàng để bắt đầu hành trình bỏ thuốc của mình?
            </p>
            <p className="text-gray-700 text-sm sm:text-lg mb-4 sm:mb-8 text-center max-w-lg">
              Nhấn vào nút bên dưới để khởi động kế hoạch và thay đổi cuộc sống của bạn ngay hôm nay!
            </p>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-green-600 text-3xl sm:text-5xl transform -rotate-12">➜</span>
                <button
                onClick={handleStartPlan}
                className="bg-green-600 text-white font-bold py-2 sm:py-4 px-6 sm:px-10 rounded-lg text-lg sm:text-2xl shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75"
                >
                Bắt đầu nào
                </button>
                <span className="text-green-600 text-3xl sm:text-5xl transform -rotate-165">➜</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanPage;