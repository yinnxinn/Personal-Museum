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
                <button v-if="canShare" @click="shareToXiaohongshu" class="hover:text-blue-700 transition">
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

        <div v-if="exhibit.datas.length" class="bg-white rounded-lg overflow-hidden p-4" ref="galleryContainer">
            <div :class="{
                'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4': displayMode === 'grid',
                '': displayMode === 'list' // No specific grid classes for list mode, handled by flex below
            }">
                <div v-for="(item, index) in exhibit.datas" :key="item.id" :class="{
                    'flex flex-col md:flex-row items-center my-8': displayMode === 'list',
                    'md:flex-row-reverse': displayMode === 'list' && index % 2 !== 0,
                    'flex flex-col items-center justify-center': displayMode === 'grid' // Adjust for grid items
                }">
                    <div :class="{
                        'md:w-1/2 w-full p-4': displayMode === 'list',
                        'w-full': displayMode === 'grid' // Full width in grid item
                    }">
                        <a :href="item.imageUrl" class="block rounded-lg overflow-hidden shadow-lg lg-trigger"
                            :data-lg-size="`${item.width || 1600}-${item.height || 1067}`"
                            :data-sub-html="`<div class='lg-caption'><h4>${item.title}</h4><p>${item.description || ''}</p></div>`">
                            <div class="relative w-full h-full" :class="{ 'min-h-[200px]': displayMode === 'grid' }">
                                <div v-if="!item.loaded" class="w-full h-[300px] bg-gray-200 animate-pulse rounded">
                                </div>
                                <img v-show="item.loaded" :src="item.imageUrl" :alt="item.title"
                                    class="w-full h-full object-cover cursor-pointer"
                                    :class="{ 'aspect-video': displayMode === 'grid' }" @load="item.loaded = true" />
                            </div>
                        </a>
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
            </div>
        </div>

        <div v-if="isLoading" class="text-center py-6">
            <p class="text-lg text-gray-500 animate-pulse">加载中，请稍候...</p>
        </div>

        <div v-else-if="!exhibit.datas.length" class="text-center py-12">
            <p class="text-xl text-gray-600">展品尚未加载或未找到内容。</p>
        </div>
    </div>


</template>


<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, nextTick, computed } from 'vue'; // 引入 computed
import lightGallery from 'lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import html2canvas from 'html2canvas';
const { $auth } = useNuxtApp()

const route = useRoute();
const exhibitId = route.params.id;
const exhibit = ref({
    title: '',
    cover: '',
    description: '',
    datas: []
});

useSeoMeta({
    title: () => exhibit.value.title || '数字博物馆',
    ogTitle: () => exhibit.value.title || '数字博物馆',
    description: () => exhibit.value.description?.slice(0, 150) || '一个精彩的数字展览，欢迎来参观！',
    ogDescription: () => exhibit.value.description?.slice(0, 150) || '一个精彩的数字展览，欢迎来参观！',
    ogImage: () => exhibit.value.coverUrl || '/default-cover.jpg',
    twitterCard: 'summary_large_image'
})

const showFullDescription = ref(false);
const shouldShowToggle = ref(true);
const page = ref(1);
const pageSize = 8;
const isLoading = ref(false);
const hasMore = ref(true);
const galleryInstance = ref(null);
const galleryContainer = ref(null);

// 添加收藏状态管理
const isFavorited = ref(false);
const isShareMenuOpen = ref(false);

// 新增：显示模式
const displayMode = ref('list'); // 'list' 为参观模式，'grid' 为快速浏览模式

const canShare = computed(() => {
    return exhibit.value.privacy !== 'private' && $auth.isLoggedIn.value && $auth.user.value?.id === exhibit.value.author;
});

// 新增：动态背景图样式
const dynamicCoverStyle = computed(() => {
    if (!exhibit.value.datas || exhibit.value.datas.length === 0) {
        // 如果没有数据，可以使用默认背景图或者不显示背景
        return { backgroundImage: 'url(/bg.jpg)' }; // 保持原有默认背景
    }

    // 随机选择10张图片，或者更少如果数据不足
    const numImages = Math.min(10, exhibit.value.datas.length);
    const selectedImages = [];
    const availableIndices = Array.from({ length: exhibit.value.datas.length }, (_, i) => i);

    for (let i = 0; i < numImages; i++) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        selectedImages.push(exhibit.value.datas[availableIndices[randomIndex]].imageUrl);
        availableIndices.splice(randomIndex, 1); // 移除已选中的索引，避免重复
    }

    // 构建多层背景图的CSS字符串
    // 这里使用一个简单的平铺网格布局示例，你可以根据需要调整 position/size/repeat
    // 例如，均匀分布在背景上
    const imageUrls = selectedImages.map(url => `url(${url})`).join(', ');
    const backgroundSizes = Array(numImages).fill('20%').join(', '); // 每张图片占据20%宽度，以便平铺
    const backgroundPositions = selectedImages.map((_, i) => {
        const x = (i % 5) * 20; // 5列
        const y = Math.floor(i / 5) * 50; // 2行
        return `${x}% ${y}%`;
    }).join(', ');
    const backgroundRepeats = Array(numImages).fill('no-repeat').join(', '); // 不重复

    return {
        backgroundImage: imageUrls,
        backgroundSize: backgroundSizes,
        backgroundPosition: backgroundPositions,
        backgroundRepeat: backgroundRepeats,
        // fallback or additional styles if needed
        backgroundColor: '#f0f0f0' // 备用背景色
    };
});

const shareToXiaohongshu = async () => {
    if (!exhibit.value) return;

    const shareContent = document.createElement('div');
    shareContent.style.width = '750px'; // 小红书推荐图片宽度
    shareContent.style.height = '1334px'; // 小红书推荐图片高度
    shareContent.style.backgroundColor = '#f8f8f8';
    shareContent.style.display = 'flex';
    shareContent.style.flexDirection = 'column';
    shareContent.style.alignItems = 'center';
    shareContent.style.justifyContent = 'center';
    shareContent.style.padding = '40px';
    shareContent.style.boxSizing = 'border-box';
    shareContent.style.position = 'absolute'; // 隐藏在屏幕外
    shareContent.style.left = '-9999px';
    shareContent.style.top = '-9999px';

    // 添加封面图片
    if (exhibit.value.coverUrl) {
        const img = document.createElement('img');
        img.src = exhibit.value.coverUrl;
        img.style.width = '600px';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        img.style.marginBottom = '20px';
        shareContent.appendChild(img);
    }

    // 添加标题
    const title = document.createElement('h1');
    title.textContent = exhibit.value.title;
    title.style.fontSize = '48px';
    title.style.fontWeight = 'bold';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.color = '#333';
    shareContent.appendChild(title);

    // 添加描述
    const description = document.createElement('p');
    description.textContent = exhibit.value.description;
    description.style.fontSize = '32px';
    description.style.textAlign = 'left';
    description.style.color = '#666';
    description.style.lineHeight = '1.5';
    shareContent.appendChild(description);

    document.body.appendChild(shareContent);

    try {
        const canvas = await html2canvas(shareContent, {
            useCORS: true, // 如果图片是跨域的，需要设置此项
            allowTaint: true, // 允许污染画布，如果图片是跨域的，可能需要
            backgroundColor: '#f8f8f8', // 设置背景色，防止透明
        });
        const image = canvas.toDataURL('image/png');

        // 提供下载
        const link = document.createElement('a');
        link.href = image;
        link.download = `PersonalMuseum_${exhibit.value.title}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert('图片已生成并下载。请手动打开小红书，选择此图片进行分享！');
    } catch (error) {
        console.error('生成图片失败:', error);
        alert('生成分享图片失败，请稍后再试。');
    } finally {
        document.body.removeChild(shareContent);
    }
};


const fetchExhibitData = async (id, append = false) => {
    try {
        isLoading.value = true;
        const { data, error } = await useFetch(`/api/exhibit/${id}?page=${page.value}&pageSize=${pageSize}`);

        if (error.value) {
            console.error('获取展品数据失败:', error.value);
            return;
        }

        if (data.value?.exhibit) {
            if (!append) {
                console.log(data.value, '23423423')
                exhibit.value.author = data.value.exhibit.author;
                exhibit.value.privacy = data.value.exhibit.privacy;
                exhibit.value.title = data.value.exhibit.title;
                exhibit.value.coverUrl = data.value.exhibit.coverUrl;
                exhibit.value.description = data.value.exhibit.description;
                exhibit.value.datas = []; // 重置数据以便首次加载或非追加模式
                shouldShowToggle.value = data.value.exhibit.description?.length > 150;
            }
            const newItems = data.value.exhibit.datas?.map(item => ({ ...item, loaded: false })) || [];
            if (newItems.length < pageSize) hasMore.value = false;
            exhibit.value.datas.push(...newItems);

            // 在数据加载后更新动态背景
            // 首次加载或非追加模式下，确保数据可用再生成背景
            if (!append || page.value === 1) { // 确保只在初始数据加载或刷新时更新背景
                // 由于 dynamicCoverStyle 是 computed 属性，它会在 exhibit.datas 变化时自动更新
                // 无需手动调用
            }

            await nextTick();
            if (galleryInstance.value) {
                galleryInstance.value.destroy(true);
            }
            if (galleryContainer.value) {
                galleryInstance.value = lightGallery(galleryContainer.value, {
                    selector: '.lg-trigger',
                    plugins: [lgZoom, lgThumbnail],
                    speed: 300,
                    download: false,
                    hash: false,
                    closable: true,
                    // lightGallery 绑定到新元素时需要注意选择器是否准确
                });
            }
        }
    } catch (err) {
        console.error('获取展品数据异常:', err);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await fetchExhibitData(exhibitId);
    window.addEventListener('scroll', handleScroll);
});

// 在组件卸载时移除滚动事件监听器，避免内存泄漏
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    if (galleryInstance.value) {
        galleryInstance.value.destroy();
    }
});

const handleScroll = () => {
    if (!hasMore.value || isLoading.value) return;
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const fullHeight = document.body.scrollHeight;
    if (scrollTop + windowHeight >= fullHeight - 100) {
        page.value++;
        fetchExhibitData(exhibitId, true);
    }
};

// 添加收藏功能
const toggleFavorite = async () => {
    try {
        // 切换收藏状态
        isFavorited.value = !isFavorited.value;

        // 调用API保存收藏状态
        const { data, error } = await useFetch(`/api/exhibit/favorite/${exhibitId}`, {
            method: 'POST',
            body: { favorited: isFavorited.value }
        });

        if (error.value) {
            console.error('收藏操作失败:', error.value);
            // 如果API调用失败，恢复原状态
            isFavorited.value = !isFavorited.value;
            return;
        }

        // 显示成功消息
        alert(isFavorited.value ? '已添加到收藏' : '已从收藏中移除');
    } catch (err) {
        console.error('收藏操作异常:', err);
        // 出错时恢复原状态
        isFavorited.value = !isFavorited.value;
    }
};

// 检查是否已收藏
const checkFavoriteStatus = async () => {
    try {
        const { data, error } = await useFetch(`/api/exhibit/favorite/${exhibitId}/status`);

        if (error.value) {
            console.error('获取收藏状态失败:', error.value);
            return;
        }

        isFavorited.value = data.value?.favorited || false;
    } catch (err) {
        console.error('获取收藏状态异常:', err);
    }
};

// 分享功能
const shareUrl = computed(() => {
    // 获取当前页面的完整URL
    return window.location.href;
});

// 复制链接
const copyLink = async () => {
    try {
        let shareUrl = window.location.href;
        if (exhibit.value.privacy === 'private') {
            if (!$auth.user.value || $auth.user.value.id !== exhibit.value.author) {
                alert('只有项目作者可以分享私有项目');
                return;
            }
            const { data, error } = await useFetch(`/api/share`, { // Endpoint remains /api/share
                method: 'POST', // IMPORTANT: Specify POST method
                body: { // Send data in the request body
                    exhibit_id: exhibitId,
                    user: $auth.user.value.id // Use user_id for clarity
                },
                key: `generated-invite-link-${exhibitId}-${$auth.user.value.id}`, // Unique key for useFetch caching
            });
            if (error.value || !data.value?.shareLink) {
                console.error('获取分享链接失败:', error.value);
                alert('获取分享链接失败，请稍后再试');
                return;
            }
            shareUrl = data.value.shareLink;
        }
        await navigator.clipboard.writeText(shareUrl);
        alert('分享链接已复制到剪贴板');
    } catch (err) {
        console.error('复制分享链接失败:', err);
        alert('复制分享链接失败，请手动复制');
    }
    isShareMenuOpen.value = false;
};

// 社交媒体分享
const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`;
    window.open(url, '_blank');
};

const shareToTwitter = () => {
    const text = `查看这个精彩展览: ${exhibit.value.title}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl.value)}`;
    window.open(url, '_blank');
};

// 更多分享选项
const toggleShareMenu = () => {
    isShareMenuOpen.value = !isShareMenuOpen.value;
};

// 在组件挂载时检查收藏状态
onMounted(() => {
    fetchExhibitData(exhibitId);
    checkFavoriteStatus(); // 添加这一行
    window.addEventListener('scroll', handleScroll);
});
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