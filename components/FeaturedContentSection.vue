<template>
  <section class="py-12 md:py-16 lg:py-20 px-4 max-w-7xl mx-auto">
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10 text-gray-900">
      {{ $t('featured_sections.title') }}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      <FeaturedCard v-for="(card, index) in cards" :key="index" :item="card" />
    </div>
  </section>
</template>

<script setup>
import FeaturedCard from './FeaturedCard.vue';

const props = defineProps({
  cards: {
    type: Array,
    required: true,
    default: () => [],
    validator: (value) => {
      return value.every(card =>
        typeof card.image === 'string' &&
        typeof card.titleKey === 'string' &&
        typeof card.descriptionKey === 'string' &&
        typeof card.link === 'string' &&
        typeof card.buttonTextKey === 'string'
      );
    }
  }
});
</script>

<style scoped>
/* 可以在这里添加组件特有的样式 */
</style>