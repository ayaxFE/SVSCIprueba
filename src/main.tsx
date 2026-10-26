import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { OperativoProvider } from './Context/OperativoContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <OperativoProvider>
        <App />
      </OperativoProvider>
    </BrowserRouter>
  </React.StrictMode>,
)