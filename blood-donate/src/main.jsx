import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// Import Bootstrap JavaScript
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'
// Import Animate.css
import 'animate.css'
import './styles/index.css'

// Import locale configuration
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={viVN}>
    <App />
  </ConfigProvider>,
)
