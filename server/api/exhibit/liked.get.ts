// server/api/exhibits/liked.get.ts
import { supabase } from '../../utils/supabase';
import { H3Event, getQuery, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const userId = query.userId as string; // Expect userId as a query parameter

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required to fetch liked exhibits.',
    });
  }

  try {
    // 1. Get exhibit IDs that the user has liked from the 'actions' table
    const { data: likedActions, error: actionsError } = await supabase
      .from('actions')
      .select('exhibitId')
      .eq('userId', userId)
      .eq('likes', true); // Filter for actions where 'likes' is true

    if (actionsError) {
      console.error('Supabase actions fetch error:', actionsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user liked actions.',
      });
    }

    const exhibitIds = likedActions.map(action => action.exhibitId);

    // If no exhibits are liked, return an empty array immediately
    if (exhibitIds.length === 0) {
      return { exhibits: [], total: 0 };
    }

    // 2. Fetch the exhibit details for the liked IDs from the 'exhibits' table
    const { data: exhibitsData, error: exhibitsError, count } = await supabase
      .from('exhibits')
      .select('id, title, description, coverUrl, created_at, author', { count: 'exact' })
      .in('id', exhibitIds) // Filter exhibits by the collected IDs
      .order('created_at', { ascending: false }); // Optionally order them

    if (exhibitsError) {
      console.error('Supabase exhibits fetch error:', exhibitsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch liked exhibit details.',
      });
    }

    // Format the response data
    const exhibits = exhibitsData?.map(exhibit => ({
      id: exhibit.id,
      title: exhibit.title,
      description: exhibit.description,
      coverUrl: exhibit.coverUrl, // Keep as coverUrl as per your component
      createdAt: exhibit.created_at,
      // Note: If 'author' in your 'exhibits' table is a direct user ID,
      // you might need a join or separate fetch to get user_metadata like username.
      // Assuming it's already structured for direct use or will be adjusted.
      author: exhibit.author || 'Unknown' // Adjust based on your 'author' column type
    })) || [];

    return {
      exhibits,
      total: count ?? 0,
    };

  } catch (err: any) {
    console.error('Unhandled server error in liked.get.ts:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});