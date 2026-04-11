"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  followUserAction,
  removeFollowerAction,
} from "@/app/friends/actions";
import { PublicProfileUnfollowButton } from "@/components/profile/PublicProfileUnfollowButton";

type Props = {
  profileUserId: string;
  displayLabel: string;
  viewerFollowsProfile: boolean;
  /** El dueño de este perfil sigue al visitante (puedes quitarlo de tus seguidores). */
  profileFollowsViewer: boolean;
};

export function PublicProfileRelationshipActions({
  profileUserId,
  displayLabel,
  viewerFollowsProfile,
  profileFollowsViewer,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [followBusy, setFollowBusy] = useState(false);
  const [removeBusy, setRemoveBusy] = useState(false);
  /** Tras quitar al dueño del perfil de tus seguidores, ocultar opciones hasta que el servidor coincida. */
  const [removedThemAsFollower, setRemovedThemAsFollower] = useState(false);

  useEffect(() => {
    if (!profileFollowsViewer) setRemovedThemAsFollower(false);
  }, [profileFollowsViewer]);

  useEffect(() => {
    setRemovedThemAsFollower(false);
  }, [profileUserId]);

  const theyFollowMe = profileFollowsViewer && !removedThemAsFollower;

  async function onFollow() {
    setFollowBusy(true);
    const res = await followUserAction(profileUserId, pathname);
    setFollowBusy(false);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  async function onRemoveFollower() {
    const name = displayLabel.trim() || "este jugador";
    if (
      !window.confirm(
        `¿Quitar a ${name} de tus seguidores? Dejará de seguirte y ya no aparecerá en tu lista de seguidores.`,
      )
    )
      return;
    setRemoveBusy(true);
    const res = await removeFollowerAction(profileUserId, pathname);
    setRemoveBusy(false);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    setRemovedThemAsFollower(true);
    router.refresh();
  }

  return (
    <div className="mt-4 flex max-md:justify-center md:justify-start">
      <div className="flex w-full max-w-md flex-col gap-2 sm:max-w-none">
        {theyFollowMe ? (
          <p className="text-[12px] font-medium text-[#9ab]">
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-white/85">
              Te sigue
            </span>
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
          {!viewerFollowsProfile ? (
            <button
              type="button"
              disabled={followBusy}
              onClick={onFollow}
              aria-label="Seguir — añadir a la lista de personas que sigues"
              className="touch-manipulation rounded-lg border border-[#40bcf4]/55 bg-[#40bcf4]/25 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#40bcf4]/80 hover:bg-[#40bcf4]/35 disabled:opacity-50 sm:text-xs"
            >
              {followBusy ? "Enviando…" : "Seguir"}
            </button>
          ) : (
            <PublicProfileUnfollowButton
              targetUserId={profileUserId}
              displayLabel={displayLabel}
              revalidatePagePath={pathname}
            />
          )}
          {theyFollowMe ? (
            <button
              type="button"
              disabled={removeBusy}
              onClick={onRemoveFollower}
              className="touch-manipulation rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#bcd] transition hover:border-white/30 hover:bg-white/10 disabled:opacity-50 sm:text-xs"
            >
              {removeBusy ? "…" : "Eliminar de seguidores"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
