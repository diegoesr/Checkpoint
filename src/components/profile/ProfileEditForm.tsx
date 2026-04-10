"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  saveProfileLinksAction,
  updateProfileSettingsAction,
} from "@/app/profile/actions";
import type { ProfileLinkRecord } from "@/lib/supabase/profile-dashboard";
import { AvatarCropModal } from "@/components/profile/AvatarCropModal";

type ProfileFormState = { ok: false; error: string } | null;

type Props = {
  userId: string;
  email: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  psnId: string;
  xboxGamertag: string;
  steamDisplay: string;
  nintendoFriendCode: string;
  epicDisplayName: string;
  battlenetBtag: string;
  links: ProfileLinkRecord[];
};

export function ProfileEditForm({
  userId,
  email,
  displayName,
  username,
  bio,
  avatarUrl: initialAvatarUrl,
  psnId,
  xboxGamertag,
  steamDisplay,
  nintendoFriendCode,
  epicDisplayName,
  battlenetBtag,
  links: initialLinks,
}: Props) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [cropModalSrc, setCropModalSrc] = useState<string | null>(null);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl);
  }, [initialAvatarUrl]);
  const [profileState, profileAction, profilePending] = useActionState(
    async (_prev: ProfileFormState, formData: FormData) =>
      updateProfileSettingsAction(_prev, formData),
    null as ProfileFormState,
  );

  const [linkRows, setLinkRows] = useState(() =>
    initialLinks.length
      ? initialLinks.map((l) => ({ label: l.label, url: l.url }))
      : [{ label: "", url: "" }],
  );
  const [linksStatus, setLinksStatus] = useState<string | null>(null);
  const [linksBusy, setLinksBusy] = useState(false);

  async function saveLinks() {
    setLinksBusy(true);
    setLinksStatus(null);
    const res = await saveProfileLinksAction(linkRows);
    setLinksBusy(false);
    if (!res.ok) {
      setLinksStatus(res.error);
      return;
    }
    setLinksStatus("Enlaces guardados.");
    router.refresh();
  }

  function closeCropModal() {
    setCropModalSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function replaceCropImage(nextBlobUrl: string) {
    setCropModalSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextBlobUrl;
    });
  }

  function onAvatarFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("La imagen debe pesar como máximo 8 MB para editarla.");
      return;
    }
    const url = URL.createObjectURL(file);
    setCropModalSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }

  const previewInitial = displayName.slice(0, 1).toUpperCase() || "?";

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
          Foto de perfil
        </h2>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <div className="relative size-28 overflow-hidden rounded-full bg-[#1f252d] ring-2 ring-[#2f3642] sm:size-32">
              {avatarUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl.trim()}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-3xl font-semibold text-white/80">
                  {previewInitial}
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-4 max-w-lg">
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={onAvatarFilePick}
                />
                Elegir imagen…
              </label>
              <p className="mt-2 text-xs text-[#678]">
                JPG, PNG, WebP o GIF (máx. 8 MB)
              </p>
            </div>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
                O pega URL de la imagen
              </span>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
                placeholder="https://…"
              />
            </label>
          </div>
        </div>
      </section>

      {cropModalSrc ? (
        <AvatarCropModal
          imageSrc={cropModalSrc}
          userId={userId}
          onClose={closeCropModal}
          onImageReplace={replaceCropImage}
          onUploaded={(url) => {
            setAvatarUrl(url);
            closeCropModal();
          }}
        />
      ) : null}

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
          Cuenta y perfil
        </h2>
        <form action={profileAction} className="mt-6 space-y-4 max-w-lg">
          {profileState?.ok === false ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {profileState.error}
            </p>
          ) : null}

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
              Nombre visible
            </span>
            <input
              name="display_name"
              type="text"
              defaultValue={displayName}
              className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
              Usuario (3–24, letras, números, _ y -)
            </span>
            <input
              name="username"
              type="text"
              defaultValue={username}
              autoComplete="username"
              className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
              placeholder="mi_usuario"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
              Frase / bio
            </span>
            <textarea
              name="bio"
              rows={3}
              defaultValue={bio}
              className="mt-1.5 w-full resize-none rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
            />
          </label>

          <div className="rounded-lg border border-[#2f3642] bg-[#1a1f26] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#678]">
              IDs para agregarte
            </p>
            <p className="mt-1.5 text-xs text-[#678]">
              Opcional. Tus amigos verán estos datos en tu perfil para
              invitarte en cada plataforma (máx. 80 caracteres cada uno).
            </p>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
                  PlayStation (PSN)
                </span>
                <input
                  name="psn_id"
                  type="text"
                  defaultValue={psnId}
                  autoComplete="off"
                  maxLength={80}
                  className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
                  placeholder="Tu ID en línea de PlayStation"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
                  Xbox (Gamertag)
                </span>
                <input
                  name="xbox_gamertag"
                  type="text"
                  defaultValue={xboxGamertag}
                  autoComplete="off"
                  maxLength={80}
                  className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
                  placeholder="Gamertag"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
                  Steam (PC)
                </span>
                <input
                  name="steam_display"
                  type="text"
                  defaultValue={steamDisplay}
                  autoComplete="off"
                  maxLength={80}
                  className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
                  placeholder="Nombre de perfil o código de amigo"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
                  Nintendo Switch
                </span>
                <input
                  name="nintendo_friend_code"
                  type="text"
                  defaultValue={nintendoFriendCode}
                  autoComplete="off"
                  maxLength={80}
                  className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
                  placeholder="Código de amigo u otro identificador"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
                  Epic Games (PC)
                </span>
                <input
                  name="epic_display_name"
                  type="text"
                  defaultValue={epicDisplayName}
                  autoComplete="off"
                  maxLength={80}
                  className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
                  placeholder="Nombre para mostrar / para agregar"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
                  Battle.net
                </span>
                <input
                  name="battlenet_btag"
                  type="text"
                  defaultValue={battlenetBtag}
                  autoComplete="off"
                  maxLength={80}
                  className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
                  placeholder="BattleTag (ej. Jugador#1234)"
                />
              </label>
            </div>
          </div>

          <input type="hidden" name="avatar_url" value={avatarUrl} />

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ab]">
              Correo
            </span>
            <input
              name="email"
              type="email"
              defaultValue={email}
              autoComplete="email"
              className="mt-1.5 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white placeholder:text-white/35"
            />
            <span className="mt-1 block text-xs text-[#678]">
              Si cambias el correo, Supabase puede enviarte un enlace de confirmación.
            </span>
          </label>

          <button
            type="submit"
            disabled={profilePending}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {profilePending ? "Guardando…" : "Guardar perfil"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#678]">
          Enlaces (Twitch, Steam, PlayStation…)
        </h2>
        <p className="mt-2 max-w-lg text-sm text-[#9ab]">
          Etiqueta libre y URL completa o dominio (se añade https:// si falta).
        </p>
        <div className="mt-4 space-y-3 max-w-lg">
          {linkRows.map((row, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="text-[10px] uppercase tracking-wider text-[#678]">
                  Etiqueta
                </span>
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => {
                    const next = [...linkRows];
                    next[i] = { ...next[i], label: e.target.value };
                    setLinkRows(next);
                  }}
                  className="mt-1 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white"
                  placeholder="Twitch"
                />
              </label>
              <label className="block flex-[2]">
                <span className="text-[10px] uppercase tracking-wider text-[#678]">
                  URL
                </span>
                <input
                  type="text"
                  value={row.url}
                  onChange={(e) => {
                    const next = [...linkRows];
                    next[i] = { ...next[i], url: e.target.value };
                    setLinkRows(next);
                  }}
                  className="mt-1 w-full rounded-lg border border-[#2f3642] bg-[#1f252d] px-3 py-2 text-sm text-white"
                  placeholder="twitch.tv/…"
                />
              </label>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLinkRows([...linkRows, { label: "", url: "" }])}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/90 hover:bg-white/5"
            >
              + Enlace
            </button>
            <button
              type="button"
              disabled={linksBusy}
              onClick={saveLinks}
              className="rounded-lg bg-[#2c3440] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3a4450] disabled:opacity-50"
            >
              {linksBusy ? "Guardando…" : "Guardar enlaces"}
            </button>
          </div>
          {linksStatus ? (
            <p
              className={`text-sm ${linksStatus.includes("Error") || linksStatus.includes("Ejecuta") || linksStatus.includes("migración") ? "text-red-300" : "text-emerald-300"}`}
            >
              {linksStatus}
            </p>
          ) : null}
        </div>
      </section>

      <p>
        <Link
          href="/profile"
          className="text-sm text-[#40bcf4] hover:underline"
        >
          ← Volver al perfil
        </Link>
      </p>
    </div>
  );
}
