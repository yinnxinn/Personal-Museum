<template>
  <div class="min-h-screen bg-gray-100 text-gray-800 font-sans background-image">
    <HeroSection :background-image-url="heroBackgroundImage" />

    <FeaturedContentSection :cards="featuredCards" />
    <TimelineSection :events="timelineEvents" />

    <CallToActionSection />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNuxtApp } from '#app';

import HeroSection from '~/components/HeroSection.vue';
import FeaturedContentSection from '~/components/FeaturedContentSection.vue';
import TimelineSection from '~/components/TimelineSection.vue';
import CallToActionSection from '~/components/CallToActionSection.vue';

// Get global authentication status
const { $auth } = useNuxtApp();

// Data for HeroSection
const heroBackgroundImage = '/bg.jpg';

// Reactive data for sections that will be fetched from APIs
const featuredCards = ref([]);
const timelineEvents = ref([]);

// Function to fetch most liked exhibits for the featured section
const fetchMostLikedExhibits = async () => {
  try {
    // This API endpoint should return the overall most popular exhibits
    const response = await fetch('/api/exhibit/most-liked');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Map API response to your card data structure
    featuredCards.value = data.map(item => ({
      image: item.imageUrl || '/avatar.png',
      titleKey: item.title,
      descriptionKey: item.description,
      link: `/exhibit/${item.id}`,
      buttonTextKey: 'featured_sections.view_details',
    }));
  } catch (error) {
    console.error('Error fetching most liked exhibits:', error);
    // Fallback to static data if API fails
    featuredCards.value = [
      { image: '/avatar.png', titleKey: 'featured_sections.card1.title', descriptionKey: 'featured_sections.card1.description', link: '/exhibit/history', buttonTextKey: 'featured_sections.view_details' },
      { image: '/avatar.png', titleKey: 'featured_sections.card2.title', descriptionKey: 'featured_sections.card2.description', link: '/exhibit/art', buttonTextKey: 'featured_sections.view_details' },
      { image: '/avatar.png', titleKey: 'featured_sections.card3.title', descriptionKey: 'featured_sections.card3.description', link: '/exhibit/nature', buttonTextKey: 'featured_sections.view_details' },
      { image: '/avatar.png', titleKey: 'featured_sections.card4.title', descriptionKey: 'featured_sections.card4.description', link: '/exhibit/tech', buttonTextKey: 'featured_sections.view_details' },
    ];
  }
};
const fetchTimelineData = async () => {
  try {
    // 1. 获取所有展品并按创建时间分组
    const timelineEventsResponse = await fetch('/api/timeline-events');
    if (!timelineEventsResponse.ok) {
      throw new Error(`HTTP error! status: ${timelineEventsResponse.status}`);
    }
    const timelinePeriods = await timelineEventsResponse.json();

    // 2. 为每个时间段获取关联展品
    const populatedTimeline = await Promise.all(
      timelinePeriods.map(async (period) => {
        let exhibitsForPeriod = [];

        // 如果用户已登录，尝试获取用户在该时间段的展品

        // 如果没有用户展品，获取该时间段最受欢迎的展品
        try {
          const mostLikedExhibitsResponse = await fetch(
            `/api/exhibit/period/${period.id}`
          );
          if (mostLikedExhibitsResponse.ok) {
            const mostLikedExhibits = await mostLikedExhibitsResponse.json();
            exhibitsForPeriod = mostLikedExhibits.slice(0, 3).map((exhibit) => ({
              id: exhibit.id,
              title: exhibit.title,
              link: `/exhibit/${exhibit.id}`,
              imageUrl:exhibit.imageUrl
            }));


          }
        } catch (popularExhibitError) {
          console.error(
            `Could not fetch most liked exhibits for period ${period.id}:`,
            popularExhibitError
          );
        }


        return {
          titleKey: period.name,
          dateKey: period.date_range,
          descriptionKey: ``,
          associatedExhibits: exhibitsForPeriod,
        };
      })
    );

    return populatedTimeline;
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    throw error;
  }
};


onMounted(async () => {
  await fetchMostLikedExhibits();
  const events = await fetchTimelineData();
  timelineEvents.value = events;
  
  // 调试：打印最终的时间线数据
  console.log('Timeline events:', events);
});
</script>

<style>
.bg-pattern {
  background-image:
    linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent),
    linear-gradient(to right, #e5e7eb, #d1d5db);
  background-size: 40px 40px;
  /* Control the size of the geometric pattern */
}
</style>