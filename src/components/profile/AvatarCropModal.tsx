"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { createClient } from "@/lib/supabase/client";
import { getCroppedImageBlob } from "@/lib/get-cropped-image";

type Props = {
  imageSrc: string;
  userId: string;
  onClose: () => void;
  onImageReplace: (nextBlobUrl: string) => void;
  onUploaded: (publicUrl: string) => void;
};

export function AvatarCropModal({
  imageSrc,
  userId,
  onClose,
  onImageReplace,
  onUploaded,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [applying, setApplying] = useState(false);
  const croppedAreaPixelsRef = useRef<Area | null>(null);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    croppedAreaPixelsRef.current = pixels;
  }, []);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    croppedAreaPixelsRef.current = null;
  }, [imageSrc]);

  async function applyCropAndUpload() {
    const pixels = croppedAreaPixelsRef.current;
    if (!pixels) {
      alert("Espera a que cargue la imagen y vuelve a intentar.");
      return;
    }
    setApplying(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, pixels);
      if (!blob) {
        alert("No se pudo generar la imagen recortada.");
        setApplying(false);
        return;
      }
      if (blob.size > 2 * 1024 * 1024) {
        alert("La imagen resultante es demasiado grande; reduce el zoom.");
        setApplying(false);
        return;
      }
      const supabase = createClient();
      const path = `${userId}/${Date.now()}-avatar.png`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, {
          contentType: "image/png",
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        alert(
          error.message.includes("Bucket not found") ||
            error.message.includes("not found")
            ? "Falta el bucket de avatares: ejecuta supabase/migrations/003_storage_avatars.sql."
            : error.message,
        );
        setApplying(false);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      onUploaded(data.publicUrl);
    } finally {
      setApplying(false);
    }
  }

  function onPickAnother(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("El archivo es demasiado grande (máx. 8 MB para editar).");
      return;
    }
    const next = URL.createObjectURL(file);
    onImageReplace(next);
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[#2f3642] bg-[#1e2329] shadow-2xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <h2
          id="avatar-crop-title"
          className="border-b border-[#2f3642] px-4 py-3 text-base font-medium text-white"
        >
          Avatar
        </h2>

        <div className="relative min-h-[280px] flex-1 bg-[#0d0f12] sm:min-h-[360px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="horizontal-cover"
            classes={{
              containerClassName: "h-full w-full",
              mediaClassName: "max-h-none",
            }}
          />
        </div>

        <div className="flex items-center gap-3 border-t border-[#2f3642] bg-[#252b33] px-3 py-3 sm:px-4">
          <button
            type="button"
            aria-label="Alejar"
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#1a1f26] text-lg font-medium text-white/90 hover:bg-[#2a3140]"
            onClick={() => setZoom((z) => Math.max(1, Number((z - 0.12).toFixed(2))))}
          >
            −
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-2 min-w-0 flex-1 cursor-pointer accent-emerald-500"
            aria-label="Zoom"
          />
          <button
            type="button"
            aria-label="Acercar"
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#1a1f26] text-lg font-medium text-white/90 hover:bg-[#2a3140]"
            onClick={() => setZoom((z) => Math.min(3, Number((z + 0.12).toFixed(2))))}
          >
            +
          </button>

          <label
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-[#3d4654] bg-[#1a1f26] text-white/90 hover:border-[#556] hover:bg-[#2a3140]"
            title="Cambiar archivo"
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={onPickAnother}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[#2f3642] bg-[#1e2329] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#3d4654] px-4 py-2.5 text-sm font-medium text-[#bcd] hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={applying}
            onClick={applyCropAndUpload}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {applying ? "Subiendo…" : "Aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
