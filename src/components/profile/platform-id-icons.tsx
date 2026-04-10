export type PlatformKey =
  | "playstation"
  | "xbox"
  | "steam"
  | "nintendo"
  | "epic"
  | "battlenet";

/** Archivos en public/assets/icons/platforms/ — puedes sustituirlos por tus PNG/SVG (mismo nombre). */
const PLATFORM_SRC: Record<PlatformKey, string> = {
  playstation: "/assets/icons/platforms/playstation.png",
  xbox: "/assets/icons/platforms/xbox.png",
  steam: "/assets/icons/platforms/steam.png",
  nintendo: "/assets/icons/platforms/nintendo.png",
  epic: "/assets/icons/platforms/epic.png",
  battlenet: "/assets/icons/platforms/battlenet.png",
};

/** PlayStation, Battle.net (azules), Nintendo (rojo), Epic (negro): relleno de marca. Resto: gris. */
const PLATFORM_FRAME_CLASS: Record<PlatformKey, string> = {
  playstation: "bg-[#003087] p-0 ring-1 ring-white/25",
  xbox: "bg-[#252b33] p-[2.5px] ring-1 ring-white/15",
  steam: "bg-[#252b33] p-0 ring-1 ring-white/15",
  nintendo: "bg-[#E60012] p-0 ring-1 ring-white/25",
  epic: "bg-black p-0 ring-1 ring-white/25",
  battlenet: "bg-[#00AEFF] p-0 ring-1 ring-white/25",
};

/** Epic: escudo alto; se escala para que quepa en el círculo. */
const EPIC_IMG_CLASS =
  "max-h-[58%] max-w-[58%] min-h-0 min-w-0 object-contain";

/** Steam: cubre todo el círculo (el PNG es casi circular). */
const STEAM_IMG_CLASS = "h-full w-full object-cover object-center";

export function PlatformIdIcon({ platform }: { platform: PlatformKey }) {
  const imgClass =
    platform === "epic"
      ? EPIC_IMG_CLASS
      : platform === "steam"
        ? STEAM_IMG_CLASS
        : "h-full w-full object-contain";

  return (
    <span
      className={`inline-flex size-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full ${PLATFORM_FRAME_CLASS[platform]}`}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- iconos estáticos en /public */}
      <img
        src={PLATFORM_SRC[platform]}
        alt=""
        width={24}
        height={24}
        className={imgClass}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
