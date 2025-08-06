/**
 * Polyfills cho môi trường trình duyệt
 * File này đảm bảo tương thích với các trình duyệt cũ và cung cấp các global variables cần thiết
 */

// Polyfill cho global object trong môi trường trình duyệt
// Một số thư viện Node.js expect global object tồn tại
if (typeof global === "undefined") {
  var global = globalThis;
}

// Polyfill cho process object trong môi trường trình duyệt
// Nhiều thư viện Node.js cần process.env để đọc environment variables
if (typeof process === "undefined") {
  global.process = {
    env: {
      // Lấy mode từ Vite (development/production)
      NODE_ENV: import.meta.env.MODE || "development",
      // Lấy base URL cho API từ Vite environment variables
      REACT_APP_API_BASE_URL:
        import.meta.env.VITE_API_BASE_URL || "http://localhost:7262",
    },
  };
}
