export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'zh', // 默认语言
  messages: {
    en: {}, // 实际消息会通过 langDir 加载
    zh: {}
  }
}))