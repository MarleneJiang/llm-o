// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  runtimeConfig: {
    MODEL_NAME: process.env.MODEL_NAME,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    API_KEY: process.env.API_KEY,
    API_VERSION: process.env.API_VERSION,
    HELICONE_API_KEY: process.env.HELICONE_API_KEY
  },

  modules: ['shadcn-nuxt', '@nuxtjs/tailwindcss', '@nuxt/icon'],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        baseUrl: '.'
      }
    }
  }
})