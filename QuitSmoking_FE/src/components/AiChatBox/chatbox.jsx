import React, { useState, useRef, useEffect } from 'react';
import { askGemini } from '../../services/AIChatboxService';

const ChatBox = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const chatContentRef = useRef(null);

  // Hiển thị tin nhắn mẫu khi mở chatbox
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'ai-greeting',
          sender: 'ai',
          text: 'Xin chào, tôi có thể giúp gì cho bạn?'
        }
      ]);
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
      if (textareaRef.current) textareaRef.current.focus();

      try {
        const aiReply = await askGemini(message.trim());
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + '-ai',
            sender: 'ai',
            text: aiReply
          }
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + '-ai-error',
            sender: 'ai',
            text: 'Xin lỗi, AI hiện không phản hồi được.'
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[400px] shadow-lg rounded border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Trợ lý của bạn</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      {/* Chat content area */}
      <div
        ref={chatContentRef}
        className="flex-grow p-4 overflow-y-auto h-[500px] bg-[#fdf9e2]"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`rounded-lg px-3 py-2 ${msg.sender === 'ai' ? 'bg-white text-gray-800' : 'bg-blue-500 text-white'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input area */}
      <div className={`flex items-end border-t border-gray-200 bg-white p-2 ${isFocused ? 'ring-2 ring-blue-200' : ''}`}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Nội dung tin nhắn của bạn...."
          className="resize-none w-full border-none focus:outline-none focus:ring-0 py-2 px-3 text-sm max-h-32"
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer !rounded-button whitespace-nowrap"
          aria-label="Gửi tin nhắn"
        >
          <i className="fas fa-arrow-up text-gray-600"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatBox;