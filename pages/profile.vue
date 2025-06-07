<template>
  <div class="container mx-auto px-4 py-8 mt-10 max-w-5xl">
    <div v-if="loadingUser || loadingExhibits" class="text-center p-10">
      <p class="text-indigo-600 text-lg">加载中，请稍候...</p>
      <div class="spinner mt-4"></div>
    </div>

    <div v-else-if="$auth.user.value" class="text-center mb-8">
      <img :src="$auth.user.value.user_metadata?.avatar_url || '/avatar.png'" :alt="$auth.user.value.user_metadata?.full_name || '用户头像'"
        class="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-500 shadow-lg">
      <h1 class="text-3xl font-bold text-gray-900">欢迎, {{ $auth.user.value.user_metadata?.full_name || $auth.user.value.email || '用户' }}!</h1>
      <p class="text-gray-600">管理你的展品和收藏。</p>
    </div>

    <div v-else class="text-center p-8 bg-red-50 border border-red-200 text-red-700 rounded-lg">
      <p class="text-lg mb-4">无法加载用户信息或您未登录。</p>
      <NuxtLink to="/login" class="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200">去登录</NuxtLink>
    </div>

    <div class="border-b border-gray-200 mb-6" v-if="$auth.user.value">
      <nav class="-mb-px flex justify-center space-x-8" aria-label="Tabs">
        <button @click="activeTab = 'liked'" :class="[
            activeTab === 'liked'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
          ]">
          我喜欢的展品 ({{ likedExhibits.length }})
        </button>
        <button @click="activeTab = 'created'" :class="[
            activeTab === 'created'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
          ]">
          我创建的展品 ({{ createdExhibits.length }})
        </button>
      </nav>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md" v-if="$auth.user.value">
      <div v-if="activeTab === 'liked'">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">我喜欢的展品</h2>
        <div v-if="likedExhibits.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="exhibit in likedExhibits" :key="exhibit.id"
            class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            <img :src="exhibit.coverUrl || '/placeholder-cover.png'" :alt="exhibit.title" class="w-full h-48 object-cover">
            <div class="p-4 flex flex-col flex-grow">
              <h3 class="font-bold text-lg mb-1">{{ exhibit.title }}</h3>
              <p class="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{{ exhibit.description }}</p>
              <NuxtLink :to="`/exhibit/${exhibit.id}`"
                class="mt-auto inline-block text-indigo-600 hover:text-indigo-800 text-sm font-semibold">
                查看详情
              </NuxtLink>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 p-8">
          <p>你还没有喜欢任何展品。</p>
          <NuxtLink to="/" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">去探索更多展品
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="activeTab === 'created'">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">我创建的展品</h2>
        <div v-if="createdExhibits.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="exhibit in createdExhibits" :key="exhibit.id"
            class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            <img :src="exhibit.coverUrl || '/placeholder-cover.png'" :alt="exhibit.title" class="w-full h-48 object-cover">
            <div class="p-4 flex flex-col flex-grow">
              <h3 class="font-bold text-lg mb-1">{{ exhibit.title }}</h3>
              <p class="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{{ exhibit.description }}</p>
              <div class="mt-auto flex justify-between items-center">
                <NuxtLink :to="`/exhibit/${exhibit.id}`"
                  class="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">
                  查看详情
                </NuxtLink>
                <NuxtLink :to="`/exhibit/create?id=${exhibit.id}`"
                  class="text-blue-500 hover:text-blue-700 text-sm font-semibold ml-4">
                  编辑
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 p-8">
          <p>你还没有创建任何展品。</p>
          <NuxtLink to="/create-exhibit" class="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
            去创建你的第一个展品</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useNuxtApp, useHead } from '#app';
import { useSupabaseClient } from '#imports'; // 导入 useSupabaseClient 以便在组件中使用

const { $auth } = useNuxtApp(); // 获取你注入的 $auth 插件
const supabase = useSupabaseClient(); // 获取 Supabase 客户端实例，用于数据库查询

const activeTab = ref('liked');
const likedExhibits = ref([]);
const createdExhibits = ref([]);

// 从 $auth 插件中获取加载状态，或者定义自己的局部加载状态
const loadingUser = $auth.isLoading; // 直接使用 auth 插件的 loading 状态
const loadingExhibits = ref(true); // 展品加载状态仍需单独管理

// --- 获取用户喜欢的展品 ---
const fetchLikedExhibits = async (userId) => {
  if (!userId) return [];
  try {
    const { data: likedActions, error: actionsError } = await supabase // 使用 useSupabaseClient 获取的实例
      .from('actions')
      .select('exhibitId')
      .eq('userId', userId)
      .eq('likes', true);

    if (actionsError) throw actionsError;

    const exhibitIds = likedActions.map(action => action.exhibitId);

    if (exhibitIds.length === 0) return [];

    const { data: exhibits, error: exhibitsError } = await supabase // 使用 useSupabaseClient 获取的实例
      .from('exhibits')
      .select('id, title, description, coverUrl')
      .in('id', exhibitIds);

    if (exhibitsError) throw exhibitsError;
    return exhibits;

  } catch (error) {
    console.error('获取喜欢的展品失败:', error.message);
    return [];
  }
};

// --- 获取用户创建的展品 ---
const fetchCreatedExhibits = async (userId) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase // 使用 useSupabaseClient 获取的实例
      .from('exhibits')
      .select('id, title, description, coverUrl')
      .eq('author', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('获取创建的展品失败:', error.message);
    return [];
  }
};

// --- 统一的数据获取逻辑 ---
const fetchData = async () => {
  loadingExhibits.value = true;
  if ($auth.user.value) { // 使用 $auth.user.value 来获取当前用户
    const userId = $auth.user.value.id;
    const [likedData, createdData] = await Promise.all([
      fetchLikedExhibits(userId),
      fetchCreatedExhibits(userId)
    ]);
    likedExhibits.value = likedData;
    createdExhibits.value = createdData;
  } else {
    likedExhibits.value = [];
    createdExhibits.value = [];
  }
  loadingExhibits.value = false;
};

// 组件挂载时执行
onMounted(async () => {
  // $auth 插件内部的 checkAuthState 已经处理了用户的初始加载
  // 这里我们只需要等待 $auth.user 的值就绪，然后获取展品数据
  // 由于 useSupabaseUser 是响应式的，它会在 session 可用时自动更新
  // 我们可以直接依赖 watch 监听 $auth.user 的变化来触发 fetchData
});

// 监听 $auth.user 的变化，以便在登录/登出后重新加载展品
watch($auth.user, async (newVal, oldVal) => {
  if (newVal?.id !== oldVal?.id) { // 仅当用户ID发生实际变化时才重新获取数据
    await fetchData();
  }
}, { immediate: true }); // immediate: true 确保在组件初次挂载时也执行一次 fetchData

// 设置页面头部信息
useHead(() => ({
  title: `个人中心 - ${$auth.user.value?.user_metadata?.full_name || $auth.user.value?.email || '用户'}`,
  meta: [
    { name: 'description', content: '管理你的展品和收藏。' }
  ],
}));
</script>

<style scoped>
/* Spinner 动画样式 */
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #6366f1; /* Indigo color */
  animation: spin 1s ease infinite;
  margin: auto; /* Center the spinner */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 确保卡片在 Grid 布局中高度一致且内容底部对齐 */
.grid > div {
  display: flex;
  flex-direction: column;
}

.grid > div .p-4 {
  flex-grow: 1; /* 让内层 p-4 容器扩展以填充剩余空间 */
  display: flex;
  flex-direction: column;
}

.grid > div .p-4 .mb-4.flex-grow {
  flex-grow: 1; /* 让描述段落扩展以将底部的链接推到底部 */
}

/* 占位图背景色 */
.object-cover[src$="placeholder-cover.png"] {
  background-color: #f3f4f6; /* Light gray background for placeholders */
}
</style>