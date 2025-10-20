import React from 'react'
import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import SEO from '../../Components/SEO'
import heroImage from '../../Images/home_hero.jpg'
import homeScopri from '../../Images/home_scopri.jpg'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Lorem Ipsum - Webapp dimostrativa"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        keywords={[
          'lorem',
          'ipsum',
          'dolor',
          'sit',
          'amet'
        ]}
        canonical="/"
      />
      <Navbar />

      {/* Hero */}
      <section
        className="relative h-[550px] md:h-[600px] w-full overflow-hidden"
        aria-label="Hero principale"
      >
        <img
          src={heroImage}
          alt="Immagine di copertina"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 container px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-3xl">
            <h1 className="text-3xl lg:text-5xl font-semibold leading-tight">
              Lorem ipsum dolor sit amet
              <br />
              consectetur adipiscing elit
              <br />
              sed do eiusmod tempor
            </h1>

            <div className="mt-10 md:mt-14 flex flex-wrap gap-8">
              <Link to="/cosa-e" className="btn btn-primary btn-big">LOREM IPSUM</Link>
              <Link to="/contatti" className="btn btn-secondary btn-big">DOLOR SIT</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro breve */}
      <section className="py-16 md:py-20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="md:max-w-[800px]">
            <h2 className="text-xl lg:text-3xl font-semibold text-gray-900">
              Lorem ipsum dolor sit amet.<br />
              Consectetur adipiscing elit, sed do.<br />
              Eiusmod tempor incididunt ut labore.
              </h2>
          </div>
        </div>
      </section>

      {/* Sezione: intro con immagine a sinistra e testo a destra */}
      <section className="py-20 bg-gray-100">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Immagine */}
            <div>
              <img
                src={homeScopri}
                alt="Immagine illustrativa"
                className="w-full rounded-3xl shadow-2xl object-cover"
              />
            </div>

            {/* Testo */}
            <div>
              <h3 className="text-2xl lg:text-4xl font-semibold text-gray-900 leading-tight">
                Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor.
              </h3>
              <p className="my-6 text-gray-900 text-base md:text-xl">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <div className="mt-12">
                <a href="/cosa-e" className="btn btn-primary btn-big">SCOPRI DI PIÙ</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione: Cosa può fare */}
      <section className="py-24 bg-gradient-to-b from-sky-600 to-indigo-500 text-center text-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <p className="uppercase  font-semibold text-xl md:text-xl">Lorem ipsum</p>
          <h3 className="mt-4 text-3xl sm:text-4xl font-bold">Dolor sit amet consectetur</h3>
          <div className="mt-8 flex justify-center">
            <a href="/cosa-puoi-fare" className="btn btn-big btn-white ">LOREM</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home


