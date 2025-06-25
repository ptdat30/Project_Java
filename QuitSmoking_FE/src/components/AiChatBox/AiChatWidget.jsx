import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatBox from './chatbox';

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Danh sách các trang không hiển thị chatbox
  const hideOnPaths = [
    '/login',
    '/register',
    '/recover-password',
    '/forgot-password',
    '/reset-password'
  ];

  if (hideOnPaths.includes(location.pathname)) return null;

  return (
    <>
      {/* Icon robot ở góc phải dưới */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 focus:outline-none"
          style={{ background: 'transparent', border: 'none' }}
          aria-label="Mở trợ lý AI"
        >
          <img
            src="/images/AiChat_icon.png"
            alt="AI Chat Icon"
            className="w-24 h-24 drop-shadow-lg hover:scale-110 transition-transform"
            style={{ pointerEvents: 'auto' }}
          />
        </button>
      )}
      {/* Chatbox */}
      <ChatBox isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AiChatWidget;