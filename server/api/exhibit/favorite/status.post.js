// 获取收藏状态
import { supabase } from '../../../utils/supabase';

export default defineEventHandler(async (event) => {

  const { id, user } = await readBody(event)

  const supabaseClient = supabase(event);
  
  if (!user) {
    // 未登录用户默认未收藏
    return { favorited: false }
  }
  
  try {
    // 查询是否已收藏
    const { data, error } = await supabaseClient
      .from('actions')
      .select('id')
      .match({ userId: user, exhibitId: id })
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