import React, { useState, useRef } from 'react';

const Feedback = () => {
  const [rating, setRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState({});
  const ratingRef = useRef(null);
  const feedbackRef = useRef(null);

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

  const validateForm = () => {
    const newError = {};
    if (rating === null) {
      newError.rating = 'Vui lòng chọn mức độ hài lòng!';
    }
    if (!feedback.trim()) {
      newError.feedback = 'Vui lòng nhập ý kiến đóng góp!';
    }
    setError(newError);
    if (Object.keys(newError).length > 0) {
      setTimeout(() => {
        if (newError.rating && ratingRef.current) {
          ratingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (newError.feedback && feedbackRef.current) {
          feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          feedbackRef.current.focus && feedbackRef.current.focus();
        }
      }, 100);
    }
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const jwtToken = localStorage.getItem('jwt_token');

    try {
      const response = await fetch('http://localhost:8080/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` })
        },
        body: JSON.stringify({
          rating: rating, // Gửi đúng giá trị rating từ 1-5
          feedbackContent: feedback
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        alert(responseData.message || 'Ý kiến đã được ghi nhận, xin cảm ơn bạn!');
        setRating(null);
        setFeedback('');
        setHoverRating(null);
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
    }
  };

  // SỬA ĐỔI Ở ĐÂY: Thêm phần tử dummy vào đầu mảng (index 0)
  // để các phần tử từ index 1 đến 5 có giá trị mong muốn
  const starSizes = ["", "text-3xl", "text-4xl", "text-5xl", "text-6xl", "text-7xl"];
  const starMarginTops = ["", "mt-8", "mt-6", "mt-4", "mt-2", "mt-0"]; // Điều chỉnh margin nếu cần

  return (
    <div className="min-h-[calc(100vh-80px)] mt-10 sm:mt-20 bg-gray-50 flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl sm:max-w-5xl mx-auto">
        <div className="bg-green-700 text-white text-center py-3 sm:py-4 rounded-lg mb-4 sm:mb-6 max-w-xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold">HÃY ĐÁNH GIÁ CHÚNG TÔI !!!</h1>
        </div>
        <div className="bg-[#fdf6ed] rounded-lg p-4 sm:p-12 mb-4 sm:mb-8 w-full">
          <h2 className="text-green-600 text-lg sm:text-2xl font-medium text-center mb-4 sm:mb-8">
            TỔNG QUAN VỀ MỨC ĐỘ HÀI LÒNG CỦA BẠN
          </h2>
          {/* Hiển thị lỗi rating */}
          {error.rating && <div className="text-red-600 text-sm mb-2 text-center">{error.rating}</div>}
          <div className="flex justify-center space-x-2 sm:space-x-8 mb-2 sm:mb-4 items-end" ref={ratingRef}>
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className={`flex flex-col items-center ${starMarginTops[index]}`}>
                <button
                  className="focus:outline-none transition-transform transform hover:scale-110 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(index)}
                  type="button"
                >
                  <i
                    className={`fas fa-star ${starSizes[index]} ${
                      hoverRating === index
                        ? 'text-yellow-300'
                        : rating === index
                        ? 'text-yellow-300 animate-pulse'
                        : 'text-gray-300'
                    }`}
                  ></i>
                </button>
                <span className={`text-xs sm:text-base mt-1 sm:mt-2 ${index === rating ? 'text-green-600 font-medium' : 'text-green-500'}`}>
                  {getRatingLabel(index)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#fdf6ed] rounded-lg p-4 sm:p-12 mb-4 sm:mb-8 w-full">
          <p className="text-green-600 mb-2 sm:mb-4 text-base sm:text-xl">
            Nếu bạn có đóng góp ý kiến cứ đóng góp cho chúng tôi nhé, chúng tôi rất mong chờ và tiếp thu ý kiến đóng góp của bạn <span className="text-red-500">❤️</span>
          </p>
          {/* Hiển thị lỗi feedback */}
          {error.feedback && <div className="text-red-600 text-sm mb-2">{error.feedback}</div>}
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 sm:p-6 min-h-[100px] sm:min-h-[160px] focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 sm:mb-8 text-base sm:text-lg bg-white"
              placeholder="Ý kiến của bạn......."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              ref={feedbackRef}
            ></textarea>
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-green-700 text-white py-3 sm:py-4 px-6 sm:px-10 rounded-lg font-medium hover:bg-green-800 transition-all duration-300 transform hover:scale-105 active:scale-95 !rounded-button whitespace-nowrap cursor-pointer text-base sm:text-lg"
              >
                Đóng góp ý kiến
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;