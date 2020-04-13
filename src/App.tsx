import React from 'react'
import { BrowserRouter } from 'react-router-dom'

// import logo from './logo.svg';


// import "antd/dist/antd.less"
// import "antd/dist/antd.css"

import 'antd/dist/antd.compact.min.css'
import './App.css'

import Header from './components/Header'
import NavPanel from './components/NavPanel'
import Workarea from './components/Workarea'
import Footer from './components/Footer'

function App () {
  return (
    <BrowserRouter>
      <main>
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
      </main>
    </BrowserRouter>
  )
}

export default App
