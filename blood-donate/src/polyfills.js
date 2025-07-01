// Polyfill for process in browser environment
if (typeof global === 'undefined') {
  var global = globalThis;
}

if (typeof process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: import.meta.env.MODE || 'development',
      REACT_APP_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7262'
    }
  };
}
