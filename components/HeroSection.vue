<template>
  <section class="relative h-96 md:h-[500px] lg:h-[600px] bg-cover bg-center flex items-center justify-center text-white"
             :style="{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${backgroundImageUrl}')` }">
    <div class="text-center px-4">
      <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
        {{ $t('hero.title') }}
      </h1>
      <p class="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
        {{ $t('hero.subtitle') }}
      </p>
      <NuxtLink to="/explore"
                class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition duration-300 ease-in-out shadow-lg">
        {{ $t('hero.explore_button') }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  backgroundImageUrl: {
    type: String,
    required: true,
    default: '/bg.jpg' // Default fallback
  }
});
</script>

<style scoped>
/* 可以在这里添加组件特有的样式 */
</style>