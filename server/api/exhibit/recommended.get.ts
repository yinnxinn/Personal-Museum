// server/api/exhibits/recommended.get.ts
import { supabase } from '../../utils/supabase';
import { H3Event, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  try {
    // 获取3个最新创建的展品作为推荐
    const { data, error } = await supabase
      .from('exhibits')
      .select('id, title, description, coverUrl, created_at, author')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Supabase fetch error:', error);
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to fetch recommended exhibits' 
      });
    }

    // 格式化响应数据
    const exhibits = data?.map(exhibit => ({
      id: exhibit.id,
      title: exhibit.title,
      description: exhibit.description,
      cover: exhibit.coverUrl,
      createdAt: exhibit.created_at,
      author: exhibit.author?.username || 'Unknown'
    })) || [];

    return {
      "exhibits" : exhibits
    };
    
  } catch (err: any) {
    console.error('Unhandled server error:', err);
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal Server Error' 
    });
  }
});