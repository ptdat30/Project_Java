import React, { useState, useEffect, useRef } from "react";
import apiService from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import config from "../../config/config";

// Thông tin mẫu cho coach theo email
const defaultCoachInfoByEmail = {
  "vuman6699@gmail.com": {
    specialty: "Chuyên gia cai nghiện thuốc lá",
    experience: "10 năm kinh nghiệm",
    rating: 4.9,
    totalSessions: 1250,
    status: "ONLINE",
    description:
      "Bác sĩ chuyên về tâm lý và hành vi cai nghiện. Đã giúp hơn 1000 người cai thuốc thành công.",
    price: 150000,
    specialties: ["Tâm lý học", "Liệu pháp hành vi", "Coaching cai nghiện"],
  },
  "123123123@gmail.com": {
    specialty: "Chuyên gia cai nghiện thuốc lào",
    experience: "20 năm kinh nghiệm",
    rating: 4.7,
    totalSessions: 900,
    status: "BUSY",
    description:
      "Bác sĩ chuyên về tâm lý và hành vi cai nghiện. Đã giúp hơn 500 người cai thuốc thành công.",
    price: 100000,
    specialties: ["Tâm lý học", "Liệu pháp hành vi", "Coaching cai nghiện"],
  },
  // "":{

  // },
};

// Hàm tiện ích để tạo full URL cho avatar
const getFullAvatarUrl = (pictureUrl) => {
  if (!pictureUrl) return null;
  if (pictureUrl.startsWith('http')) return pictureUrl;
  return `${config.API_BASE_URL}${pictureUrl}`;
};

// Hàm tiện ích lưu/lấy thông tin giới thiệu coach từ localStorage hoặc mẫu
const saveCoachInfo = (coachId, info) => {
  const allInfo = JSON.parse(localStorage.getItem("coachExtraInfo") || "{}");
  allInfo[coachId] = info;
  localStorage.setItem("coachExtraInfo", JSON.stringify(allInfo));
};
const getCoachInfo = (coach) => {
  const allInfo = JSON.parse(localStorage.getItem("coachExtraInfo") || "{}");
  if (allInfo[coach.id]) return allInfo[coach.id];
  if (defaultCoachInfoByEmail[coach.email]) return defaultCoachInfoByEmail[coach.email];
  return {};
};

const CoachConsultation = () => {
  const { user } = useAuth();
  const isCoach = user?.role === "COACH";
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionType, setSessionType] = useState("CHAT");
  const messagesEndRef = useRef(null);

  // Lấy danh sách session nếu là coach, hoặc danh sách coach nếu là member
  useEffect(() => {
    if (isCoach) {
      // Coach: lấy các session mà mình là coach
      const fetchSessions = async () => {
        try {
          const data = await apiService.get(`/api/coach-consultations?coachId=${user.id}`);
          setSessions(data);
        } catch (err) {
          setSessions([]);
        }
      };
      fetchSessions();
    } else {
      // Member: lấy danh sách coach như cũ
      const fetchCoaches = async () => {
        try {
          const data = await apiService.getCoaches();
          setSessions(data); // sessions = coaches cho member
        } catch (err) {
          setSessions([]);
        }
      };
      fetchCoaches();
    }
  }, [isCoach, user]);

  // Khi bắt đầu chat với user (coach) hoặc coach chọn session
  const handleStartSession = async (target) => {
    if (isCoach) {
      // target là session, lấy member làm selected user
      setSelectedSession(target);
      setActiveSession(target);
      try {
        const res = await apiService.getChatMessages(target.id);
        setMessages(res.content || []);
      } catch (err) {
        alert("Không thể tải tin nhắn. Vui lòng thử lại!");
        setMessages([]);
      }
    } else {
      // member: target là coach
      setSelectedSession(target);
      let session;
      try {
        session = await apiService.getConsultationSession(user.id, target.id);
        if (!session || !session.id) {
          session = await apiService.createConsultation({
            userId: user.id,
            coachId: target.id,
            sessionType,
          });
        }
        setActiveSession(session);
        const res = await apiService.getChatMessages(session.id);
        setMessages(res.content || []);
      } catch (err) {
        alert("Không thể bắt đầu phiên chat. Vui lòng thử lại!");
        setMessages([]);
      }
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;
    try {
      await apiService.sendMessage(activeSession.id, {
        senderId: user.id,
        content: newMessage,
        messageType: "TEXT",
      });
      setNewMessage("");
      const res = await apiService.getChatMessages(activeSession.id);
      setMessages(res.content || []);
    } catch (err) {
      alert("Không gửi được tin nhắn!");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Nếu đang trong session chat
  if (activeSession && selectedSession) {
    // Nếu là coach, làm nổi bật tin nhắn từ user
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setActiveSession(null);
                  setSelectedSession(null);
                  setMessages([]);
                }}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700"
              >
                ←
              </button>
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                {isCoach && selectedSession.memberPictureUrl ? (
                  <img
                    src={getFullAvatarUrl(selectedSession.memberPictureUrl)}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {isCoach
                      ? (selectedSession.memberFirstName
                          ? selectedSession.memberFirstName.charAt(0)
                          : selectedSession.memberUsername?.charAt(0))
                      : (selectedSession.firstName
                          ? selectedSession.firstName.charAt(0)
                          : selectedSession.username.charAt(0))}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {isCoach
                    ? (selectedSession.memberFirstName
                        ? `${selectedSession.memberFirstName} ${selectedSession.memberLastName}`
                        : selectedSession.memberUsername)
                    : (selectedSession.firstName
                        ? `${selectedSession.firstName} ${selectedSession.lastName}`
                        : selectedSession.username)}
                </h3>
                <p className="text-sm text-green-600">● Online</p>
              </div>
            </div>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col">
                {/* Sender name */}
                <div className={`text-xs text-gray-500 mb-1 ${
                  message.senderId === user.id ? "text-right" : "text-left"
                }`}>
                  {message.senderName || message.senderUsername || "Unknown"}
                </div>
                {/* Message bubble */}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === user.id
                      ? "bg-blue-600 text-white"
                      : isCoach
                        ? "bg-yellow-100 text-gray-900 border border-yellow-300"
                        : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.senderId === user.id
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
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

  // Giao diện danh sách session cho coach hoặc danh sách coach cho member
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isCoach ? "Tin nhắn từ người dùng" : "Tư vấn với Coach"}
          </h1>
          <p className="text-gray-600 mb-4">
            {isCoach
              ? "Chọn một người dùng để trả lời tin nhắn."
              : "Nhận hỗ trợ chuyên nghiệp từ các huấn luyện viên cai nghiện thuốc lá"}
          </p>
          {!isCoach && (
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
          )}
        </div>
        {/* Danh sách session cho coach hoặc danh sách coach cho member */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCoach
            ? sessions.map((session) => (
                <div key={session.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
                      {session.memberPictureUrl ? (
                        <img
                          src={getFullAvatarUrl(session.memberPictureUrl)}
                          alt="Avatar"
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xl font-medium">
                          {session.memberFirstName
                            ? session.memberFirstName.charAt(0)
                            : session.memberUsername?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {session.memberFirstName
                          ? `${session.memberFirstName} ${session.memberLastName}`
                          : session.memberUsername}
                      </h3>
                      <p className="text-sm text-gray-600">{session.memberEmail}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleStartSession(session)}
                      className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
                    >
                      Xem tin nhắn
                    </button>
                  </div>
                </div>
              ))
            : sessions.map((coach) => {
                const extraInfo = getCoachInfo(coach);
                return (
                  <div key={coach.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
                        {coach.pictureUrl ? (
                          <img
                            src={getFullAvatarUrl(coach.pictureUrl)}
                            alt="Avatar"
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xl font-medium">
                            {coach.firstName
                              ? coach.firstName.charAt(0)
                              : coach.username.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {coach.firstName
                            ? `${coach.lastName} ${coach.firstName}`
                            : coach.username}
                        </h3>
                        <p className="text-sm text-gray-600">{coach.email}</p>
                      </div>
                    </div>
                    {/* Hiển thị thông tin giới thiệu nếu có */}
                    {extraInfo.specialty && (
                      <div className="mb-2 text-sm text-gray-700">
                        <b>Chuyên môn:</b> {extraInfo.specialty}
                      </div>
                    )}
                    {extraInfo.experience && (
                      <div className="mb-2 text-sm text-gray-700">
                        <b>Kinh nghiệm:</b> {extraInfo.experience}
                      </div>
                    )}
                    {extraInfo.description && (
                      <div className="mb-2 text-sm text-gray-700">
                        <b>Mô tả:</b> {extraInfo.description}
                      </div>
                    )}
                    <div className="mb-2 text-sm text-gray-700">
                      <b>Trạng thái:</b> {extraInfo.status || "ONLINE"}
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <button
                        onClick={() => handleStartSession(coach)}
                        className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
                      >
                        Bắt đầu chat
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default CoachConsultation;
