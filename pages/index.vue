<template>
  <div
    class="min-h-screen bg-gray-100 text-gray-800 font-sans background-image"
  >
    <HeroSection :background-image-url="heroBackgroundImage" />

    <FeaturedContentSection :cards="featuredCards" />
    <TimelineSection :events="timelineEvents" />

    <CallToActionSection />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { locale } = useI18n(); // 这行是关键修复

definePageMeta({
  requiresAuth: false, // 明确标记为不需要认证
});

useSeoMeta({
  title: () => `Home | ${locale.value === 'zh' ? '个人博物馆' : 'Personal Museum'}`,
  description: () => `Welcome to the ${locale.value === 'zh' ? '个人博物馆' : 'Personal Museum'} homepage. Explore our unique collections.`,
  ogTitle: () => `Home | ${locale.value === 'zh' ? '个人博物馆' : 'Personal Museum'}`,
  ogDescription: () => `Welcome to the ${locale.value === 'zh' ? '个人博物馆' : 'Personal Museum'} homepage. Explore our unique collections.`,
  ogImage: 'https://personal-museum.nilco2.com/bg.jpg', // 替换为实际图片 URL
  twitterCard: 'summary_large_image',
});

import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

import HeroSection from "~/components/HeroSection.vue";
import FeaturedContentSection from "~/components/FeaturedContentSection.vue";
import TimelineSection from "~/components/TimelineSection.vue";
import CallToActionSection from "~/components/CallToActionSection.vue";

// Get global authentication status
const { $auth } = useNuxtApp();

// Data for HeroSection
const heroBackgroundImage = "/bg.jpg";

// Reactive data for sections that will be fetched from APIs
const featuredCards = ref([]);
const timelineEvents = ref([]);
const loading = ref(true);
const error = ref(null);

const { data: mostLikedData, error: mostLikedError } = await useAsyncData(
  "most-liked-exhibits",
  async () => {
    try {
      const response = await $fetch("/api/exhibit/most-liked", {
        headers: useRequestHeaders(["cookie", "authorization"]),
        credentials: "include",
      });
      return response.map((item) => ({
        image: item.imageUrl || "/avatar.png",
        titleKey: item.title,
        descriptionKey: item.description,
        link: `/exhibit/${item.id}`,
        buttonTextKey: "featured_sections.view_details",
      }));
    } catch (err) {
      console.error("Error fetching most liked exhibits:", err);
      // Fallback to static data
      return [
        {
          image: "/avatar.png",
          titleKey: "featured_sections.card1.title",
          descriptionKey: "featured_sections.card1.description",
          link: "/exhibit/history",
          buttonTextKey: "featured_sections.view_details",
        },
        {
          image: "/avatar.png",
          titleKey: "featured_sections.card2.title",
          descriptionKey: "featured_sections.card2.description",
          link: "/exhibit/art",
          buttonTextKey: "featured_sections.view_details",
        },
        {
          image: "/avatar.png",
          titleKey: "featured_sections.card3.title",
          descriptionKey: "featured_sections.card3.description",
          link: "/exhibit/nature",
          buttonTextKey: "featured_sections.view_details",
        },
        {
          image: "/avatar.png",
          titleKey: "featured_sections.card4.title",
          descriptionKey: "featured_sections.card4.description",
          link: "/exhibit/tech",
          buttonTextKey: "featured_sections.view_details",
        },
      ];
    }
  }
);

// Sync data to ref
watch(
  mostLikedData,
  (newData) => {
    featuredCards.value = newData || [];
  },
  { immediate: true }
);

// Fetch timeline data
const { data: timelineData, error: timelineError } = await useAsyncData(
  "timeline-events",
  async () => {
    try {
      // Fetch timeline periods
      const timelinePeriods = await $fetch("/api/timeline-events");

      // Fetch associated exhibits for each period
      const populatedTimeline = await Promise.all(
        timelinePeriods.map(async (period) => {
          let exhibitsForPeriod = [];

          try {
            const mostLikedExhibits = await $fetch(
              `/api/exhibit/period/${period.id}`
            );
            exhibitsForPeriod = mostLikedExhibits
              .slice(0, 3)
              .map((exhibit) => ({
                id: exhibit.id,
                title: exhibit.title,
                link: `/exhibit/${exhibit.id}`,
                imageUrl: exhibit.imageUrl,
              }));
          } catch (popularExhibitError) {
            console.error(
              `Could not fetch most liked exhibits for period ${period.id}:`,
              popularExhibitError
            );
          }

          return {
            titleKey: period.name,
            dateKey: period.date_range,
            descriptionKey: "",
            associatedExhibits: exhibitsForPeriod,
          };
        })
      );

      return populatedTimeline;
    } catch (err) {
      console.error("Error fetching timeline data:", err);
      return []; // Fallback to empty array to prevent rendering issues
    } finally {
      loading.value = false;
    }
  }
);

// Sync data to ref
watch(
  timelineData,
  (newData) => {
    timelineEvents.value = newData || [];
  },
  { immediate: true }
);

// Combine errors
watch(
  [mostLikedError, timelineError],
  ([mostLikedErr, timelineErr]) => {
    error.value =
      mostLikedErr?.statusMessage || timelineErr?.statusMessage || null;
    if (error.value) {
      loading.value = false;
    }
  },
  { immediate: true }
);
</script>

<style>
.bg-pattern {
  background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.1) 75%,
      transparent 75%,
      transparent
    ),
    linear-gradient(to right, #e5e7eb, #d1d5db);
  background-size: 40px 40px;
  /* Control the size of the geometric pattern */
}
</style>