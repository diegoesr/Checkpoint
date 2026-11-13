/**
 * Ajustes de calidad para carátulas (IGDB). Next/Image usa `sizes` para elegir
 * ancho: si pedimos poco, en pantallas retina la imagen se ve pixelada. Subir
 * calidad y declarar un `sizes` algo mayor que el hueco CSS mejora la nitidez.
 */
export const GAME_COVER_QUALITY = 88;

/** Carátula vertical ~100–140px de ancho (actividad, modales compactos). */
export const GAME_COVER_SIZES_POSTER_COMPACT =
  "(max-width: 640px) 42vw, 220px";

/** Miniatura de reseña en lista (~72–80px de ancho). */
export const GAME_COVER_SIZES_REVIEW_ROW = "min(240px, 35vw)";
