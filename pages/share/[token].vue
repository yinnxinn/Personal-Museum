<template>
  <div>
    <p>正在接收邀请...</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
const { $auth } = useNuxtApp()
const route = useRoute(); // Initialize useRoute
const router = useRouter(); // Initialize useRouter

const token = route.params.token;

// 检查用户是否登录
if (!$auth.isLoggedIn) {
  // 如果未登录，重定向到登录页面，并带上分享链接作为重定向参数
  router.push(`/login?redirect=/share/${token}`);
} else {
  // 如果已登录，处理加入项目的逻辑
  // 这里需要调用后端 API 来验证 token 并将用户加入项目
  // 假设有一个 API 路由 `/api/join-project-by-token`
  onMounted(async () => {
    try {
      const response = await $fetch(`/api/share/${token}?userId=${$auth.user.value.id}`);


      if (response.exhibit_id) {
        // 成功加入项目后，重定向到项目页面
        router.push(`/exhibit/${response.exhibit_id}`); // 假设后端返回 projectId
      } else {
        // 处理加入失败的情况
        console.error('加入项目失败:', response.message);
        // 可以重定向到错误页面或显示错误信息
        router.push('/error?message=join_failed');
      }
    } catch (error) {
      console.error('调用加入项目 API 失败:', error);
      router.push('/error?message=api_error');
    }
  });
}
</script>

<style scoped>
/* 样式 */
</style>