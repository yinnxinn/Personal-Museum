<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">搜索结果："{{ keyword }}"</h1>

    <div v-if="isLoading" class="text-center py-4">
      <p class="text-lg text-gray-500">加载中，请稍候...</p>
    </div>

    <div v-else-if="exhibits.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="exhibit in exhibits" :key="exhibit.id" class="bg-white rounded-lg shadow-md overflow-hidden">
        <NuxtLink :to="`/exhibit/${exhibit.id}`">
          <img :src="exhibit.coverUrl || '/default-cover.jpg'" :alt="exhibit.title" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-2">{{ exhibit.title }}</h2>
            <p class="text-gray-600 text-sm line-clamp-3">{{ exhibit.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-xl text-gray-600">没有找到与 "{{ keyword }}" 相关的展品。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const keyword = ref(route.params.keyword);
const exhibits = ref([]);
const isLoading = ref(false);

// SEO 优化
useSeoMeta({
  title: () => `搜索: ${keyword.value} - 个人博物馆`,
  ogTitle: () => `搜索: ${keyword.value} - 个人博物馆`,
  description: () => `在个人博物馆中搜索关于 ${keyword.value} 的展品。`,
  ogDescription: () => `在个人博物馆中搜索关于 ${keyword.value} 的展品。`,
});

const searchExhibits = async (searchQuery) => {
  if (!searchQuery) {
    exhibits.value = [];
    return;
  }
  isLoading.value = true;
  try {
    // 假设您有一个后端 API 用于搜索展品
    // 您可能需要根据您的实际后端接口调整这里的 URL 和参数
    const { data, error } = await useFetch(`/api/search/exhibits?q=${encodeURIComponent(searchQuery)}`);
    
    if (error.value) {
      console.error('搜索展品失败:', error.value);
      exhibits.value = [];
    } else {
      exhibits.value = data.value?.results || [];
    }
  } catch (e) {
    console.error('客户端搜索错误:', e);
    exhibits.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 首次加载时执行搜索
searchExhibits(keyword.value);

// 监听关键词变化，当关键词改变时重新搜索
watch(() => route.params.keyword, (newKeyword) => {
  keyword.value = newKeyword;
  searchExhibits(newKeyword);
});
</script>

<style scoped>
/* 您可以在这里添加页面特有的样式 */
</style>