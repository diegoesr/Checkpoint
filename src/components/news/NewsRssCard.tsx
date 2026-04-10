import type { GamingNewsItem } from "@/lib/gaming-news-rss";

function sourceInitials(source: string): string {
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase().slice(0, 2);
  }
  return source.slice(0, 2).toUpperCase() || "?";
}

function formatDateShort(iso: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(t);
}

type Props = {
  item: GamingNewsItem;
};

export function NewsRssCard({ item }: Props) {
  const dateLabel = formatDateShort(item.publishedAt);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[#2f3642] bg-[#1a1f26] shadow-lg shadow-black/30 transition hover:border-[#3d4754]">
      <a
        href={item.link}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex h-full flex-col outline-offset-2 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-[#40bcf4]"
      >
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#1f252d]">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- dominios RSS arbitrarios
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1f252d] text-sm font-medium text-[#678]">
              Checkpoint
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#2f3642] bg-[#1f252d] text-[11px] font-bold tracking-tight text-[#c8d0d9]"
              aria-hidden
            >
              {sourceInitials(item.source)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#9ab]">{item.source}</p>
              {dateLabel ? (
                <p className="text-[11px] text-[#678]">{dateLabel}</p>
              ) : null}
            </div>
          </div>

          <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight text-white transition group-hover:text-[#40bcf4]">
            {item.title}
          </h3>

          {item.excerpt ? (
            <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-[#9ab]">
              {item.excerpt}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          <p className="mt-5 text-sm font-semibold text-[#40bcf4] transition group-hover:text-[#5ccfff]">
            Ver la noticia completa
          </p>
        </div>
      </a>
    </article>
  );
}
