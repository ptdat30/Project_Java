import React, { useState, useEffect, useRef } from "react";
import apiService from "../../services/apiService";
import websocketService from "../../services/websocketService";
import { useAuth } from "../../context/AuthContext";
import config from "../../config/config";
import AvatarFromName from '../common/AvatarFromName';
import useMembershipError from "../../hooks/useMembershipError";
import MembershipUpgradeModal from "../common/MembershipUpgradeModal";
import notificationService from "../../services/notificationService";

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
  "trungnlq123456@ut.edu.vn": {
    specialty: "Chuyên gia cai nghiện vape",
    experience: "15 năm kinh nghiệm",
    rating: 3.8,
    totalSessions: 900,
    status: "ONLINE",
    description:
      "Bác sĩ chuyên về tâm lý và hành vi cai nghiện. Đã giúp hơn 200 người cai thuốc thành công.",
    price: 120000,
    specialties: ["Liệu pháp hành vi", "Coaching cai nghiện", "Vape", "Vật lý trị liệu"],
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
  
  // Sử dụng hook xử lý lỗi membership
  const { showUpgradeModal, errorMessage, handleApiError, closeUpgradeModal } = useMembershipError();
  
  // Kiểm tra quyền truy cập cho guest
  const isGuest = user?.role === "GUEST";
  const hasAccess = !isGuest || isCoach;
  
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionType, setSessionType] = useState("CHAT");
  const [websocketStatus, setWebsocketStatus] = useState("disconnected");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const messagesEndRef = useRef(null);
  const [unreadSessions, setUnreadSessions] = useState(notificationService.getUnreadSessions());

  // Lấy danh sách session nếu là coach, hoặc danh sách coach nếu là member
  useEffect(() => {
    // Chỉ fetch data nếu có quyền truy cập
    if (!hasAccess) return;
    
    if (isCoach) {
      // Coach: lấy các session mà mình là coach
      const fetchSessions = async () => {
        try {
          const data = await apiService.get(`/api/coach-consultations?coachId=${user.id}`);
          // Deduplicate sessions ở frontend để đảm bảo không có duplicate
          const deduplicatedSessions = deduplicateSessions(data);
          setSessions(deduplicatedSessions);
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

  // Hàm deduplicate sessions - chỉ giữ lại session mới nhất cho mỗi member
  const deduplicateSessions = (sessions) => {
    const sessionMap = new Map();
    
    sessions.forEach(session => {
      const memberId = session.memberId;
      
      // Nếu chưa có session cho member này, hoặc session hiện tại mới hơn
      if (!sessionMap.has(memberId) || 
          new Date(session.createdAt) > new Date(sessionMap.get(memberId).createdAt)) {
        sessionMap.set(memberId, session);
      }
    });
    
    // Trả về danh sách đã deduplicate, sắp xếp ưu tiên session có tin nhắn chưa đọc
    return Array.from(sessionMap.values())
      .sort((a, b) => {
        const aHasUnread = unreadSessions.includes(a.id);
        const bHasUnread = unreadSessions.includes(b.id);
        
        // Ưu tiên session có tin nhắn chưa đọc
        if (aHasUnread && !bHasUnread) return -1;
        if (!aHasUnread && bHasUnread) return 1;
        
        // Nếu cùng trạng thái đọc, sắp xếp theo thời gian tạo mới nhất
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  };

  // Handle cleanup duplicate sessions
  const handleCleanupDuplicates = async () => {
    try {
      const response = await apiService.post(`/api/coach-consultations/cleanup-duplicates?coachId=${user.id}`);
      alert(`Đã dọn dẹp ${response.cleanedCount} session trùng lặp!`);
      
      // Refresh sessions sau khi cleanup
      const data = await apiService.get(`/api/coach-consultations?coachId=${user.id}`);
      const deduplicatedSessions = deduplicateSessions(data);
      setSessions(deduplicatedSessions);
    } catch (err) {
      alert("Lỗi khi dọn dẹp session trùng lặp: " + err.message);
    }
  };

  // Handle WebSocket message received
  const handleWebSocketMessage = (message) => {
    console.log('CoachConsultation: Received WebSocket message:', message);
    setMessages(prevMessages => [...prevMessages, message]);
    
    // Nếu tin nhắn từ người khác và đang ở trang danh sách session (không phải trong chat)
    if (message.senderId !== user.id && !activeSession) {
      console.log('CoachConsultation: Adding session to unread list:', message.sessionId);
      notificationService.addUnreadSession(message.sessionId);
    }
  };

  // Handle WebSocket status changes
  const handleWebSocketStatusChange = (status) => {
    console.log('CoachConsultation: WebSocket status changed to:', status);
    setWebsocketStatus(status);
  };

  // Khi nhận tin nhắn mới (qua global listener), localStorage sẽ tự động cập nhật
  // Cập nhật state khi quay lại trang này
  useEffect(() => {
    const handleStorage = () => {
      setUnreadSessions(notificationService.getUnreadSessions());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Cập nhật lại danh sách session khi unreadSessions thay đổi (để sắp xếp lại)
  useEffect(() => {
    if (isCoach && sessions.length > 0) {
      const sortedSessions = deduplicateSessions(sessions);
      setSessions(sortedSessions);
    }
  }, [unreadSessions, isCoach]);

  // Cập nhật unreadSessions khi có tin nhắn mới từ WebSocket
  useEffect(() => {
    const handleUnreadUpdate = () => {
      setUnreadSessions(notificationService.getUnreadSessions());
    };

    // Tạo custom event để cập nhật unread sessions
    window.addEventListener('unreadSessionsUpdate', handleUnreadUpdate);
    
    return () => {
      window.removeEventListener('unreadSessionsUpdate', handleUnreadUpdate);
    };
  }, []);

  // Debug log khi unreadSessions thay đổi
  useEffect(() => {
    console.log('CoachConsultation: unreadSessions changed:', unreadSessions);
  }, [unreadSessions]);

  // Khi bắt đầu chat với user (coach) hoặc coach chọn session
  const handleStartSession = async (target) => {
    // Prevent multiple clicks
    if (isCreatingSession) return;
    setIsCreatingSession(true);
    
    try {
      if (isCoach) {
        // target là session, lấy member làm selected user
        setSelectedSession(target);
        setActiveSession(target);
        try {
          const res = await apiService.getChatMessages(target.id);
          setMessages(res.content || []);
          
          // Connect to WebSocket
          console.log('CoachConsultation: Connecting to WebSocket for coach session:', target.id);
          websocketService.connect(
            user.id, 
            target.id, 
            handleWebSocketMessage
          );
          
          // Join session after a short delay to ensure connection is established
          setTimeout(() => {
            if (websocketService.isConnected()) {
              console.log('CoachConsultation: Joining WebSocket session:', target.id);
              websocketService.joinSession(
                target.id,
                user.id,
                user.firstName + " " + user.lastName,
                user.username
              );
            } else {
              console.warn('CoachConsultation: WebSocket not connected, cannot join session');
            }
          }, 1000);
        } catch (err) {
          // Xử lý lỗi membership
          if (handleApiError(err)) {
            return; // Đã xử lý bởi hook
          }
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
          
          // Connect to WebSocket
          console.log('CoachConsultation: Connecting to WebSocket for member session:', session.id);
          websocketService.connect(
            user.id, 
            session.id, 
            handleWebSocketMessage
          );
          
          // Join session after a short delay to ensure connection is established
          setTimeout(() => {
            if (websocketService.isConnected()) {
              console.log('CoachConsultation: Joining WebSocket session:', session.id);
              websocketService.joinSession(
                session.id,
                user.id,
                user.firstName + " " + user.lastName,
                user.username
              );
            } else {
              console.warn('CoachConsultation: WebSocket not connected, cannot join session');
            }
          }, 1000);
        } catch (err) {
          // Xử lý lỗi membership
          if (handleApiError(err)) {
            return; // Đã xử lý bởi hook
          }
          alert("Không thể bắt đầu phiên chat. Vui lòng thử lại!");
          setMessages([]);
        }
      }
      notificationService.removeUnreadSession(target.id);
      setUnreadSessions(notificationService.getUnreadSessions());
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Gửi tin nhắn via WebSocket
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;
    
    try {
      // Send via WebSocket (this will also save to database)
      if (websocketService.isConnected()) {
        console.log('CoachConsultation: Sending message via WebSocket');
        websocketService.sendMessage(
          activeSession.id,
          user.id,
          newMessage,
          "TEXT",
          user.firstName + " " + user.lastName,
          user.username
        );
        setNewMessage("");
      } else {
        // Fallback to REST API if WebSocket is not connected
        console.warn('CoachConsultation: WebSocket not connected, using REST API fallback');
        await apiService.sendMessage(activeSession.id, {
          senderId: user.id,
          content: newMessage,
          messageType: "TEXT",
        });
        setNewMessage("");
        const res = await apiService.getChatMessages(activeSession.id);
        setMessages(res.content || []);
      }
    } catch (err) {
      console.error('CoachConsultation: Error sending message:', err);
      alert("Không gửi được tin nhắn!");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      websocketService.disconnect();
    };
  }, []);

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
                  // Disconnect WebSocket when leaving chat
                  websocketService.disconnect();
                  // Xóa session khỏi unread list khi rời khỏi chat
                  if (isCoach) {
                    notificationService.removeUnreadSession(activeSession.id);
                  }
                }}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700"
              >
                ←
              </button>
              <div className="h-10 w-10 rounded-full flex items-center justify-center">
                {isCoach && selectedSession.memberPictureUrl ? (
                  <img
                    src={getFullAvatarUrl(selectedSession.memberPictureUrl)}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <AvatarFromName 
                    firstName={isCoach ? selectedSession.memberFirstName : selectedSession.firstName}
                    lastName={isCoach ? selectedSession.memberLastName : selectedSession.lastName}
                    size={40}
                  />
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
      {/* Hiển thị thông báo nâng cấp cho guest */}
      {!hasAccess && (
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-6">👨‍⚕️</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Tư vấn chuyên gia dành cho thành viên
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Tư vấn trực tiếp với chuyên gia là tính năng premium chỉ dành cho thành viên.
                  Hãy nâng cấp gói thành viên để trải nghiệm đầy đủ tính năng này!
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    🎯 Lợi ích khi nâng cấp:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💬</div>
                      <div>
                        <div className="font-medium text-gray-900">Chat trực tiếp với chuyên gia</div>
                        <div className="text-sm text-gray-600">Giải đáp mọi thắc mắc 24/7</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📹</div>
                      <div>
                        <div className="font-medium text-gray-900">Video call tư vấn</div>
                        <div className="text-sm text-gray-600">Trao đổi trực tiếp với chuyên gia</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📅</div>
                      <div>
                        <div className="font-medium text-gray-900">Lịch trình cá nhân</div>
                        <div className="text-sm text-gray-600">Lộ trình cai nghiện riêng biệt</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <div className="font-medium text-gray-900">Theo dõi tiến độ</div>
                        <div className="text-sm text-gray-600">Đánh giá định kỳ từ chuyên gia</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                      onClick={() => navigate('/membership')}
                      className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition duration-300 shadow-lg"
                  >
                    🚀 Nâng cấp ngay
                  </button>
                  <div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Quay về trang chủ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Hiển thị nội dung chính chỉ khi có quyền truy cập */}
      {hasAccess && (
        <>
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
              {isCoach && (
                <div className="flex justify-between items-center mb-4">
                  <div></div>
                  <button
                    onClick={handleCleanupDuplicates}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                  >
                    🧹 Dọn dẹp session trùng lặp
                  </button>
                </div>
              )}
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
                ? sessions.map((session) => {
                    const hasUnread = unreadSessions.includes(session.id);
                    console.log(`Session ${session.id}: hasUnread = ${hasUnread}, unreadSessions =`, unreadSessions);
                    return (
                      <div key={session.id} className="bg-white rounded-lg shadow-sm p-6 relative">
                        {/* Dấu ! nếu có tin nhắn mới */}
                        {hasUnread && (
                          <span className="absolute top-2 right-3 bg-red-500 text-white text-lg font-bold rounded-full w-6 h-6 flex items-center justify-center z-10 animate-pulse">!</span>
                        )}
                        {/* Debug info - chỉ hiển thị trong development */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="absolute top-2 left-2 text-xs text-gray-500 bg-yellow-100 px-1 rounded">
                            {hasUnread ? 'UNREAD' : 'READ'}
                          </div>
                        )}
                        <div className="flex items-center mb-4">
                          <div className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden">
                            {session.memberPictureUrl ? (
                              <img
                                src={getFullAvatarUrl(session.memberPictureUrl)}
                                alt="Avatar"
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFromName 
                                firstName={session.memberFirstName}
                                lastName={session.memberLastName}
                                size={64}
                              />
                            )}
                          </div>
                          <div className="ml-4 flex flex-col">
                            <span className="text-lg font-bold text-gray-900">
                              {session.memberFirstName
                                ? `${session.memberFirstName} ${session.memberLastName}`
                                : session.memberUsername}
                            </span>
                            <span className="text-sm text-gray-500">{session.memberEmail}</span>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                          <button
                            onClick={() => handleStartSession(session)}
                            disabled={isCreatingSession}
                            className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                              isCreatingSession 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {isCreatingSession ? 'Đang tải...' : 'Xem tin nhắn'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                : sessions.map((coach) => {
                    const extraInfo = getCoachInfo(coach);
                    return (
                      <div key={coach.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center mb-4">
                          <div className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden">
                            {coach.pictureUrl ? (
                              <img
                                src={getFullAvatarUrl(coach.pictureUrl)}
                                alt="Avatar"
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              <AvatarFromName 
                                firstName={coach.firstName}
                                lastName={coach.lastName}
                                size={64}
                              />
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
                            disabled={isCreatingSession}
                            className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                              isCreatingSession 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {isCreatingSession ? 'Đang tải...' : 'Bắt đầu chat'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </>
      )}
      
      {/* Membership Upgrade Modal */}
      <MembershipUpgradeModal 
        isOpen={showUpgradeModal}
        onClose={closeUpgradeModal}
        message={errorMessage}
      />
    </div>
  );
};

export default CoachConsultation;
