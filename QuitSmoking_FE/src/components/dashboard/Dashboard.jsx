import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal & input state cho cập nhật tiến trình
  const [showModal, setShowModal] = useState(false);
  const [progressInput, setProgressInput] = useState({
    mood: 7,
    cravings: 2,
    exercise: false,
    water: 0,
    sleep: 7,
    note: "",
    smokedToday: false,
    cigarettesToday: "",
    moneySpentToday: ""
  });
  const [successMsg, setSuccessMsg] = useState("");

  // Lấy index ngày hôm nay trong tuần (0: T2, ..., 6: CN)
  const getTodayIndex = () => {
    const d = new Date();
    let idx = d.getDay();
    return idx === 0 ? 6 : idx - 1;
  };

  // Khởi tạo weeklyProgress: lấy dữ liệu đã lưu cho cả ngày hôm nay
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

  // Tính tổng số điếu đã hút thực tế trong các ngày đã có dữ liệu
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

  // Tính tổng số tiền đã tiêu mua thuốc thực tế trong tuần
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Lấy dữ liệu kế hoạch từ localStorage
    const planStr = localStorage.getItem("quitPlan");
    if (!planStr) {
      setStats(null);
      setLoading(false);
      return;
    }
    const plan = JSON.parse(planStr);

    // Xác định ngày bắt đầu
    let quitDate;
    if (plan.startDate === "today") {
      quitDate = new Date();
      quitDate.setHours(0, 0, 0, 0);
    } else if (plan.startDate === "tomorrow") {
      quitDate = new Date();
      quitDate.setDate(quitDate.getDate() + 1);
      quitDate.setHours(0, 0, 0, 0);
    } else {
      quitDate = new Date(plan.startDate);
      quitDate.setHours(0, 0, 0, 0);
    }

    // Tính số ngày không hút thuốc
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let daysWithoutSmoking = Math.max(0, Math.floor((now - quitDate) / (1000 * 60 * 60 * 24)) + 1);

    // Lấy weeklyProgress và todayStatus từ localStorage nếu có
    let weeklyProgress = getInitialWeeklyProgress();
    let todayStatus = plan.todayStatus || {
      mood: 7,
      cravings: 2,
      exercise: false,
      water: 0,
      sleep: 7,
      note: "",
      smokedToday: false,
      cigarettesToday: "",
      moneySpentToday: ""
    };

    // Lấy thông tin từ plan
    const cigarettesPerDay = parseInt(plan.cigarettesPerDay) || 0;
    const pricePerPack = parseFloat(plan.pricePerPack) || 0;
    const pricePerCigarette = pricePerPack / 20;

    // Tính tổng số điếu đã hút thực tế trong tuần
    const totalCigarettesSmoked = getTotalCigarettesSmoked(weeklyProgress);

    // Tính tổng số điếu lẽ ra sẽ hút nếu không bỏ
    const totalShouldSmoke = daysWithoutSmoking * cigarettesPerDay;

    // Điếu thuốc tránh được = số điếu lẽ ra hút - số điếu thực tế đã hút
    const cigarettesNotSmoked = Math.max(0, totalShouldSmoke - totalCigarettesSmoked);

    // Tiền tiết kiệm = số điếu tránh được * giá 1 điếu
    const moneySaved = cigarettesNotSmoked * pricePerCigarette;

    setStats({
      quitDate: quitDate.toISOString().slice(0, 10),
      daysWithoutSmoking,
      moneySaved,
      cigarettesNotSmoked,
      healthImprovements: [
        { milestone: "20 phút", description: "Nhịp tim và huyết áp trở về bình thường", achieved: daysWithoutSmoking >= 1 },
        { milestone: "12 giờ", description: "Nồng độ CO trong máu giảm về mức bình thường", achieved: daysWithoutSmoking >= 1 },
        { milestone: "2 tuần", description: "Tuần hoàn máu cải thiện và phổi hoạt động tốt hơn", achieved: daysWithoutSmoking >= 14 },
        { milestone: "1 tháng", description: "Cơn ho và khó thở giảm đáng kể", achieved: daysWithoutSmoking >= 30 },
        { milestone: "1 năm", description: "Nguy cơ bệnh tim giảm 50%", achieved: daysWithoutSmoking >= 365 },
        { milestone: "5 năm", description: "Nguy cơ đột quỵ giảm về mức như người không hút thuốc", achieved: daysWithoutSmoking >= 1825 }
      ],
      weeklyProgress: weeklyProgress,
      recentAchievements: plan.recentAchievements || [],
      todayStatus
    });
    setLoading(false);
  }, [isAuthenticated, navigate]);

  // Lưu tiến trình hôm nay vào localStorage và cập nhật state
  const handleSaveProgress = () => {
    const planStr = localStorage.getItem("quitPlan");
    let plan = planStr ? JSON.parse(planStr) : {};
    let weeklyProgress = getInitialWeeklyProgress();
    const idx = getTodayIndex();
    weeklyProgress[idx] = { ...progressInput, day: daysOfWeek[idx] };
    plan.weeklyProgress = weeklyProgress;
    plan.todayStatus = progressInput;
    localStorage.setItem("quitPlan", JSON.stringify(plan));
    setStats((prev) => ({
      ...prev,
      weeklyProgress: [...weeklyProgress],
      todayStatus: { ...progressInput }
    }));
    setShowModal(false);
    setSuccessMsg("Đã cập nhật tiến trình hôm nay!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "-";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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
                <p className="text-sm font-medium text-gray-600">Tiền tiết kiệm</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Health Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🏥 Cải thiện sức khỏe</h2>
              <div className="space-y-4">
                {stats.healthImprovements.map((improvement, index) => (
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
                    {stats.weeklyProgress.map((day, idx) => (
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
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${
                        i < stats.todayStatus.cravings ? 'bg-red-500' : 'bg-gray-200'
                      }`}></div>
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
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
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
                      <label className="block text-gray-700 mb-1 font-medium">Mức thèm thuốc:</label>
                      <div className="flex flex-wrap gap-2">
                        {[...Array(6)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${progressInput.cravings === i ? "bg-red-500 text-white border-red-600" : "bg-gray-100 border-gray-300 text-gray-700"}`}
                            onClick={() => setProgressInput({ ...progressInput, cravings: i })}
                          >
                            {i}
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
                    {/* Bổ sung hai trường mới */}
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
                    {/* Hết bổ sung */}
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

            {/* Recent Achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Thành tích gần đây</h3>
              <div className="space-y-3">
                {stats.recentAchievements.map((achievement, index) => (
                  <div key={index} className={`p-3 rounded-lg ${achievement.color}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm opacity-75">{achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                to="/achievements"
                className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition duration-300 text-center block"
              >
                Xem tất cả
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Hành động nhanh</h3>
              <div className="space-y-3">
                <Link 
                  to="/plan"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-300"
                >
                  <span className="text-2xl mr-3">📋</span>
                  <span className="font-medium text-blue-700">Xem kế hoạch</span>
                </Link>
                <Link 
                  to="/community"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition duration-300"
                >
                  <span className="text-2xl mr-3">👥</span>
                  <span className="font-medium text-green-700">Cộng đồng</span>
                </Link>
                <Link 
                  to="/coach-consultation"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition duration-300"
                >
                  <span className="text-2xl mr-3">👨‍⚕️</span>
                  <span className="font-medium text-purple-700">Tư vấn coach</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;