"use client";

import { useEffect, useState } from "react";
import DepthText from "@/components/text/DepthText";

const PHRASES = [
  "Lleva el control de tus juegos",
  "Prepara tu siguiente aventura",
  "Comparte lo mejor que has jugado",
];

/** Tiempo que se muestra cada frase (incluye la entrada en profundidad de 1.2 s). */
const PHRASE_MS = 4200;

/**
 * Titular del hero: rota las frases con DepthText. Cada cambio remonta el
 * componente (key) para repetir su animación de entrada en profundidad.
 */
export function HeroHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % PHRASES.length),
      PHRASE_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <h1 className="mx-auto w-full max-w-4xl text-center text-white">
      <span className="sr-only">{PHRASES[0]}</span>
      <span aria-hidden>
        <DepthText
          key={index}
          text={PHRASES[index]}
          wrap
          layers={28}
          depth={2.2}
          faceColor="#ffffff"
          depthColor="#7c3aed"
          tilt={7}
          orbitSpeed={0.25}
          fontSize="clamp(2rem, 6.2vw, 4.25rem)"
          fontWeight={800}
        />
      </span>
    </h1>
  );
}
