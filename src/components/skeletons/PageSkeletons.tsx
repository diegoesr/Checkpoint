import {
  BackLinkSkeleton,
  CoverGridSkeleton,
  CoverRowSkeleton,
  EntryListSkeleton,
  GameCardSkeleton,
  NewsGridSkeleton,
  PageSkeleton,
  ProfileHeaderSkeleton,
  ProfileSidebarSkeleton,
  SectionHeadingSkeleton,
  Skeleton,
} from "@/components/skeletons/Skeleton";

const PROFILE_MAIN =
  "mx-auto max-w-[1100px] px-3 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32";
const PUBLIC_PROFILE_MAIN =
  "mx-auto max-w-[1100px] px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32";

/** Inicio: hero, carrusel de portadas y noticias. */
export function HomeSkeleton() {
  return (
    <PageSkeleton bgClassName="flex flex-col bg-black" mainClassName="contents">
        <section className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 pt-32 text-center">
          <Skeleton className="h-10 w-72 max-w-full sm:h-14 sm:w-[32rem]" />
          <Skeleton className="h-4 w-64 max-w-full sm:w-96" />
          <Skeleton className="mt-4 h-11 w-40 rounded-full" />
        </section>
        <section className="border-t border-white/10 bg-black py-8">
          <div className="flex gap-4 overflow-hidden px-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton
                key={i}
                className="h-[220px] w-[150px] shrink-0 rounded-xl sm:h-[250px] sm:w-[170px]"
              />
            ))}
          </div>
        </section>
        <section className="border-t border-[#2f3642] bg-[#14181c] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="border-b border-[#2f3642] pb-4">
              <SectionHeadingSkeleton />
            </div>
            <NewsGridSkeleton count={3} />
          </div>
        </section>
    </PageSkeleton>
  );
}

export function GamesSkeleton() {
  return (
    <PageSkeleton>
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="mt-6 h-11 w-full rounded-xl" />
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="flex min-w-0">
            <GameCardSkeleton />
          </li>
        ))}
      </ul>
    </PageSkeleton>
  );
}

export function GameDetailSkeleton() {
  return (
    <PageSkeleton mainClassName="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
      <BackLinkSkeleton />
      <div className="mt-8 overflow-hidden rounded-2xl border border-[#2f3642] bg-[#1a1f26]">
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="space-y-4 p-6 sm:p-8">
          <Skeleton className="h-8 w-2/3" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3.5 w-3/5" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className={`h-3.5 ${i === 5 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
          <Skeleton className="mt-6 h-10 w-44 rounded-lg" />
        </div>
      </div>
    </PageSkeleton>
  );
}

export function NewsSkeleton() {
  return (
    <PageSkeleton>
      <BackLinkSkeleton />
      <div className="mt-8 flex items-baseline justify-between gap-4 border-b border-[#2f3642] pb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <NewsGridSkeleton count={9} />
    </PageSkeleton>
  );
}

export function SearchSkeleton() {
  return (
    <PageSkeleton
      bgClassName="bg-black"
      mainClassName="mx-auto max-w-3xl px-6 pb-24 pt-40 sm:pt-44"
    >
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <ul className="mt-6 space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <Skeleton className="size-20 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    </PageSkeleton>
  );
}

export function ListsSkeleton() {
  return (
    <PageSkeleton>
      <BackLinkSkeleton />
      <div className="mt-6 flex flex-col gap-8">
        <Skeleton className="h-11 w-44 rounded-lg" />
        <section>
          <SectionHeadingSkeleton />
          <ul className="mt-6 grid gap-8 md:grid-cols-2 md:gap-x-6 md:gap-y-10 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="flex flex-col gap-3 md:items-center">
                <div className="flex w-full max-w-[260px] -space-x-6">
                  {Array.from({ length: 4 }, (_, j) => (
                    <Skeleton
                      key={j}
                      className="aspect-[3/4] w-1/3 rounded-md ring-2 ring-[#14181c]"
                    />
                  ))}
                </div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-16" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageSkeleton>
  );
}

export function ListDetailSkeleton() {
  return (
    <PageSkeleton mainClassName="mx-auto max-w-[960px] px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
      <BackLinkSkeleton />
      <header className="mt-6 space-y-3 border-b border-[#2f3642] pb-8">
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-3.5 w-20" />
      </header>
      <div className="mt-8">
        <CoverGridSkeleton />
      </div>
    </PageSkeleton>
  );
}

/** Perfil propio (dashboard) y perfil público comparten estructura. */
export function ProfileDashboardSkeleton({ publicProfile = false }: { publicProfile?: boolean }) {
  return (
    <PageSkeleton mainClassName={publicProfile ? PUBLIC_PROFILE_MAIN : PROFILE_MAIN}>
      {publicProfile ? (
        <div className="mb-6">
          <BackLinkSkeleton />
        </div>
      ) : null}
      <ProfileHeaderSkeleton />
      <div className="mt-8 lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">
        <div className="min-w-0 space-y-10">
          <div className="space-y-4">
            <SectionHeadingSkeleton />
            <CoverRowSkeleton />
          </div>
          <div className="space-y-4 border-t border-[#2f3642] pt-10">
            <SectionHeadingSkeleton />
            <EntryListSkeleton count={3} />
          </div>
          <div className="space-y-4 border-t border-[#2f3642] pt-10">
            <SectionHeadingSkeleton />
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="size-10 rounded-full" />
              ))}
            </div>
          </div>
        </div>
        <aside
          className={`mt-12 border-t border-[#2f3642] pt-10 lg:mt-0 lg:block lg:border-t-0 lg:pt-0 ${
            publicProfile ? "" : "hidden"
          }`}
        >
          <ProfileSidebarSkeleton />
        </aside>
      </div>
    </PageSkeleton>
  );
}

/** Subpáginas de perfil (backlog, diario, reseñas, amigos…): cabecera + lista. */
export function ProfileSubpageSkeleton({ publicProfile = false }: { publicProfile?: boolean }) {
  return (
    <PageSkeleton mainClassName={publicProfile ? PUBLIC_PROFILE_MAIN : PROFILE_MAIN}>
      <ProfileHeaderSkeleton />
      <div className="mt-8 space-y-6">
        <SectionHeadingSkeleton />
        <EntryListSkeleton count={5} />
      </div>
    </PageSkeleton>
  );
}

/** Formularios (editar perfil, registrar, nueva lista). */
export function FormPageSkeleton({ mainClassName }: { mainClassName?: string }) {
  return (
    <PageSkeleton
      mainClassName={
        mainClassName ??
        "mx-auto max-w-3xl px-4 pb-24 pt-[4.5rem] sm:px-6 md:pt-28 lg:px-8 lg:pt-32"
      }
    >
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      <div className="mt-10 space-y-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
    </PageSkeleton>
  );
}

/** Login / registro: tarjeta centrada. */
export function AuthSkeleton() {
  return (
    <div className="relative min-h-full bg-[#0d1014] font-sans text-white">
      <div
        aria-busy="true"
        className="flex min-h-dvh items-center justify-center px-4"
      >
        <span className="sr-only">Cargando…</span>
        <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md">
          <Skeleton className="mx-auto h-6 w-40" />
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
