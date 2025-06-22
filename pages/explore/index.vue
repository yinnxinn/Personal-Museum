<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center text-gray-900 mb-10">探索展览</h1>

    <section class="mb-12">
      <div
        class="max-w-xl mx-auto flex items-center bg-white rounded-lg shadow-md overflow-hidden p-2"
      >
        <input
          type="text"
          v-model="localSearchQuery"
          @keyup.enter="performSearch"
          placeholder="搜索展品名称、描述..."
          class="flex-grow p-3 text-gray-800 outline-none border-none focus:ring-0"
        />
        <button
          @click="performSearch"
          class="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
          <span>搜索</span>
        </button>
      </div>
    </section>

     <section class="mb-12">
      <h2 class="text-xl font-semibold text-gray-800 mb-4 text-center">热门搜索</h2>
      <div v-if="hotKeywords.length > 0" class="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
        <span v-for="keyword in hotKeywords" :key="keyword" @click="selectKeyword(keyword)"
          class="inline-block bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full cursor-pointer
                 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 transform hover:scale-105">
          {{ keyword }}
        </span>
      </div>
      <div v-else class="text-center text-gray-500">
        <p>加载热门搜索词...</p>
      </div>
    </section>

    <section v-if="recommendedExhibits?.length > 0" class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">推荐展览</h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <router-link
          v-for="recExhibit in recommendedExhibits"
          :key="recExhibit.id"
          :to="`/exhibit/${recExhibit.id}`"
          class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          <img
            :src="recExhibit.cover"
            :alt="recExhibit.title"
            class="w-full h-48 object-cover"
          />
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
              {{ recExhibit.title }}
            </h3>
            <p class="text-gray-600 text-sm line-clamp-2">
              {{ recExhibit.description }}
            </p>
          </div>
        </router-link>
      </div>
    </section>

    <hr class="border-gray-200 mb-12" />

    <section>
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">
        所有展览
      </h2>
      <div
        v-if="allExhibits?.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      > 
        <router-link
          v-for="exhibitItem in allExhibits"
          :key="exhibitItem.id"
          :to="`/exhibit/${exhibitItem.id}`"
          class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          <img
            :src="exhibitItem.cover"
            :alt="exhibitItem.title"
            class="w-full h-48 object-cover"
          />
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
              {{ exhibitItem.title }}
            </h3>
            <p class="text-gray-600 text-sm line-clamp-2">
              {{ exhibitItem.description }}
            </p>
          </div>
        </router-link>
      </div>
    </section>

    <div v-if="false" ref="gallery" class="hidden"></div>
  </div>
</template>

<script setup>

const { locale } = useI18n(); 

useSeoMeta({
  title: () => `Home | ${locale.value === 'zh' ? '个人博物馆' : 'Personal Museum'}`,
  description: () => `Welcome to the ${locale.value === 'zh' ? '个人博物馆' : 'Personal Museum'} homepage. Explore our unique collections.`,
  ogTitle: () => `Home | ${locale.value === 'zh' ? '个人博物馆' : 'Personal Museum'}`,
  ogDescription: () => `Welcome to the ${locale.value === 'zh' ? '个人博物馆' : 'Personal Museum'} homepage. Explore our unique collections.`,
  ogImage: 'https://personal-museum.nilco2.com/bg.jpg', // 替换为实际图片 URL
  twitterCard: 'summary_large_image',
});


import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 解决 $localePath is not defined 错误
const localePath = useLocalePath?.() || (path => path);
const hotKeywords = ref([]);

const { data, error } = await useAsyncData(
  'hotwords_data',
  async () => {
    try {
      const response = await $fetch('/api/hotwords');
      return response;
    } catch (e) {
      // 抛出错误或返回一个默认结构，确保 transform 不会因为 undefined/null 崩溃
      throw e; // 让 useAsyncData 捕获此错误
    }
  },
  {
    server: true,
    transform: (res) => {
      const transformed = res?.keywords || [];
      return transformed;
    },
    // 添加 debug 模式，可以在开发时提供更多信息
    // debug: process.env.NODE_ENV === 'development',
  }
);


// 将数据赋值给 hotKeywords
hotKeywords.value = data.value || [];


// 错误处理
if (error.value) {
  console.error('Failed to fetch hot keywords:', error.value);
}

const totalExhibits = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const localSearchQuery = ref(""); // 仅用于本地输入框绑定
const allExhibits = ref([]); // 所有展览数据
const recommendedExhibits = ref([]); // 推荐展览数据
const loading = ref(false); // 加载状态


const selectKeyword = (keyword) => {
  localSearchQuery.value = keyword;
  performSearch();
};

// 执行搜索（跳转到搜索页面）
const performSearch = () => {
  const query = localSearchQuery.value.trim();
  if (query) {
    router.push({
      path: localePath("/search"), // 使用 localePath 函数
      query: { query },
    });
  }
};

// 通过标签搜索（跳转到搜索页面）
const searchByTag = (tag) => {
  router.push({
    path: localePath("/search"), // 使用 localePath 函数
    query: { query: tag },
  });
};

// 获取所有展品数据
const { data: allExhibitsData, error: allExhibitsError } = await useFetch(
  "/api/exhibit/all",
  {
    key: `all-exhibits-${currentPage.value}-${pageSize.value}`,
    query: () => ({
      page: currentPage.value,
      pageSize: pageSize.value,
    }),
    transform: (response) => {
      loading.value = false;
      if (response?.exhibits) {
        return {
          exhibits: response.exhibits,
          total: response.total,
        };
      }
      return { exhibits: [], total: 0 };
    },
    onResponseError: () => {
      loading.value = false;
      return { exhibits: [], total: 0 };
    },
  }
);

// 获取推荐展品
const { data: recommendedData, error: recommendedError } = await useFetch(
  "/api/exhibit/recommended",
  {
    key: "recommended-exhibits",
    headers: useRequestHeaders(["cookie", "authorization"]),
    credentials: "include",
    transform: (response) => {
      loading.value = false;
      return response?.exhibits || [];
    },
    onResponseError: () => {
      loading.value = false;
      return [];
    },
  }
);

watch(
  allExhibitsData,
  (newData) => {
    allExhibits.value = newData?.exhibits || [];
    totalExhibits.value = newData?.total || 0;
  },
  { immediate: true }
);

watch(
  recommendedData,
  (newData) => {
    recommendedExhibits.value = newData || [];
  },
  { immediate: true }
);

watch([currentPage, pageSize], async () => {
  loading.value = true;
  const { data } = await useFetch("/api/exhibit/all", {
    key: `all-exhibits-${currentPage.value}-${pageSize.value}`,
    query: {
      page: currentPage.value,
      pageSize: pageSize.value,
    },
  });
  allExhibits.value = data.value?.exhibits || [];
  totalExhibits.value = data.value?.total || 0;
  loading.value = false;
});
</script>

<style scoped>
/* 样式保持不变 */
</style>