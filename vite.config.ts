import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

const site = JSON.parse(readFileSync(new URL('./content/site.json', import.meta.url), 'utf8'))

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'company-identity',
    transformIndexHtml() {
      return [
        { tag: 'link', attrs: { rel: 'canonical', href: `${site.url}/` }, injectTo: 'head' },
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Organization', '@id': `${site.url}/#organization`,
          name: site.name, url: site.url, description: site.description,
          founder: { '@type': 'Person', name: site.founder.name },
        }).replace(/</g, '\\u003c'), injectTo: 'head' },
      ]
    },
  }],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion'
            if (
              id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/')
            ) return 'react'
          }
        },
      },
    },
  },
})
