// server/api/exhibits/update.put.ts
import { supabase } from '../../utils/supabase';
import { H3Event, readBody, createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  const { id, title, description, privacy, items } = body;

  if (!id || !title || !description || !privacy || !items) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required exhibit fields or items for update.',
    });
  }

  try {
    // 1. Update the exhibit details
    const { error: exhibitError } = await supabase
      .from('exhibits')
      .update({
        title,
        description,
        privacy,
        updated_at: new Date().toISOString(), // Add an updated_at timestamp
      })
      .eq('id', id);

    if (exhibitError) {
      console.error('Supabase update exhibit error:', exhibitError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update exhibit.',
      });
    }

    // 2. Handle exhibit items (upsert or delete as needed)
    // First, get existing items to compare
    const { data: existingItems, error: fetchItemsError } = await supabase
      .from('images')
      .select('id')
      .eq('exhibitId', id);

    if (fetchItemsError) {
      console.error('Supabase fetch existing items error:', fetchItemsError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to retrieve existing exhibit items.',
      });
    }

    const existingItemIds = existingItems.map(item => item.id);
    const newItemIds = items.filter((item: any) => item.id && !item.file).map((item: any) => item.id); // Items that already exist and are not new uploads

    const itemsToDelete = existingItemIds.filter(itemId => !newItemIds.includes(itemId));
    const itemsToInsert = items.filter((item: any) => !item.id || item.file); // New items or items that were just uploaded (identified by absence of id or presence of file)
    const itemsToUpdate = items.filter((item: any) => item.id && !item.file); // Existing items that might have updated title/description

    // Delete removed items
    if (itemsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .in('id', itemsToDelete);

      if (deleteError) {
        console.error('Supabase delete items error:', deleteError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to delete old exhibit items.',
        });
      }
    }

    // Insert new items
    if (itemsToInsert.length > 0) {
      const formattedNewItems = itemsToInsert.map((item: any) => ({
        exhibitId: id,
        image_url: item.imageUrl, // This should be the URL from Supabase Storage
        title: item.title,
        description: item.description,
      }));

      console.log( formattedNewItems , '11111111')
      const { error: insertError } = await supabase
        .from('images')
        .insert(formattedNewItems);

      if (insertError) {
        console.error('Supabase insert new items error:', insertError);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to insert new exhibit items.',
        });
      }
    }

    // Update existing items' titles and descriptions
    for (const item of itemsToUpdate) {
      const { error: updateItemError } = await supabase
        .from('images')
        .update({
          title: item.title,
          description: item.description,
        })
        .eq('id', item.id);

      if (updateItemError) {
        console.error(`Supabase update item ${item.id} error:`, updateItemError);
        // Decide how to handle individual item update failures
      }
    }

    return { message: 'Exhibit updated successfully', exhibitId: id };
  } catch (err: any) {
    console.error('Unhandled server error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});

