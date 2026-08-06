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

  devtools: {
    enabled: { enabled: process.env.NODE_ENV !== 'production' }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.BACKEND_URL ?? ''
    }
  },

  devServer: {
    port: 5173
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    features: {
      websocket: true
    },
    routeRules: {
      '/socket.io/**': {
        proxy: 'http://localhost:80/socket.io/**'
      }
    },
    minify: true,
    sourceMap: false
  },

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
