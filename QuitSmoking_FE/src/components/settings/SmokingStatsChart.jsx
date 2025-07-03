import React, { useState, useEffect } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

const SmokingStatsChart = ({
                               deathsPerYear = "40,000",
                               healthcareCosts = "23,000 tỷ VND",
                               diseases = [
                                   "Ung thư phổi (85% trường hợp do thuốc lá)",
                                   "Bệnh tim mạch (nguy cơ tăng gấp 2-4 lần)",
                                   "Đột quỵ (nguy cơ tăng 50%)",
                                   "Bệnh phổi tắc nghẽn mạn tính (COPD)",
                                   "Ung thư thanh quản, miệng, thực quản",
                                   "Loãng xương ở phụ nữ",
                                   "Vô sinh, sẩy thai",
                                   "Lão hóa da sớm"
                               ]
                           }) => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const [activeChart, setActiveChart] = useState('deaths');

    useEffect(() => {
        const timer = setTimeout(() => setAnimationComplete(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Chuyển đổi dữ liệu
    const deathsNum = parseInt(deathsPerYear.replace(/\D/g, ''));
    const healthcareCostsNum = parseInt(healthcareCosts.replace(/\D/g, ''));

    // Dữ liệu biểu đồ tròn với gradient xanh lá cây
    const doughnutData = {
        labels: ['Tử vong do thuốc lá', 'Tử vong do nguyên nhân khác'],
        datasets: [
            {
                data: [deathsNum, 200000 - deathsNum],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',  // Green-500
                    'rgba(156, 163, 175, 0.3)'
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',   // Green-500
                    'rgba(156, 163, 175, 0.5)'
                ],
                borderWidth: 3,
                hoverBackgroundColor: [
                    'rgba(22, 163, 74, 0.9)',  // Green-600
                    'rgba(156, 163, 175, 0.4)'
                ],
                cutout: '60%',
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        const percentage = ((context.parsed / (deathsNum + (200000 - deathsNum))) * 100).toFixed(1);
                        return `${context.label}: ${new Intl.NumberFormat('vi-VN').format(context.parsed)} người (${percentage}%)`;
                    }
                }
            }
        },
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 2000,
            easing: 'easeInOutQuart'
        }
    };

    // Dữ liệu biểu đồ cột với gradient xanh lá cây
    const barData = {
        labels: ['Chi phí thuốc lá', 'Chi phí y tế khác'],
        datasets: [
            {
                label: 'Chi phí (Tỷ VND)',
                data: [healthcareCostsNum, 80000],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',   // Green-500
                    'rgba(16, 185, 129, 0.6)'   // Emerald-500
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',     // Green-500
                    'rgba(16, 185, 129, 1)'     // Emerald-500
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${new Intl.NumberFormat('vi-VN').format(context.parsed.y)} tỷ VND`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                title: {
                    display: true,
                    text: 'Chi phí (Tỷ VND)',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#374151'
                },
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('vi-VN').format(value);
                    },
                    font: {
                        size: 12
                    },
                    color: '#6B7280'
                }
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart'
        }
    };

    // Dữ liệu biểu đồ đường xu hướng với màu xanh lá cây
    const lineData = {
        labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        datasets: [
            {
                label: 'Tử vong do thuốc lá',
                data: [35000, 36500, 38000, 39000, 39500, 40000, 40500],
                borderColor: 'rgba(34, 197, 94, 1)',      // Green-500
                backgroundColor: 'rgba(34, 197, 94, 0.1)', // Green-500 với opacity
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            },
            {
                label: 'Chi phí y tế (tỷ VND)',
                data: [18000, 19000, 20000, 21000, 22000, 23000, 24000],
                borderColor: 'rgba(16, 185, 129, 1)',      // Emerald-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)', // Emerald-500 với opacity
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                yAxisID: 'y1',
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Số người tử vong',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#22C55E'  // Green-500
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('vi-VN').format(value);
                    },
                    font: {
                        size: 11
                    },
                    color: '#22C55E'  // Green-500
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Chi phí y tế (tỷ VND)',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#10B981'  // Emerald-500
                },
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('vi-VN').format(value);
                    },
                    font: {
                        size: 11
                    },
                    color: '#10B981'  // Emerald-500
                }
            },
        },
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart'
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        📊 Thống kê Tác hại của Thuốc lá tại Việt Nam
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Những con số đáng báo động về tác động của thuốc lá đến sức khỏe cộng đồng và kinh tế quốc gia
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-md p-1 flex">
                    </div>
                </div>

                {/* Charts Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Biểu đồ tròn - Tử vong */}
                    <div className={`lg:col-span-2 bg-white rounded-xl shadow-xl p-8 transform transition-all duration-500 ${
                        activeChart === 'deaths' ? 'scale-105 ring-4 ring-green-200' : ''
                    }`}>
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                💀 Tử vong hàng năm tại Việt Nam
                            </h3>
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                {deathsPerYear} người
                            </div>
                            <p className="text-gray-600">
                                Tử vong do các bệnh liên quan đến thuốc lá
                            </p>
                        </div>
                        <div className="h-80">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                        <div className="mt-6 text-center">
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-green-700 font-medium">
                                    ⚠️ Mỗi ngày có khoảng {Math.round(deathsNum / 365)} người tử vong do thuốc lá
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Thống kê nổi bật */}
                    <div className="space-y-6">
                        {/* Card 1 */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">TỬ VONG HÀNG NĂM</p>
                                    <p className="text-3xl font-bold">{deathsPerYear}</p>
                                    <p className="text-green-100 text-sm">người</p>
                                </div>
                                <div className="text-4xl">💀</div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">CHI PHÍ Y TẾ</p>
                                    <p className="text-3xl font-bold">{healthcareCosts}</p>
                                    <p className="text-emerald-100 text-sm">mỗi năm</p>
                                </div>
                                <div className="text-4xl">💰</div>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-teal-100 text-sm font-medium">TỶ LỆ HÚT THUỐC</p>
                                    <p className="text-3xl font-bold">22.5%</p>
                                    <p className="text-teal-100 text-sm">dân số nam</p>
                                </div>
                                <div className="text-4xl">🚬</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ cột - Chi phí */}
                <div className={`bg-white rounded-xl shadow-xl p-8 mb-12 transform transition-all duration-500 ${
                    activeChart === 'costs' ? 'scale-105 ring-4 ring-emerald-200' : ''
                }`}>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            💰 Gánh nặng Chi phí Y tế
                        </h3>
                        <p className="text-gray-600">
                            So sánh chi phí y tế liên quan đến thuốc lá với các nguyên nhân khác
                        </p>
                    </div>
                    <div className="h-96">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                {/* Biểu đồ xu hướng */}
                <div className={`bg-white rounded-xl shadow-xl p-8 mb-12 transform transition-all duration-500 ${
                    activeChart === 'trends' ? 'scale-105 ring-4 ring-green-200' : ''
                }`}>
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            📈 Xu hướng 7 năm qua (2018-2024)
                        </h3>
                        <p className="text-gray-600">
                            Diễn biến số liệu tử vong và chi phí y tế do thuốc lá
                        </p>
                    </div>
                    <div className="h-96">
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>

                {/* Danh sách bệnh */}
                <div className="bg-white rounded-xl shadow-xl p-8">
                    <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                        🏥 Các bệnh phổ biến do thuốc lá gây ra
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {diseases.map((disease, index) => (
                            <div
                                key={index}
                                className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="flex-shrink-0 mr-4">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">⚠️</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-800 font-medium text-lg">
                                        {disease}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 py-8 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 rounded-xl">
                    <h4 className="text-2xl font-bold text-white mb-4">
                        🚭 Hãy nói KHÔNG với thuốc lá!
                    </h4>
                    <p className="text-white/90 text-lg">
                        Vì một Việt Nam khỏe mạnh, không khói thuốc
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SmokingStatsChart;