// server/api/timeline-events.get.ts
import { defineEventHandler, createError } from 'h3';
import { TIME_PERIODS } from '../utils/constants';
import { supabase } from '../utils/supabase';

export default defineEventHandler(async (event) => {
  const supabaseClient = supabase(event);

  try {
    const populatedTimeline = await Promise.all(
      TIME_PERIODS.map(async (period) => {
        let exhibitsForPeriod = [];

        try {
          const { data, error } = await supabaseClient
            .from('exhibits')
            .select(`
              id,
              title,
              "coverUrl"
            `)
            .eq('privacy', 'public')
            .gte('created_at', period.start.toISOString()) // Greater than or equal to start date
            .lte('created_at', period.end.toISOString())   // Less than or equal to end date
            .order('created_at', { ascending: false })
            .limit(3);

          if (error) {
            console.error(`Supabase query error for period ${period.id}:`, error);
          } else {
            exhibitsForPeriod = data.map((exhibit) => ({
              id: exhibit.id,
              title: exhibit.title,
              link: `/exhibit/${exhibit.id}`,
              imageUrl: exhibit.coverUrl,
            }));
          }
        } catch (popularExhibitError) {
          console.error(
            `Could not fetch exhibits for period ${period.id}:`,
            popularExhibitError
          );
        }

        return {
          id: period.id,
          name: period.name,
          date_range: `${period.start.toISOString().split('T')[0]} to ${period.end.toISOString().split('T')[0]}`, // Add date_range
          titleKey: period.name,
          dateKey: period.date_range, // This might be redundant if date_range is used
          descriptionKey: "",
          associatedExhibits: exhibitsForPeriod,
        };
      })
    );

    return populatedTimeline;
  } catch (error: any) {
    console.error('API error in /api/timeline-events:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});