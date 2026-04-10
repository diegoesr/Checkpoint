import { unstable_cache } from "next/cache";
import Parser from "rss-parser";
import type { Item } from "rss-parser";

export type GamingNewsItem = {
  id: string;
  title: string;
  link: string;
  excerpt: string;
  source: string;
  imageUrl: string | null;
  publishedAt: string | null;
};

/**
 * Fuentes por defecto: verticales de videojuegos (menos ruido que el RSS general).
 * Sustituye con `NEWS_RSS_FEEDS` en .env (URLs separadas por coma).
 */
const DEFAULT_RSS_FEEDS = [
  "https://www.polygon.com/rss/gaming/index.xml",
  "https://www.videogameschronicle.com/feed/",
  "https://www.eurogamer.net/feed",
  "https://www.pcgamer.com/rss/",
  "https://kotaku.com/rss",
] as const;

/**
 * La entrada debe mencionar al menos una de estas cadenas (título, resumen o URL),
 * o coincidir con un patrón de plataforma/tienda (regex).
 */
const STRICT_SUBSTRING_KEYWORDS = [
  "steam",
  "steam deck",
  "game pass",
  "xbox game pass",
  "pc game pass",
  "playstation store",
  "play station store",
  "ps store",
  "nintendo eshop",
  "nintendo e-shop",
  "epic games",
  "epic games store",
  "gog",
  "gog.com",
  "ubisoft",
  "ubisoft connect",
  "battle.net",
  "battlenet",
  "playstation",
  "play station",
  "ps5",
  "ps4",
  "ps3",
  "psvr",
  "ps vr",
  "psn",
  "ps plus",
  "playstation plus",
  "xbox",
  "xbox series",
  "xbox one",
  "xbox cloud",
  "nintendo",
  "nintendo switch",
  "switch 2",
  "switch online",
  "eshop",
  "e-shop",
  "geforce now",
  "nvidia now",
  "meta quest",
  "oculus",
  "playdate",
] as const;

const STRICT_REGEX_KEYWORDS: RegExp[] = [
  /\bsteam\b/i,
  /\bxbox\b/i,
  /\bplaystation\b/i,
  /\bnintendo\b/i,
  /\bswitch\b/i,
  /\bps5\b/i,
  /\bps4\b/i,
  /\bpsn\b/i,
  /\bgog\b/i,
  /\bubisoft\b/i,
];

function matchesStrictGamingKeywords(title: string, excerpt: string, link: string): boolean {
  const hay = `${title} ${excerpt} ${link}`.toLowerCase();
  for (const phrase of STRICT_SUBSTRING_KEYWORDS) {
    if (hay.includes(phrase)) return true;
  }
  const combined = `${title} ${excerpt} ${link}`;
  for (const re of STRICT_REGEX_KEYWORDS) {
    if (re.test(combined)) return true;
  }
  return false;
}

function getFeedUrls(): string[] {
  const raw = process.env.NEWS_RSS_FEEDS?.trim();
  if (!raw) return [...DEFAULT_RSS_FEEDS];
  const parsed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [...DEFAULT_RSS_FEEDS];
}

function normalizeLink(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
      (k) => u.searchParams.delete(k),
    );
    let s = u.toString();
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return url;
  }
}

function stableId(link: string): string {
  const n = normalizeLink(link);
  let h = 0;
  for (let i = 0; i < n.length; i++) {
    h = (Math.imul(31, h) + n.charCodeAt(i)) | 0;
  }
  return `rss-${Math.abs(h).toString(36)}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptFromItem(item: Item): string {
  if (item.contentSnippet?.trim()) {
    return item.contentSnippet.trim().slice(0, 220);
  }
  const ext = item as Item & Record<string, unknown>;
  const raw = ext["content:encoded"] ?? item.content ?? item.summary;
  if (typeof raw === "string" && raw.trim()) {
    return stripHtml(raw).slice(0, 220);
  }
  return "";
}

function extractImageUrl(item: Item): string | null {
  const enc = item.enclosure;
  if (enc?.url && (enc.type?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(enc.url))) {
    return enc.url;
  }
  const media = item as Item & {
    "media:thumbnail"?: { $?: { url?: string } } | { $?: { url?: string } }[];
  };
  const thumb = media["media:thumbnail"];
  if (thumb) {
    const t = Array.isArray(thumb) ? thumb[0] : thumb;
    const u = t?.$?.url;
    if (u) return u;
  }
  const ext = item as Item & Record<string, unknown>;
  const blobs = [ext["content:encoded"], item.content, item.summary].filter(
    (x): x is string => typeof x === "string",
  );
  for (const html of blobs) {
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m?.[1]) return m[1];
  }
  return null;
}

async function aggregateGamingNews(limit: number): Promise<GamingNewsItem[]> {
  const feeds = getFeedUrls();
  const parser = new Parser({
    timeout: 14_000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Checkpoint/1.0; +https://checkpoint.app) RSS reader",
      Accept: "application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8",
    },
  });

  const settled = await Promise.allSettled(
    feeds.map(async (url) => {
      const feed = await parser.parseURL(url);
      return {
        source: (feed.title ?? new URL(url).hostname).replace(/^\s+|\s+$/g, ""),
        items: feed.items ?? [],
      };
    }),
  );

  type Row = GamingNewsItem & { _t: number };
  const rows: Row[] = [];

  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    const { source, items } = r.value;
    for (const item of items.slice(0, 40)) {
      if (!item.link?.trim() || !item.title?.trim()) continue;
      const title = item.title.trim();
      const excerpt = excerptFromItem(item);
      const link = item.link.trim();
      if (!matchesStrictGamingKeywords(title, excerpt, link)) continue;

      const pub = item.pubDate ? Date.parse(item.pubDate) : 0;
      rows.push({
        id: stableId(link),
        title,
        link,
        excerpt,
        source,
        imageUrl: extractImageUrl(item),
        publishedAt: item.pubDate ?? null,
        _t: Number.isFinite(pub) ? pub : 0,
      });
    }
  }

  const seen = new Set<string>();
  const unique = rows.filter((row) => {
    const key = normalizeLink(row.link);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => b._t - a._t);

  return unique.slice(0, limit).map(({ _t, ...rest }) => rest);
}

/**
 * Noticias agregadas desde varios RSS. Cacheada ~10 min (ISR) para no martillar las fuentes.
 */
export async function getGamingNewsFromRss(limit: number): Promise<GamingNewsItem[]> {
  const runner = unstable_cache(
    async () => aggregateGamingNews(limit),
    ["gaming-news-rss-v2-strict", String(limit)],
    { revalidate: 600 },
  );
  return runner();
}
