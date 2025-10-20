import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  noindex?: boolean
  ogImage?: string
  ogType?: string
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  noindex = false,
  ogImage = '/src/Images/logo.png',
  ogType = 'website'
}) => {
  const baseKeywords = [
    'showcase webapp',
    'starter kit',
    'react',
    'vite',
    'typescript',
    'componenti riutilizzabili',
    'seo',
    'design system',
    'template webapp',
    'landing page'
  ]

  const allKeywords = [...baseKeywords, ...keywords].join(', ')
  const fullTitle = `${title} | Showcase Webapp`
  const siteUrl = 'https://showcase-webapp.it'

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={canonical ? `${siteUrl}${canonical}` : siteUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical ? `${siteUrl}${canonical}` : siteUrl} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Showcase Webapp" />
      <meta property="og:locale" content="it_IT" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Additional SEO */}
      <meta name="author" content="StarterKit" />
      <meta name="language" content="Italian" />
      <meta name="geo.region" content="IT-BA" />
      <meta name="geo.placename" content="Monopoli" />
      <meta name="geo.position" content="40.9535;17.2972" />
      <meta name="ICBM" content="40.9535, 17.2972" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Showcase Webapp",
          "description": "Starter Kit generico per siti vetrina e webapp dimostrative.",
          "url": siteUrl,
          "logo": `${siteUrl}/src/Images/logo.png`
        })}
      </script>
    </Helmet>
  )
}

export default SEO
