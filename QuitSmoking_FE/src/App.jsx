import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import HomePage from "./components/HomePage";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage />} />
            {/* Có thể giữ lại route dashboard nếu cần */}
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
    );
};

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> fc5e27bf21c491c079cbb39b76593bac27e12280
