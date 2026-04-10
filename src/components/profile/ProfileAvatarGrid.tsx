import Link from "next/link";
import { publicProfilePath } from "@/lib/public-profile";
import type { FriendProfile } from "@/lib/supabase/friends";

type Props = {
  people: FriendProfile[];
  emptyLabel: string;
};

export function ProfileAvatarGrid({ people, emptyLabel }: Props) {
  if (!people.length) {
    return <p className="text-sm text-[#678]">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {people.map((p) => (
        <Link
          key={p.id}
          href={publicProfilePath(p)}
          title={p.display_name ?? p.username ?? "Perfil"}
          className="size-9 overflow-hidden rounded-full ring-1 ring-white/10 transition hover:ring-emerald-500/40"
        >
          {p.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_url} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[#1f252d] text-[11px] font-semibold text-white/80">
              {(p.display_name ?? p.username ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
