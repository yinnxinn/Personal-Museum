<template>
  <header class="bg-white shadow-md py-4">
    <nav class="container mx-auto px-4 md:px-2 flex justify-between items-center">
      <NuxtLink :to="localePath('/')" class="flex items-center space-x-2">
        <img src="/favicon.ico" alt="Personal Museum Logo" class="h-10 w-10 rounded-full">
        <span class="text-2xl font-bold text-gray-800">{{ $t('header.app_name') }}</span>
      </NuxtLink>

      <div class="hidden md:flex space-x-6">
        <NuxtLink :to="localePath('/')" class="text-gray-600 hover:text-blue-600 transition duration-300">{{ $t('header.nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/explore')" class="text-gray-600 hover:text-blue-600 transition duration-300">{{ $t('header.nav.explore') }}</NuxtLink>
        <NuxtLink v-if="$auth.isLoggedIn.value" :to="localePath('/exhibit/create')" class="text-gray-600 hover:text-blue-600 transition duration-300">{{ $t('header.nav.create') }}</NuxtLink>
        <NuxtLink :to="localePath('/about')" class="text-gray-600 hover:text-blue-600 transition duration-300">{{ $t('header.nav.about') }}</NuxtLink>
      </div>

      <div class="flex items-center space-x-4">
        <button @click="toggleLocale" class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md hover:bg-blue-600 transition duration-300">
          {{ currentLocale === 'en' ? 'E' : '文' }}
        </button>

        <div v-if="$auth.isLoggedIn.value" class="relative">
          <img :src="$auth.user.value?.user_metadata?.avatar_url || '/avatar.png'" alt="User Avatar" class="h-10 w-10 rounded-full cursor-pointer" @click="toggleUserMenu">
          <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <span class="block px-4 py-2 text-sm text-gray-700 font-semibold truncate">{{ $auth.user.value?.email }}</span>
            <hr class="my-1">
            <NuxtLink :to="localePath('/profile')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{{ $t('header.user_menu.profile') }}</NuxtLink>
            <NuxtLink :to="localePath('/settings')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{{ $t('header.user_menu.settings') }}</NuxtLink>
            <a href="#" @click.prevent="handleLogout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{{ $t('header.user_menu.logout') }}</a>
          </div>
        </div>
        <NuxtLink v-else :to="localePath('/login')" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300">
          {{ $t('header.login_button') }}
        </NuxtLink>

        <button @click="toggleMobileMenu" class="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>
    </nav>

    <div v-if="showMobileMenu" class="md:hidden bg-white shadow-lg py-2">
      <NuxtLink :to="localePath('/')" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">{{ $t('header.nav.home') }}</NuxtLink>
      <NuxtLink :to="localePath('/explore')" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">{{ $t('header.nav.explore') }}</NuxtLink>
      <NuxtLink v-if="$auth.isLoggedIn.value" :to="localePath('/exhibit/create')" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">{{ $t('header.nav.create') }}</NuxtLink>
      <NuxtLink :to="localePath('/about')" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">{{ $t('header.nav.about') }}</NuxtLink>
      <hr class="my-1">
      <template v-if="$auth.isLoggedIn.value">
        <span class="block px-4 py-2 text-gray-800 font-semibold truncate">{{ $auth.user.value?.email }}</span>
        <NuxtLink :to="localePath('/profile')" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">{{ $t('header.user_menu.profile') }}</NuxtLink>
        <NuxtLink :to="localePath('/settings')" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">{{ $t('header.user_menu.settings') }}</NuxtLink>
        <a href="#" @click.prevent="handleLogout" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">{{ $t('header.user_menu.logout') }}</a>
      </template>
      <template v-else>
        <NuxtLink :to="localePath('/login')" class="block px-4 py-2 text-gray-800 hover:bg-gray-100">{{ $t('header.login_button') }}</NuxtLink>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n, useLocalePath, useNuxtApp } from '#imports';
import { useRouter } from 'vue-router';

const { locale, setLocale } = useI18n();
const localePath = useLocalePath();
const { $auth } = useNuxtApp(); // Use the global authentication state

const currentLocale = ref(locale.value);
const showUserMenu = ref(false);
const showMobileMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const handleLogout = async () => {
  const result = await $auth.logout();
  if (result.success) {
    showUserMenu.value = false;
    // Using i18n for messages
    alert($t('header.logout_success_message'));
    // Redirect to home or login page after logout
    // Using router from vue-router for programmatic navigation
    const router = useRouter(); // Ensure useRouter is called inside setup or a function where it's needed
    router.push(localePath('/')); // Use localePath for i18n compatible routing
  } else {
    console.error('Error logging out:', result.error);
    alert($t('header.logout_error_message', { error: result.error }));
  }
};

// Listen for route changes to close mobile menu and user menu
const router = useRouter();
router.afterEach(() => {
  showMobileMenu.value = false;
  showUserMenu.value = false;
});

const toggleLocale = () => {
  const newLocale = currentLocale.value === 'en' ? 'zh' : 'en';
  setLocale(newLocale);
  currentLocale.value = newLocale; // Update local state
};
</script>

<style scoped>
/* You can add custom styles here if needed */
</style>