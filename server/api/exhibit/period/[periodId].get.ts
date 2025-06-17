// server/api/exhibits/most-liked/period/[periodId].get.ts

import { H3Event, createError } from 'h3';
import { TIME_PERIODS } from '../../../utils/constants'; // Ensure this path is correct


export default defineEventHandler(async (event: H3Event) => {


  const supabaseClient = supabase(event);
  
  try {
    const periodId = event.context.params?.periodId;

    if (!periodId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing period ID',
      });
    }

    // Get time period definition
    const period = TIME_PERIODS.find(p => p.id === periodId);
    if (!period) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid period ID',
      });
    }


    // Directly query the 'exhibits' table
    const { data, error } = await supabaseClient
      .from('exhibits')
      .select(`
        id,
        title,
        description,
        "coverUrl",
        created_at,
        author
      `).eq('privacy', 'public')
      .gte('created_at', period.start.toISOString()) // Greater than or equal to start date
      .lte('created_at', period.end.toISOString())   // Less than or equal to end date
      .order('created_at', { ascending: false })     // Order by newest first
      .limit(3);                                    // Limit to 10 exhibits

    if (error) {
      console.error(`Supabase query error for period ${periodId}:`, error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch exhibits for period',
      });
    }

    // Map the data to include author_username and author_email
    const exhibits = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.coverUrl,
      createdAt: item.created_at,
      authorId: item.author,
      authorEmail: item.auth_users?.email || 'unknown@example.com',
      authorUsername: (item.auth_users?.raw_user_meta_data?.username as string) || 'Unknown Author',
      // No likeCount here, as we are not counting likes directly in this endpoint.
      // If you need like count, you'd have to join the 'actions' table and count.
    }));

    return exhibits;

  } catch (err: any) {
    console.error(`API error in /api/exhibits/period/[periodId]:`, err);
    // Ensure the error message is generic for security
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      // Optionally, expose specific error details in development for debugging
      // fatal: process.env.NODE_ENV === 'production',
      // message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    });
  }
});