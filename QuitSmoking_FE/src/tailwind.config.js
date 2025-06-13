/** @type {import('tailwindcss').Config} */
export default { // <-- Lưu ý 'export default' thay vì 'module.exports'
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}