import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { NewsRssCard } from "@/components/news/NewsRssCard";
import { getGamingNewsFromRss } from "@/lib/gaming-news-rss";

export default async function NewsPage() {
  const items = await getGamingNewsFromRss(36);

  return (
    <div className="min-h-full bg-[#14181c] font-sans text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <Link
          href="/"
          className="text-sm text-[#40bcf4] transition hover:text-[#5ccfff]"
        >
          ← Inicio
        </Link>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-[#2f3642] pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Noticias
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#678]">
            RSS · videojuegos
          </p>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#9ab]">
          Agregado automático desde los feeds configurados. Cada tarjeta abre el artículo en el medio
          original.
        </p>

        {items.length === 0 ? (
          <p className="mt-14 text-[#9ab]">
            No hay entradas disponibles. Revisa{" "}
            <code className="rounded border border-[#2f3642] bg-[#1f252d] px-1.5 py-0.5 text-xs text-[#40bcf4]">
              NEWS_RSS_FEEDS
            </code>{" "}
            en{" "}
            <code className="rounded border border-[#2f3642] bg-[#1f252d] px-1.5 py-0.5 text-xs text-[#40bcf4]">
              .env.local
            </code>
            .
          </p>
        ) : (
          <ul className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            {items.map((item) => (
              <li key={item.id} className="flex min-h-0">
                <NewsRssCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
