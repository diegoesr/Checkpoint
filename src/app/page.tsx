import { Suspense } from "react";
import { Hero } from "@/components/landing/Hero";
import { HomeFeatures } from "@/components/landing/HomeFeatures";
import { HomeNewsRss } from "@/components/landing/HomeNewsRss";
import { Navbar } from "@/components/landing/Navbar";
import { PopularGamesMarquee } from "@/components/landing/PopularGamesMarquee";
import {
  NewsGridSkeleton,
  SectionHeadingSkeleton,
  Skeleton,
} from "@/components/skeletons/Skeleton";
import { getGamingNewsFromRss } from "@/lib/gaming-news-rss";
import { getHomeMarqueeCovers, isIgdbConfigured } from "@/lib/igdb";
import { createClient } from "@/lib/supabase/server";

/** Carrusel de portadas: espera a IGDB sin bloquear el hero. */
async function MarqueeSection() {
  const games = await getHomeMarqueeCovers();
  const hasApiKey = isIgdbConfigured();
  return (
    <PopularGamesMarquee
      games={games}
      showAttribution={hasApiKey}
      hasApiKey={hasApiKey}
    />
  );
}

function MarqueeFallback() {
  return (
    <section
      aria-hidden
      className="relative z-10 -mt-32 border-t border-white/10 bg-black pb-8 pt-6 sm:-mt-36 sm:pb-10 sm:pt-7"
    >
      <div className="flex h-[260px] gap-4 overflow-hidden px-4 sm:h-[290px] md:h-[300px]">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton
            key={i}
            className="h-full w-[170px] shrink-0 rounded-xl sm:w-[190px]"
          />
        ))}
      </div>
    </section>
  );
}

/** Noticias RSS: los feeds externos pueden tardar; se transmiten al final. */
async function NewsSection() {
  const rssNews = await getGamingNewsFromRss(6);
  return <HomeNewsRss items={rssNews} />;
}

function NewsFallback() {
  return (
    <section
      aria-hidden
      className="relative z-10 border-t border-[#2f3642] bg-[#14181c] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-[#2f3642] pb-4">
          <SectionHeadingSkeleton />
        </div>
        <NewsGridSkeleton count={3} />
      </div>
    </section>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div
      className={
        user
          ? "flex min-h-full flex-col bg-black pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] font-sans text-white md:pb-0"
          : "flex min-h-full flex-col bg-black font-sans text-white"
      }
    >
      <Navbar />
      <Hero expandedTopNav={Boolean(user)} showSignupCta={!user} />
      <Suspense fallback={<MarqueeFallback />}>
        <MarqueeSection />
      </Suspense>
      <HomeFeatures />
      <Suspense fallback={<NewsFallback />}>
        <NewsSection />
      </Suspense>
    </div>
  );
}
