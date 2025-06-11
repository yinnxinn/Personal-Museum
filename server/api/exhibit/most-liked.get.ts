import { supabase } from '../../utils/supabase';
import { H3Event, getQuery, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {


  const supabaseClient = supabase(event);

  const query = getQuery(event);

  const limit = parseInt((query.limit as string) || '4', 10);

  try {
    const { data, error } = await supabaseClient.rpc('get_most_liked_exhibits', {
      p_limit: limit,
    });


    if (error) throw error;

    // Handle type conversion for potentially problematic columns
    const exhibits = data?.map(exhibit => ({
      id: exhibit.id,
      title: String(exhibit.title),        // Ensure string conversion
      description: String(exhibit.description),  // Ensure string conversion
      imageUrl: String(exhibit.coverUrl), // Ensure string conversion
      createdAt: exhibit.created_at,
      author: exhibit.author?.username || 'Unknown',
      likeCount: Number(exhibit.like_count) || 0,
    })) || [];

    return exhibits;

  } catch (err: any) {
    console.error('Error fetching most liked exhibits:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch most liked exhibits',
    });
  }
});