<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center text-gray-900 mb-10">探索展览</h1>

    <section class="mb-8">
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

    <hr class="border-gray-200 mb-12">

    <section v-if="!searchQuery && recommendedExhibits?.length > 0" class="mb-12">
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

    <hr v-if="!searchQuery" class="border-gray-200 mb-12">


    <section>
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">
        {{ searchQuery ? `搜索结果: "${searchQuery}"` : '随便看看' }}
      </h2>

      <div v-if="loading && currentPage === 1" class="text-center py-4">
        <p class="text-lg text-gray-500">加载中，请稍候...</p>
      </div>

      <div v-else-if="currentExhibits.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <router-link v-for="exhibitItem in currentExhibits" :key="exhibitItem.id" :to="`/exhibit/${exhibitItem.id}`"
          class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <img :src="exhibitItem.cover" :alt="exhibitItem.title" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{{ exhibitItem.title }}</h3>
            <p class="text-gray-600 text-sm line-clamp-2">{{ exhibitItem.description }}</p>
          </div>
        </router-link>
        <div v-if="isFetchingMore" class="text-center py-4 col-span-full">
          <p class="text-lg text-gray-500">加载更多...</p>
        </div>
        <div class="sentinel" /> </div>

      <div v-else class="text-center text-gray-500 py-12">
        <p>没有找到相关展品。</p>
      </div>
    </section>

    <div v-if="false" ref="gallery" class="hidden">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRoute as we'll now monitor its query

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

const router = useRouter();
const route = useRoute(); // Initialize useRoute

const totalExhibits = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const searchQuery = ref(''); // Represents the current search query
const allExhibits = ref([]); // Stores all exhibits when no search is active
const searchResults = ref([]); // Stores search results when a search is active
const recommendedExhibits = ref([]);
const loading = ref(false); // For initial loading state
const isFetchingMore = ref(false); // For infinite scroll loading
const observer = ref(null); // Intersection observer reference

// Hot keywords
const hotKeywords = ref([
  '印象派', '现代艺术', '雕塑', '摄影', '中国画', '欧洲古典', '当代设计', '数字艺术', '抽象表现主义', '文艺复兴'
]);


const fetchHotKeywords = async () => {
  try {
    const { data, error } = await useFetch('/api/hot-keywords'); // Call your new API endpoint
    if (error.value) {
      console.error('Failed to fetch hot keywords:', error.value);
      hotKeywords.value = [];
    } else if (data.value && Array.isArray(data.value.keywords)) {
      hotKeywords.value = data.value.keywords;
    } else {
      hotKeywords.value = [
  '印象派', '现代艺术', '雕塑', '摄影', '中国画', '欧洲古典', '当代设计', '数字艺术', '抽象表现主义', '文艺复兴'
]; // Ensure it's an array even if API returns unexpected format
    }
  } catch (err) {
    console.error('Unhandled error fetching hot keywords:', err);
    hotKeywords.value = [];
  }
};
// Computed property to determine which list to display
const currentExhibits = computed(() => {
  return searchQuery.value ? searchResults.value : allExhibits.value;
});

// Function to fetch exhibits (either all or search results)
const fetchExhibits = async (isSearch = false) => {
  // Prevent duplicate fetches when already loading more
  if (isFetchingMore.value && currentPage.value > 1) return;

  loading.value = currentPage.value === 1; // Only show full loading spinner for the first page
  isFetchingMore.value = currentPage.value > 1; // Flag for loading more data on subsequent pages

  try {
    const apiPath = '/api/exhibit/all'; // Your unified API endpoint

    const { data, error } = await useFetch(apiPath, {
      headers: useRequestHeaders(['cookie', 'authorization']),
      credentials: 'include',
      query: {
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value, // Pass searchQuery to API
      },
    });

    if (error.value) {
      console.error('Failed to fetch exhibits:', error.value);
      if (isSearch) {
        searchResults.value = [];
      } else {
        allExhibits.value = [];
      }
      totalExhibits.value = 0;
    } else if (data.value) {
      const fetchedItems = data.value.exhibits || [];
      totalExhibits.value = data.value.total ?? 0;

      if (isSearch) {
        // For search results, replace or append based on current page
        searchResults.value = currentPage.value === 1 ? fetchedItems : [...searchResults.value, ...fetchedItems];
      } else {
        // For '随便看看' (all exhibits), replace or append
        allExhibits.value = fetchedItems ;
      }
    }
  } catch (err) {
    console.error('Unhandled API error:', err);
    if (isSearch) {
      searchResults.value = [];
    } else {
      allExhibits.value = [];
    }
    totalExhibits.value = 0;
  } finally {
    loading.value = false;
    isFetchingMore.value = false;
  }
};

// Fetch recommended exhibits (always fetched)
const fetchRecommendedExhibits = async () => {
  try {
    const { data } = await useFetch('/api/exhibit/recommended', {
      headers: useRequestHeaders(['cookie', 'authorization']),
      credentials: 'include'
    });

    if (data.value) {
      recommendedExhibits.value = data.value.exhibits;
    } else {
      recommendedExhibits.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch recommended exhibits:', error);
    recommendedExhibits.value = [];
  }
};

// --- Search Functionality ---
const performSearch = async () => {
  // Update URL query parameter without navigating to a new page
  // This keeps the URL up-to-date and allows direct linking to searches
  await router.push({ query: { query: searchQuery.value || undefined } }); // Use undefined to remove query param if empty

  currentPage.value = 1; // Reset to first page for new search
  totalExhibits.value = 0; // Reset total
  await fetchExhibits(true); // Fetch as search results
};

// Handle hot keyword selection
const selectKeyword = (keyword) => {
  searchQuery.value = keyword;
  performSearch();
};

// --- Infinite Scroll Logic ---
const handleIntersection = ([entry]) => {
  // Determine the correct total count based on whether we are searching or Browse
  const currentTotal = searchQuery.value ? searchResults.value.length : allExhibits.value.length;

  if (entry.isIntersecting && !isFetchingMore.value && currentTotal < totalExhibits.value) {
    currentPage.value += 1;
    fetchExhibits(!!searchQuery.value); // Pass true if searchQuery exists
  }
};

onMounted(async () => {
  await fetchHotKeywords();
  // Initialize searchQuery from URL on mount
  if (route.query.query) {
    searchQuery.value = route.query.query;
    currentPage.value = parseInt(route.query.page || '1', 10);
    // Fetch search results on initial load if query exists
    await fetchExhibits(true);
  } else {
    // If no search query, fetch all exhibits
    await fetchExhibits(false);
  }

  // Fetch recommended exhibits regardless of search state
  await fetchRecommendedExhibits();

  // Set up Intersection Observer for infinite scroll
  observer.value = new IntersectionObserver(handleIntersection, {
    root: null, // viewport
    rootMargin: '200px', // Trigger when sentinel is 200px from viewport
    threshold: 0.1, // Trigger when 10% of sentinel is visible
  });

  const sentinel = document.querySelector('.sentinel');
  if (sentinel) {
    observer.value.observe(sentinel);
  }
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});

// Watch for changes in the URL query parameter (e.g., if user navigates back/forward)
watch(() => route.query.query, (newQuery) => {
  // If the query changes from external navigation (e.g., browser back/forward),
  // update the internal searchQuery and re-fetch.
  if (newQuery !== searchQuery.value) {
    searchQuery.value = newQuery || '';
    currentPage.value = 1; // Reset page
    if (searchQuery.value) {
      fetchExhibits(true); // Fetch as search results
    } else {
      fetchExhibits(false); // Fetch all exhibits
    }
  }
});
</script>

<style scoped>
/* Tailwind CSS handles most styling. Add custom styles here if needed. */
</style>