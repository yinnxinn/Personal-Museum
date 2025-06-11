import { supabase } from '../utils/supabase';
import { H3Event, createError } from 'h3';
import { v4 as uuidv4 } from 'uuid'; // 用于生成唯一的分享 token

export default defineEventHandler(async (event) => {

    const supabaseClient = supabase(event);
 
    const body = await readBody(event);
    const { exhibit_id, user } = body;

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        });
    }

    // 验证请求参数
    if (!exhibit_id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing exhibit_id',
        });
    }

    // 1. 验证当前用户是否是展品的创建者
    const { data: exhibitData, error: exhibitError } = await supabaseClient
        .from('exhibits')
        .select('author, privacy')
        .eq('id', exhibit_id)
        .single();

    if (exhibitError || !exhibitData) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Exhibit not found or error fetching exhibit',
        });
    }

    if (exhibitData.author !== user) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You are not the creator of this exhibit',
        });
    }

    if (exhibitData.privacy !== 'private') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Only private exhibits can be shared',
        });
    }

    // 2. 生成唯一的分享 token
    const token = uuidv4();

    // 3. 计算过期时间（当前时间 + 24小时）
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    // 4. 将分享链接信息插入到 share_links 表
    const { error: insertError } = await supabaseClient
        .from('share_links')
        .insert({
            exhibitId: exhibit_id,
            token,
            created_at: createdAt.toISOString(),
            expires_at: expiresAt.toISOString(),
        });

    if (insertError) {
        throw createError({
            statusCode: 500,
            statusMessage: `Error creating share link: ${insertError.message}`,
        });
    }

    // 5. 生成并返回分享链接（假设前端路由为 /share/:token）
    const shareLink = `${process.env.SITE_URL}/share/${token}`; // BASE_URL 需在环境变量中配置

    return { 
        message: 'Share link created successfully', 
        shareLink 
    };
});