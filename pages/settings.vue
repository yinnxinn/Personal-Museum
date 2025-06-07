<template>
    <div class="container mx-auto p-8 mt-10">
        <h1 class="text-3xl font-bold mb-8 text-gray-800">用户设置</h1>

        <div class="space-y-10">
            <section>
                <h2 class="text-xl font-semibold mb-3 text-gray-700">语言偏好</h2>
                <div class="max-w-md">
                    <label for="language-select" class="block text-sm font-medium text-gray-600 mb-1">选择语言</label>
                    <select id="language-select" v-model="userSettings.language"
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="en">English</option>
                        <option value="zh">简体中文</option>
                    </select>
                </div>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 text-gray-700">主题偏好</h2>
                <div class="max-w-md space-y-2">
                    <p class="text-sm text-gray-600 mb-1">选择应用的主题模式</p>
                    <div class="flex items-center">
                        <input id="theme-light" name="theme" type="radio" value="light" v-model="userSettings.theme"
                            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                        <label for="theme-light" class="ml-2 block text-sm text-gray-700">浅色模式</label>
                    </div>
                    <div class="flex items-center">
                        <input id="theme-dark" name="theme" type="radio" value="dark" v-model="userSettings.theme"
                            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                        <label for="theme-dark" class="ml-2 block text-sm text-gray-700">深色模式</label>
                    </div>
                </div>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 text-gray-700">通知设置</h2>
                <div class="max-w-md space-y-3">
                    <div class="relative flex items-start">
                        <div class="flex items-center h-5">
                            <input id="email-notifications" name="email-notifications" type="checkbox"
                                v-model="userSettings.notifications.email"
                                class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="email-notifications" class="font-medium text-gray-700">邮件通知</label>
                            <p class="text-gray-500">接收关于新展品或重要更新的邮件。</p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 text-gray-700">账户管理</h2>
                <div class="max-w-md space-y-3">
                    <button @click="goToChangePassword"
                        class="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md border border-indigo-200">
                        修改密码
                    </button>
                    <button @click="confirmDeleteAccount"
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200">
                        删除账户
                    </button>
                </div>
            </section>

            <div class="mt-12">
                <button @click="saveSettings"
                    class="w-full md:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    保存设置
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const userSettings = ref({
    language: 'zh', // 默认语言
    theme: 'light',   // 默认主题
    notifications: {
        email: true,
    },
});

// Function to apply theme changes
const applyTheme = (theme) => {
    if (process.client) { // Only run this code on the client side
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
};

// Load user settings (usually from API or localStorage)
onMounted(() => {
    // TODO: 实现从API或localStorage加载用户设置的逻辑
    const loadedSettings = localStorage.getItem('userSettings');
    if (loadedSettings) {
        userSettings.value = JSON.parse(loadedSettings);
    }
    console.log('加载用户设置 (模拟)');

    // Apply theme initially once the component is mounted (client-side)
    applyTheme(userSettings.value.theme);
});

// Watch for theme changes and apply them
// This watcher will also only trigger on the client after initial mount
watch(() => userSettings.value.theme, (newTheme) => {
    applyTheme(newTheme);
});

const saveSettings = () => {
    // TODO: 实现保存用户设置到API或localStorage的逻辑
    localStorage.setItem('userSettings', JSON.stringify(userSettings.value)); // Persist to localStorage
    console.log('保存用户设置:', JSON.parse(JSON.stringify(userSettings.value)));
    alert('设置已保存 (模拟)');
};

const goToChangePassword = () => {
    alert('跳转到修改密码页面 (模拟)');
    // router.push('/change-password');
};

const confirmDeleteAccount = () => {
    if (confirm('您确定要删除您的账户吗？此操作无法撤销。')) {
        console.log('用户确认删除账户');
        alert('账户已删除 (模拟)');
        // router.push('/logout');
    }
};

</script>
<style scoped>
/* 你可以添加一些自定义样式 */
</style>