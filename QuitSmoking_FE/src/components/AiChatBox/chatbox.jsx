import React, { useState, useRef, useEffect } from 'react';
import { askGemini } from '../../services/AIChatboxService';

const ChatBox = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const chatContentRef = useRef(null);

  // Hiển thị tin nhắn mẫu khi mở chatbox
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: 'ai-greeting',
            sender: 'ai',
            text: 'Xin chào! 👋 Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm nay?'
          }
        ]);
      }, 500);
    }
  }, [isOpen]);

  // Tự động scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e) => setMessage(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMsg = {
        id: Date.now() + '-user',
        sender: 'user',
        text: message.trim()
      };
      setMessages((prev) => [...prev, userMsg]);
      setMessage('');
      setIsTyping(true);

      if (textareaRef.current) textareaRef.current.focus();

      try {
        const aiReply = await askGemini(message.trim());
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + '-ai',
            sender: 'ai',
            text: aiReply
          }
        ]);
      } catch (err) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + '-ai-error',
            sender: 'ai',
            text: 'Xin lỗi, AI hiện không phản hồi được. Vui lòng thử lại sau! 😔'
          }
        ]);
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  if (!isOpen) return null;

  return (
      <div className={`fixed bottom-2 right-2 sm:bottom-6 sm:right-6 z-50 flex flex-col w-[98vw] max-w-xs sm:max-w-md md:max-w-lg shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 overflow-hidden transition-all duration-500 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header với gradient */}
        <div className="relative px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white">
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">Trợ lý AI</h3>
                <p className="text-white/80 text-xs sm:text-sm">Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center group cursor-pointer z-10 relative"
                aria-label="Đóng"
                type="button"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-200 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-2 -left-2 w-12 h-12 sm:w-20 sm:h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-16 sm:h-16 bg-white/10 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Chat content area */}
        <div
            ref={chatContentRef}
            className="flex-grow p-2 sm:p-4 overflow-y-auto h-[60vh] sm:h-[500px] bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50"
            style={{
              backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
          `
            }}
        >
          {messages.map((msg, index) => (
              <div
                  key={msg.id}
                  className={`mb-2 sm:mb-4 flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} animate-fade-in`}
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                  }}
              >
                <div className={`max-w-[90%] flex items-end space-x-1 sm:space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar - Fixed size, no scaling */}
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium flex-shrink-0 ${msg.sender === 'ai' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
                    {msg.sender === 'ai' ? '🤖' : '👤'}
                  </div>

                  {/* Message bubble - Only bubble has hover effect */}
                  <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg transform transition-all duration-200 hover:scale-105 ${
                      msg.sender === 'ai'
                          ? 'bg-white text-gray-800 border border-gray-100'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  }`}>
                    <p className="text-xs sm:text-sm leading-relaxed break-words max-w-[60vw] sm:max-w-[300px]">{msg.text}</p>
                  </div>
                </div>
              </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
              <div className="mb-2 sm:mb-4 flex justify-start animate-fade-in">
                <div className="flex items-end space-x-1 sm:space-x-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                    🤖
                  </div>
                  <div className="bg-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg border border-gray-100">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-2 sm:p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className={`flex items-end space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-2xl bg-gray-50 border transition-all duration-200 ${
              isFocused ? 'border-green-300 shadow-lg bg-white' : 'border-gray-200'
          }`}>
          <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Nhập tin nhắn của bạn..."
              className="resize-none flex-1 border-none focus:outline-none bg-transparent text-gray-700 placeholder-gray-400 text-xs sm:text-sm max-h-24 sm:max-h-32 leading-relaxed"
              rows={1}
          />
            <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                    message.trim()
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Gửi tin nhắn"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Custom styles for animations */}
        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
  );
};

export default ChatBox;