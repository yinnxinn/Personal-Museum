// 获取收藏状态
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { id } = event.context.params
  
  // 获取当前用户
  const { data: { user } } = await client.auth.getUser()
  
  if (!user) {
    // 未登录用户默认未收藏
    return { favorited: false }
  }
  
  try {
    // 查询是否已收藏
    const { data, error } = await client
      .from('actions')
      .select('id')
      .match({ userId: user.id, exhibitId: id })
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 是未找到记录的错误
      throw error
    }
    
    return { favorited: !!data }
  } catch (error) {
    console.error('获取收藏状态失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取收藏状态失败'
    })
  }
})