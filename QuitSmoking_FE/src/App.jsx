import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./auth/LoginPage"; // Đảm bảo LoginPage được import
import RegisterPage from "./auth/RegisterPage";
import HomePage from "./components/HomePage";
import RecoverPasswordProcess from "./components/laylaimatkhau/RecoverPasswordProcess";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} /> {/* Bỏ comment dòng này */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/recover-password" element={<RecoverPasswordProcess />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  );
};

export default App;