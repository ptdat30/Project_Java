import React, { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const DashboardMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDashboard, setMemberDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "COACH") {
      apiService.get("/api/dashboard/shared-members").then(setMembers).catch(() => setMembers([]));
    }
  }, [user]);

  const handleViewDashboard = async (member) => {
    setSelectedMember(member);
    setLoading(true);
    try {
      const data = await apiService.get(`/api/dashboard/member/${member.id}`);
      setMemberDashboard(data);
    } catch {
      setMemberDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMoodEmoji = (mood) => {
    if (!mood) return "😐";
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    if (mood >= 2) return "😔";
    return "😢";
  };

  const getCravingsColor = (cravings) => {
    if (!cravings) return "bg-gray-100";
    if (cravings >= 8) return "bg-red-500";
    if (cravings >= 6) return "bg-orange-400";
    if (cravings >= 4) return "bg-yellow-400";
    if (cravings >= 2) return "bg-green-400";
    return "bg-green-500";
  };

  const renderWeeklyProgress = () => {
    if (!memberDashboard?.weeklyProgress?.dailyData) return null;

    const { startDate, endDate, dailyData } = memberDashboard.weeklyProgress;
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Tiến độ tuần ({formatDate(startDate)} - {formatDate(endDate)})
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {dailyData.map((day, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">{dayNames[index]}</div>
              {day ? (
                <div className="space-y-2">
                  {/* Tâm trạng */}
                  <div className="flex items-center justify-center">
                    <span className="text-lg">{getMoodEmoji(day.mood)}</span>
                  </div>
                  
                  {/* Thèm thuốc */}
                  <div className="flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${getCravingsColor(day.cravings)}`}></div>
                  </div>
                  
                  {/* Hút thuốc */}
                  <div className="text-xs">
                    {day.smokedToday ? (
                      <span className="text-red-600 font-medium">{day.cigarettesToday || 0} điếu</span>
                    ) : (
                      <span className="text-green-600 font-medium">✓ Không hút</span>
                    )}
                  </div>
                  
                  {/* Nhiệm vụ */}
                  <div className="text-xs space-y-1">
                    {day.exercise && <div className="text-blue-600">🏃‍♂️ Tập thể dục</div>}
                    {day.water && <div className="text-blue-600">💧 {day.water} ly nước</div>}
                    {day.sleep && <div className="text-purple-600">😴 {day.sleep}h ngủ</div>}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-xs">Chưa cập nhật</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (!memberDashboard?.statistics) return null;

    const stats = memberDashboard.statistics;
    const formatMoney = (amount) => {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(amount || 0);
    };

    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Thống kê tổng quan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.smokeFreeDays || 0}</div>
            <div className="text-sm text-gray-600">Ngày không hút</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatMoney(stats.moneySaved)}</div>
            <div className="text-sm text-gray-600">Tiền tiết kiệm</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.avoidedCigarettes || 0}</div>
            <div className="text-sm text-gray-600">Điếu thuốc tránh được</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.todayMood ? stats.todayMood + "/10" : "-"}</div>
            <div className="text-sm text-gray-600">Cảm giác hôm nay</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Tiến độ thành viên đã chia sẻ</h1>
        
        {/* Danh sách members */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {members.length === 0 && (
            <div className="col-span-full text-center text-gray-600 py-8">
              <div className="text-4xl mb-4">📊</div>
              <div>Chưa có thành viên nào chia sẻ tiến độ.</div>
            </div>
          )}
          {members.map(member => (
            <div key={member.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mb-4">
                <span className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white text-2xl font-bold shadow-lg">
                  {member.firstName?.charAt(0) || member.username?.charAt(0) || "U"}
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900 text-center">{member.firstName} {member.lastName}</div>
              <div className="text-sm text-gray-500 mb-4 text-center">{member.email}</div>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => handleViewDashboard(member)}
              >
                Xem tiến độ
              </button>
            </div>
          ))}
        </div>

        {/* Dashboard của member được chọn */}
        {selectedMember && (
          <div className="bg-white rounded-xl shadow-xl p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Tiến độ của {selectedMember.firstName} {selectedMember.lastName}
                </h2>
                <p className="text-gray-600 mt-1">{selectedMember.email}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-600">Đang tải tiến độ...</div>
              </div>
            ) : memberDashboard ? (
              <div className="space-y-8">
                {renderStatistics()}
                {renderWeeklyProgress()}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-red-600 text-lg mb-2">❌</div>
                <div className="text-red-600">Không thể tải tiến độ thành viên này.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMembers; 