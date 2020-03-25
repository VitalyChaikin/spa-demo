import React from 'react'
import { BrowserRouter } from 'react-router-dom'

// import logo from './logo.svg';
import './App.css'
import Header from './components/Header'
import NavPanel from './components/NavPanel'
import Workarea from './components/Workarea'
import Footer from './components/Footer'

function App () {
  return (
    <BrowserRouter>
      <div className='App'>
        <div className='mainFrame'>
          <Header />
          <div className='NavWorkarea'>
            <NavPanel />
            <Workarea />
          </div>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
