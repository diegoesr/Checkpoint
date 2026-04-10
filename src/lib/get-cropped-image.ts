import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (e) => reject(e));
    image.src = src;
  });
}

/** Recorta la región indicada y la escala a un cuadrado (listo para avatar circular en UI). */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 512,
): Promise<Blob | null> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png", 0.92);
  });
}
