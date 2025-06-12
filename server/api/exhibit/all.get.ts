// server/api/exhibits/all.get.ts
import { supabase } from '../../utils/supabase';
import { H3Event, getQuery, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const page = parseInt((query.page as string) || '0', 10);
  const pageSize = parseInt((query.pageSize as string) || '20', 10);
  const category = (query.category as string) || '';
  const search = (query.search as string) || '';

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;


  const supabaseClient = supabase(event);

  try {
    // 构建基本查询
    let queryBuilder = supabaseClient
      .from('exhibits')
      .select('id, title, description, coverUrl, created_at, author',
        { count: 'exact' }
      ).eq('privacy', 'public')


    // 添加分类过滤
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    // 添加搜索过滤
    if (search) {
      queryBuilder = queryBuilder.ilike('title', `%${search}%`).range(from, to);
    } else {
      queryBuilder = queryBuilder.order('description', { ascending: false })
        .limit(4);
    }

    const { data, error, count } = await queryBuilder;

    if (data && search) {
     const {data, error} =  await supabaseClient
        .from('hotwords')
        .insert({
          search: search
        })
        .select()
        .single();

        console.log( ' 插入搜素记录 ', data, error)

    }

    if (error) {
      console.error('Supabase fetch error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch exhibits'
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
      exhibits,
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > (to + 1),
    };

  } catch (err: any) {
    console.error('Unhandled server error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  }
});