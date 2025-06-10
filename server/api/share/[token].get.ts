import { supabase } from '../../utils/supabase';
import { H3Event, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const token = getRouterParam(event, 'token');
    const query = getQuery(event);

    console.log(token, query);

    if (!token) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing token',
        });
    }

    // 1. 查询 share_links 表
    const { data: shareData, error: shareError } = await supabase
        .from('share_links')
        .select('exhibitId, expires_at')
        .eq('token', token)
        .single();

    if (shareError || !shareData) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Share link not found',
        });
    }

    // 2. 检查是否过期
    const now = new Date();
    const expiresAt = new Date(shareData.expires_at);
    if (now > expiresAt) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Share link has expired',
        });
    }

    // 3. 可选：记录用户权限到 exhibit_permissions 表
    const user = query.userId;
    if (user) {
        const { error: permError } = await supabase
            .from('exhibit_permissions')
            .insert({
                exhibitId: shareData.exhibitId,
                userId: user,
                role: 'editor' // 或 'viewer'，根据需求设置
            });
        if (permError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Error granting permission',
            });
        }
    }

    return { 
        message: 'Share link is valid', 
        exhibit_id: shareData.exhibitId 
    };
});