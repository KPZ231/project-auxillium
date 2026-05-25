import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://auxilium.app'
  const locales = ['pl', 'en', 'de']
  
  // Marketing routes
  const routes = [
    '',
    '/pricing',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies'
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Create entries for each locale
  routes.forEach((route) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.8,
      })
    })
  })

  // Add the absolute root redirect url
  sitemapEntries.push({
    url: `${baseUrl}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  })

  return sitemapEntries
}
