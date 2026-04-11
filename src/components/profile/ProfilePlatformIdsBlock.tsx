import type { ProfileRecord } from "@/lib/supabase/profile-dashboard";
import {
  PlatformIdIcon,
  type PlatformKey,
} from "@/components/profile/platform-id-icons";

const ROWS: {
  key: keyof Pick<
    ProfileRecord,
    | "psn_id"
    | "xbox_gamertag"
    | "steam_display"
    | "nintendo_friend_code"
    | "epic_display_name"
    | "battlenet_btag"
  >;
  label: string;
  platform: PlatformKey;
}[] = [
  { key: "psn_id", label: "PlayStation", platform: "playstation" },
  { key: "xbox_gamertag", label: "Xbox", platform: "xbox" },
  { key: "steam_display", label: "Steam (PC)", platform: "steam" },
  { key: "nintendo_friend_code", label: "Nintendo Switch", platform: "nintendo" },
  { key: "epic_display_name", label: "Epic Games (PC)", platform: "epic" },
  { key: "battlenet_btag", label: "Battle.net", platform: "battlenet" },
];

type Props = {
  profile: ProfileRecord | null;
  className?: string;
};

export function ProfilePlatformIdsBlock({ profile, className = "" }: Props) {
  const items = ROWS.map(({ key, label, platform }) => {
    const raw = profile?.[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    return { label, platform, value };
  }).filter((s) => s.value.length > 0);

  if (items.length === 0) return null;

  const listLayoutClass =
    items.length === 1
      ? "mt-3 flex list-none flex-col items-center gap-y-3.5 p-0 md:grid md:grid-cols-1 md:gap-y-3.5"
      : "mt-3 flex list-none flex-col items-center gap-y-4 p-0 md:grid md:grid-cols-3 md:gap-x-5 md:gap-y-4";

  return (
    <div className={className}>
      <h2 className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#678] md:text-left">
        En consolas y launchers
      </h2>
      <ul className={listLayoutClass}>
        {items.map(({ label, platform, value }) => (
          <li
            key={label}
            className="flex w-max max-w-full min-w-0 items-center justify-start gap-2 text-left sm:gap-2.5 md:w-full md:max-w-none"
          >
            <span className="sr-only">{label}</span>
            <span className="inline-flex w-6 shrink-0 justify-center sm:w-7">
              <PlatformIdIcon platform={platform} />
            </span>
            <span className="min-w-0 break-all text-left font-mono text-[13px] leading-snug text-[#e6edf3] sm:text-[14px] md:flex-1">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
