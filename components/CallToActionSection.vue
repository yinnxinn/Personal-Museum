<template>
  <section class="bg-gray-800 text-white py-12 md:py-16 lg:py-20 px-4 text-center">
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
      {{ $t('cta_section.title') }}
    </h2>
    <p class="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto">
      {{ $t('cta_section.subtitle') }}
    </p>
    <NuxtLink to="/exhibit/create"
              class="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition duration-300 ease-in-out shadow-lg">
      {{ $t('cta_section.create_button') }}
    </NuxtLink>
  </section>
</template>

<script setup>
// 可以在这里添加组件特有的逻辑
</script>

<style scoped>
/* 可以在这里添加组件特有的样式 */
</style>