// server/api/exhibits/create.post.ts
import { supabase } from '../../utils/supabase';
import { H3Event, readBody, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);

  const supabaseClient = supabase(event);


  const { title, description, privacy, items, coverUrl, author } = body;

  if (!title || !description || !privacy || !items) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required exhibit fields or items.',
    });
  }

  try {
    // 1. Insert the new exhibit
    const { data: newExhibit, error: exhibitError } = await supabaseClient
      .from('exhibits')
      .insert({
        title,
        description,
        privacy,
        coverUrl,
        author
        // You might want to add author_id here if you have user authentication
        // author_id: event.context.user.id,
      })
      .select()
      .single();

    if (exhibitError) {
      console.error('Supabase insert exhibit error:', exhibitError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create exhibit.',
      });
    }

    //1.5 insert perssmission 
    const { data: idx, error: error } = await supabaseClient
      .from('exhibit_permissions')
      .insert({
        userId: author,
        exhibitId: newExhibit.id,
        role: 'owner'
        // You might want to add author_id here if you have user authentication
        // author_id: event.context.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert perssmission error:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create exhibit perssmission.',
      });
    }



    // 2. Insert exhibit items (images)
    const exhibitItemsToInsert = items.map((item: any) => ({
      exhibitId: newExhibit.id,
      image_url: item.imageUrl, // This should be the URL from Supabase Storage
      preview_url: item.previewUrl, // Add previewUrl
      title: item.title,
      description: item.description,
    }));

    if (exhibitItemsToInsert.length > 0) {
      const { error: itemsError } = await supabaseClient
        .from('images')
        .insert(exhibitItemsToInsert);

      if (itemsError) {
        console.error('Supabase insert exhibit items error:', itemsError);
        // Consider rolling back exhibit creation here if items fail
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create exhibit items.',
        });
      }
    }

    return { message: 'Exhibit created successfully', exhibitId: newExhibit.id };
  } catch (err: any) {
    console.error('Unhandled server error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});