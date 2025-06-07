<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center text-gray-900 mb-10">探索展览</h1>

    <section class="mb-12">
      <div class="max-w-xl mx-auto flex items-center bg-white rounded-lg shadow-md overflow-hidden p-2">
        <input type="text" v-model="searchQuery" @keyup.enter="performSearch" placeholder="搜索展品名称、描述..."
          class="flex-grow p-3 text-gray-800 outline-none border-none focus:ring-0" />
        <button @click="performSearch"
          class="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
          <span>搜索</span>
        </button>
      </div>
    </section>

    <section v-if="recommendedExhibits?.length > 0" class="mb-12">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">推荐展览</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <router-link v-for="recExhibit in recommendedExhibits" :key="recExhibit.id" :to="`/exhibit/${recExhibit.id}`"
          class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <img :src="recExhibit.cover" :alt="recExhibit.title" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{{ recExhibit.title }}</h3>
            <p class="text-gray-600 text-sm line-clamp-2">{{ recExhibit.description }}</p>
          </div>
        </router-link>
      </div>
    </section>

    <hr class="border-gray-200 mb-12">

    <section>
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">
        {{ searchQuery ? `搜索结果: "${searchQuery}"` : '所有展览' }}
      </h2>
      <div v-if="filteredExhibits?.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <router-link v-for="exhibitItem in filteredExhibits" :key="exhibitItem.id" :to="`/exhibit/${exhibitItem.id}`"
          class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <img :src="exhibitItem.cover" :alt="exhibitItem.title" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{{ exhibitItem.title }}</h3>
            <p class="text-gray-600 text-sm line-clamp-2">{{ exhibitItem.description }}</p>
          </div>
        </router-link>
      </div>
      <div v-else class="text-center text-gray-500 py-12">
        <p>没有找到相关展品。</p>
      </div>
    </section>

    <div v-if="false" ref="gallery" class="hidden">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; // useRouter is useful for programmatic navigation

// Font Awesome Imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeart, faLink, faShareAlt, faEye, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faHeart, faLink, faShareAlt, faEye, faMagnifyingGlass, faFacebook, faXTwitter);

// LightGallery imports (kept but typically used on detail pages)
import lightGallery from 'lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

const router = useRouter(); // Initialize router for navigation

const totalExhibits = ref(0);
const currentPage = ref(1);
const pageSize = ref(5);
const searchQuery = ref('');
const allExhibits = ref([]); // Holds all fetched exhibits
const recommendedExhibits = ref([]); // Holds recommended exhibits (subset of allExhibits) // Holds exhibits filtered by search query
const loading = ref(false); // Indicates if data is being loaded

// Filtered exhibits based on search query
const filteredExhibits = computed(() => {
  if (!searchQuery.value) {
    return allExhibits.value; // Show all if no search query
  }
  const query = searchQuery.value.toLowerCase();
  return allExhibits.value.filter(exhibit =>
    exhibit.title.toLowerCase().includes(query) ||
    exhibit.description.toLowerCase().includes(query)
  );
});

// Mock Data Fetching Functions
const fetchAllExhibits = async () => {
  loading.value = true;
  try {
    const { data } = await useFetch('/api/exhibit/all', {
      headers: useRequestHeaders(['cookie', 'authorization']),
      credentials: 'include', // 若服务端基于 cookie 做鉴权
      query: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    });

    if (data.value) {
      allExhibits.value = data.value.exhibits;
      totalExhibits.value = data.value.total;
    }
  } catch (error) {
    console.error('Failed to fetch exhibits:', error);
  } finally {
    loading.value = false;
  }
};

// 获取推荐展品
const fetchRecommendedExhibits = async () => {
  try {
    const { data } = await useFetch('/api/exhibit/recommended', {
      headers: useRequestHeaders(['cookie', 'authorization']),
      credentials: 'include'
    }) // 若服务端基于 cookie 做鉴权);

    console.log('Fetching recommended exhibits...', data.value); // Log the start of the fetch
    console.log('Fetching recommended exhibits2222...', data.value.exhibits); // Log the start of the fetch

    if (data.value) {
      console.log('Recommended exhibits:', data.value.exhibits); // Log the fetched recommendatio
      recommendedExhibits.value = data.value.exhibits;
    } else {
      recommendedExhibits.value = [];

    }
  } catch (error) {
    console.log(error)
    console.error('Failed to fetch recommended exhibits:', error);
    recommendedExhibits.value = [];
  }
};

// --- Search Functionality ---
const performSearch = () => {
  // The computed property `filteredExhibits` automatically updates
  // when `searchQuery` changes, so no direct manipulation of `allExhibits` is needed here.
  console.log(`Searching for: ${searchQuery.value}`);
  // In a real application, you might trigger an API call here to fetch search results
  // if you're not filtering a pre-loaded `allExhibits` array.
};

// LightGallery reference (if you decide to use it for individual image viewing on this page)
const gallery = ref(null); // This ref isn't directly used for the explore page list.
// It would be used if you had a specific image gallery on THIS page.

onMounted(async () => {
  await fetchAllExhibits();
  await fetchRecommendedExhibits();

  // If you decide to add a dynamic gallery section on this page later,
  // ensure `gallery.value` exists before initializing lightGallery.
  // if (gallery.value) {
  //   lightGallery(gallery.value, {
  //     selector: 'a', // Selects anchor tags within the gallery ref
  //     plugins: [lgZoom, lgThumbnail],
  //     speed: 300,
  //     download: false,
  //   });
  // }
});
</script>

<style scoped>
/* You can add custom styles here if needed, but Tailwind CSS handles most of it */
</style>