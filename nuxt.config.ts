// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@comark/nuxt',
    '@nuxthub/core',
    'nuxt-auth-utils',
    'nuxt-charts',
    'nuxt-csurf'
  ],

  app: {
    baseURL: '/'
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : ''
    }
  },

  // Login state is in localStorage, which the server can't read, so the
  // protected pages are rendered in the browser only. Otherwise the server
  // renders the dashboard for logged-out users before the redirect to /login.
  routeRules: {
    '/chat': { ssr: false },
    '/chat/**': { ssr: false },
    '/log': { ssr: false },
    '/log/**': { ssr: false }
  },

  devServer: {
    port: 5173
  },

  compatibilityDate: '2024-07-11',

  vite: {
    optimizeDeps: {
      include: [
        'striptags',
        'socket.io-client',
        '@tanstack/vue-db',
        '@tanstack/vue-query'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
