import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/coach', '/parent'], // Protect private dashboards from public search indexing
    },
    sitemap: 'https://yca-two.vercel.app/sitemap.xml',
  };
}

