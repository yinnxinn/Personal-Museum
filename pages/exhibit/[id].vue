<template>
    <div class="container mx-auto px-4 py-18">
        <div class="hidden md:block bg-cover bg-center md:bg-fixed md:max-h-[300px] md:overflow-hidden relative"
            :style="dynamicCoverStyle">
        </div>

        <div class="text-center px-4 py-6 mb-6">
            <div class="flex justify-center items-center space-x-4 mb-4">
                <button @click="displayMode = 'list'"
                    :class="{ 'text-blue-600 font-semibold': displayMode === 'list', 'text-gray-500 hover:text-blue-400': displayMode !== 'list' }"
                    class="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200">

                    <FontAwesomeIcon icon="fa-solid fa-table-list" class="text-xl" />
                    <span class="hidden sm:inline">参观模式</span>

                </button>
                <button @click="displayMode = 'grid'"
                    :class="{ 'text-blue-600 font-semibold': displayMode === 'grid', 'text-gray-500 hover:text-blue-400': displayMode !== 'grid' }"
                    class="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200">

                    <FontAwesomeIcon icon="fa-solid fa-grip" class="text-xl" />
                    <span class="hidden sm:inline">快速浏览</span>

                </button>
            </div>

            <h1 class="text-3xl font-semibold text-gray-900 mb-4">{{ exhibit.title }}</h1>

            <div class="flex justify-center items-center space-x-6 text-gray-600 text-xl mb-4">
                <button @click="toggleFavorite" class="hover:text-red-500 transition"
                    :class="{ 'text-red-500': isFavorited }">
                    <FontAwesomeIcon :icon="['fa-solid', isFavorited ? 'fa-heart' : 'fa-heart']" />
                </button>
                <!-- <button @click="copyLink" class="hover:text-blue-500 transition">
                    <FontAwesomeIcon icon="fa-solid fa-link" />
                </button> -->
                <button v-if="canShare" @click="generateShareImage(exhibit, 'share')"
                    class="hover:text-blue-700 transition">
                    <FontAwesomeIcon icon="fa-solid fa-book" class="mr-2" />
                    <!-- <img src="/xhs.svg" alt="Xiaohongshu Logo" class="w-6 h-6 inline-block" /> -->
                </button>
                <button v-if="canShare" @click="shareToTwitter" class="hover:text-black transition">
                    <FontAwesomeIcon icon="fa-brands fa-x-twitter" />
                </button>
                <button @click="toggleShareMenu" class="hover:text-gray-700 transition relative">
                    <FontAwesomeIcon icon="fa-solid fa-share-alt" />
                    <!-- 分享菜单 -->
                    <div v-if="isShareMenuOpen"
                        class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <a href="#" @click.prevent="copyLink"
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            复制链接
                        </a>

                        <template v-if="exhibit.privacy !== 'private'">
                            <a href="#" @click.prevent="shareToFacebook"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                分享到Facebook
                            </a>
                            <a href="#" @click.prevent="shareToTwitter"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                分享到Twitter
                            </a>
                        </template>
                        <!-- 可以添加更多分享选项 -->
                    </div>
                </button>
                <!-- <button class="hover:text-gray-700 transition">
                    <FontAwesomeIcon icon="fa-solid fa-eye" />
                </button> -->
            </div>

            <p class="text-gray-700 text-base leading-relaxed mb-2 px-4 max-w-2xl mx-auto transition-all duration-300 text-left"
                :class="!showFullDescription ? 'line-clamp-3' : ''">
                {{ exhibit.description }}
            </p>

            <div v-if="shouldShowToggle" class="mt-2">
                <button @click="showFullDescription = !showFullDescription"
                    class="text-blue-600 hover:underline text-sm">
                    {{ showFullDescription ? '收起详情' : '展开详情' }}
                </button>
            </div>
        </div>

        <div v-if="exhibit.datas?.length" class="bg-white rounded-lg overflow-hidden p-4" ref="galleryContainer">
            <div :class="{
                'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4': displayMode === 'grid',
                '': displayMode === 'list' // No specific grid classes for list mode, handled by flex below
            }">
                <div v-for="(item, index) in exhibit.datas" :key="item.id" :class="{
                    'flex flex-col md:flex-row items-center my-8': displayMode === 'list',
                    'md:flex-row-reverse': displayMode === 'list' && index % 2 !== 0,
                    'flex flex-col items-center justify-center': displayMode === 'grid'
                }">
                    <div :class="{
                        'md:w-1/2 w-full p-4': displayMode === 'list',
                        'w-full': displayMode === 'grid' // Full width in grid item
                    }">
                        <div class="relative w-full h-full" :class="{ 'min-h-[200px]': displayMode === 'grid' }">
                            <div v-if="!item.loaded" class="w-full h-[300px] bg-gray-200 animate-pulse rounded">
                            </div>
                            <a :href="item.imageUrl" class="block rounded-lg overflow-hidden shadow-lg lg-trigger"
                                :data-lg-size="`${item.width || 1600}-${item.height || 1067}`"
                                :data-sub-html="`<div class='lg-caption'><h4>${item.title}</h4><p>${item.description || ''}</p></div>`">
                                <img v-show="item.loaded" :src="item.imageUrl" :alt="item.title"
                                    class="w-full h-full object-cover cursor-pointer"
                                    :class="{ 'aspect-video': displayMode === 'grid' }" @load="item.loaded = true" />
                            </a>
                            <button @click.stop="generateShareImage(item, 'share')"
                                class="absolute top-2 right-2 bg-gray-100 bg-opacity-75 rounded-md p-2 text-gray-600 hover:text-gray-800 transition z-10">
                                <FontAwesomeIcon icon="fa-solid fa-download" class="text-sm" />
                            </button>
                        </div>
                    </div>
                    <div :class="{
                        'md:w-1/2 w-full p-4 text-left': displayMode === 'list',
                        'w-full p-2 text-center': displayMode === 'grid' // Center text in grid item
                    }">
                        <h3 :class="{
                            'text-2xl font-semibold text-gray-800 mb-2': displayMode === 'list',
                            'text-lg font-medium text-gray-800 mb-1': displayMode === 'grid' // Smaller title in grid
                        }">
                            {{ item.title }}
                        </h3>
                        <p v-if="displayMode === 'list'" class="text-gray-600 text-base">
                            {{ item.description }}
                        </p>
                        <p v-if="displayMode === 'list' && item.artist" class="text-gray-500 text-sm mt-2">Artist: {{
                            item.artist }}</p>
                        <p v-if="displayMode === 'list' && item.year" class="text-gray-500 text-sm">Year:
                            {{ item.year }}</p>
                        <p v-if="displayMode === 'list' && item.category" class="text-gray-500 text-sm">
                            Category: {{ item.category }}</p>
                    </div>
                </div>

                <div v-if="isDownloadOverlayVisible"
                    class="fixed inset-0 w-full h-full bg-black bg-opacity-70 z-50 flex justify-center items-center"
                    @click="closeDownloadOverlay">
                    <div class="bg-white rounded-lg shadow-xl overflow-hidden p-4" @click.stop>
                        <img :src="downloadImageUrl" alt="Downloadable Image"
                            class="block max-w-[90vw] max-h-[90vh] object-contain mx-auto" />
                        <div class="mt-4 flex justify-end">
                            <a :href="downloadImageUrl" :download="`PersonalMuseum_${exhibit.title}_${Date.now()}.png`"
                                class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                                下载图片
                            </a>
                            <button @click="closeDownloadOverlay"
                                class="ml-3 inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200">
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isLoading" class="text-center py-6">
            <p class="text-lg text-gray-500 animate-pulse">加载中，请稍候...</p>
        </div>

        <div v-else-if="!exhibit.datas?.length" class="text-center py-12">
            <p class="text-xl text-gray-600">展品尚未加载或未找到内容。</p>
        </div>
    </div>

    <div v-if="isShareOverlayVisible"
        class="fixed inset-0 w-full h-full bg-black bg-opacity-70 z-[60] flex justify-center items-center"
        @click="closeShareOverlay">
        <div class="bg-white rounded-lg shadow-xl overflow-hidden p-4" @click.stop>
            <img :src="shareOverlayImageUrl" alt="Share Image for Xiaohongshu"
                class="block max-w-[90vw] max-h-[90vh] object-contain mx-auto" />
            <div class="mt-4 text-center">
                <p class="text-gray-700 text-sm mb-2">长按或右键图片保存，然后手动分享</p>
                <button @click="closeShareOverlay"
                    class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                    关闭
                </button>
            </div>
        </div>
    </div>


</template>


<script setup>

import { useRoute } from 'vue-router';
import { ref, onMounted, nextTick, computed, watch, onUnmounted } from 'vue';
import lightGallery from 'lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import html2canvas from 'html2canvas';

const { $auth } = useNuxtApp();

const route = useRoute();
const exhibitId = route.params.id;

const exhibit = ref({
    id: '',
    title: '',
    coverUrl: '',
    description: '',
    datas: []
});

useSeoMeta({
    title: () => exhibit.value?.title || '数字博物馆',
    ogTitle: () => exhibit.value?.title || '数字博物馆',
    description: () => exhibit.value?.description?.slice(0, 150) || '一个精彩的数字展览，欢迎来参观！',
    ogDescription: () => exhibit.value?.description?.slice(0, 150) || '一个精彩的数字展览，欢迎来参观！',
    ogImage: () => exhibit.value?.coverUrl || '/default-cover.jpg',
    twitterCard: 'summary_large_image'
});

const showFullDescription = ref(false);
const shouldShowToggle = ref(true);
const page = ref(1);
const pageSize = 10;
const isLoading = ref(true);
const hasMore = ref(true);
const galleryInstance = ref(null);
const galleryContainer = ref(null);

const isFavorited = ref(false);
const exhibitError = ref(null);
const isShareMenuOpen = ref(false);

const displayMode = ref('list'); // 'list' or 'grid'

// --- 新增的状态变量 for download overlay ---
const isDownloadOverlayVisible = ref(false);
const downloadImageUrl = ref('');


const { data, error } = await useFetch(`/api/exhibit/${exhibitId}`, {
    key: `exhibit-details-${exhibitId}-${$auth.user.value?.id || 'public'}`,
    query: () => ({
        userId: $auth.isLoggedIn.value && $auth.user.value?.id ? $auth.user.value.id : undefined
    }),
    // 在响应后处理数据
    transform: (response) => {
        isLoading.value = false
        if (!response?.exhibit) {
            exhibitError.value = '未找到展品内容。'
            return { id: '', title: '', coverUrl: '', description: '', datas: [] }
        }
        // 设置 exhibit 数据
        const exhibitData = {
            id: response.exhibit.id,
            author: response.exhibit.author,
            privacy: response.exhibit.privacy,
            title: response.exhibit.title,
            coverUrl: response.exhibit.coverUrl,
            description: response.exhibit.description,
            datas: response.exhibit.datas
        }
        shouldShowToggle.value = response.exhibit.description?.length > 150
        return exhibitData
    },
    onResponseError: ({ response }) => {
        isLoading.value = false
        exhibitError.value = response.statusMessage || '无法加载展品内容。'
        return { id: '', title: '', coverUrl: '', description: '', datas: [] }
    }
})

const canShare = computed(() => {
    if (!exhibit.value.id) return false;
    if (exhibit.value.privacy === 'private') {
        return $auth.isLoggedIn.value && $auth.user.value?.id === exhibit.value.author;
    }
    return true;
});

const isLoadingAuth = computed(() => $auth.isLoading.value);

const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};


const fetchExhibitItems = async (id, append = false) => {
    if (!id || isLoading.value) return;

    isLoading.value = true;

    try {
        const { data, error } = await useFetch(`/api/exhibit/items/${id}?page=${page.value}&pageSize=${pageSize}`, {
            key: `exhibit-items-${id}-${page.value}`,
        });

        if (error.value) {
            console.error('获取展品数据项失败:', error.value);
            return;
        }

        if (data.value?.items) {
            const newItems = data.value.items.map(item => ({ ...item, loaded: false })) || [];
            if (newItems.length < pageSize) {
                hasMore.value = false;
            } else {
                hasMore.value = true;
            }

            if (append) {
                exhibit.value.datas.push(...newItems);
            } else {
                exhibit.value.datas = newItems;
            }

            await nextTick();

            if (galleryContainer.value) {
                if (galleryInstance.value) {
                    galleryInstance.value.destroy(true);
                }
                galleryInstance.value = lightGallery(galleryContainer.value, {
                    selector: '.lg-trigger',
                    plugins: [lgZoom, lgThumbnail],
                    speed: 300,
                    download: false,
                    hash: false,
                    closable: true,
                });
            }
        }
    } catch (err) {
        console.error('获取展品数据项异常:', err);
    } finally {
        isLoading.value = false;
    }
};

// watch([isLoadingAuth, () => $auth.user.value?.id, () => route.params.id],
//     async ([newIsLoadingAuth, newUserId, newExhibitId], [oldIsLoadingAuth, oldUserId, oldExhibitId]) => {
//         if (!newIsLoadingAuth && newExhibitId && (newExhibitId !== oldExhibitId || newUserId !== oldUserId)) {
//             await fetchExhibitDetails();
//         }
//     }, { immediate: true }
// );

watch(data, (newData) => {
    exhibit.value = newData || { id: '', title: '', coverUrl: '', description: '', datas: [] }
}, { immediate: true })

const dynamicCoverStyle = computed(() => {
    if (!exhibit.value.datas || exhibit.value.datas?.length === 0) {
        return { backgroundImage: 'url(/bg.jpg)' };
    }

    const numImages = Math.min(10, exhibit.value.datas.length);
    const selectedImages = [];
    const availableIndices = Array.from({ length: exhibit.value.datas.length }, (_, i) => i);

    for (let i = 0; i < numImages; i++) {
        if (availableIndices.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        selectedImages.push(exhibit.value.datas[availableIndices[randomIndex]].imageUrl);
        availableIndices.splice(randomIndex, 1);
    }

    const imageUrls = selectedImages.map(url => `url('${url}')`).join(', ');
    const backgroundSizes = Array(numImages).fill('20%').join(', ');
    const backgroundPositions = selectedImages.map((_, i) => {
        const x = (i % 5) * 20;
        const y = Math.floor(i / 5) * 50;
        return `${x}% ${y}%`;
    }).join(', ');
    const backgroundRepeats = Array(numImages).fill('no-repeat').join(', ');

    return {
        backgroundImage: imageUrls,
        backgroundSize: backgroundSizes,
        backgroundPosition: backgroundPositions,
        backgroundRepeat: backgroundRepeats,
        backgroundColor: '#f0f0f0'
    };
});

const generateShareImage = async (item, mode = 'share') => {
    if (!item || !item.title) return;

    const container = document.createElement('div');
    container.style.width = '750px';
    container.style.backgroundColor = '#f9f7f5'; // 柔和的米白色背景
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'flex-start';
    container.style.padding = '50px'; // 增加内边距
    container.style.boxSizing = 'border-box';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.borderRadius = '12px'; // 更大的圆角
    container.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'; // 更柔和的阴影
    container.style.fontFamily = '"Helvetica Neue", Arial, sans-serif'; // 优雅的字体

    // 添加艺术装饰元素
    const artDecoTop = document.createElement('div');
    artDecoTop.style.width = '100%';
    artDecoTop.style.height = '4px';
    artDecoTop.style.backgroundColor = '#d4b996'; // 金色装饰线
    artDecoTop.style.marginBottom = '30px';
    artDecoTop.style.borderRadius = '2px';
    container.appendChild(artDecoTop);

    if (item.imageUrl || item.coverUrl) {
        const imgContainer = document.createElement('div');
        imgContainer.style.width = '100%';
        imgContainer.style.marginBottom = '30px';
        imgContainer.style.borderRadius = '8px';
        imgContainer.style.overflow = 'hidden';
        imgContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';

        const img = document.createElement('img');
        img.src = item.imageUrl || item.coverUrl;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.objectFit = 'cover';

        imgContainer.appendChild(img);
        container.appendChild(imgContainer);
    }

    // 标题容器添加背景和边框
    const titleContainer = document.createElement('div');
    titleContainer.style.width = '100%';
    titleContainer.style.padding = '20px';
    titleContainer.style.backgroundColor = '#ffffff'; // 纯白背景
    titleContainer.style.borderRadius = '8px';
    titleContainer.style.marginBottom = '25px';
    titleContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
    titleContainer.style.borderLeft = '4px solid #d4b996'; // 金色装饰条

    const title = document.createElement(item.titleFontTag || 'h2');
    title.textContent = item.title;
    title.style.fontSize = mode === 'share' ? '42px' : '36px';
    title.style.fontWeight = '600'; // 中等粗体
    title.style.textAlign = 'left';
    title.style.margin = '0';
    title.style.color = '#3a3a3a'; // 深灰替代纯黑
    title.style.lineHeight = '1.3';
    title.style.letterSpacing = '-0.5px'; // 紧凑字距
    titleContainer.appendChild(title);
    container.appendChild(titleContainer);

    if (item.description) {
        const description = document.createElement('div');
        description.textContent = item.description;
        description.style.fontSize = mode === 'share' ? '30px' : '24px';
        description.style.textAlign = 'left';
        description.style.color = '#5c5c5c'; // 中灰色
        description.style.lineHeight = '1.6';
        description.style.whiteSpace = 'pre-wrap';
        description.style.padding = '0 10px';
        description.style.fontFamily = '"Georgia", serif'; // 优雅衬线字体
        container.appendChild(description);
    }

    // 添加底部水印
    const watermark = document.createElement('div');
    watermark.style.width = '100%';
    watermark.style.textAlign = 'center';
    watermark.style.marginTop = '30px';
    watermark.style.paddingTop = '20px';
    watermark.style.borderTop = '1px solid #eae6e0'; // 柔和的边框
    watermark.style.color = '#a0a0a0'; // 浅灰色
    watermark.style.fontSize = '24px';
    watermark.textContent = 'Personal Museum · 数字艺术收藏';
    container.appendChild(watermark);

    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#f9f7f5',
            scale: 2 // 更高分辨率
        });

        const imageDataUrl = canvas.toDataURL('image/png');

        if (mode === 'share') {
            shareOverlayImageUrl.value = imageDataUrl;
            isShareOverlayVisible.value = true;
        } else if (mode === 'download') {
            downloadImageUrl.value = imageDataUrl;
            isDownloadOverlayVisible.value = true;
        }

    } catch (error) {
        console.error('生成图片失败:', error);
        alert('生成图片失败，请稍后再试。');
    } finally {
        document.body.removeChild(container);
    }
};

// --- downloadImage 方法：生成并显示图片浮层 ---
/*
const downloadImage = async (item) => {
    const tempShareContent = document.createElement('div');
    tempShareContent.style.width = '750px'; // 小红书推荐尺寸宽度
    tempShareContent.style.backgroundColor = '#f8f8f8';
    tempShareContent.style.display = 'flex';
    tempShareContent.style.flexDirection = 'column';
    tempShareContent.style.alignItems = 'center';
    tempShareContent.style.padding = '40px';
    tempShareContent.style.boxSizing = 'border-box';
    tempShareContent.style.position = 'absolute'; // 隐藏在屏幕外，用于渲染
    tempShareContent.style.left = '-9999px';
    tempShareContent.style.top = '-9999px';
    tempShareContent.style.borderRadius = '8px';
    tempShareContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.style.width = '600px'; // 图片在卡片内的最大宽度
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.marginBottom = '20px';
    tempShareContent.appendChild(img);

    const title = document.createElement('h3');
    title.textContent = item.title;
    title.style.fontSize = '36px'; // 适当的字体大小
    title.style.fontWeight = 'bold';
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';
    title.style.color = '#333';
    tempShareContent.appendChild(title);

    if (item.description) {
        const description = document.createElement('p');
        description.textContent = item.description;
        description.style.fontSize = '24px';
        description.style.textAlign = 'left';
        description.style.color = '#f8f8f8';
        description.style.lineHeight = '1.4';
        tempShareContent.appendChild(description);
    }

    document.body.appendChild(tempShareContent);

    try {
        const canvas = await html2canvas(tempShareContent, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#f8f8f8',
        });
        downloadImageUrl.value = canvas.toDataURL('image/png');
        isDownloadOverlayVisible.value = true; // 显示浮层
    } catch (error) {
        console.error('生成图片失败:', error);
        alert('生成下载图片失败，请稍后再试。');
    } finally {
        document.body.removeChild(tempShareContent); // 移除临时创建的DOM元素
    }
}; */

const closeDownloadOverlay = () => {
    isDownloadOverlayVisible.value = false;
    downloadImageUrl.value = '';
};

// Existing functions below...
const isShareOverlayVisible = ref(false); // Controls visibility of the share image overlay
const shareOverlayImageUrl = ref('');
/*
const shareToXiaohongshu = async () => {
    if (!exhibit.value || !exhibit.value.title) return;

    const shareContent = document.createElement('div');
    shareContent.style.width = '750px';
    shareContent.style.height = '1334px'; // Xiaohongshu recommended aspect ratio
    shareContent.style.backgroundColor = '#f8f8f8';
    shareContent.style.display = 'flex';
    shareContent.style.flexDirection = 'column';
    shareContent.style.alignItems = 'center';
    shareContent.style.justifyContent = 'center';
    shareContent.style.padding = '40px';
    shareContent.style.boxSizing = 'border-box';
    shareContent.style.position = 'absolute';
    shareContent.style.left = '-9999px'; // Render off-screen for html2canvas
    shareContent.style.top = '-9999px';

    if (exhibit.value.coverUrl) {
        const img = document.createElement('img');
        img.src = exhibit.value.coverUrl;
        img.style.width = '600px';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        img.style.marginBottom = '20px';
        shareContent.appendChild(img);
    }

    const title = document.createElement('h1');
    title.textContent = exhibit.value.title;
    title.style.fontSize = '48px';
    title.style.fontWeight = 'bold';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.color = '#333';
    shareContent.appendChild(title);

    const description = document.createElement('p');
    description.textContent = exhibit.value.description;
    description.style.fontSize = '32px';
    description.style.textAlign = 'left';
    description.style.color = '#666';
    description.style.lineHeight = '1.5';
    // Add some basic styling for description overflow if it's too long
    description.style.maxHeight = '300px'; // Limit description height
    description.style.overflowY = 'auto'; // Add scroll if content overflows
    shareContent.appendChild(description);

    document.body.appendChild(shareContent);

    try {
        const canvas = await html2canvas(shareContent, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#f8f8f8',
        });
        const image = canvas.toDataURL('image/png');

        // --- MODIFIED PART ---
        shareOverlayImageUrl.value = image;
        isShareOverlayVisible.value = true;
        // alert('图片已生成。请右键或长按保存图片，并手动打开小红书进行分享！'); // Optional alert
        // --- END MODIFIED PART ---

    } catch (error) {
        console.error('生成图片失败:', error);
        alert('生成分享图片失败，请稍后再试。');
    } finally {
        document.body.removeChild(shareContent);
    }
};*/

// New function to close the share overlay
const closeShareOverlay = () => {
    isShareOverlayVisible.value = false;
    shareOverlayImageUrl.value = '';
};


const handleScroll = throttle(() => {
    if (!hasMore.value || isLoading.value) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const fullHeight = document.body.scrollHeight;

    if (scrollTop + windowHeight >= fullHeight - 300) {
        page.value++;
        fetchExhibitItems(exhibitId, true);
    }
}, 300);

const shareUrl = ref('');
const canUseDOM = typeof window !== 'undefined';

onMounted(async () => {
    // 设置分享 URL
    if (process.client) {
        shareUrl.value = window.location.href
        window.addEventListener('scroll', handleScroll)
    }

    // 初始化 lightGallery
    await nextTick()
    if (galleryContainer.value) {
        if (galleryInstance.value) {
            galleryInstance.value.destroy(true)
        }
        galleryInstance.value = lightGallery(galleryContainer.value, {
            selector: '.lg-trigger',
            plugins: [lgZoom, lgThumbnail],
            speed: 300,
            download: false,
            hash: false,
            closable: true
        })
    }

    // 检查收藏状态
    await checkFavoriteStatus()
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    if (galleryInstance.value) {
        galleryInstance.value.destroy();
    }
});

const toggleFavorite = async () => {
    try {
        if (!$auth.isLoggedIn.value) {
            navigateTo('/login');
            return;
        }

        isFavorited.value = !isFavorited.value;

        const { data, error } = await useFetch(`/api/exhibit/favorite/${exhibitId}`, {
            method: 'POST',
            body: { favorited: isFavorited.value, user: $auth.user.value?.id }
        });

        if (error.value) {
            console.error('收藏操作失败:', error.value);
            isFavorited.value = !isFavorited.value;
            alert('收藏操作失败，请稍后再试。');
            return;
        }

        alert(isFavorited.value ? '已添加到收藏' : '已从收藏中移除');
    } catch (err) {
        console.error('收藏操作异常:', err);
        isFavorited.value = !isFavorited.value;
        alert('收藏操作异常，请稍后再试。');
    }
};

const checkFavoriteStatus = async () => {
    try {
        if (!$auth.isLoggedIn.value || !exhibit.value.id || !$auth.user.value?.id) {
            isFavorited.value = false;
            return;
        }

        const { data, error } = await useFetch(`/api/exhibit/favorite/status`, {
            method: 'POST',
            body: { id: exhibitId, user: $auth.user.value.id }
        });

        if (error.value) {
            console.error('获取收藏状态失败:', error.value);
            isFavorited.value = false;
            return;
        }

        isFavorited.value = data.value?.favorited || false;
    } catch (err) {
        console.error('获取收藏状态异常:', err);
        isFavorited.value = false;
    }
};




const copyLink = async () => {
    try {
        let finalShareUrl = window.location.href;

        if (exhibit.value.privacy === 'private') {
            if (!$auth.user.value || $auth.user.value.id !== exhibit.value.author) {
                alert('只有项目作者可以生成私有分享链接');
                return;
            }
            const { data, error } = await useFetch(`/api/share`, {
                method: 'POST',
                body: {
                    exhibit_id: exhibitId,
                    user_id: $auth.user.value.id
                },
                key: `generated-invite-link-${exhibitId}-${$auth.user.value.id}`,
            });

            if (error.value || !data.value?.shareLink) {
                console.error('获取分享链接失败:', error.value);
                alert('获取分享链接失败，请稍后再试');
                return;
            }
            finalShareUrl = data.value.shareLink;
        }
        await navigator.clipboard.writeText(finalShareUrl);
        alert('分享链接已复制到剪贴板');
    } catch (err) {
        console.error('复制分享链接失败:', err);
        alert('复制分享链接失败，请手动复制');
    }
    isShareMenuOpen.value = false;
};

const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`;
    window.open(url, '_blank');
};

const shareToTwitter = () => {
    const text = `查看这个精彩展览: ${exhibit.value.title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl.value)}`;
    window.open(url, '_blank');
};

const toggleShareMenu = () => {
    isShareMenuOpen.value = !isShareMenuOpen.value;
};

</script>

<style scoped>
.lg-caption {
    color: white;
    text-align: left;
    padding: 10px;
}

/* 确保图片加载动画的高度一致性 */
.w-full.h-full.object-cover {
    /* 当图片未加载时，确保占位符有高度 */
    min-height: 200px;
    /* 或者根据你的设计调整 */
}

.aspect-video {
    aspect-ratio: 16 / 9;
    /* 使网格模式下的图片保持宽屏比例 */
    height: auto;
    /* 允许高度根据比例自动调整 */
}
</style>