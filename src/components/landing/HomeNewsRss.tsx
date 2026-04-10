import Link from "next/link";
import { NewsRssCard } from "@/components/news/NewsRssCard";
import type { GamingNewsItem } from "@/lib/gaming-news-rss";

type Props = {
  items: GamingNewsItem[];
};

export function HomeNewsRss({ items }: Props) {
  return (
    <section
      className="relative z-10 border-t border-[#2f3642] bg-[#14181c] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      aria-labelledby="rss-news-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-[#2f3642] pb-4">
          <h2
            id="rss-news-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#678] sm:text-xs"
          >
            Noticias recientes
          </h2>
        </div>

        {items.length === 0 ? (
          <p className="mt-12 text-center text-sm text-[#9ab]">
            No se pudieron cargar entradas RSS. Comprueba tu conexión o las URLs en{" "}
            <code className="rounded border border-[#2f3642] bg-[#1f252d] px-1.5 py-0.5 text-xs text-[#40bcf4]">
              NEWS_RSS_FEEDS
            </code>
            .
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            {items.map((item) => (
              <li key={item.id} className="flex min-h-0">
                <NewsRssCard item={item} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex justify-end">
          <Link
            href="/news"
            className="text-sm font-semibold text-[#40bcf4] transition hover:text-[#5ccfff]"
          >
            Todas las noticias
          </Link>
        </div>

        <p className="mt-8 text-center text-[10px] text-[#678]">
          Contenido enlazado desde fuentes RSS.
        </p>
      </div>
    </section>
  );
}
