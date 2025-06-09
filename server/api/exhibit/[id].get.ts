import { supabase } from '../../utils/supabase';
import { H3Event, getRouterParam, getQuery, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing exhibit ID parameter',
    });
  }

  // 处理分页参数
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // 先查一次该展品是否存在（避免空数据导致无法提取title等）
    const { data: headData, error: headError } = await supabase
      .from('exhibits')
      .select('id, title, description, coverUrl, created_at, author')
      .eq('id', id)
      .limit(1);

    if (headError) {
      console.error('Supabase head fetch error:', headError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch exhibit meta info',
      });
    }

    if (!headData || headData.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Exhibit not found',
      });
    }

    // 分页获取展品的图片项
    const { data: items, error: listError, count } = await supabase
      .from('images')
      .select('id, title, description, image_url, author', { count: 'exact' })
      .eq('exhibitId', id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (listError) {
      console.error('Supabase image list error:', listError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch exhibit images',
      });
    }

    const exhibitInfo = headData[0];

    return {
      exhibit: {
        id,
        title: exhibitInfo.title,
        description: exhibitInfo.description,
        cover: exhibitInfo.image_url,
        createdAt: exhibitInfo.created_at,
        author: exhibitInfo.author,
        datas: items?.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          author: item.author
        })) || [],
      },
      pagination: {
        page,
        pageSize,
        total: count || 0,
        hasMore: count ? to + 1 < count : false,
      },
    };
  } catch (err: any) {
    console.error('Unhandled server error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
