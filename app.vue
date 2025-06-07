<template>
  <div class="min-h-screen flex flex-col"> <AppHeader class="fixed top-0 left-0 w-full z-50 bg-white shadow-md" />
    <div class="flex-grow flex flex-col"> <NuxtRouteAnnouncer />
      <NuxtPage />
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '~/components/AppHeader.vue'; // 导入 AppHeader 组件
import AppFooter from '~/components/AppFooter.vue'; // 导入 AppHeader 组件
import '@fortawesome/fontawesome-svg-core/styles.css';
</script>

<!-- <NuxtWelcome /> -->
