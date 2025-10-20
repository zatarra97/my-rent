import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop: React.FC = () => {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Mostra il pulsante quando si è scrollato più di 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll automatico all'inizio su cambio route
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out origin-center cursor-pointer ${
        isVisible 
          ? 'w-12 h-12 opacity-100 scale-100' 
          : 'w-0 h-0 opacity-0 scale-0 pointer-events-none'
      }`}
      aria-label="Torna in cima"
    >
      {/* Icona chevron verso l'alto */}
      <svg
        className={`text-white transition-all duration-300 ease-in-out ${
          isVisible ? 'w-5 h-5 opacity-100' : 'w-0 h-0 opacity-0'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  )
}

export default ScrollToTop
