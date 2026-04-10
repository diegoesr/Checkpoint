"use client";

import TiltedCard from "@/components/ui/TiltedCard";
import type { UserListWithPreview } from "@/lib/supabase/user-lists";

/** Proporción casi cuadrada (~4:5 ligero), similar al ejemplo de ReactBits */
const COVER_W = 240;
const COVER_H = 260;

const LIST_COVER_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_W}" height="${COVER_H}" viewBox="0 0 ${COVER_W} ${COVER_H}"><rect fill="#2a3138" width="${COVER_W}" height="${COVER_H}"/><text x="${COVER_W / 2}" y="${COVER_H / 2}" dominant-baseline="middle" text-anchor="middle" fill="#678" font-family="system-ui,sans-serif" font-size="12">Sin juegos</text></svg>`,
  );

type Props = { list: UserListWithPreview };

export function ListTiltedPreview({ list }: Props) {
  const firstCover = list.preview_images[0];
  const imageSrc = firstCover ?? LIST_COVER_PLACEHOLDER;

  return (
    <TiltedCard
      imageSrc={imageSrc}
      altText={list.name}
      captionText={list.name}
      containerHeight={`${COVER_H}px`}
      containerWidth={`${COVER_W}px`}
      imageHeight={`${COVER_H}px`}
      imageWidth={`${COVER_W}px`}
      rotateAmplitude={12}
      scaleOnHover={1.05}
      showMobileWarning={false}
      showTooltip
      displayOverlayContent
      overlayContent={
        <div className="pointer-events-none relative h-full w-full rounded-[15px]">
          <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full bg-black/55 px-3 py-1.5 shadow-lg backdrop-blur-md ring-1 ring-white/15">
            <p className="line-clamp-2 text-left text-xs font-bold leading-tight text-white sm:text-[13px]">
              {list.name}
            </p>
          </div>
        </div>
      }
    />
  );
}
