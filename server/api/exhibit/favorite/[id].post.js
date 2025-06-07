// 处理收藏/取消收藏请求
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { id } = event.context.params
  const { favorited } = await readBody(event)
  
  // 获取当前用户
  const { data: { user } } = await client.auth.getUser()
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: '需要登录才能收藏展览'
    })
  }
  
  try {
    if (favorited) {
      // 添加收藏
      const { data, error } = await client
        .from('actions')
        .upsert({
          userId: user.id,
          exhibitId: id,
          created_at: new Date()
        })
      
      if (error) throw error
      
      return { success: true, message: '已添加到收藏' }
    } else {
      // 取消收藏
      const { error } = await client
        .from('actions')
        .delete()
        .match({ userId: user.id, exhibitId: id })
      
      if (error) throw error
      
      return { success: true, message: '已从收藏中移除' }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    throw createError({
      statusCode: 500,
      message: '收藏操作失败'
    })
  }
})