export default defineNuxtRouteMiddleware((to, from) => {
  const { $auth } = useNuxtApp();
  
  // 如果用户未登录且尝试访问需要认证的页面
  if (!$auth.isLoggedIn.value && to.meta.requiresAuth) {
    // 重定向到登录页面
    return navigateTo('/login');
  }
});