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
        title="Showcase - Webapp dimostrativa"
        description="Starter Kit generico per realizzare showcase webapp moderne. Layout responsive, componenti riutilizzabili e SEO integrata."
        keywords={[
          'software fotovoltaico',
          'monitoraggio impianti solari',
          'gestione fotovoltaico',
          'automazione GSE',
          'telelettura automatica',
          'dashboard fotovoltaico',
          'consulenti energetici',
          'installatori fotovoltaici'
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
          alt="Impianto fotovoltaico"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 container px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-3xl">
            <h1 className="text-3xl lg:text-5xl font-semibold leading-tight">
              Il software intelligente
              <br />
              per la gestione degli
              <br />
              impianti fotovoltaici
            </h1>

            <div className="mt-10 md:mt-14 flex flex-wrap gap-8">
              <Link to="/cosa-e" className="btn btn-primary btn-big">SCOPRI DI PIÙ</Link>
              <Link to="/contatti" className="btn btn-secondary btn-big">CONTATTACI</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro breve */}
      <section className="py-16 md:py-20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="md:max-w-[800px]">
            <h2 className="text-xl lg:text-3xl font-semibold text-gray-900">
              Tutto sotto controllo. Sempre.<br />
              Gestisci adempimenti, monitora le performance, ottimizza l'efficienza.<br />
              In un'unica piattaforma semplice e automatizzata.
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
                alt="Casa con pannelli fotovoltaici"
                className="w-full rounded-3xl shadow-2xl object-cover"
              />
            </div>

            {/* Testo */}
            <div>
              <h3 className="text-2xl lg:text-4xl font-semibold text-gray-900 leading-tight">
                Questo Starter Kit è progettato per creare velocemente showcase webapp
                moderne, accessibili e ottimizzate.
              </h3>
              <p className="my-6 text-gray-900 text-base md:text-xl">
                Include componenti base, gestione SEO, routing, layout responsive e
                strumenti di sviluppo pronti all'uso.
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
          <p className="uppercase  font-semibold text-xl md:text-xl">Cosa può fare</p>
          <h3 className="mt-4 text-3xl sm:text-4xl font-bold">L'energia solare su misura per te</h3>
          <div className="mt-8 flex justify-center">
            <a href="/cosa-puoi-fare" className="btn btn-big btn-white ">ESPLORA</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home


