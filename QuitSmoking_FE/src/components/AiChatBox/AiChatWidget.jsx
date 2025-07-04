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
    '/reset-password',
    '/coach-consultation',
    '/admin'
  ];

  if (hideOnPaths.includes(location.pathname)) return null;

  return (
      <>
        {/* Icon robot ở góc phải dưới với hiệu ứng hiện đại */}
        {!isOpen && (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 focus:outline-none group"
                style={{ background: 'transparent', border: 'none' }}
                aria-label="Mở trợ lý AI"
            >
              {/* Vòng tròn nền với gradient và glow effect */}
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 opacity-20 blur-xl animate-pulse"></div>

                {/* Main button với robot icon */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group-hover:rotate-6 flex items-center justify-center overflow-hidden">
                  {/* Inner glow */}
                  <div className="absolute inset-1 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 opacity-50 blur-sm"></div>

                  {/* Robot Image - nếu có file robot icon */}
                  <img
                      src="/images/AiChat_icon.png"
                      alt="AI Robot"
                      className="relative z-10 w-14 h-14 object-contain"
                      style={{
                        filter: 'brightness(0) invert(1)',
                        animation: 'robotBlink 3s infinite'
                      }}
                  />

                  {/* Fallback SVG Robot nếu không có hình */}
                  {/* <div className="relative z-10 text-white">
                <svg
                  className="w-12 h-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ animation: 'robotBlink 3s infinite' }}
                >
                  <rect x="6" y="4" width="12" height="10" rx="2" />
                  <circle cx="9" cy="8" r="1" fill="white" className="robot-eye-left" />
                  <circle cx="15" cy="8" r="1" fill="white" className="robot-eye-right" />
                  <rect x="10" y="11" width="4" height="1" rx="0.5" fill="white" />
                  <rect x="11.5" y="1" width="1" height="3" />
                  <circle cx="12" cy="1" r="1" />
                  <rect x="8" y="14" width="8" height="6" rx="1" />
                  <rect x="4" y="15" width="4" height="2" rx="1" />
                  <rect x="16" y="15" width="4" height="2" rx="1" />
                  <rect x="9" y="20" width="2" height="3" />
                  <rect x="13" y="20" width="2" height="3" />
                </svg>
              </div> */}
                </div>

                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
                  Trợ lý AI
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>

              {/* CSS cho hiệu ứng chớp mắt */}
              <style jsx>{`
            @keyframes robotBlink {
              0%, 85%, 100% { opacity: 1; }
              90%, 95% { opacity: 0.3; }
            }
            
            .robot-eye-left, .robot-eye-right {
              animation: robotBlink 3s infinite;
            }
          `}</style>
            </button>
        )}

        {/* Chatbox */}
        <ChatBox isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
  );
};

export default AiChatWidget;