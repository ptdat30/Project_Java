import React, { useState } from 'react';

const Feedback = () => {
  const [rating, setRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  const [feedback, setFeedback] = useState('');

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
      case 0:
        return 'Rất tệ';
      case 1:
        return 'Chưa hài lòng';
      case 2:
        return 'Tạm ổn';
      case 3:
        return 'Hài lòng';
      case 4:
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

  const jwtToken = localStorage.getItem('jwt_token'); // Lấy token từ localStorage (hoặc nơi bạn lưu trữ)

  try {
    const response = await fetch('http://localhost:8080/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Thêm Authorization header nếu có token
        ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }) // Chỉ thêm header nếu jwtToken tồn tại
      },
      body: JSON.stringify({
        rating: rating,
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
      // Cố gắng đọc phản hồi lỗi. Backend có thể trả về HTML, text, hoặc JSON.
      // Vì lỗi 401 thường không phải JSON, ta cần xử lý linh hoạt hơn.
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
              if (errorBody.fieldErrors) { // Nếu có lỗi validation từ GlobalExceptionHandler
                  for (const field in errorBody.fieldErrors) {
                      errorMessage += `\n${field}: ${errorBody.fieldErrors[field]}`;
                  }
              }
          } else if (typeof errorBody === 'string') {
              errorMessage += ` - Chi tiết: ${errorBody.substring(0, 100)}...`; // Tránh log quá dài
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

  const starSizes = ["text-3xl", "text-4xl", "text-5xl", "text-6xl", "text-7xl"];
  const starMarginTops = ["mt-8", "mt-6", "mt-4", "mt-2", "mt-0"];

  return (
    <div className="min-h-[calc(100vh-80px)] mt-20 bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-green-700 text-white text-center py-4 rounded-lg mb-6 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">HÃY ĐÁNH GIÁ CHÚNG TÔI !!!</h1>
        </div>
        <div className="bg-[#fdf6ed] rounded-lg p-12 mb-8 w-full">
          <h2 className="text-green-600 text-2xl font-medium text-center mb-8">
            TỔNG QUAN VỀ MỨC ĐỘ HÀI LÒNG CỦA BẠN
          </h2>
          <div className="flex justify-center space-x-8 mb-4 items-end">
            {[0, 1, 2, 3, 4].map((index) => (
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
                className="bg-green-700 text-white py-4 px-10 rounded-lg font-medium hover:bg-green-800 transition-all duration-300 transform hover:scale-105 active:scale-95 !rounded-button whitespace-nowrap cursor-pointer text-lg"
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