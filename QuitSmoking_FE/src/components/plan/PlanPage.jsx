import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  // Define the full list of reasons to quit with their titles and images
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
    let value = e.target.value.replace(/[^0-9.]/g, ""); // Allow digits and a single dot
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
  const handleTriggerSelect = (index, type) => {
    const triggerId = `${type}-${index}`;
    if (selectedTriggers.includes(triggerId)) {
      setSelectedTriggers(selectedTriggers.filter((id) => id !== triggerId));
    } else {
      setSelectedTriggers([...selectedTriggers, triggerId]);
    }
  };

  // Main handler to start the quit plan and send data to backend
  const handleStartPlan = async () => {
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

    console.log("Dữ liệu kế hoạch gửi đi:", planData);

    try {
      const token = localStorage.getItem("jwt_token");

      if (!token) {
        alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tạo kế hoạch.");
        console.warn("Không tìm thấy JWT token trong localStorage. Yêu cầu gửi bị hủy.");
        navigate('/login'); // Redirect to login page
        return;
      }

      console.log("Đang gửi request Axios đến backend...");

      const response = await axios.post(
        "http://localhost:8080/api/quit-plans", // Đảm bảo URL này chính xác
        planData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Kế hoạch đã được lưu thành công:", response.data);
      alert("Kế hoạch của bạn đã bắt đầu và được lưu thành công!");

      // Lưu kế hoạch vào localStorage để Dashboard đọc được
      localStorage.setItem("quitPlan", JSON.stringify({
        ...planData,
        realStartDate: actualStartDate,
        recentAchievements: [],
        weeklyProgress: [],
        todayStatus: {
          mood: 7,
          cravings: 0,
          exercise: false,
          water: 0,
          sleep: 7,
          note: "",
          smokedToday: false,
          cigarettesToday: "",
          moneySpentToday: ""
        }
      }));

      navigate('/dashboard'); // Redirect to dashboard after successful plan creation
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* First Section - Choose Start Date */}
        <div className="mb-8 bg-white rounded-lg overflow-hidden shadow">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-3 px-4 text-center">
            <h2 className="text-xl font-bold">CHỌN NGÀY BẮT ĐẦU KẾ HOẠCH</h2>
          </div>
          <div className="p-8 bg-gray-50">
            <p className="mb-6 text-gray-800 text-lg">
              Hãy chọn ngày vào khoảng mấy tuần tiếp theo để bạn có thời gian
              chuẩn bị trước khi bước vào tuần kế hoạch, hoặc nếu bạn đã sẵn
              sàng bạn có thể chọn các ngày dưới đây:
            </p>
            <div className="mt-4">
              <p className="font-medium mb-3 text-gray-800">
                Khi nào bạn thực hiện kế hoạch?
              </p>
              <div className="space-y-3">
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
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Second Section - Smoking Cost */}
        <div className="bg-white rounded-lg overflow-hidden shadow mb-8">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-3 px-4 text-center">
            <h2 className="text-xl font-bold">
              BẠN CHI TRẢ BAO NHIÊU CHO VIỆC HÚT THUỐC?
            </h2>
          </div>
          <div className="p-8 bg-gray-50">
            <p className="mb-6 text-gray-800 text-lg">
              Nhập số lượng bạn hút trong một gói và số lượng gói bạn hút sẽ cho
              bạn biết được số tiền bạn tiết kiệm được khi bắt đầu thực hiện kế
              hoạch cai thuốc.
            </p>
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-32 flex-shrink-0">
                  <img
                    src="https://readdy.ai/api/search-image?query=A%20simple%20calculator%20icon%20with%20basic%20buttons%20and%20display%20screen%2C%20minimalist%20design%2C%20clean%20lines%2C%20soft%20gray%20background%2C%20professional%20look%2C%20suitable%20for%20a%20quit%20smoking%20app%20interface&width=100&height=100&seq=1&orientation=squarish"
                    alt="Calculator"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex-grow ml-4">
                  <div className="flex items-center mb-6">
                    <span className="text-gray-800 mr-3 text-lg">
                      Tôi hút khoảng
                    </span>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md px-4 py-2.5 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 !rounded-button text-lg"
                      value={cigarettesPerDay}
                      onChange={handleCigarettesChange}
                      placeholder="0"
                    />
                    <span className="text-gray-800 ml-2">
                      điếu thuốc một ngày.
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-800 mr-3 text-lg">
                      Tôi dành khoảng
                    </span>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md px-4 py-2.5 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 !rounded-button text-lg"
                      value={pricePerPack}
                      onChange={handlePriceChange}
                      placeholder="0.00"
                    />
                    <span className="text-gray-800 ml-2">
                      cho một bao thuốc.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Third Section - Reasons to Quit */}
        <div className="bg-white rounded-lg overflow-hidden shadow mb-8">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-3 px-4 text-center">
            <h2 className="text-xl font-bold">TẠI SAO BẠN LẠI BỎ THUỐC?</h2>
          </div>
          <div className="p-8 bg-gray-50">
            <p className="mb-6 text-gray-800 text-lg">
              Biết được mục đích cai nghiện sẽ giúp bạn giữ vững động lực để
              tiếp tục cai thuốc trong những tình huống khó khăn hay thèm
              khát,...
            </p>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-4">
                Lý do tôi muốn bỏ thuốc:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {allReasons.map((reason, index) => (
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
        <div className="bg-white rounded-lg overflow-hidden shadow mb-8">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-3 px-4 text-center">
            <h2 className="text-xl font-bold">
              KHI NÀO BẠN LÊN CƠN THÈM KHÁT
            </h2>
          </div>
          <div className="p-8 bg-gray-50">
            <p className="mb-6 text-gray-800 text-lg">
              Sau khi bạn cai thuốc, một số địa điểm, tình huống và cảm xúc
              nhất định có thể khiến bạn khó duy trì việc cai thuốc. Sử dụng
              danh sách này để tìm ra lý do khiến bạn muốn hút thuốc. Chúng
              tôi sẽ cung cấp cho bạn các chiến lược giúp bạn kiểm soát được
              việc hút thuốc.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">TÌNH HUỐNG</h3>
                <div className="space-y-4">
                  {allSituationTriggers.map((situation, index) => (
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
                  {allEmotionTriggers.map((emotion, index) => (
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
        <div className="bg-white rounded-lg overflow-hidden shadow mb-8">
          <div style={{ backgroundColor: lightGreen }} className="text-white py-3 px-4 text-center">
            <h2 className="text-xl font-bold">BẮT ĐẦU KẾ HOẠCH</h2>
          </div>
          <div className="p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-gray-800 text-xl font-semibold mb-6 text-center">
              Bạn đã sẵn sàng để bắt đầu hành trình bỏ thuốc của mình?
            </p>
            <p className="text-gray-700 text-lg mb-8 text-center max-w-lg">
              Nhấn vào nút bên dưới để khởi động kế hoạch và thay đổi cuộc sống của bạn ngay hôm nay!
            </p>
            <div className="flex items-center space-x-4">
                <span className="text-green-600 text-5xl transform -rotate-12">➜</span>
                <button
                onClick={handleStartPlan}
                className="bg-green-600 text-white font-bold py-4 px-10 rounded-lg text-2xl shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-75"
                >
                Bắt đầu nào
                </button>
                <span className="text-green-600 text-5xl transform -rotate-165">➜</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanPage;