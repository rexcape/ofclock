import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'sweetalert2/dist/sweetalert2.min.css'
import Modal from 'react-modal'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

Modal.setAppElement(document.getElementById('root')!)
