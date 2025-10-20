import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../Images/horizzontal.png'

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = 650 // Altezza della hero section
      setIsScrolled(window.scrollY > heroHeight)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="w-full sticky top-0 z-30 bg-white border-b border-gray-100">
        <nav className={`container px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ease-in-out ${
          isScrolled ? 'h-16 md:h-20' : 'h-16 md:h-28'
        }`}>
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center" onClick={closeMobileMenu}>
              <img 
                src={logo} 
                alt="logo" 
                className={`w-auto transition-all duration-300 ease-in-out ${
                  isScrolled ? 'h-10 md:h-12' : 'h-10 md:h-14'
                }`} 
              />
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8 font-semibold text-gray-700 text-lg">
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'text-primary' : 'hover:text-primary'}>HOME</NavLink></li>
            <li><NavLink to="/cosa-e" className={({ isActive }) => isActive ? 'text-primary' : 'hover:text-primary'}>COS'È</NavLink></li>
            <li><NavLink to="/cosa-puoi-fare" className={({ isActive }) => isActive ? 'text-primary' : 'hover:text-primary'}>COSA PUOI FARE</NavLink></li>
            <li><NavLink to="/a-chi-si-rivolge" className={({ isActive }) => isActive ? 'text-primary' : 'hover:text-primary'}>A CHI SI RIVOLGE</NavLink></li>
          </ul>

          <div className="hidden md:block">
            <NavLink to="/contatti" className="btn btn-secondary btn-small">
              CONTATTI
            </NavLink>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
            aria-label="Apri menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
            }`}></span>
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}></span>
            <span className={`block w-6 h-0.5 bg-gray-700 transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}></span>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={closeMobileMenu}
        ></div>
        
        {/* Mobile Menu */}
        <div className={`absolute top-0 left-0 h-full w-full bg-black transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Close Button */}
          <div className="flex justify-end p-6">
            <button 
              onClick={closeMobileMenu}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
              aria-label="Chiudi menu"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <nav className="px-6 py-8">
            <ul className="space-y-6">
              <li>
                <NavLink 
                  to="/" 
                  onClick={closeMobileMenu}
                  className="text-white text-4xl font-semibold uppercase tracking-wider hover:text-primary transition-colors"
                >
                  HOME
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/cosa-e" 
                  onClick={closeMobileMenu}
                  className="text-white text-4xl font-semibold uppercase tracking-wider hover:text-primary transition-colors"
                >
                  COS'È
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/cosa-puoi-fare" 
                  onClick={closeMobileMenu}
                  className="text-white text-4xl font-semibold uppercase tracking-wider hover:text-primary transition-colors"
                >
                  COSA PUOI FARE
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/a-chi-si-rivolge" 
                  onClick={closeMobileMenu}
                  className="text-white text-4xl font-semibold uppercase tracking-wider hover:text-primary transition-colors"
                >
                  A CHI SI RIVOLGE
                </NavLink>
              </li>
              <li className="pt-4">
                <NavLink 
                  to="/contatti" 
                  onClick={closeMobileMenu}
                  className="text-white text-4xl font-semibold uppercase tracking-wider hover:text-primary transition-colors"
                >
                  RICHIEDI UNA CONSULENZA
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Navbar


