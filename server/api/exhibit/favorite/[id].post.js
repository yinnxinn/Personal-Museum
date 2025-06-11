import { defineEventHandler, createError, readBody } from 'h3';
import { supabase } from '../../../utils/supabase';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const { favorited } = await readBody(event);

  // Create Supabase client with SSR support
  const supabaseClient = supabase(event);

  // Get the session from the Supabase client
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  const user = session?.user?.id;

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '需要登录才能收藏展览'
    });
  }

  try {
    if (favorited) {
      const { data, error } = await supabaseClient
        .from('actions')
        .upsert({
          userId: user,
          exhibitId: id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true, message: '已添加到收藏' };
    } else {
      const { error } = await supabaseClient
        .from('actions')
        .delete()
        .match({ userId: user, exhibitId: id });

      if (error) throw error;

      return { success: true, message: '已从收藏中移除' };
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    throw createError({
      statusCode: 500,
      message: '收藏操作失败'
    });
  }
});