import Image from "next/image";
import Link from "next/link";
import type { UserListEntryRecord } from "@/lib/supabase/user-lists";
import { RAWG_COVER_QUALITY } from "@/lib/rawg-image";

export function ListReadOnlyGrid({
  entries,
}: {
  entries: UserListEntryRecord[];
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-[#678]">Esta lista no tiene juegos aún.</p>
    );
  }

  return (
    <ul className="grid list-none grid-cols-4 gap-1 p-0 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4">
      {entries.map((e) => (
        <li key={e.id}>
          <Link
            href={`/games/${e.rawg_id}`}
            className="group block"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-[3px] bg-[#1f252d] ring-1 ring-[#2f3642] transition group-hover:ring-[#40bcf4]/40 sm:rounded-sm">
              {e.background_image ? (
                <Image
                  src={e.background_image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 45vw, 200px"
                  quality={RAWG_COVER_QUALITY}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-[#567]">
                  —
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-[#40bcf4] transition group-hover:text-[#5ccfff] max-md:hidden">
              {e.game_name}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
