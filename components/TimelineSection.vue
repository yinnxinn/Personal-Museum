<template>
  <section class="py-12 md:py-16 lg:py-20 px-4 max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10 text-gray-900">
      {{ $t('timeline_section.title') }}
    </h2>
    <p class="text-lg text-center text-gray-600 mb-12">
      {{ $t('timeline_section.subtitle') }}
    </p>

    <div class="relative">
      <div class="absolute left-1/2 transform -translate-x-1/2 w-1 bg-blue-200 h-full hidden md:block"></div>

      <div class="space-y-12 md:space-y-0">
        <div v-for="(event, index) in events" :key="index"
             class="flex items-center w-full relative"
             :class="{ 'md:flex-row-reverse': index % 2 !== 0 }">
          <div class="w-full md:w-1/2 px-4"
               :class="{ 'md:pr-8 md:text-right': index % 2 === 0, 'md:pl-8 md:text-left': index % 2 !== 0 }">
            <h3 class="text-xl font-semibold text-gray-800">{{ $t(event.titleKey) }}</h3>
            <p class="text-gray-600 text-sm">{{ $t(event.dateKey) }}</p>
            <p class="text-gray-700 mt-2">{{ $t(event.descriptionKey) }}</p>

            <div v-if="event.associatedExhibits && event.associatedExhibits.length > 0" class="mt-6">
              <h4 class="text-md font-semibold text-gray-700 mb-3">
                {{ $t('timeline_section.associated_exhibits_title') || 'Associated Exhibits' }}
              </h4>
              <div class="grid gap-4"
                   :class="{
                     'md:grid-cols-1': event.associatedExhibits.length === 1,
                     'md:grid-cols-2': event.associatedExhibits.length === 2,
                     'md:grid-cols-3': event.associatedExhibits.length >= 3,
                     'grid-cols-2': event.associatedExhibits.length >= 2, /* Mobile */
                     'grid-cols-1': event.associatedExhibits.length === 1, /* Mobile */
                   }">
                <NuxtLink v-for="exhibit in event.associatedExhibits" :key="exhibit.id"
                          :to="exhibit.link"
                          class="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                  <img :src="exhibit.imageUrl || '/avatar.png'" :alt="exhibit.title"
                       class="w-full h-32 object-cover object-center transform group-hover:scale-105 transition-transform duration-300">
                  <div class="p-3">
                    <p class="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">{{ exhibit.title }}</p>
                    <p v-if="exhibit.authorUsername" class="text-xs text-gray-500 mt-1">
                      {{ $t('timeline_section.author') }}: {{ exhibit.authorUsername }}
                    </p>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="z-10 flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white
                       absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>

          <div class="hidden md:block w-1/2 px-4"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  events: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => value.every(event =>
      typeof event.titleKey === 'string' &&
      typeof event.dateKey === 'string' &&
      typeof event.descriptionKey === 'string' &&
      // Add validation for associatedExhibits
      (Array.isArray(event.associatedExhibits) && event.associatedExhibits.every(exhibit =>
        typeof exhibit.id === 'string' &&
        typeof exhibit.title === 'string' &&
        typeof exhibit.link === 'string' &&
        typeof exhibit.imageUrl === 'string' // Ensure imageUrl is expected
      ))
    )
  }
});
</script>

<style scoped>
/* 移动端 (小于 md 尺寸) 样式 */
@media (max-width: 767px) {
  .space-y-12 > div {
    /* 每个事件项在移动端垂直堆叠，并为左侧的圆圈和线留出空间 */
    flex-direction: column;
    align-items: flex-start;
    padding-left: 40px; /* 为左侧的圆圈和线留出空间 */
  }

  .space-y-12 > div > div:first-child {
    /* 内容 div 占据全部宽度，文本左对齐 */
    width: 100%;
    padding-left: 0;
    padding-right: 0;
    text-align: left;
  }

  .space-y-12 > div > .z-10 {
    /* 圆圈图标在移动端定位到左侧 */
    position: absolute;
    left: 0; /* 距离父元素左侧 0 */
    top: 0; /* 距离父元素顶部 0 */
    transform: translateY(10px); /* 微调垂直位置，使其与文本顶部对齐 */
    margin-left: 0; /* 重置可能存在的 margin */
  }

  .space-y-12 > div::before {
    /* 移动端垂直线段 */
    content: '';
    position: absolute;
    left: 15px; /* 与圆圈中心对齐 */
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #bfdbfe; /* Tailwind blue-200 */
    z-index: 0;
  }

  /* 调整第一项和最后一项的线段，使其从圆圈中心开始/结束 */
  .space-y-12 > div:first-child::before {
    top: 15px;
  }

  .space-y-12 > div:last-child::before {
    bottom: 15px;
  }
}
</style>