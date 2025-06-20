import React, { useState, useEffect, useRef } from "react";
const CoachConsultation = () => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionType, setSessionType] = useState("CHAT");
  const messagesEndRef = useRef(null);
  useEffect(() => {
    // Mock data - coaches
    setCoaches([
      {
        id: "1",
        name: "Dr. Nguyễn Thanh Hà",
        specialty: "Chuyên gia cai nghiện thuốc lá",
        experience: "8 năm kinh nghiệm",
        rating: 4.9,
        totalSessions: 1250,
        avatar: null,
        status: "ONLINE",
        description:
          "Bác sĩ chuyên về tâm lý và hành vi cai nghiện. Đã giúp hơn 1000 người cai thuốc thành công.",
        price: 150000,
        specialties: ["Tâm lý học", "Liệu pháp hành vi", "Coaching cai nghiện"],
      },
      {
        id: "2",
        name: "ThS. Trần Minh Tuấn",
        specialty: "Tư vấn sức khỏe tâm thần",
        experience: "5 năm kinh nghiệm",
        rating: 4.8,
        totalSessions: 890,
        avatar: null,
        status: "BUSY",
        description:
          "Chuyên gia tâm lý lâm sàng với phương pháp tiếp cận nhân văn.",
        price: 120000,
        specialties: [
          "Tâm lý lâm sàng",
          "Trị liệu nhận thức",
          "Quản lý stress",
        ],
      },
      {
        id: "3",
        name: "Coach Lê Thị Mai",
        specialty: "Life Coach chuyên cai nghiện",
        experience: "6 năm kinh nghiệm",
        rating: 4.7,
        totalSessions: 650,
        avatar: null,
        status: "ONLINE",
        description:
          "Life coach chuyên về thay đổi thói quen và xây dựng lối sống tích cực.",
        price: 100000,
        specialties: ["Life Coaching", "Thay đổi thói quen", "Motivation"],
      },
    ]);
    // Mock active session
    setActiveSession({
      id: "1",
      coachId: "1",
      status: "ACTIVE",
      sessionType: "CHAT",
      startTime: new Date().toISOString(),
      duration: 30,
    });
    // Mock messages
    setMessages([
      {
        id: "1",
        senderId: "1",
        senderType: "COACH",
        content:
          "Chào bạn! Tôi là Dr. Hà. Rất vui được hỗ trợ bạn trong hành trình cai thuốc. Bạn đã cai thuốc được bao lâu rồi?",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        messageType: "TEXT",
      },
      {
        id: "2",
        senderId: "user",
        senderType: "USER",
        content:
          "Chào bác sĩ! Em đã cai được 25 ngày rồi ạ. Nhưng hôm nay em cảm thấy rất muốn hút thuốc.",
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        messageType: "TEXT",
      },
      {
        id: "3",
        senderId: "1",
        senderType: "COACH",
        content:
          "Tuyệt vời! 25 ngày là một thành tích đáng tự hào. Cảm giác muốn hút thuốc là bình thường. Bạn có thể chia sẻ điều gì đang làm bạn căng thẳng không?",
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        messageType: "TEXT",
      },
    ]);
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const message = {
      id: Date.now().toString(),
      senderId: "user",
      senderType: "USER",
      content: newMessage,
      timestamp: new Date().toISOString(),
      messageType: "TEXT",
    };
    setMessages([...messages, message]);
    setNewMessage("");
    // Simulate coach response after 2 seconds
    setTimeout(() => {
      const coachResponse = {
        id: (Date.now() + 1).toString(),
        senderId: selectedCoach?.id || "1",
        senderType: "COACH",
        content: getCoachResponse(newMessage),
        timestamp: new Date().toISOString(),
        messageType: "TEXT",
      };
      setMessages((prev) => [...prev, coachResponse]);
    }, 2000);
  };
  const getCoachResponse = (userMessage) => {
    const responses = [
      "Tôi hiểu cảm giác của bạn. Hãy thử áp dụng kỹ thuật hít thở sâu 4-7-8: Hít vào trong 4 giây, giữ 7 giây, thở ra trong 8 giây.",
      "Đó là phản ứng tự nhiên của cơ thể. Hãy uống một ly nước lạnh và đi bộ 5 phút để chuyển hướng sự chú ý.",
      "Bạn đang làm rất tốt! Hãy nhớ lại lý do ban đầu khiến bạn muốn cai thuốc. Điều đó sẽ giúp bạn vượt qua.",
      "Có thể bạn cần một hoạt động thay thế. Hãy thử nhai kẹo cao su hoặc giữ tay bận rộn với fidget spinner.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  const handleStartSession = (coach) => {
    setSelectedCoach(coach);
    setActiveSession({
      id: Date.now().toString(),
      coachId: coach.id,
      status: "ACTIVE",
      sessionType: sessionType,
      startTime: new Date().toISOString(),
      duration: 30,
    });
    setMessages([
      {
        id: "1",
        senderId: coach.id,
        senderType: "COACH",
        content: `Chào bạn! Tôi là ${coach.name}. Rất vui được hỗ trợ bạn trong hành trình cai thuốc. Bạn có thể chia sẻ về tình hình hiện tại của mình không?`,
        timestamp: new Date().toISOString(),
        messageType: "TEXT",
      },
    ]);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  if (activeSession && selectedCoach) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setActiveSession(null);
                  setSelectedCoach(null);
                  setMessages([]);
                }}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700"
              >
                ←
              </button>
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {selectedCoach.name.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCoach.name}
                </h3>
                <p className="text-sm text-green-600">● Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Phiên tư vấn: {sessionType === "CHAT" ? "Chat" : "Video call"}
              </span>
              <button className="p-2 text-gray-500 hover:text-red-600">
                📞
              </button>
              <button className="p-2 text-gray-500 hover:text-red-600">
                🔚
              </button>
            </div>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderType === "USER" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderType === "USER"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderType === "USER"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tư vấn với Coach
          </h1>
          <p className="text-gray-600 mb-4">
            Nhận hỗ trợ chuyên nghiệp từ các huấn luyện viên cai nghiện thuốc lá
          </p>

          {/* Session Type Selection */}
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="CHAT"
                checked={sessionType === "CHAT"}
                onChange={(e) => setSessionType(e.target.value)}
                className="mr-2"
              />
              💬 Chat trực tuyến
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="VIDEO_CALL"
                checked={sessionType === "VIDEO_CALL"}
                onChange={(e) => setSessionType(e.target.value)}
                className="mr-2"
              />
              📹 Video call
            </label>
          </div>
        </div>
        {/* Coaches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <div key={coach.id} className="bg-white rounded-lg shadow-sm p-6">
              {/* Coach Header */}
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white text-xl font-medium">
                    {coach.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {coach.name}
                  </h3>
                  <p className="text-sm text-gray-600">{coach.specialty}</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        coach.status === "ONLINE"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {coach.status === "ONLINE" ? "Trực tuyến" : "Bận"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Coach Info */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {coach.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{coach.experience}</span>
                  <span>⭐ {coach.rating}</span>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                  {coach.totalSessions} phiên tư vấn
                </p>
                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {coach.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              {/* Pricing and Action */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(coach.price)}
                  </span>
                  <span className="text-sm text-gray-500">/ phiên</span>
                </div>

                <button
                  onClick={() => handleStartSession(coach)}
                  disabled={coach.status === "BUSY"}
                  className={`w-full py-2 px-4 rounded-lg font-medium ${
                    coach.status === "ONLINE"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {coach.status === "ONLINE"
                    ? `Bắt đầu ${
                        sessionType === "CHAT" ? "chat" : "video call"
                      }`
                    : "Hiện không khả dụng"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            💡 Cách tận dụng tối đa phiên tư vấn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Trước phiên tư vấn:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Chuẩn bị những câu hỏi cụ thể</li>
                <li>• Ghi chú tình hình hiện tại của bạn</li>
                <li>• Chia sẻ về những khó khăn đang gặp</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Trong phiên tư vấn:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Thành thật và mở lòng</li>
                <li>• Ghi chú lại lời khuyên quan trọng</li>
                <li>• Đặt câu hỏi khi không hiểu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CoachConsultation;
