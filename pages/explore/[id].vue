<template>
    <div class="container mx-auto px-4 py-18">
        <div class="hidden md:block bg-[url(/bg.jpg)] bg-local md:bg-fixed md:max-h-[300px] md:overflow-hidden">
            <img :src="exhibit.cover" class="w-full h-full object-cover">
        </div>
        <div class="text-center px-4 py-6 mb-6">
            <!-- 标题 -->
            <h1 class="text-3xl font-semibold text-gray-900 mb-4">{{ exhibit.title }}</h1>

            <!-- 操作图标 -->
            <div class="flex justify-center items-center space-x-6 text-gray-600 text-xl mb-4">
                <button class="hover:text-red-500 transition">
                    <FontAwesomeIcon icon="fa-solid fa-heart" />
                </button>
                <button class="hover:text-blue-500 transition">
                    <FontAwesomeIcon icon="fa-solid fa-link" />
                </button>
                <button class="hover:text-blue-700 transition">
                    <FontAwesomeIcon icon="fa-brands fa-facebook" />
                </button>
                <button class="hover:text-black transition">
                    <FontAwesomeIcon icon="fa-brands fa-x-twitter" />
                </button>
                <button class="hover:text-gray-700 transition">
                    <FontAwesomeIcon icon="fa-share-alt" />
                </button>
                <button class="hover:text-gray-700 transition">
                    <FontAwesomeIcon icon="fa-solid fa-eye" />
                </button>


            </div>

            <!-- 描述内容 -->
            <p class="text-gray-700 text-base leading-relaxed mb-2 px-4 max-w-2xl mx-auto transition-all duration-300 text-left"
                :class="!showFullDescription ? 'line-clamp-3' : ''">
                {{ exhibit.description }}
            </p>

            <!-- 展开/收起 -->
            <div v-if="shouldShowToggle" class="mt-2">
                <button @click="showFullDescription = !showFullDescription"
                    class="text-blue-600 hover:underline text-sm">
                    {{ showFullDescription ? '收起详情' : '展开详情' }}
                </button>
            </div>
        </div>


        <div v-if="exhibit.datas" class="bg-white rounded-lg overflow-hidden">
            <!-- <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                <div v-for="item in exhibit.datas" :key="item.id" class="relative rounded-lg overflow-hidden">
                    <div class="aspect-w-1 aspect-h-1">
                        <img :src="item.imageUrl" :alt="item.title" class="w-full h-full object-cover" />
                        <div class="absolute bottom-0 left-0 px-3 py-2">
                            <p class="text-gray-800 text-sm font-semibold">{{ item.title }}</p>
                        </div>
                    </div>
                </div>
            </div> -->


            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4" ref="gallery">
                <a v-for="item in exhibit.datas" :key="item.id" :href="item.imageUrl"
                    class="relative rounded-lg overflow-hidden" :data-lg-size="'1600-1067'">
                    <div class="aspect-w-1 aspect-h-1">
                        <img :src="item.imageUrl" :alt="item.title" class="w-full h-full object-cover" />
                        <div class="absolute bottom-0 left-0 px-3 py-2">
                            <p class="text-white text-sm font-semibold">{{ item.title }}</p>
                        </div>
                    </div>
                </a>
            </div>

        </div>


        <div v-else class="text-center py-12">
            <p class="text-xl text-gray-600">Loading exhibit or exhibit not found...</p>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import FeaturedCard from '~/components/FeaturedCard.vue';

import lightGallery from 'lightgallery';

// Plugins
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';

// Styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

const gallery = ref(null);


const route = useRoute();
const exhibitId = route.params.id;
const exhibit = ref({
    "title": "title", "cover": "/bg.jpg", "description": "丹麦，全称丹麦王国，是北欧的一个国家，政体为君主立宪制下的议会民主制，首都在哥本哈根，拥有二个自治领地：法罗群岛和格陵兰。由于丹麦和挪威、瑞典有相近的语言、文化和历史，合称为斯堪地那维亚国家。\
丹麦是欧洲联盟成员国，经济高度发达，同时是个典型的福利国家，贫富差距极小，被联合国认定为发达国家。丹麦也是北大西洋公约组织创始会员国之一。\
丹麦政体为君主立宪制下的议会民主制，现任君主是玛格丽特二世女王，中央政府拥有相当大的权力，并负责属地法罗群岛和格陵兰的部分事务。", "datas": []
});
const showFullDescription = ref(false);
const shouldShowToggle = ref(true);

// 模拟数据获取函数
// 在实际应用中，您会从后端 API 或数据库获取数据
const fetchExhibitData = async (id) => {
    // 模拟异步请求
    //   await new Promise(resolve => setTimeout(resolve, 500)); 

    const mockData = {
        '1': {
            id: '1',
            title: 'The Starry Night',
            description: 'A famous oil on canvas painting by Dutch Post-Impressionist painter Vincent van Gogh.',
            imageUrl: '/avatar.png', // 替换为实际图片URL
            artist: 'Vincent van Gogh',
            year: '1889',
            category: 'Painting'
        },
        '2': {
            id: '2',
            title: 'Mona Lisa',
            description: 'A half-length portrait painting by Italian artist Leonardo da Vinci.',
            imageUrl: '/avatar.png', // 替换为实际图片URL
            artist: 'Leonardo da Vinci',
            year: '1503',
            category: 'Painting'
        },
        '3': {
            id: '2',
            title: 'Mona Lisa',
            description: 'A half-length portrait painting by Italian artist Leonardo da Vinci.',
            imageUrl: '/avatar.png', // 替换为实际图片URL
            artist: 'Leonardo da Vinci',
            year: '1503',
            category: 'Painting'
        },
        '4': {
            id: '2',
            title: 'Mona Lisa',
            description: 'A half-length portrait painting by Italian artist Leonardo da Vinci.',
            imageUrl: '/avatar.png', // 替换为实际图片URL
            artist: 'Leonardo da Vinci',
            year: '1503',
            category: 'Painting'
        },
        '5': {
            id: '2',
            title: 'Mona Lisa',
            description: 'A half-length portrait painting by Italian artist Leonardo da Vinci.',
            imageUrl: '/avatar.png', // 替换为实际图片URL
            artist: 'Leonardo da Vinci',
            year: '1503',
            category: 'Painting'
        }
    };

    return mockData;
};

onMounted(async () => {
    exhibit.value.datas = await fetchExhibitData(exhibitId);
    lightGallery(gallery.value, {
        selector: 'a',
        plugins: [lgZoom, lgThumbnail],
        speed: 300,
        download: false,
    });
});
</script>

<style scoped>
/* Add any specific styles for this page here */
</style>