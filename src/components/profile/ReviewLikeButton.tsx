"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleReviewLikeAction } from "@/app/profile/actions";

type Props = {
  reviewId: string;
  initialLiked: boolean;
  initialCount: number;
  /** Solo muestra contador (autor viendo sus reseñas). */
  readOnly?: boolean;
};

export function ReviewLikeButton({
  reviewId,
  initialLiked,
  initialCount,
  readOnly = false,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount, reviewId]);

  const onClick = () => {
    if (readOnly || pending) return;
    startTransition(async () => {
      const prevLiked = liked;
      const prevCount = count;
      setLiked(!prevLiked);
      setCount((c) => (prevLiked ? Math.max(0, c - 1) : c + 1));
      const res = await toggleReviewLikeAction(reviewId);
      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        return;
      }
      setLiked(res.liked);
      setCount(res.likeCount);
    });
  };

  const label =
    count === 0
      ? readOnly
        ? "Sin likes"
        : liked
          ? "Quitar me gusta"
          : "Me gusta"
      : readOnly
        ? `${count} me gusta`
        : liked
          ? `Quitar me gusta (${count})`
          : `Me gusta (${count})`;

  if (readOnly && count === 0) {
    return null;
  }

  if (readOnly) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-sm text-[#9ab]"
        title={label}
      >
        <span
          className="text-2xl leading-none text-orange-400/90"
          aria-hidden
        >
          ♥
        </span>
        <span className="tabular-nums">{count}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded py-0.5 text-sm text-[#9ab] transition hover:text-white disabled:opacity-50"
    >
      <span
        className={`text-2xl leading-none ${liked ? "text-orange-400/90" : "text-[#567]"}`}
        aria-hidden
      >
        {liked ? "♥" : "♡"}
      </span>
      {count > 0 ? (
        <span className="tabular-nums text-[#9ab]">{count}</span>
      ) : null}
    </button>
  );
}
