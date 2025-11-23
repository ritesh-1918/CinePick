import React from 'react'
import ReactDOM from 'react-dom/client'
import { Terms } from './components/legal/Terms'
import { Privacy } from './components/legal/Privacy'
import { Cookies } from './components/legal/Cookies'
import { FAQ } from './components/legal/FAQ'
import './index.css'

const path = window.location.pathname;
let Component = Terms; // Default

if (path.includes('privacy')) {
    Component = Privacy;
} else if (path.includes('cookies')) {
    Component = Cookies;
} else if (path.includes('faq')) {
    Component = FAQ;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Component />
    </React.StrictMode>,
)
