import Image from "next/image";
import Link from "next/link";
import { ListTiltedPreview } from "@/components/lists/ListTiltedPreview";
import type { UserListWithPreview } from "@/lib/supabase/user-lists";
import { RAWG_COVER_QUALITY } from "@/lib/rawg-image";

type Props = { list: UserListWithPreview };

export function UserListRow({ list }: Props) {
  const desc = list.description?.trim();
  const snippet = desc
    ? desc.length > 140
      ? `${desc.slice(0, 140)}…`
      : desc
    : list.game_count === 0
      ? "Sin juegos aún."
      : null;

  const countLabel = `${list.game_count} ${list.game_count === 1 ? "juego" : "juegos"}`;

  return (
    <li className="w-full border-b border-[#2f3642] pb-8 last:border-b-0 last:pb-0 md:border-0 md:pb-0">
      <Link
        href={`/lists/${list.id}`}
        className="group flex w-full flex-col gap-3 md:max-w-[260px] md:items-center md:gap-2"
        aria-label={`Abrir lista: ${list.name}`}
      >
        <div className="flex w-full items-start justify-between gap-3 md:hidden">
          <span className="min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-white">
            {list.name}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-[#9ab]">
            {countLabel}
          </span>
        </div>

        <div className="hidden w-full md:flex md:flex-col md:items-center">
          <ListTiltedPreview list={list} />
          <p className="mt-2 text-center text-xs tabular-nums text-[#9ab]">
            {countLabel}
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
          {list.preview_images.length === 0 ? (
            <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-sm bg-[#1f252d] text-[10px] text-[#567] ring-1 ring-[#2f3642]">
              —
            </div>
          ) : (
            list.preview_images.slice(0, 10).map((src, i) => (
              <div
                key={`${list.id}-${i}`}
                className="relative h-28 w-[4.25rem] shrink-0 overflow-hidden rounded-sm bg-[#1f252d] ring-1 ring-[#2f3642]"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="68px"
                  quality={RAWG_COVER_QUALITY}
                />
              </div>
            ))
          )}
        </div>

        {snippet ? (
          <p className="line-clamp-2 text-left text-[11px] italic leading-relaxed text-[#678] md:text-center">
            {snippet}
          </p>
        ) : null}
      </Link>
    </li>
  );
}
