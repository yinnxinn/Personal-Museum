// server/api/exhibits/upload-image.post.ts
import { supabase } from '../../utils/supabase';
import { H3Event, createError, readMultipartFormData } from 'h3';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install uuid: pnpm install uuid @types/uuid

export default defineEventHandler(async (event: H3Event) => {
  const formData = await readMultipartFormData(event);

  const supabaseClient = supabase(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded.',
    });
  }

  const uploadedUrls: string[] = [];

  for (const fileField of formData) {
    if (fileField.name === 'image' && fileField.data) {
      const fileBuffer = fileField.data;
      const fileName = `${uuidv4()}-${fileField.filename}`;
      const contentType = fileField.type || 'application/octet-stream';

      const { data, error } = await supabaseClient.storage
        .from('images') // Make sure this bucket exists in Supabase
        .upload(`public/${fileName}`, fileBuffer, {
          contentType: contentType,
          upsert: false, // Set to true if you want to overwrite existing files with the same name
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to upload image: ${error.message}`,
        });
      }

      // Get the public URL of the uploaded image
      const { data: publicUrlData } = supabaseClient.storage
        .from('images')
        .getPublicUrl(data.path);

      if (publicUrlData) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }
  }

  if (uploadedUrls.length === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'No images were successfully uploaded.',
    });
  }

  return { urls: uploadedUrls };
});