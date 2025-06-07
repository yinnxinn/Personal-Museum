// server/api/timeline-events.get.ts
import { defineEventHandler } from 'h3';
import {TIME_PERIODS}  from '../utils/constants';
// 定义时间段（按年分组）

export default defineEventHandler(async () => {
  try {
    // 返回预定义的时间段
    const periods = TIME_PERIODS.map(period => ({
      id: period.id,
      name: period.name,
      date_range: `${period.start.toISOString().split('T')[0]} to ${period.end.toISOString().split('T')[0]}`
    }));


    return periods;
  } catch (error: any) {
    console.error('API error in /api/timeline-events:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});