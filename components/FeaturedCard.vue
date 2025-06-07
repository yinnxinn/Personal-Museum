<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out overflow-hidden flex flex-col h-full">
    <img :src="item.image" :alt="item.title" class="w-full h-48 object-cover">
    <div class="p-5 flex flex-col flex-grow"> <h3 class="text-xl font-semibold mb-2 text-gray-900">{{ item.titleKey }}</h3>
      <p class="text-gray-600 text-sm mb-4 flex-grow">{{ item.descriptionKey }}</p> <NuxtLink :to="item.link" class="mt-auto inline-block text-blue-600 hover:text-blue-800 font-medium text-sm">
        {{ $t(item.buttonTextKey) }} &rarr;
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        typeof value.image === 'string' &&
        typeof value.titleKey === 'string' &&
        typeof value.descriptionKey === 'string' &&
        typeof value.link === 'string' &&
        typeof value.buttonTextKey === 'string'
      );
    },
  },
});
</script>

<style scoped>
/* 可以在这里添加组件特有的样式，但通常 Tailwind CSS 已经足够 */
</style>