<template>
  <div class="error-container">
    <h1>出错了！</h1>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>抱歉，发生了一个未知错误。</p>
    <NuxtLink to="/">返回首页</NuxtLink>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

const route = useRoute();
const errorMessage = ref('');

onMounted(() => {
  const message = route.query.message;
  if (message) {
    switch (message) {
      case 'join_failed':
        errorMessage.value = '加入项目失败，请检查您的链接或联系管理员。';
        break;
      case 'api_error':
        errorMessage.value = '服务器请求失败，请稍后再试。';
        break;
      // 您可以在这里添加更多错误类型
      default:
        errorMessage.value = `错误信息: ${message}`;
        break;
    }
  }
});
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  padding: 20px;
}

h1 {
  color: #e74c3c;
  margin-bottom: 20px;
}

p {
  font-size: 1.2em;
  margin-bottom: 30px;
}

NuxtLink {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

NuxtLink:hover {
  background-color: #2980b9;
}
</style>