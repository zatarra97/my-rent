import React from 'react'

interface HeroProps {
  imageSrc: string
  imageAlt: string
  className?: string
}

const Hero: React.FC<HeroProps> = ({ imageSrc, imageAlt, className = "" }) => {
  return (
    <section
      className={`relative h-[650px] md:h-[700px] w-full overflow-hidden ${className}`}
      aria-label="Hero section"
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
    </section>
  )
}

export default Hero
