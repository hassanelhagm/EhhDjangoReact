import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './index.scss'
import {BrowserRouter as Router} from 'react-router-dom'
import { CustomThemeProvider } from './ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <CustomThemeProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </CustomThemeProvider>
  </Router>

)
