export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $auth } = useNuxtApp();
  
  // 公共路由列表（使用更简单的匹配方式）
  const publicRoutes = [
    '/',
    '/en',
    '/en/',
    '/about',
    '/en/about',
    '/explore',
    '/en/explore',
    '/exhibit',
    '/en/exhibit',
    '/search',
    '/en/search',
    '/login', // 添加登录页，避免循环重定向
    '/en/login'
  ];


  
  // 检查是否为公共路由或子路由
  const isPublicRoute = publicRoutes.some(route => 
    to.path === route || to.path.startsWith(`${route}/`)
  );

  // 检查路由是否需要认证
  const requiresAuth = to.meta.requiresAuth !== false; // 默认为需要认证

  // console.log('中间件触发:', to.path, !$auth.isLoggedIn.value, requiresAuth, isPublicRoute);


  if (!$auth.isLoggedIn.value && requiresAuth && !isPublicRoute) {
    console.log('重定向到登录页');
    return navigateTo('/login');
  }
});