import React from 'react'
import { NavLink } from 'react-router-dom'
import logoWhite from '../Images/horizzontal.png'
import homePreFooter from '../Images/home_pre_footer.jpg'

interface FooterProps {
  className?: string
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <>
      {/* Hero finale con logo e link */}
      <section className={`relative py-16 md:py-29 ${className}`}>
        <img src={homePreFooter} alt="Background rinnovabili" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-blue-800/75" />
        <div className="relative text-center text-white container px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="block">
            <img src={logoWhite} alt="logo" className="mx-auto h-16 md:h-18 w-auto" />
          </NavLink>
          <nav className="mt-8 flex flex-col md:flex-row justify-center gap-x-10 gap-y-3 text-xl font-semibold">
            <NavLink to="/" className="hover:text-secondary/80">HOME</NavLink>
            <NavLink to="/cosa-e" className="hover:text-secondary/80">COS'È</NavLink>
            <a href="/cosa-puoi-fare" className="hover:text-secondary/80">COSA PUOI FARE</a>
            <NavLink to="/a-chi-si-rivolge" className="hover:text-secondary/80">A CHI SI RIVOLGE</NavLink>
            <NavLink to="/contatti" className="hover:text-secondary/80">RICHIEDI UNA CONSULENZA</NavLink>
          </nav>
          <p className="mt-8 text-white/90 max-w-xs mx-auto text-lg">
            Starter Kit generico per showcase webapp
          </p>
          <div className="mx-auto my-14 h-1 w-28 rounded-full bg-primary" />
          <div className="flex items-center justify-center gap-8 text-primary font-semibold">
            <a href="#facebook" className="hover:text-white">Facebook</a>
            <a href="#instagram" className="hover:text-white">Instagram</a>
            <a href="#linkedin" className="hover:text-white">LinkedIn</a>
          </div>
        </div>
      </section>
      <section className="py-9 bg-black">
        <div className="container px-4 sm:px-6 lg:px-8">
        </div>
      </section>
    </>
  )
}

export default Footer
