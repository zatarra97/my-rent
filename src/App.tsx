import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './App.css'
import NotFound from './Pages/NotFound/NotFound'
import Home from './Pages/Home/Home'
import ScrollToTop from './Components/ScrollToTop'

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ScrollToTop />
      </Router>
    </HelmetProvider>
  )
}

export default App 