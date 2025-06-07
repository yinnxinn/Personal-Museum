<template>
  <footer class="text-gray-600 text-sm py-6 border-t border-gray-300 mt-10">
    <div class="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center text-center md:text-left">
      <!-- <div class="mb-4 md:mb-0">
        © {{ new Date().getFullYear() }} {{ $t('footer.project_name') || 'Personal Museum' }}. {{ $t('footer.all_rights_reserved') || 'All rights reserved.' }}
      </div> -->

      <div class="flex flex-wrap justify-center md:justify-start space-x-4 mb-4 md:mb-0">
        <NuxtLink to="/about" class="hover:underline">{{ $t('footer.about_us') || '关于项目' }}</NuxtLink>
        <!-- <NuxtLink to="/contact" class="hover:underline">{{ $t('footer.contact') || '联系' }}</NuxtLink> -->
        <!-- <NuxtLink to="/terms" class="hover:underline">{{ $t('footer.terms_of_service') || '服务条款' }}</NuxtLink>
        <NuxtLink to="/privacy" class="hover:underline">{{ $t('footer.privacy_policy') || '隐私政策' }}</NuxtLink> -->

        <a href="https://github.com/yinnxinn/Personal-Museum" target="_blank" rel="noopener noreferrer"
          aria-label="GitHub">
          <svg class="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors duration-200" fill="currentColor"
            viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017 2 16.295 4.866 19.76 8.839 20.812c.48.086.654-.208.654-.465 0-.229-.008-.847-.013-1.666-2.782.603-3.37-.9-3.37-.9-.454-1.156-1.11-1.474-1.11-1.474-.908-.62.069-.608.069-.608 1.007.072 1.532 1.03 1.532 1.03.89 1.531 2.332 1.09 2.906.833.091-.647.35-1.09.637-1.34-2.22-.253-4.555-1.116-4.555-4.949 0-1.092.39-1.986 1.029-2.68a3.67 3.67 0 01.1-2.652s.837-.268 2.753 1.025c.792-.222 1.636-.333 2.479-.338.843.005 1.687.116 2.479.338 1.916-1.293 2.753-1.025 2.753-1.025.263.766.425 1.764.1 2.652.64.694 1.028 1.588 1.028 2.68 0 3.841-2.339 4.693-4.566 4.941.359.309.678.92.678 1.855 0 1.341-.012 2.422-.012 2.75c0 .258.174.555.66.465C19.14 19.757 22 16.289 22 12.017 22 6.484 17.523 2 12 2Z"
              clip-rule="evenodd" />
          </svg>
        </a>
        <a href="https://x.com/aiartistdance" target="_blank" rel="noopener noreferrer"
          aria-label="X (formerly Twitter)">
          <font-awesome-icon :icon="['fab', 'x-twitter']" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style scoped>
/* 可以添加额外样式，例如图标悬停效果或响应式调整 */
</style>