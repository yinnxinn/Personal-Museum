import { defineEventHandler } from 'h3';
import { supabase } from '../utils/supabase';

export default defineEventHandler(async (event) => {


    const supabaseClient = supabase(event);

    const { data, error, count } = await supabaseClient
        .from('hotwords')
        .select('search', { count: 'exact' })
        .limit(16)

    const searchValues = [...new Set(data?.map(item => item.search) || [])];

    return {
        keywords: searchValues
    };
});