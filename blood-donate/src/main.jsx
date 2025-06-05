import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Import Ant Design styles
import './styles/index.css'

// Import locale configuration
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={viVN}>
    <App />
  </ConfigProvider>,
)
