import type { ReactNode } from "react";

/**
 * Primitivas de skeleton (Server Components, sin JS en el cliente).
 * Los colores siguen la paleta de la app (#1f252d / #2f3642 sobre #14181c).
 */

type BoxProps = { className?: string };

export function Skeleton({ className = "" }: BoxProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-[#1f252d] motion-reduce:animate-none ${className}`}
    />
  );
}

/** Placeholder del Navbar: misma posición absoluta y altura aproximada. */
export function NavbarSkeleton() {
  return (
    <header aria-hidden className="absolute inset-x-0 top-0 z-20">
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex min-h-[3.25rem] w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-2 sm:min-h-14 sm:px-6 sm:py-1 md:h-16 lg:px-8">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-lg sm:size-9" />
            <Skeleton className="h-3 w-24 sm:w-32" />
          </div>
          <div className="hidden items-center gap-5 md:flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-2.5 w-14" />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}

type ShellProps = {
  children: ReactNode;
  /** Clases del <main>; por defecto el contenedor estándar de la app. */
  mainClassName?: string;
  bgClassName?: string;
};

/** Contenedor de página con Navbar placeholder y anuncio para lectores de pantalla. */
export function PageSkeleton({
  children,
  mainClassName = "mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32",
  bgClassName = "bg-[#14181c]",
}: ShellProps) {
  return (
    <div className={`min-h-full ${bgClassName} font-sans text-white`}>
      <NavbarSkeleton />
      <main
        className={mainClassName}
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Cargando…</span>
        {children}
      </main>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="flex h-[26rem] w-full flex-col overflow-hidden rounded-2xl border border-[#2f3642] bg-[#1a1f26] sm:h-[27.5rem]">
      <Skeleton className="h-[11.25rem] w-full shrink-0 rounded-none sm:h-[12.5rem]" />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="mt-auto h-3.5 w-2/5" />
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-[#2f3642] bg-[#1a1f26]">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex min-h-0">
          <NewsCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/** Cabecera de perfil (avatar + nombre + stats) y sub-navegación. */
export function ProfileHeaderSkeleton() {
  return (
    <>
      <header className="border-b border-[#2f3642] pb-8">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-start md:gap-6">
          <Skeleton className="size-24 shrink-0 rounded-full md:size-[104px]" />
          <div className="flex w-full flex-col items-center gap-3 md:items-start">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3.5 w-64 max-w-full" />
            <div className="mt-2 flex gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-2.5 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-b border-[#2f3642] py-3 md:justify-start">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
    </>
  );
}

export function SectionHeadingSkeleton() {
  return <Skeleton className="h-2.5 w-32" />;
}

/** Fila de 4 portadas (Top 4 / favoritos). */
export function CoverRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Lista de reseñas / entradas con portada a la izquierda. */
export function EntryListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="divide-y divide-[#2f3642]">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex gap-4 py-5 first:pt-0">
          <Skeleton className="h-24 w-16 shrink-0 rounded sm:h-28 sm:w-[4.5rem]" />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Sidebar de perfil: bloques con título y miniaturas. */
export function ProfileSidebarSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-4">
          <SectionHeadingSkeleton />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} className="aspect-[3/4] w-full rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Cuadrícula de portadas para el detalle de una lista. */
export function CoverGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
      ))}
    </div>
  );
}

export function BackLinkSkeleton() {
  return <Skeleton className="h-3 w-24" />;
}
