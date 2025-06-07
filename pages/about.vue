<template>
  <div class="container mx-auto px-4 py-12 md:py-16 lg:py-20 mt-20 max-w-7xl bg-white shadow-lg rounded-lg">
    <h1 class="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-8">
      {{ $t('about.page_title') || '关于个人博物馆项目' }}
    </h1>

    <section class="mb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        {{ $t('about.section_intro_title') || '项目简介' }}
      </h2>
      <p class="text-lg text-gray-700 leading-relaxed mb-4">
        {{ $t('about.section_intro_para1') || '“个人博物馆”是一个创新的数字平台，旨在赋能每一位收藏爱好者，无论其收藏品类别如何，都能拥有一个专属于自己的在线虚拟博物馆。从珍贵的艺术品、历史悠久的文物，到独特的数字资产、模型手办，甚至是充满回忆的私人物品，这里都将是它们闪耀的舞台。我们致力于通过技术，让收藏品的管理、展示和分享变得前所未有的简单与有趣。' }}
      </p>
      <p class="text-lg text-gray-700 leading-relaxed">
        {{ $t('about.section_intro_para2') || '我们深知每一件收藏品背后都蕴含着独特的故事和情感。因此，我们希望打破传统实体博物馆的界限，为个人收藏搭建一个无形的桥梁，使其能够被更广泛的受众所欣赏和理解。在这里，您不仅是收藏家，更是您个人藏品的策展人。' }}
      </p>
    </section>

    <section class="mb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        {{ $t('about.section_features_title') || '核心功能亮点' }}
      </h2>
      <ul class="list-disc list-inside text-lg text-gray-700 space-y-3">
        <li>
          <strong>{{ $t('about.feature1_title') || '沉浸式个性化展览' }}：</strong>
          {{ $t('about.feature1_desc') || '用户可以根据主题、时间、类别等维度，自由创建多个虚拟展览空间。每个展览都可独立设计布局，确保您的藏品以最吸引人的方式呈现。' }}
        </li>
        <li>
          <strong>{{ $t('about.feature2_title') || '详尽的藏品档案管理' }}：</strong>
          {{ $t('about.feature2_desc') || '为每一件收藏品提供丰富的元数据字段，包括高分辨率图片、多角度视图、详细的描述、购买或获取来源、历史沿革、鉴定信息等，让每一件物品的故事得以完整记录。' }}
        </li>
        <li>
          <strong>{{ $t('about.feature3_title') || '直观易用的管理后台' }}：</strong>
          {{ $t('about.feature3_desc') || '简洁而强大的后台管理界面，支持批量上传、快速编辑、智能分类和搜索功能，让您轻松掌控您的数字博物馆。' }}
        </li>
        <li>
          <strong>{{ $t('about.feature4_title') || '灵活多样的分享机制' }}：</strong>
          {{ $t('about.feature4_desc') || '您可以选择将整个博物馆或特定展览对外公开，生成可分享的链接，轻松分享至社交媒体；也可以设定为私有，仅供指定用户访问。' }}
        </li>
        <li>
          <strong>{{ $t('about.feature5_title') || '互动与社区（未来规划）' }}：</strong>
          {{ $t('about.feature5_desc') || '未来版本将考虑加入评论、点赞、用户间互访等互动功能，逐步构建一个收藏爱好者社区，让分享和交流更有价值。' }}
        </li>
      </ul>
    </section>

    <section class="mb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        {{ $t('about.section_tech_title') || '技术栈与架构' }}
      </h2>
      <p class="text-lg text-gray-700 leading-relaxed mb-4">
        {{ $t('about.section_tech_desc') || '本项目采用现代化的前端框架和后端服务，旨在提供高性能、高可靠性和可扩展性。' }}
      </p>
      <ul class="list-disc list-inside text-lg text-gray-700 space-y-2">
        <li><strong>{{ $t('about.tech_frontend') || '前端' }}：</strong> Nuxt.js (Vue 3), Tailwind CSS</li>
        <li><strong>{{ $t('about.tech_backend') || '后端' }}：</strong> Supabase (PostgreSQL 数据库, 认证, 存储, Edge Functions/RPC)</li>
        <li><strong>{{ $t('about.tech_deployment') || '部署' }}：</strong> Vercel / Netlify (For frontend), Supabase Cloud (For backend)</li>
      </ul>
    </section>

    <section>
      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        {{ $t('about.section_vision_title') || '我们的愿景' }}
      </h2>
      <p class="text-lg text-gray-700 leading-relaxed">
        {{ $t('about.section_vision_desc') || '我们相信，每一份热爱都值得被记录与分享。“个人博物馆”项目致力于成为全球收藏爱好者首选的数字化管理和展示平台，让您的收藏不仅仅是物品，更是连接世界、传递文化的桥梁。我们期待与您一同，开启数字策展的新篇章。' }}
      </p>
    </section>
  </div>
</template>

<script setup>
// 导入 useI18n 钩子，以便在模板中使用 $t() 函数进行国际化
import { useI18n } from 'vue-i18n';
const { t } = useI18n(); // 实际上这里可以直接在模板中使用 $t，无需显式导入 t
</script>

<style scoped>
/* 调整容器的背景、阴影和圆角，使其更显眼和美观 */
.container {
  background-color: #ffffff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  border-radius: 0.75rem; /* rounded-lg */
}

/* 额外的排版调整，确保列表和段落间距美观 */
section + section {
  padding-top: 2.5rem; /* 增加 section 之间的间距 */
  border-top: 1px solid #e5e7eb; /* Subtle separator between sections */
  margin-top: 2.5rem;
}
</style>