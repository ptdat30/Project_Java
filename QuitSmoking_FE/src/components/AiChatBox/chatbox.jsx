import React, { useState, useRef, useEffect } from 'react';

const ChatBox = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const chatContentRef = useRef(null);

  const handleInputChange = (e) => setMessage(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Gửi message tới backend ở đây nếu muốn
      setMessage('');
      if (textareaRef.current) textareaRef.current.focus();
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
        {/* Chat messages sẽ render ở đây */}
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