<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center text-gray-900 mb-10">
      搜索结果: "{{ searchQuery || '无查询' }}"
    </h1>

    <section class="mb-12">
      <div class="max-w-xl mx-auto flex items-center bg-white rounded-lg shadow-md overflow-hidden p-2">
        <input
          type="text"
          v-model="searchQuery"
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

    <section>
      <div v-if="loading" class="text-center text-gray-500 py-12">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="apiError" class="text-center text-red-500 py-12">
        <p>加载失败: {{ apiError }}</p>
        <p class="text-gray-500 text-sm mt-2">请尝试重新搜索或稍后再试。</p>
      </div>
      
      <div v-else>
        <div 
          v-if="searchResults && searchResults.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <NuxtLink
            v-for="item in searchResults"
            :key="item.id"
            :to="$localePath(`/exhibit/${item.id}`)"
            class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <img 
              :src="item.cover" 
              :alt="item.title" 
              class="w-full h-48 object-cover" 
            />
            <div class="p-4">
              <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{{ item.title }}</h3>
              <p class="text-gray-600 text-sm line-clamp-2">{{ item.description }}</p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="text-center text-gray-500 py-12">
          <p>没有找到与 "{{ searchQuery }}" 相关的展品。</p>
          <p v-if="searchQuery === ''" class="text-sm mt-2">请在上方输入关键词开始搜索。</p>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNuxtApp } from "#app";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

definePageMeta({
  requiresAuth: false, // 明确标记为不需要认证
});

const route = useRoute();
const router = useRouter();
const { $localePath } = useNuxtApp();

// 1. 搜索查询初始化为路由参数
const searchQuery = ref(route.query.query?.toString() || "");

// 2. SEO 设置
useSeoMeta({
  title: () => `搜索: ${searchQuery.value} - 个人博物馆`,
  ogTitle: () => `搜索: ${searchQuery.value} - 个人博物馆`,
  description: () => `在个人博物馆中搜索关于 ${searchQuery.value} 的展品。`,
  ogDescription: () => `在个人博物馆中搜索关于 ${searchQuery.value} 的展品。`,
});

library.add(faMagnifyingGlass);

// 3. 分页和加载状态
const loading = ref(false);
const apiError = ref(null);
const page = ref(1);
const pageSize = ref(20);

// 4. 修复的核心数据获取逻辑
const fetchSearchResults = async () => {
  loading.value = true;
  apiError.value = null;
  
  const queryValue = searchQuery.value.trim();
  if (!queryValue) {
    loading.value = false;
    return { exhibits: [] };
  }

  try {
    const response = await $fetch("/api/exhibit/search", {
      method: "GET",
      query: {
        query: queryValue,
        page: page.value,
        pageSize: pageSize.value,
      },
    });
    
    // 检查API响应格式
    console.log("API Response:", response);
    
    return response;
  } catch (err) {
    console.error("搜索请求错误:", err);
    apiError.value = err.response?._data?.statusMessage ||
                    err.message ||
                    "搜索过程中发生错误";
    return { exhibits: [] };
  } finally {
    loading.value = false;
  }
};

// 5. 使用 useAsyncData 正确配置
const {
  data: exhibitsData,
  pending,
  error: asyncError,
  refresh,
} = await useAsyncData(
  `search-results-${searchQuery.value}-${page.value}-${pageSize.value}`,
  fetchSearchResults,
  {
    // 关键：使用 getter 函数来监听响应式依赖
    watch: [() => searchQuery.value, () => page.value, () => pageSize.value],
  }
);

// 6. 处理搜索结果
const searchResults = computed(() => {
  // 确保处理可能的响应格式
  return exhibitsData.value?.exhibits || [];
});

// 7. 同步加载状态
watch(pending, (isPending) => {
  loading.value = isPending;
});

// 8. 处理错误状态
watch(asyncError, (error) => {
  if (error) {
    apiError.value = error.message;
  }
});

// 9. 搜索功能
const performSearch = () => {
  if (searchQuery.value.trim()) {
    // 重置分页到第一页
    page.value = 1;
    
    // 更新URL但不重新加载页面
    router.replace({
      path: $localePath("/search"),
      query: { query: searchQuery.value },
    });
    
    // 手动刷新数据
    refresh();
  }
};

// 10. 监听路由变化
watch(
  () => route.query.query,
  (newQuery) => {
    if (newQuery !== searchQuery.value) {
      searchQuery.value = newQuery?.toString() || "";
      // 手动刷新数据，因为 useAsyncData 的 watch 可能不会自动触发
      refresh();
    }
  },
  { immediate: true }
);

// 11. 调试：打印当前状态
watch([searchQuery, searchResults], () => {
  console.log("搜索查询:", searchQuery.value);
  console.log("搜索结果:", searchResults.value);
});
</script>