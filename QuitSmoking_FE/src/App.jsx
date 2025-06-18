import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./auth/LoginPage"; // Đảm bảo LoginPage được import
import RegisterPage from "./auth/RegisterPage";
import HomePage from "./components/HomePage";
import RecoverPasswordProcess from "./components/laylaimatkhau/RecoverPasswordProcess";
// import LayLaiMatKhau1 from "./components/laylaimatkhau/laylaimatkhau1";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recover-password" element={<RecoverPasswordProcess />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  );
};

export default App;
