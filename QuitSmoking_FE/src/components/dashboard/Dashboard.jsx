import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/apiService";
import Modal from "../common/MembershipUpgradeModal";

const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missingType, setMissingType] = useState(null); // 'plan' | 'smoking' | 'both' | null

  // Modal & input state cho cập nhật tiến trình
  const [showModal, setShowModal] = useState(false);
  const [progressInput, setProgressInput] = useState({
    mood: 7,
    cravings: 0,
    exercise: false,
    water: 0,
    sleep: 7,
    note: "",
    smokedToday: false,
    cigarettesToday: "",
    moneySpentToday: ""
  });
  const [successMsg, setSuccessMsg] = useState("");

  // --- State cho weeklyProgress ---
  const [weeklyProgress, setWeeklyProgress] = useState([]);

  // Định nghĩa các giai đoạn
  const phases = [
    {
      name: "Giai đoạn 1: Chuẩn bị và Giảm dần",
      duration: 7,
      startDayOffset: 0,
      objective: "Nhận diện thói quen, giảm số điếu thuốc từ 5 xuống 2–3 điếu/ngày.",
      achievement: "Làm chủ hành vi, tăng khả năng kiểm soát cơn thèm thuốc.",
      tasks: [
        "Ghi nhật ký thời điểm hút, cảm xúc khi hút, hoàn cảnh đi kèm.",
        "Giảm 1 điếu. Tập thay thế bằng uống nước, kẹo cao su, đi bộ.",
        "Xác định 3 tình huống thường xuyên hút → tìm giải pháp thay thế.",
        "Giảm tiếp 1 điếu. Lập danh sách '5 lý do bỏ thuốc' – đọc mỗi sáng.",
        "Tâm sự với người thân về kế hoạch bỏ thuốc, tìm sự đồng hành.",
        "Loại bỏ toàn bộ bật lửa, gạt tàn, thuốc dư thừa trong nhà.",
        "Giảm xuống 2 điếu. Chuẩn bị cho 'Ngày bỏ hoàn toàn'."
      ],
      icon: "🧘"
    },
    {
      name: "Giai đoạn 2: Cai hoàn toàn",
      duration: 7,
      startDayOffset: 7,
      objective: "Không hút bất kỳ điếu nào.",
      achievement: "Trải qua cơn nghiện thể chất (nikotin) – bước đột phá quan trọng.",
      tasks: [
        "Ngày cai thuốc chính thức – không hút. Ghi lại cảm xúc, thèm thuốc.",
        "Thực hiện kỹ thuật 4D (Delay, Deep breath, Drink water, Do something else).",
        "Viết thư cho chính mình – lý do bạn đã chọn bỏ thuốc.",
        "Khi căng thẳng → hít thở sâu 10 lần. Tránh cà phê, bia rượu.",
        "Tránh người hay hút thuốc. Không nhận thuốc khi được mời.",
        "Tự thưởng (một món nhỏ) vì đã không hút thuốc 5 ngày.",
        "Đánh dấu '7 ngày sạch thuốc đầu tiên' – bạn đã thắng bước đầu."
      ],
      icon: "🚀"
    },
    {
      name: "Giai đoạn 3: Ổn định – Vượt qua cơn thèm tâm lý",
      duration: 10,
      startDayOffset: 14,
      objective: "Tăng sức chịu đựng với cơn thèm thuốc do cảm xúc và thói quen.",
      achievement: "Não bộ bắt đầu tái thiết lập hành vi không thuốc.",
      tasks: [
        "Tập thể dục nhẹ 15–30 phút để tăng sản xuất endorphin.",
        "Tạo chuỗi thói quen buổi sáng – không có thuốc.",
        "Tránh các cuộc nhậu hoặc bạn bè hút thuốc.",
        'Viết nhật ký: "Hôm nay tôi đã vượt qua cơn thèm thuốc như thế nào".',
        "Học cách từ chối khi người khác mời thuốc.",
        "Dùng số tiền tiết kiệm được mua quà cho người thân.",
        "Tưởng tượng lá phổi bạn đang tự làm sạch – giúp duy trì quyết tâm.",
        "Gọi điện tâm sự với một người quan trọng về hành trình của bạn.",
        "Thiền hoặc nghe nhạc thư giãn khi buồn/căng thẳng.",
        "Ghi nhận 3 lợi ích bạn thấy rõ sau gần 3 tuần bỏ thuốc."
      ],
      icon: "🧠"
    },
    {
      name: "Giai đoạn 4: Tăng cường sức khỏe – Thay đổi lối sống",
      duration: 11,
      startDayOffset: 24,
      objective: "Xây dựng lối sống lành mạnh thay thế vai trò của thuốc lá.",
      achievement: "Cơ thể thích nghi hoàn toàn với việc không hút.",
      tasks: [
        "Bắt đầu uống nhiều nước lọc mỗi ngày (tối thiểu 2 lít).",
        "Ăn thêm rau xanh, trái cây – giúp giải độc, cải thiện hơi thở.",
        "Hạn chế thức khuya – ngủ trước 23h để tái tạo cơ thể.",
        "Đăng một dòng trạng thái chia sẻ hành trình bỏ thuốc.",
        "Lên kế hoạch tập thể dục định kỳ 3 buổi/tuần.",
        "Tổng hợp nhật ký hành trình 1 tháng bỏ thuốc.",
        "Ghi lại các lần thèm thuốc gần đây – làm gì bạn đã vượt qua?",
        "Nhìn lại số tiền tiết kiệm được → đề ra mục tiêu sử dụng.",
        "Kiểm tra lại phổi nếu có thể (khám sức khỏe).",
        "Lập danh sách 5 điều bạn thấy tốt lên từ khi bỏ thuốc.",
        "Tổ chức buổi 'ăn mừng sạch thuốc 1 tháng' cùng người thân."
      ],
      icon: "💪"
    },
    {
      name: "Giai đoạn 5: Củng cố và Phòng tái nghiện",
      duration: 11,
      startDayOffset: 35,
      objective: "Duy trì cuộc sống không thuốc, sẵn sàng đối phó tình huống bất ngờ.",
      achievement: "Trở thành một người không hút thuốc vững vàng.",
      tasks: [
        "Học lại các kỹ năng từ chối – luyện nói trước gương.",
        'Tự hỏi: "Nếu hút lại 1 điếu, tôi sẽ mất những gì?"',
        "Viết ra kế hoạch 6 tháng tiếp theo để giữ sạch thuốc.",
        "Tham gia nhóm hoặc diễn đàn bỏ thuốc để duy trì động lực.",
        "Đặt mục tiêu thể chất mới: chạy bộ, đạp xe, gym…",
        "Nếu buồn, stress → gọi người thân thay vì nghĩ đến hút thuốc.",
        'Cập nhật lại nhật ký "người không hút thuốc" mỗi tuần 1 lần.',
        "Ghi nhận một thành tựu trong công việc hay học tập sau khi bỏ thuốc.",
        "Làm điều gì đó cho người thân – như lời cảm ơn đã ủng hộ.",
        "Ôn lại toàn bộ quá trình – ước tính bạn đã tiết kiệm bao nhiêu?",
        'Viết một bức thư gửi cho "bạn của 6 tháng sau" – giữ vững cam kết.'
      ],
      icon: "🏆"
    }
  ];

  const getTodayIndex = () => {
    const d = new Date();
    let idx = d.getDay();
    return idx === 0 ? 6 : idx - 1;
  };

  const getInitialWeeklyProgress = () => {
    let planStr = localStorage.getItem("quitPlan");
    let oldProgress = [];
    if (planStr) {
      try {
        const plan = JSON.parse(planStr);
        oldProgress = Array.isArray(plan.weeklyProgress) ? plan.weeklyProgress : [];
      } catch {}
    }
    return daysOfWeek.map((day, idx) => {
      if (oldProgress[idx]) return oldProgress[idx];
      return null;
    });
  };

  const getTotalCigarettesSmoked = (weeklyProgress) => {
    let total = 0;
    weeklyProgress.forEach((day) => {
      if (day && day.smokedToday === true && day.cigarettesToday) {
        const num = parseInt(day.cigarettesToday);
        if (!isNaN(num)) total += num;
      }
    });
    return total;
  };

  const getTotalMoneySpent = (weeklyProgress) => {
    let total = 0;
    weeklyProgress.forEach((day) => {
      if (day && day.smokedToday === true && day.moneySpentToday) {
        const num = parseFloat(day.moneySpentToday);
        if (!isNaN(num)) total += num;
      }
    });
    return total;
  };

  const getPhaseInfo = (daysWithoutSmoking, quitDateStr, dailyCost) => {
    const startDate = new Date(quitDateStr);
    startDate.setHours(0, 0, 0, 0);

    let currentPhase = null;
    let cumulativeSavedMoney = 0;

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseStartDayAbsolute = phase.startDayOffset;
      const phaseEndDayAbsolute = phase.startDayOffset + phase.duration - 1;

      const currentPhaseStartDate = new Date(startDate);
      currentPhaseStartDate.setDate(startDate.getDate() + phaseStartDayAbsolute);
      const currentPhaseEndDate = new Date(startDate);
      currentPhaseEndDate.setDate(startDate.getDate() + phaseEndDayAbsolute);

      if (daysWithoutSmoking >= phaseStartDayAbsolute && daysWithoutSmoking <= phaseEndDayAbsolute) {
        currentPhase = {
          ...phase,
          startDate: currentPhaseStartDate.toLocaleDateString('vi-VN'),
          endDate: currentPhaseEndDate.toLocaleDateString('vi-VN'),
          currentDayInPhase: daysWithoutSmoking - phaseStartDayAbsolute
        };
        break;
      }
      cumulativeSavedMoney += phase.duration * dailyCost;
    }

    if (!currentPhase && daysWithoutSmoking > (phases[phases.length - 1].startDayOffset + phases[phases.length - 1].duration - 1)) {
      currentPhase = {
        name: "Bạn đã hoàn thành Lộ trình Cai Nghiện!",
        objective: "Duy trì cuộc sống không thuốc lá vĩnh viễn và sống khỏe mạnh.",
        achievement: "Trở thành một người hoàn toàn không hút thuốc.",
        tasks: [],
        isCompleted: true,
        totalDaysCompleted: daysWithoutSmoking
      };
      cumulativeSavedMoney = phases.reduce((sum, p) => sum + p.duration * dailyCost, 0);
    }

    let phaseSavedMoney = 0;
    if (currentPhase && !currentPhase.isCompleted) {
      phaseSavedMoney = cumulativeSavedMoney + (currentPhase.currentDayInPhase * dailyCost);
    } else if (currentPhase && currentPhase.isCompleted) {
      phaseSavedMoney = cumulativeSavedMoney;
    }

    return { currentPhase, phaseSavedMoney };
  };

  // Lấy tiến trình tuần từ backend
  const fetchWeeklyProgress = async () => {
    try {
      setLoading(true);
      const data = await apiService.getWeeklyProgress();
      setWeeklyProgress(data);
    } catch (e) {
      setWeeklyProgress([]);
    } finally {
      setLoading(false);
    }
  };

  // Khi vào dashboard, lấy dữ liệu tổng hợp từ backend
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Lấy số liệu tổng hợp từ backend
        const res = await apiService.getMemberDashboard(user.id);
        setStats({
          daysWithoutSmoking: res.summary.smokeFreeDays,
          moneySaved: res.summary.moneySaved,
          cigarettesNotSmoked: res.summary.avoidedCigarettes,
          todayStatus: {
            mood: res.summary.todayMood,
            cravings: res.weeklyProgress.dailyData && res.weeklyProgress.dailyData.length > 0 && res.weeklyProgress.dailyData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.cravings,
            exercise: res.weeklyProgress.dailyData && res.weeklyProgress.dailyData.length > 0 && res.weeklyProgress.dailyData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.exercise,
            water: res.weeklyProgress.dailyData && res.weeklyProgress.dailyData.length > 0 && res.weeklyProgress.dailyData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.water,
            sleep: res.weeklyProgress.dailyData && res.weeklyProgress.dailyData.length > 0 && res.weeklyProgress.dailyData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.sleep,
            note: res.weeklyProgress.dailyData && res.weeklyProgress.dailyData.length > 0 && res.weeklyProgress.dailyData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.note,
            smokedToday: res.weeklyProgress.dailyData && res.weeklyProgress.dailyData.length > 0 && res.weeklyProgress.dailyData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.smokedToday,
            cigarettesToday: res.weeklyProgress.dailyData && res.weeklyProgress.dailyData.length > 0 && res.weeklyProgress.dailyData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.cigarettesToday,
            moneySpentToday: res.weeklyProgress.dailyData && res.weeklyProgress.dailyData.length > 0 && res.weeklyProgress.dailyData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.moneySpentToday,
          },
          weeklyProgress: res.weeklyProgress.dailyData,
          statistics: res.statistics,
          quitDate: res.member && res.member.quitDate,
        });
        setWeeklyProgress(res.weeklyProgress.dailyData || []);
        setMissingType(null);
      } catch (e) {
        setStats(null);
        setWeeklyProgress([]);
        setMissingType('plan');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  // Lưu tiến trình ngày
  const handleSaveProgress = async () => {
    try {
      await apiService.saveDailyProgress({
        ...progressInput,
        userId: user.id,
        date: new Date().toISOString().slice(0, 10)
      });
      setShowModal(false);
      setSuccessMsg("Đã cập nhật tiến trình hôm nay!");
      fetchWeeklyProgress(); // Reload lại bảng tuần
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (e) {
      setSuccessMsg("Có lỗi khi lưu tiến trình!");
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "-";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // --- Logic hiển thị ngày của nhiệm vụ trong giai đoạn ---
  const getTaskDisplayDate = (quitDateStr, phaseStartOffset, taskIndex) => {
    const startDate = new Date(quitDateStr);
    startDate.setHours(0, 0, 0, 0);
    const taskDate = new Date(startDate);
    taskDate.setDate(startDate.getDate() + phaseStartOffset + taskIndex);
    return safeFormatDate(taskDate);
  };

  const [showShareModal, setShowShareModal] = useState(false);
  const [coaches, setCoaches] = useState([]);
  const [sharedCoaches, setSharedCoaches] = useState([]);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [shareMsg, setShareMsg] = useState("");

  // Lấy danh sách coach
  useEffect(() => {
    if (user?.role === "MEMBER") {
      console.log("Fetching coaches for user:", user.id, "role:", user.role);
      apiService.getCoaches()
        .then(data => {
          console.log("Coaches data received:", data);
          setCoaches(data);
        })
        .catch(error => {
          console.error("Error fetching coaches:", error);
          setCoaches([]);
        });
      apiService.get(`/api/dashboard/shared-coaches`).then(setSharedCoaches).catch(() => setSharedCoaches([]));
    }
  }, [user]);

  // Chia sẻ tiến độ cho coach
  const handleShare = async () => {
    if (!selectedCoachId) return;
    try {
      await apiService.post("/api/dashboard/share", { coachId: selectedCoachId });
      setShareMsg("Đã chia sẻ thành công!");
      setShowShareModal(false);
      setSelectedCoachId("");
      // Refresh danh sách coach đã chia sẻ
      apiService.get(`/api/dashboard/shared-coaches`).then(setSharedCoaches);
    } catch (e) {
      setShareMsg("Lỗi khi chia sẻ: " + (e?.response?.data || e.message));
    }
  };

  // Hủy chia sẻ
  const handleUnshare = async (coachId) => {
    try {
      await apiService.delete("/api/dashboard/share", { data: { coachId } });
      setShareMsg("Đã hủy chia sẻ!");
      apiService.get(`/api/dashboard/shared-coaches`).then(setSharedCoaches);
    } catch (e) {
      setShareMsg("Lỗi khi hủy chia sẻ: " + (e?.response?.data || e.message));
    }
  };

  // Helper to safely format dates
  const safeFormatDate = (dateInput) => {
    const d = new Date(dateInput);
    return !isNaN(d.getTime()) ? d.toLocaleDateString('vi-VN') : 'Chưa xác định';
  };

  if (missingType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thiếu dữ liệu cần thiết</h2>
          {missingType === 'both' && (
            <>
              <p className="text-gray-700 mb-4">Bạn cần nhập <b>tình trạng hút thuốc</b> và <b>kế hoạch bỏ thuốc</b> để sử dụng dashboard.</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => navigate('/ghinhantinhtrang')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition">Nhập tình trạng</button>
                <button onClick={() => navigate('/plan')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Nhập kế hoạch</button>
              </div>
            </>
          )}
          {missingType === 'smoking' && (
            <>
              <p className="text-gray-700 mb-4">Bạn cần nhập <b>tình trạng hút thuốc</b> để sử dụng dashboard.</p>
              <button onClick={() => navigate('/ghinhantinhtrang')} className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition">Nhập tình trạng</button>
            </>
          )}
          {missingType === 'plan' && (
            <>
              <p className="text-gray-700 mb-4">Bạn cần nhập <b>kế hoạch bỏ thuốc</b> để sử dụng dashboard.</p>
              <button onClick={() => navigate('/plan')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">Nhập kế hoạch</button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Bạn chưa thiết lập kế hoạch bỏ thuốc. <Link to="/plan" className="text-blue-600 underline">Tạo kế hoạch ngay</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Đây là kế hoạch của bạn, {user?.firstName || user?.username || "Bạn"}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Hy vọng bạn sẽ tin tưởng chúng tôi và thực hiện theo quy trình này!!! 🎉
          </p>
          {user?.role === "MEMBER" && (
            <div className="mt-4 flex flex-col gap-2">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition w-max"
                onClick={() => setShowShareModal(true)}
              >
                📤 Chia sẻ tiến độ cho coach
              </button>
              {sharedCoaches.length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold text-gray-700 mb-1">Đã chia sẻ với:</div>
                  <ul className="space-y-1">
                    {sharedCoaches.map(coach => (
                      <li key={coach.id} className="flex items-center gap-2">
                        <span className="font-medium text-blue-700">{coach.firstName} {coach.lastName} ({coach.email})</span>
                        <button
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => handleUnshare(coach.id)}
                        >Hủy chia sẻ</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {shareMsg && <div className="text-green-600 text-sm mt-1">{shareMsg}</div>}
            </div>
          )}
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ngày không hút thuốc</p>
                <p className="text-3xl font-bold text-green-600">{stats.daysWithoutSmoking}</p>
              </div>
              <div className="text-4xl">🗓️</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiền tiết kiệm ước tính</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.moneySaved)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điếu thuốc tránh được</p>
                <p className="text-3xl font-bold text-blue-600">{stats.cigarettesNotSmoked.toLocaleString()}</p>
              </div>
              <div className="text-4xl">🚭</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cảm giác hôm nay</p>
                <p className="text-3xl font-bold text-purple-600">{stats.todayStatus.mood}/10</p>
              </div>
              <div className="text-4xl">😊</div>
            </div>
          </div>
        </div>

        {/* Lộ trình Cai Nghiện của Bạn */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🌱 Lộ trình Cai Nghiện của Bạn</h2>
          {stats.currentPhaseInfo && stats.currentPhaseInfo.isCompleted ? (
            <div className={`p-4 rounded-lg border-l-4 bg-green-100 border-green-600`}>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                {stats.currentPhaseInfo.name}
              </h3>
              <p className="text-gray-700 mb-1">
                Xin chúc mừng! Bạn đã hoàn thành toàn bộ lộ trình cai nghiện!
              </p>
              <p className="text-gray-700 mb-1">
                Tổng số ngày không hút thuốc: <span className="font-semibold">{stats.currentPhaseInfo.totalDaysCompleted} ngày</span>
              </p>
              <p className="text-gray-700">
                Tổng số tiền tiết kiệm được: <span className="font-semibold">{formatCurrency(stats.phaseSavedMoney)}</span>
              </p>
              <p className="text-green-700 font-bold mt-2">
                Bạn đã chiến thắng! Hãy duy trì lối sống này!
              </p>
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-4 space-x-6 scrollbar-hide">
              {phases.map((phase, phaseIndex) => {
                const isCurrentPhase = stats.currentPhaseInfo && phase.name === stats.currentPhaseInfo.name;
                const phaseStartDate = new Date(stats.quitDate);
                phaseStartDate.setDate(phaseStartDate.getDate() + phase.startDayOffset);
                const phaseEndDate = new Date(stats.quitDate);
                phaseEndDate.setDate(phaseEndDate.getDate() + phase.startDayOffset + phase.duration - 1);

                return (
                  <div
                    key={phaseIndex}
                    className={`flex-none bg-white rounded-lg shadow-lg border p-5 flex flex-col justify-between text-center transition-all duration-300 transform
                      ${isCurrentPhase ? 'bg-blue-50 border-blue-500 shadow-xl scale-105 ring-4 ring-blue-200' : 'bg-gray-50 border-gray-300 hover:shadow-md hover:scale-102'}
                      hover:cursor-pointer`}
                    style={{ minWidth: '320px' }}
                  >
                    <div className="text-5xl mb-3" role="img" aria-label={phase.name}>
                      {phase.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {phase.name} {isCurrentPhase && <span className="text-blue-600 text-sm">(Hiện tại)</span>}
                    </h3>
                    <p className="text-gray-700 text-sm mb-1">
                      Thời gian: <span className="font-semibold">{safeFormatDate(phaseStartDate)}</span> đến <span className="font-semibold">{safeFormatDate(phaseEndDate)}</span>
                    </p>
                    <p className="text-gray-700 text-sm mb-1">
                      Mục tiêu: <span className="font-semibold">{phase.objective}</span>
                    </p>
                    <p className="text-gray-700 text-sm mb-4">
                      Đạt được: <span className="font-semibold">{phase.achievement}</span>
                    </p>
                    <h4 className="font-bold text-lg text-gray-800 mt-auto mb-2">Nhiệm vụ:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-left text-sm">
                      {phase.tasks.map((task, taskIndex) => {
                        const baseDate = new Date(stats.quitDate);
                        baseDate.setHours(0,0,0,0);
                        const taskAbsDate = new Date(baseDate);
                        taskAbsDate.setDate(baseDate.getDate() + phase.startDayOffset + taskIndex);
                        const todayNormalized = new Date();
                        todayNormalized.setHours(0,0,0,0);
                        const isTodayTask = (
                          taskAbsDate.getFullYear() === todayNormalized.getFullYear() &&
                          taskAbsDate.getMonth() === todayNormalized.getMonth() &&
                          taskAbsDate.getDate() === todayNormalized.getDate()
                        );

                        return (
                          <li key={taskIndex} className={isTodayTask ? '' : 'text-gray-600'}>
                            {isTodayTask ? (
                              <span className="flash-black font-bold text-green-600 bg-green-50 inline-block">
                                Ngày {getTaskDisplayDate(stats.quitDate, phase.startDayOffset, taskIndex)}: {task}
                              </span>
                            ) : (
                              <>
                                Ngày {getTaskDisplayDate(stats.quitDate, phase.startDayOffset, taskIndex)}: {task}
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Health Progress & Weekly Progress Table) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Health Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🏥 Cải thiện sức khỏe</h2>
              <div className="space-y-4">
                {(stats.healthImprovements || []).map((improvement, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    improvement.achieved ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{improvement.milestone}</h3>
                        <p className="text-gray-600">{improvement.description}</p>
                      </div>
                      <div className="text-2xl">
                        {improvement.achieved ? '✅' : '⏳'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress Table */}
            <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Tiến trình tuần này</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-center text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-2 border-b">Ngày</th>
                      <th className="py-2 px-2 border-b">Tâm trạng</th>
                      <th className="py-2 px-2 border-b">Thèm thuốc</th>
                      <th className="py-2 px-2 border-b">Tập thể dục</th>
                      <th className="py-2 px-2 border-b">Nước (ly)</th>
                      <th className="py-2 px-2 border-b">Ngủ</th>
                      <th className="py-2 px-2 border-b">Có hút?</th>
                      <th className="py-2 px-2 border-b">Số điếu</th>
                      <th className="py-2 px-2 border-b">Tiền mua thuốc</th>
                      <th className="py-2 px-2 border-b">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(weeklyProgress || []).map((day, idx) => (
                      <tr key={idx} className={getTodayIndex() === idx ? "bg-green-50 font-bold" : ""}>
                        <td className="py-2 px-2 border-b">{daysOfWeek[idx]}</td>
                        {day ? (
                          <>
                            <td className="py-2 px-2 border-b text-blue-600">{day.mood}/10</td>
                            <td className="py-2 px-2 border-b text-red-600">{day.cravings}/5</td>
                            <td className="py-2 px-2 border-b">{day.exercise ? "✅" : "❌"}</td>
                            <td className="py-2 px-2 border-b">{day.water || 0}/8</td>
                            <td className="py-2 px-2 border-b">{day.sleep || 0}/10</td>
                            <td className="py-2 px-2 border-b">
                              {day.smokedToday === true ? "Có" : day.smokedToday === false ? "Không" : "-"}
                            </td>
                            <td className="py-2 px-2 border-b">
                              {day.smokedToday === true ? (day.cigarettesToday || "-") : "-"}
                            </td>
                            <td className="py-2 px-2 border-b">
                              {day.smokedToday === true ? (day.moneySpentToday ? formatCurrency(day.moneySpentToday) : "-") : "-"}
                            </td>
                            <td className="py-2 px-2 border-b text-left">{day.note || ""}</td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                            <td className="py-2 px-2 border-b text-gray-400">-</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Trạng thái hôm nay</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tâm trạng</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${
                        i < stats.todayStatus.mood ? 'bg-blue-500' : 'bg-gray-200'
                      }`}></div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mức thèm thuốc</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(6)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`w-3 h-3 rounded-full ${
                          i < stats.todayStatus.cravings ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      >
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tập thể dục</span>
                  <span className="text-2xl">{stats.todayStatus.exercise ? '✅' : '❌'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nước uống (ly)</span>
                  <span className="font-bold text-blue-600">{stats.todayStatus.water}/8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Chất lượng ngủ</span>
                  <span className="font-bold text-purple-600">{stats.todayStatus.sleep}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ghi chú</span>
                  <span className="text-gray-500 text-sm truncate max-w-[120px]">{stats.todayStatus.note || "..."}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setProgressInput(stats.todayStatus);
                  setShowModal(true);
                }}
                className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition duration-300 text-center block"
              >
                Cập nhật tiến trình
              </button>
              {successMsg && (
                <div className="mt-3 text-green-600 text-center font-medium">{successMsg}</div>
              )}
            </div>

            {/* Modal cập nhật tiến trình */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative overflow-y-auto" style={{maxHeight: '95vh'}}>
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                      onClick={() => setShowModal(false)}
                      aria-label="Đóng"
                    >
                      ×
                    </button>
                    <h3 className="text-xl font-bold mb-4 text-center text-green-700">Ghi nhận tiến trình hôm nay</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 mb-1 font-medium">Tâm trạng:</label>
                        <div className="flex flex-wrap gap-2">
                          {[...Array(10)].map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${progressInput.mood === i + 1 ? "bg-blue-500 text-white border-blue-600" : "bg-gray-100 border-gray-300 text-gray-700"}`}
                              onClick={() => setProgressInput({ ...progressInput, mood: i + 1 })}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1 font-medium">Mức thèm thuốc (0-5):</label>
                        <div className="flex flex-wrap gap-x-2 gap-y-2">
                          {[0, 1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-200
                                ${progressInput.cravings === value ? "bg-red-500 text-white border-red-600 shadow-md" : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"}`}
                              onClick={() => setProgressInput({ ...progressInput, cravings: value })}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1 font-medium">Tập thể dục:</label>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg font-medium border-2 ${progressInput.exercise ? "bg-green-500 text-white border-green-600" : "bg-gray-100 border-gray-300 text-gray-700"}`}
                            onClick={() => setProgressInput({ ...progressInput, exercise: true })}
                          >
                            Đã tập
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg font-medium border-2 ${!progressInput.exercise ? "bg-red-400 text-white border-red-600" : "bg-gray-100 border-gray-300 text-gray-700"}`}
                            onClick={() => setProgressInput({ ...progressInput, exercise: false })}
                          >
                            Chưa
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1 font-medium">Nước uống (ly):</label>
                        <input
                          type="number"
                          min={0}
                          max={8}
                          value={progressInput.water}
                          onChange={e => setProgressInput({ ...progressInput, water: Number(e.target.value) })}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1 font-medium">Hôm nay có hút thuốc không?</label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="smokedToday"
                              checked={progressInput.smokedToday === true}
                              onChange={() => setProgressInput({ ...progressInput, smokedToday: true })}
                              className="mr-2"
                            />
                            Có
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="smokedToday"
                              checked={progressInput.smokedToday === false}
                              onChange={() => setProgressInput({ ...progressInput, smokedToday: false, cigarettesToday: "", moneySpentToday: "" })}
                              className="mr-2"
                            />
                            Không
                          </label>
                        </div>
                      </div>
                      {progressInput.smokedToday === true && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-700 mb-1 font-medium">Số điếu đã hút hôm nay:</label>
                            <input
                              type="number"
                              min={1}
                              value={progressInput.cigarettesToday}
                              onChange={e => setProgressInput({ ...progressInput, cigarettesToday: e.target.value.replace(/\D/, "") })}
                              className="w-full border rounded px-2 py-1"
                              placeholder="Nhập số điếu"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-1 font-medium">Lượng tiền mua số thuốc đó (VNĐ):</label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={progressInput.moneySpentToday}
                              onChange={e => setProgressInput({ ...progressInput, moneySpentToday: e.target.value })}
                              className="w-full border rounded px-2 py-1"
                              placeholder="Nhập số tiền"
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-gray-700 mb-1 font-medium flex items-center">
                          Chất lượng ngủ (1-10):
                          <span className="relative group ml-2 cursor-pointer">
                            <i className="fas fa-question-circle text-blue-400"></i>
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-white text-gray-700 text-xs rounded shadow-lg px-3 py-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                              Đánh giá chất lượng giấc ngủ của bạn hôm nay từ 1 (rất tệ) đến 10 (rất tốt). Hãy nhập số phù hợp với cảm nhận của bạn.
                            </span>
                          </span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={progressInput.sleep}
                          onChange={e => setProgressInput({ ...progressInput, sleep: Number(e.target.value) })}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1 font-medium">Ghi chú:</label>
                        <textarea
                          rows={2}
                          value={progressInput.note}
                          onChange={e => setProgressInput({ ...progressInput, note: e.target.value })}
                          className="w-full border rounded px-2 py-1 resize-none"
                          placeholder="Bạn muốn ghi chú gì cho hôm nay?"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveProgress}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold"
                      >
                        Lưu tiến trình
                      </button>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal chọn coach */}
      {showShareModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowShareModal(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-blue-700">Chọn coach để chia sẻ tiến độ</h2>
            {coaches.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-2">Không có coach nào trong hệ thống</p>
                <p className="text-sm text-gray-500">Vui lòng liên hệ admin để thêm coach</p>
              </div>
            ) : (
              <>
                <select
                  className="w-full border rounded-lg p-3 mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCoachId}
                  onChange={e => setSelectedCoachId(e.target.value)}
                >
                  <option value="">-- Chọn coach --</option>
                  {coaches.map(coach => (
                    <option key={coach.id} value={coach.id}>
                      {coach.firstName} {coach.lastName} ({coach.email})
                    </option>
                  ))}
                </select>
                <div className="flex gap-4 justify-end">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    onClick={() => setShowShareModal(false)}
                  >Hủy</button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleShare}
                    disabled={!selectedCoachId}
                  >Chia sẻ</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;