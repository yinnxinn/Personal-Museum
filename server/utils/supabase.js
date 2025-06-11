import { createServerClient } from '@supabase/ssr';
import { getCookie, setCookie, deleteCookie } from 'h3';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = (event) => {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (key) => getCookie(event, key), // Use getCookie from h3
      set: (key, value, options) => setCookie(event, key, value, options), // Use setCookie
      remove: (key, options) => deleteCookie(event, key, options), // Use deleteCookie
    },
  });
};