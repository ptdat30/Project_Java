import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';

const DailyProgressPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProgress, setNewProgress] = useState({
    date: new Date().toISOString().split('T')[0],
    cigarettesSmoked: 0,
    mood: 'NEUTRAL',
    stressLevel: 3,
    cravingLevel: 3,
    notes: '',
    exerciseMinutes: 0,
    sleepHours: 8,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProgressData();
  }, [isAuthenticated, navigate]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDailyProgress();
      setProgressData(response.content || response);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Không thể tải dữ liệu tiến trình');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createDailyProgress(newProgress);
      setShowAddModal(false);
      setNewProgress({
        date: new Date().toISOString().split('T')[0],
        cigarettesSmoked: 0,
        mood: 'NEUTRAL',
        stressLevel: 3,
        cravingLevel: 3,
        notes: '',
        exerciseMinutes: 0,
        sleepHours: 8,
      });
      fetchProgressData();
    } catch (error) {
      console.error('Error creating progress:', error);
      setError('Không thể lưu tiến trình');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProgress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tiến trình hàng ngày</h1>
            <p className="text-gray-600">Theo dõi và ghi nhận hành trình cai thuốc của bạn</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Ghi nhận hôm nay
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Progress Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ tiến trình</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Biểu đồ tiến trình sẽ hiển thị ở đây</p>
          </div>
        </div>

        {/* Progress List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử tiến trình</h3>
          {progressData.length > 0 ? (
            <div className="space-y-4">
              {progressData.map((progress, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {new Date(progress.date).toLocaleDateString('vi-VN')}
                    </h4>
                    <span className={`px-2 py-1 rounded text-sm ${
                      progress.cigarettesSmoked === 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {progress.cigarettesSmoked === 0 ? 'Không hút' : `${progress.cigarettesSmoked} điếu`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>Tâm trạng: <span className="font-medium">{progress.mood}</span></div>
                    <div>Stress: <span className="font-medium">{progress.stressLevel}/5</span></div>
                    <div>Khao khát: <span className="font-medium">{progress.cravingLevel}/5</span></div>
                    <div>Tập thể dục: <span className="font-medium">{progress.exerciseMinutes} phút</span></div>
                  </div>
                  {progress.notes && (
                    <p className="mt-2 text-gray-700">{progress.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có dữ liệu tiến trình. Hãy bắt đầu ghi nhận ngay hôm nay!</p>
            </div>
          )}
        </div>

        {/* Add Progress Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ghi nhận tiến trình</h3>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newProgress.date}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điếu hút
                    </label>
                    <input
                      type="number"
                      name="cigarettesSmoked"
                      value={newProgress.cigarettesSmoked}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tâm trạng
                    </label>
                    <select
                      name="mood"
                      value={newProgress.mood}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="VERY_GOOD">Rất tốt</option>
                      <option value="GOOD">Tốt</option>
                      <option value="NEUTRAL">Bình thường</option>
                      <option value="BAD">Tệ</option>
                      <option value="VERY_BAD">Rất tệ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mức độ stress (1-5)
                    </label>
                    <input
                      type="range"
                      name="stressLevel"
                      value={newProgress.stressLevel}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{newProgress.stressLevel}/5</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mức độ khao khát thuốc (1-5)
                    </label>
                    <input
                      type="range"
                      name="cravingLevel"
                      value={newProgress.cravingLevel}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{newProgress.cravingLevel}/5</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian tập thể dục (phút)
                    </label>
                    <input
                      type="number"
                      name="exerciseMinutes"
                      value={newProgress.exerciseMinutes}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={newProgress.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú về ngày hôm nay..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyProgressPage;
