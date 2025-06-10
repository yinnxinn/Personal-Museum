// server/api/exhibits/created.get.ts
import { supabase } from '../../utils/supabase';
import { H3Event, getQuery, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const userId = query.userId as string; // Expect userId as a query parameter

  // Define the roles that grant 'created' (editing/managing) access
  // This assumes 'owner' is the role assigned to the original author in exhibit_permissions
  // and 'editor' is for collaborators who can also edit.
  const managedRoles = ['owner', 'editor'];

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required to fetch managed exhibits.',
    });
  }

  try {
    // Perform a JOIN between exhibits and exhibit_permissions
    // We select exhibits where the current user is a collaborator (which now includes owners)
    // AND the role grants management/editing access.
    const { data, error, count } = await supabase
      .from('exhibits')
      .select(`
        id,
        title,
        description,
        coverUrl,
        created_at,
        author,
        privacy,
        exhibit_permissions!inner(
          userId,
          role
        )
      `, { count: 'exact' }) // Use exact count for total
      .eq('exhibit_permissions.userId', userId) // Filter by the current user's ID in permissions
      .in('exhibit_permissions.role', managedRoles) // Filter by roles that grant access
      .order('created_at', { ascending: false }); // Order the results

    if (error) {
      console.error('Supabase fetch error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch managed exhibits',
      });
    }

    // Format the response data
    // Note: 'data' will contain an array of exhibit objects, each with a nested 'exhibit_permissions' array.
    // For this specific query, the nested array will usually have only one item relevant to the filter.
    const exhibits = data?.map(exhibit => ({
      id: exhibit.id,
      title: exhibit.title,
      description: exhibit.description,
      coverUrl: exhibit.coverUrl,
      createdAt: exhibit.created_at,
      author: exhibit.author || 'Unknown',
      privacy: exhibit.privacy,
      // Optionally, you can include the specific role the user has for this exhibit
      userRole: exhibit.exhibit_permissions?.[0]?.role || null
    })) || [];

    return {
      exhibits,
      total: count ?? 0, // Total count from the joined query
    };

  } catch (err: any) {
    console.error('Unhandled server error in created.get.ts:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});