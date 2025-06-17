import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import HomePage from "./components/HomePage";
import LapKeHoach from './components/lapkehoach';

// const App = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />
//       <Route path="/home" element={<HomePage />} />
//       {/* Có thể giữ lại route dashboard nếu cần */}
//       {/* <Route path="/dashboard" element={<Dashboard />} /> */}
//     </Routes>
//   );
const App = () => {
  return <LapKeHoach />;
}
export default App;



// import React, { useEffect } from "react"; // Import useEffect
// import { Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
// import LoginPage from "./auth/LoginPage";
// import RegisterPage from "./auth/RegisterPage";
// import HomePage from "./components/HomePage";

// const App = () => {
//   useEffect(() => {
//     // Chỉ thực hiện trong môi trường phát triển
//     // và khi biến môi trường VITE_SKIP_LOGIN được đặt là 'true'
//     if (
//       process.env.NODE_ENV === "development" &&
//       import.meta.env.VITE_SKIP_LOGIN === "true"
//     ) {
//       console.log("Development mode: Tự động đăng nhập và chuyển hướng.");
//       // Đặt một token giả vào localStorage.
//       // Điều này rất quan trọng để các component "bảo vệ" khác (nếu có)
//       // nghĩ rằng người dùng đã đăng nhập.
//       localStorage.setItem("token", "dev-token-bypass-123");
//     }
//   }, []); // [] đảm bảo useEffect chỉ chạy một lần khi component mount

//   // Kiểm tra xem có token trong localStorage không (token thật hoặc token giả của dev)
//   const isAuthenticated = localStorage.getItem("token") !== null;

//   return (
//     <Routes>
//       {/* Route gốc ("/")
//         Nếu đang ở chế độ phát triển và VITE_SKIP_LOGIN là 'true', HOẶC nếu đã có token,
//         thì chuyển hướng đến "/home".
//         Ngược lại, hiển thị LoginPage.
//       */}
//       <Route
//         path="/"
//         element={
//           (process.env.NODE_ENV === "development" &&
//             import.meta.env.VITE_SKIP_LOGIN === "true") ||
//           isAuthenticated ? (
//             <Navigate to="/home" replace />
//           ) : (
//             <LoginPage />
//           )
//         }
//       />

//       <Route path="/register" element={<RegisterPage />} />
//       <Route path="/home" element={<HomePage />} />
//       {/* Các route khác của bạn */}
//     </Routes>
//   );
// };

// export default App;
