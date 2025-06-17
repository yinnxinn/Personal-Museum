import { supabase } from '../utils/supabase';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {

const supabaseClient = supabase(event);

  // 设置响应头为XML
  event.node.res.setHeader('Content-Type', 'application/xml');
  
  // 获取所有公开的展览
  const { data: exhibits, error } = await supabaseClient
    .from('exhibits')
    .select('id')
    .eq('privacy', 'public');
  
  if (error) {
    console.error('Error fetching exhibits for sitemap:', error);
  }
  
  // 网站域名 - 生产环境中应从环境变量获取
  const domain = process.env.SITE_URL || 'https://personal-museum.nilco2.com';
  
  // 生成sitemap XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  
  // 添加静态页面
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/explore', priority: '0.9', changefreq: 'daily' },
  ];
  
  // 添加静态页面到sitemap
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${domain}${page.url}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="zh" href="${domain}${page.url}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/en${page.url}" />\n`;
    xml += '  </url>\n';
  });
  
  // 添加动态展览页面
  if (exhibits) {
    exhibits.forEach(exhibit => {
      xml += '  <url>\n';
      xml += `    <loc>${domain}/exhibit/${exhibit.id}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += `    <xhtml:link rel="alternate" hreflang="zh" href="${domain}/exhibit/${exhibit.id}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${domain}/en/exhibit/${exhibit.id}" />\n`;
      xml += '  </url>\n';
    });
  }
  
  xml += '</urlset>';
  
  return xml;
});