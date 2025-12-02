import React from 'react'
import ReactDOM from 'react-dom/client'
import { injectSpeedInsights } from '@vercel/speed-insights'
import App from './App'
import './index.css'

// Inject Vercel Speed Insights (client-side only)
injectSpeedInsights()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
