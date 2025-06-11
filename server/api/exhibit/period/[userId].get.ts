// server/api/exhibits/period/[periodId]/user/[userId].get.ts
import { supabase } from '../../../utils/supabase';
import { H3Event, createError } from 'h3';
import {TIME_PERIODS}  from '../../../utils/constants';


export default defineEventHandler(async (event: H3Event) => {


  const supabaseClient = supabase(event);

  try {
    const periodId = event.context.params?.periodId;
    const userId = event.context.params?.userId;
    
    if (!periodId || !userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters',
      });
    }

    // 获取时间段定义
    const period = TIME_PERIODS.find(p => p.id === periodId);
    if (!period) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid period ID',
      });
    }

    const { data, error } = await supabaseClient
      .from('exhibits')
      .select(`
        id,
        title,
        cover_url,
        created_at
      `)
      .eq('author', userId)
      .gte('created_at', period.start.toISOString())
      .lte('created_at', period.end.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`Supabase error fetching user exhibits for period ${periodId}:`, error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user exhibits',
      });
    }

    return data || [];
  } catch (error: any) {
    console.error(`API error in /api/exhibits/period/[periodId]/user/[userId]:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});