<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ isLogin ? $t('login.title') : $t('login.register_title') }}
        </h2>
      </div>

      <!-- 登录表单 -->
      <form v-if="isLogin" class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">{{ $t('login.email_label') }}</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                   :placeholder="$t('login.email_placeholder')" v-model="email">
          </div>
          <div>
            <label for="password" class="sr-only">{{ $t('login.password_label') }}</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                   :placeholder="$t('login.password_placeholder')" v-model="password">
          </div>
        </div>

        <div>
          <button type="submit"
                  class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {{ $t('login.login_button') }}
          </button>
        </div>
      </form>

      <!-- 注册表单 -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="register-email-address" class="sr-only">{{ $t('login.email_label') }}</label>
            <input id="register-email-address" name="email" type="email" autocomplete="email" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                   :placeholder="$t('login.email_placeholder')" v-model="email">
          </div>
          <div>
            <label for="register-password" class="sr-only">{{ $t('login.password_label') }}</label>
            <input id="register-password" name="password" type="password" autocomplete="new-password" required
                   class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                   :placeholder="$t('login.password_placeholder')" v-model="password">
          </div>
        </div>

        <div>
          <button type="submit"
                  class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            {{ $t('login.register_button') }}
          </button>
        </div>
      </form>

      <p v-if="error" class="text-red-500 text-center text-sm">{{ error }}</p>

      <div class="text-center text-sm">
        <button @click="toggleForm" class="font-medium text-blue-600 hover:text-blue-500 focus:outline-none">
          {{ isLogin ? $t('login.no_account_prompt') : $t('login.have_account_prompt') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useNuxtApp } from '#imports';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();
const { $auth } = useNuxtApp(); // 使用全局认证状态

const email = ref('');
const password = ref('');
const error = ref(null);
const isLogin = ref(true); // 控制显示登录还是注册表单

// 切换表单函数
const toggleForm = () => {
  isLogin.value = !isLogin.value;
  error.value = null; // 切换时清除错误信息
};

const handleLogin = async () => {
  error.value = null;
  try {
    const result = await $auth.login(email.value, password.value);
    if (result.success) {
      router.push('/');
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = err.message;
  }
};

const handleRegister = async () => {
  error.value = null;
  try {
    const result = await $auth.register(email.value, password.value);
    if (result.success) {
      alert(t('login.registration_success_message'));
      isLogin.value = true; // 注册成功后切换回登录界面
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>