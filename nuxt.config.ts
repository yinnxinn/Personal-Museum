import tailwindcss from "@tailwindcss/vite";
import path from 'path';

// 在现有配置中添加
export default defineNuxtConfig({
  ssr: true,
  modules: [
    '@nuxtjs/i18n', // 添加 i18n 模块
    '@nuxtjs/supabase',
    '@pinia/nuxt',
  ],
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['@fortawesome/fontawesome-svg-core', '@fortawesome/free-solid-svg-icons', '@fortawesome/vue-fontawesome']
    }
  },
  i18n: { // i18n 配置
    locales: [
      {
        code: 'en',
        file: 'en.json',
        name: 'English'
      },
      {
        code: 'zh',
        file: 'zh.json',
        name: '简体中文'
      }
    ],
    lazy: true,
    langDir: path.resolve(__dirname, './lang'), // 语言文件存放目录
    defaultLocale: 'zh', // 默认语言
    strategy: 'prefix_except_default', // 路由策略，除默认语言外，其他语言带前缀
    vueI18n: './i18n.config.ts' // Vue I18n 配置文件的路径
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/',
        '/en/',                        // Homepage (index.vue)
        '/about',
        '/en/about',
        '/explore',                // about.vue
        '/en/explore',                // about.vue
        '/exhibit/*',
        '/en/exhibit/*'
      ]
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL || 'https://personal-museum.nilco2.com/',
    }
  },
})
