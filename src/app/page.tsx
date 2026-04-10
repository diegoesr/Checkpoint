import { Hero } from "@/components/landing/Hero";
import { HomeFeatures } from "@/components/landing/HomeFeatures";
import { HomeNewsRss } from "@/components/landing/HomeNewsRss";
import { Navbar } from "@/components/landing/Navbar";
import { PopularGamesMarquee } from "@/components/landing/PopularGamesMarquee";
import { getGamingNewsFromRss } from "@/lib/gaming-news-rss";
import { getHomeMarqueeCovers } from "@/lib/rawg";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [games, rssNews] = await Promise.all([
    getHomeMarqueeCovers(),
    getGamingNewsFromRss(6),
  ]);
  const hasApiKey = Boolean(process.env.RAWG_API_KEY);
  const showRawgAttribution = hasApiKey;

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
      <PopularGamesMarquee
        games={games}
        showRawgAttribution={showRawgAttribution}
        hasApiKey={hasApiKey}
      />
      <HomeFeatures />
      <HomeNewsRss items={rssNews} />
    </div>
  );
}
