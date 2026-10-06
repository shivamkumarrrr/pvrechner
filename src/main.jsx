import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initAnalytics } from './lib/events.js'

initAnalytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
