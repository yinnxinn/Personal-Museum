<template>
  <div class="border-t border-gray-300">
    <footer class="bg-white text-gray-700 text-sm py-6">
      <div class="container mx-auto px-4 flex flex-col md:flex-row justify-between items-start">
        <!-- 左侧区域（1/4） - Logo 和 About -->
        <div class="w-full md:w-1/4 mb-4 md:mb-0">
          <div class="flex items-center mb-4">
            <img src="/favicon.ico" alt="Logo" class="w-12 h-12 mr-2" /> <!-- 替换为你的Logo路径 -->
            <div>
              <h3 class="font-semibold">{{ $t('header.app_name') }}</h3>
              <p class="text-xs">{{ $t('hero.title') }}</p>
            </div>
          </div>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/about" class="hover:underline text-gray-700">
                {{ t('footer.about_us') || '关于项目' }}
              </NuxtLink>
            </li>
            <li>
              <a
                href="https://github.com/yinnxinn/Personal-Museum"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                class="hover:underline text-gray-700"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://x.com/aiartistdance"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                class="hover:underline text-gray-700"
              >
                X
              </a>
            </li>
          </ul>
        </div>

        <!-- 右侧区域（3/4） - 博物馆链接 -->
        <div class="w-full md:w-3/4">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="museum in museums" :key="museum.name" class="text-center">
              <a
                :href="museum.url"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:underline text-gray-700 flex items-center justify-center gap-2"
              >
                <!-- 使用Google的favicon服务获取图标 -->
                <img 
                  :src="`https://www.google.com/s2/favicons?domain=${museum.domain}&sz=32`" 
                  :alt="museum.chineseName + ' 图标'"
                  class="w-4 h-4"
                  loading="lazy"
                />
                {{ t(`museums.${museum.name}`) || museum.chineseName }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

// 博物馆数据 - 添加domain字段用于获取favicon
const museums = [
  { name: 'louvre', chineseName: '卢浮宫', url: 'https://www.louvre.fr', domain: 'louvre.fr' },
  { name: 'british-museum', chineseName: '大英博物馆', url: 'https://www.britishmuseum.org', domain: 'britishmuseum.org' },
  { name: 'metropolitan', chineseName: '大都会艺术博物馆', url: 'https://www.metmuseum.org', domain: 'metmuseum.org' },
  { name: 'vatican-museums', chineseName: '梵蒂冈博物馆', url: 'https://www.museivaticani.va', domain: 'museivaticani.va' },
  { name: 'uffizi-gallery', chineseName: '乌菲兹美术馆', url: 'https://www.uffizi.it', domain: 'uffizi.it' },
  { name: 'rijksmuseum', chineseName: '国立博物馆', url: 'https://www.rijksmuseum.nl', domain: 'rijksmuseum.nl' },
  { name: 'orsay', chineseName: '奥赛博物馆', url: 'https://www.musee-orsay.fr', domain: 'musee-orsay.fr' },
  { name: 'guggenheim', chineseName: '所罗门·R·古根海姆博物馆', url: 'https://www.guggenheim.org', domain: 'guggenheim.org' },
  { name: 'getty', chineseName: '盖蒂博物馆', url: 'https://www.getty.edu', domain: 'getty.edu' },
  { name: 'prado', chineseName: '普拉多博物馆', url: 'https://www.museodelprado.es', domain: 'museodelprado.es' },
  { name: 'nmaahc', chineseName: '国家非裔美国人历史与文化博物馆', url: 'https://nmaahc.si.edu', domain: 'nmaahc.si.edu' },
  { name: 'frans-hals', chineseName: '弗兰斯·哈尔斯博物馆', url: 'https://www.franshalsmuseum.nl', domain: 'franshalsmuseum.nl' },
  { name: 'pergamon', chineseName: '佩加蒙博物馆', url: 'https://www.smb.museum/en/museums-institutions/pergamonmuseum', domain: 'smb.museum' },
  { name: 'natural-history', chineseName: '国家自然历史博物馆', url: 'https://naturalhistory.si.edu', domain: 'naturalhistory.si.edu' },
  { name: 'national-gallery', chineseName: '国家画廊', url: 'https://www.nationalgallery.org.uk', domain: 'nationalgallery.org.uk' },
  { name: 'google-arts', chineseName: '谷歌艺术与文化', url: 'https://artsandculture.google.com', domain: 'google.com' },
  { name: 'gallerix', chineseName: '盖勒里克斯', url: 'https://www.gallerix.org', domain: 'gallerix.org' }
]

const { t } = useI18n()
</script>

<style scoped>
/* 响应式调整 */
@media (max-width: 767px) {
  .md\:w-1\/4, .md\:w-3\/4 {
    width: 100%;
  }
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .md\:w-1\/4 {
    width: 25%;
  }
  .md\:w-3\/4 {
    width: 75%;
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  .grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 图标和文字对齐 */
.flex.items-center img {
  vertical-align: middle;
}

/* 确保链接居中 */
.text-center a {
  display: inline-flex;
  width: 100%;
}
</style>