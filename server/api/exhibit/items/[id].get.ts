import { supabase } from '../../../utils/supabase'; // Adjust path if necessary
import { H3Event, getRouterParam, getQuery, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const supabaseClient = supabase(event);

  const exhibitId = getRouterParam(event, 'id'); // Renamed `id` to `exhibitId` for clarity
  const query = getQuery(event);

  if (!exhibitId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing exhibit ID parameter',
    });
  }

  // Handle pagination parameters
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 8; // Match frontend's pageSize
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // --- Important: We no longer fetch exhibit head data here. ---
    // The main exhibit details (title, description, coverUrl, privacy, author)
    // are now fetched by the `/api/exhibit/[id]` endpoint.
    // This endpoint only fetches the *items* (images).

    const { data: items, error: listError, count } = await supabaseClient
      .from('images') // Assuming your image table is named 'images'
      .select('id, title, description, image_url', { count: 'exact' }) // Added width, height, artist, year, category for frontend
      .eq('exhibitId', exhibitId) // Link images to the specific exhibit
      .order('created_at', { ascending: false }) // Order by creation date, newest first
      .range(from, to);

    if (listError) {
      console.error('Supabase image list error:', listError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch exhibit images',
      });
    }

    return {
      items: items?.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
      })) || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        hasMore: count ? to + 1 < count : false,
      },
    };
  } catch (err: any) {
    console.error('Unhandled server error in /api/exhibit/items/[id]:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});