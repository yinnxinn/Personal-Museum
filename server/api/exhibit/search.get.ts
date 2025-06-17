// server/api/exhibit/search.get.ts
import { supabase } from '../../utils/supabase';
import { H3Event, getQuery, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const searchQuery = (query.query as string)?.trim() || (query.keyword as string)?.trim(); // Support both 'query' and 'keyword'
  const page = parseInt((query.page as string) || '1', 10);
  const pageSize = parseInt((query.pageSize as string) || '20', 10);

  // Validate search query
  if (!searchQuery) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query is required',
    });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabaseClient = supabase(event);

  try {
    // Build search query
    let queryBuilder = supabaseClient
      .from('exhibits')
      .select(
        'id, title, description, coverUrl, created_at, author',
        { count: 'exact' }
      )
      .eq('privacy', 'public')
      .order('created_at', { ascending: false })
      .range(from, to);

    // Add search filter across title, description, and tags
    queryBuilder = queryBuilder.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    );

    const { data, error, count } = await queryBuilder;

    if (data) {
      // 假设您有一个明确的 hotwordId 和要设置的 count 值
      const hotwordId = 'some_unique_id_or_string_as_pk'; // 比如关键词本身作为ID

      try {
        const { data, error } = await supabaseClient
          .from('hotwords')
          .upsert({
            search: searchQuery
          }, {
            onConflict: 'search' // 如果 'id' 列冲突，则更新
          });

        if (error) {
          console.error('Upsert failed:', error.message);
        } else {
          console.log('Upsert successful:', data);
        }
      } catch (e: any) {
        console.error('Error during upsert:', e.message);
      }
    }

    if (error) {
      console.error('Supabase search error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch search results',
      });
    }

    // Format response data
    const exhibits = data?.map((exhibit) => ({
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
      statusMessage: 'Internal Server Error',
    });
  }
});