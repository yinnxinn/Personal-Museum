// server/api/images.get.ts

import { supabase } from '../utils/supabase';
import { H3Event, getQuery, createError } from 'h3'

export default defineEventHandler(async (event: H3Event) => {


  const supabaseClient = supabase(event);
  
  const query = getQuery(event)
  const page = parseInt((query.page as string) || '0', 10)
  const pageSize = parseInt((query.pageSize as string) || '20', 10)

  const from = page * pageSize
  const to = from + pageSize - 1

  try {
    const { data, error, count } = await supabaseClient
      .from('images')
      .select('id, image_url, description', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Supabase fetch error:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch images' })
    }

    return {
      images: data,
      total: count ?? 0,
      page,
      pageSize,
      hasMore: (count ?? 0) > (to + 1),
    }
  } catch (err: any) {
    console.error('Unhandled server error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
