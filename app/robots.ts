import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout/', '/invite/', '/onboarding/'],
      },
      {
        // Explicitly allow AI bots for AI SEO discoverability
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'anthropic-ai'],
        allow: '/',
        disallow: ['/api/', '/checkout/', '/invite/', '/onboarding/'],
      }
    ],
    sitemap: 'https://auxilium.app/sitemap.xml',
  }
}
