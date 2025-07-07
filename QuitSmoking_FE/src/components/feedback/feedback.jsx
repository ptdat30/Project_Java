import React, { useState, useEffect } from 'react';

const Feedback = () => {
  const [rating, setRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Tải feedback hiện tại khi component mount
  useEffect(() => {
    loadExistingFeedback();
  }, []);

  const loadExistingFeedback = async () => {
    const jwtToken = localStorage.getItem('jwt_token');
    
    if (!jwtToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/feedback/my-feedback', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExistingFeedback(data);
        setRating(data.rating);
        setFeedback(data.feedbackContent || '');
      } else if (response.status === 404) {
        // Người dùng chưa có feedback, đây là trường hợp bình thường
        setExistingFeedback(null);
      } else {
        console.error('Error loading existing feedback:', response.status);
      }
    } catch (error) {
      console.error('Error loading existing feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = (index) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const handleClick = (index) => {
    setRating(index);
  };

  const getRatingLabel = (index) => {
    switch (index) {
      case 1:
        return 'Rất tệ';
      case 2:
        return 'Chưa hài lòng';
      case 3:
        return 'Tạm ổn';
      case 4:
        return 'Hài lòng';
      case 5:
        return 'Rất hài lòng';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === null) {
      alert('Vui lòng chọn mức độ hài lòng của bạn!');
      return;
    }

    setIsSubmitting(true);
    const jwtToken = localStorage.getItem('jwt_token');

    try {
      const response = await fetch('http://localhost:8080/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` })
        },
        body: JSON.stringify({
          rating: rating,
          feedbackContent: feedback
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        setShowSuccessModal(true);
        
        // Cập nhật existing feedback sau khi submit thành công
        setExistingFeedback({
          ...responseData,
          rating: rating,
          feedbackContent: feedback
        });
      } else {
        let errorBody;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorBody = await response.json();
        } else {
          errorBody = await response.text();
        }

        let errorMessage = `Gửi ý kiến thất bại: ${response.status} ${response.statusText}`;

        if (errorBody) {
          if (typeof errorBody === 'object' && errorBody.message) {
            errorMessage = errorBody.message;
            if (errorBody.fieldErrors) {
              for (const field in errorBody.fieldErrors) {
                errorMessage += `\n${field}: ${errorBody.fieldErrors[field]}`;
              }
            }
          } else if (typeof errorBody === 'string') {
            errorMessage += ` - Chi tiết: ${errorBody.substring(0, 100)}...`;
          }
        }
        alert(errorMessage);
        console.error("Backend Error Response:", errorBody);
      }
    } catch (error) {
      console.error("Lỗi khi gửi feedback:", error);
      alert('Đã xảy ra lỗi khi gửi ý kiến. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SỬA ĐỔI Ở ĐÂY: Thêm phần tử dummy vào đầu mảng (index 0)
  // để các phần tử từ index 1 đến 5 có giá trị mong muốn
  const starSizes = ["", "text-3xl", "text-4xl", "text-5xl", "text-6xl", "text-7xl"];
  const starMarginTops = ["", "mt-8", "mt-6", "mt-4", "mt-2", "mt-0"]; // Điều chỉnh margin nếu cần

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] mt-20 bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-green-700">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] mt-20 bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 animate-pulse">
                <i className="fas fa-heart text-green-600 text-2xl"></i>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Cảm ơn bạn đã đánh giá! ❤️
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Ý kiến của bạn rất quan trọng với chúng tôi. 
              <br />
              Chúng tôi sẽ cải thiện dịch vụ dựa trên phản hồi của bạn.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">
                Đánh giá của bạn đã được ghi nhận thành công!
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium"
            >
              <i className="fas fa-check mr-2"></i>
              Hoàn thành
            </button>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-green-700 text-white text-center py-4 rounded-lg mb-6 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">HÃY ĐÁNH GIÁ CHÚNG TÔI !!!</h1>
        </div>
        
        {/* Hiển thị thông báo nếu đã có feedback */}
        {existingFeedback && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6 max-w-xl mx-auto">
            <div className="flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              <span>Bạn đã đánh giá trước đó. Bạn có thể cập nhật đánh giá của mình bên dưới.</span>
            </div>
          </div>
        )}

        <div className="bg-[#fdf6ed] rounded-lg p-12 mb-8 w-full">
          <h2 className="text-green-600 text-2xl font-medium text-center mb-8">
            TỔNG QUAN VỀ MỨC ĐỘ HÀI LÒNG CỦA BẠN
          </h2>
          <div className="flex justify-center space-x-8 mb-4 items-end">
            {/* Giữ nguyên vòng lặp từ 1 đến 5 */}
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className={`flex flex-col items-center ${starMarginTops[index]}`}> {/* Dùng index trực tiếp */}
                <button
                  className="focus:outline-none transition-transform transform hover:scale-110 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(index)}
                  type="button"
                >
                  <i
                    className={`fas fa-star ${starSizes[index]} ${ // Dùng index trực tiếp
                      hoverRating === index
                        ? 'text-yellow-300'
                        : rating === index
                        ? 'text-yellow-300 animate-pulse'
                        : 'text-gray-300'
                    }`}
                  ></i>
                </button>
                <span className={`text-base mt-2 ${index === rating ? 'text-green-600 font-medium' : 'text-green-500'}`}>
                  {getRatingLabel(index)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#fdf6ed] rounded-lg p-12 mb-8 w-full">
          <p className="text-green-600 mb-4 text-xl">
            Nếu bạn có đóng góp ý kiến cứ đóng góp cho chúng tôi nhé, chúng tôi rất mong chờ và tiếp thu ý kiến đóng góp của bạn <span className="text-red-500">❤️</span>
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-6 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-green-500 mb-8 text-lg bg-white"
              placeholder="Ý kiến của bạn......."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-green-700 text-white py-4 px-10 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 !rounded-button whitespace-nowrap cursor-pointer text-lg ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-800'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang gửi...
                  </span>
                ) : (
                  existingFeedback ? 'Cập nhật ý kiến' : 'Đóng góp ý kiến'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;