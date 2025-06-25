// server/api/exhibits/upload-image.post.ts
import { supabase } from '../../utils/supabase';
import { H3Event, createError, readMultipartFormData } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export default defineEventHandler(async (event: H3Event) => {
  const formData = await readMultipartFormData(event);
  const supabaseClient = supabase(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded.',
    });
  }

  let imageUrl: string | null = null;
  let previewUrl: string | null = null;

  for (const fileField of formData) {
    if (fileField.name === 'image' && fileField.data) {
      const fileBuffer = fileField.data;
      const originalFileName = `${uuidv4()}-${fileField.filename}`;
      const contentType = fileField.type || 'application/octet-stream';

      // Upload original image
      const { data: originalUploadData, error: originalUploadError } = await supabaseClient.storage
        .from('images')
        .upload(`public/original/${originalFileName}`, fileBuffer, {
          contentType: contentType,
          upsert: false,
        });

      if (originalUploadError) {
        console.error('Supabase original image upload error:', originalUploadError);
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to upload original image: ${originalUploadError.message}`,
        });
      }

      const { data: originalPublicUrlData } = supabaseClient.storage
        .from('images')
        .getPublicUrl(originalUploadData.path);

      if (originalPublicUrlData) {
        imageUrl = originalPublicUrlData.publicUrl;
      }

      // Generate and upload thumbnail
      try {
        const thumbnailBuffer = await sharp(fileBuffer)
          .resize(300) // Resize to 300px width, height auto
          .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
          .toBuffer();

        const thumbnailFileName = `${uuidv4()}-thumb-${fileField.filename?.split('.').slice(0, -1).join('.') || 'image'}.jpeg`;

        const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabaseClient.storage
          .from('images')
          .upload(`public/thumbnails/${thumbnailFileName}`, thumbnailBuffer, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (thumbnailUploadError) {
          console.error('Supabase thumbnail upload error:', thumbnailUploadError);
          throw createError({
            statusCode: 500,
            statusMessage: `Failed to upload thumbnail: ${thumbnailUploadError.message}`,
          });
        }

        const { data: thumbnailPublicUrlData } = supabaseClient.storage
          .from('images')
          .getPublicUrl(thumbnailUploadData.path);

        if (thumbnailPublicUrlData) {
          previewUrl = thumbnailPublicUrlData.publicUrl;
        }
      } catch (sharpError) {
        console.error('Sharp image processing error:', sharpError);
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to process image for thumbnail: ${sharpError.message}`,
        });
      }
    }
  }

  if (!imageUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Original image URL not generated.',
    });
  }

  return { imageUrl, previewUrl };
});