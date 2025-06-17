import { defineNuxtPlugin,  useSupabaseClient } from '#imports'
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
      console.log('333333333')
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