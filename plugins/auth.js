import { defineNuxtPlugin,  useSupabaseClient } from '#imports'
// import { ref, computed } from 'vue'

// export default defineNuxtPlugin((nuxtApp) => {
//   const supabase = useSupabaseClient()
//   const user = useSupabaseUser()
//   const isLoading = ref(true)
//   const authError = ref(null)

//   // 计算属性：用户是否已登录
//   const isLoggedIn = computed(() => !!user.value)

//   // 登录方法
//   const login = async (email, password) => {
//     authError.value = null
//     isLoading.value = true
//     try {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       })
//       if (error) throw error
//       return { success: true }
//     } catch (error) {
//       authError.value = error.message
//       return { success: false, error: error.message }
//     } finally {
//       isLoading.value = false
//     }
//   }

//   // 注册方法
//   const register = async (email, password) => {
//     authError.value = null
//     isLoading.value = true
//     try {
//       const { error } = await supabase.auth.signUp({
//         email,
//         password
//       })
//       if (error) throw error
//       return { success: true }
//     } catch (error) {
//       authError.value = error.message
//       return { success: false, error: error.message }
//     } finally {
//       isLoading.value = false
//     }
//   }

//   // 登出方法
//   const logout = async () => {
//     authError.value = null
//     try {
//       const { error } = await supabase.auth.signOut()
//       if (error) throw error
//       return { success: true }
//     } catch (error) {
//       authError.value = error.message
//       return { success: false, error: error.message }
//     }
//   }

//   // 初始化时检查登录状态
//   const checkAuthState = async () => {
//     isLoading.value = true
//     try {
//       const { data, error } = await supabase.auth.getSession()
//       if (error) throw error
//       // Supabase 客户端会自动更新 user 值，因为 useSupabaseUser 是响应式的
//     } catch (error) {
//       console.error('Auth state check failed:', error.message)
//       authError.value = error.message
//     } finally {
//       isLoading.value = false
//     }
//   }

//   // 初始检查
//   // 注意：在服务端渲染（SSR）中，useSupabaseUser 会在 hydration 之前设置好初始值。
//   // 对于客户端导航，这个 checkAuthState 可能会在首次渲染后触发，但通常 useSupabaseUser 已经处理了。
//   // 保持它在这里是安全的，因为它会更新 isLoading 状态。
//   checkAuthState()

//   // 监听认证状态变化
//   supabase.auth.onAuthStateChange((event, session) => {
//     console.log('Auth state changed:', event)
//     // 可以在这里处理不同的认证事件
//     // user composable will automatically update with the new session.user
//   })

//   // 提供给全局的认证对象
//   const auth = {
//     user,
//     isLoggedIn,
//     isLoading,
//     authError,
//     login,
//     register,
//     logout,
//     checkAuthState
//   }

//   // 将认证对象提供给应用
//   // 这是在 Nuxt 3 中访问插件功能的标准方式
//   nuxtApp.provide('auth', auth)

//   // 移除以下行，因为它导致了错误
//   // nuxtApp.vueApp.config.globalProperties.$auth = auth
// })


import { useState, useNuxtApp, useRuntimeConfig } from '#imports'
import { ref, computed, onMounted } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 useNuxtApp 获取 Nuxt 上下文
  const supabase = useSupabaseClient()

  // 使用 useState 缓存全局认证状态
  const authState = useState('supabase-auth', () => ({
    user: null,
    isLoading: true,
    authError: null,
    initialized: false,
  }))

  // 计算属性：用户是否已登录
  const isLoggedIn = computed(() => !!authState.value.user)

  // 初始化认证状态
  const initializeAuth = async () => {
    if (process.server || authState.value.initialized) return // 跳过服务器端或已初始化

    authState.value.isLoading = true
    authState.value.authError = null

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      authState.value.user = data.session?.user || null
    } catch (error) {
      console.error('Auth initialization failed:', error.message)
      authState.value.authError = error.message
      authState.value.user = null
    } finally {
      authState.value.isLoading = false
      authState.value.initialized = true
    }
  }

  // 登录方法
  const login = async (email, password) => {
    authState.value.authError = null
    authState.value.isLoading = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      authState.value.user = data.user
      return { success: true }
    } catch (error) {
      authState.value.authError = error.message
      return { success: false, error: error.message }
    } finally {
      authState.value.isLoading = false
    }
  }

  // 注册方法
  const register = async (email, password) => {
    authState.value.authError = null
    authState.value.isLoading = true
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      authState.value.user = data.user
      return { success: true }
    } catch (error) {
      authState.value.authError = error.message
      return { success: false, error: error.message }
    } finally {
      authState.value.isLoading = false
    }
  }

  // 登出方法
  const logout = async () => {
    authState.value.authError = null
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      authState.value.user = null
      return { success: true }
    } catch (error) {
      authState.value.authError = error.message
      return { success: false, error: error.message }
    }
  }

  // 监听认证状态变化（仅在客户端运行）
  if (process.client && !authState.value.initialized) {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event)
      authState.value.authError = null
      authState.value.user = session?.user || null
      if (event === 'INITIAL_SESSION') {
        authState.value.isLoading = false
        authState.value.initialized = true
      }
    })

    // 触发初始检查
    initializeAuth()
  }

  // 提供给全局的认证对象
  const auth = {
    user: computed(() => authState.value.user),
    isLoggedIn,
    isLoading: computed(() => authState.value.isLoading),
    authError: computed(() => authState.value.authError),
    login,
    register,
    logout,
    checkAuthState: initializeAuth,
  }

  // 提供给 Nuxt 应用
  nuxtApp.provide('auth', auth)

  // return {
  //   provide: {
  //     auth,
  //   },
  // }
})