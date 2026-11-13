#!/usr/bin/env node
/**
 * Migración RAWG → IGDB: rellena `igdb_id` (y la carátula) en las filas existentes
 * buscando cada `game_name` en IGDB. Ejecutar DESPUÉS de aplicar
 * supabase/migrations/020_igdb_game_ids_step1.sql.
 *
 * Uso:
 *   node --env-file=.env.local scripts/relink-igdb.mjs --dry-run   # solo muestra qué haría
 *   node --env-file=.env.local scripts/relink-igdb.mjs             # aplica los cambios
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (Supabase → Settings → API;
 *   salta RLS, no la expongas nunca en el cliente), IGDB_CLIENT_ID, IGDB_CLIENT_SECRET.
 */
import { createClient } from "@supabase/supabase-js";

const TABLES = [
  "favorite_games",
  "game_activity",
  "game_reviews",
  "game_backlog",
  "user_list_entries",
];
const DRY_RUN = process.argv.includes("--dry-run");
const PAGE = 1000;

const env = (name) => {
  const v = process.env[name];
  if (!v) {
    console.error(`Falta ${name} en el entorno (.env.local).`);
    process.exit(1);
  }
  return v;
};

const supabase = createClient(
  env("NEXT_PUBLIC_SUPABASE_URL"),
  env("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } },
);
const IGDB_CLIENT_ID = env("IGDB_CLIENT_ID");
const IGDB_CLIENT_SECRET = env("IGDB_CLIENT_SECRET");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getToken() {
  const url = new URL("https://id.twitch.tv/oauth2/token");
  url.searchParams.set("client_id", IGDB_CLIENT_ID);
  url.searchParams.set("client_secret", IGDB_CLIENT_SECRET);
  url.searchParams.set("grant_type", "client_credentials");
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`Twitch OAuth ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

async function searchIgdb(token, name) {
  const q = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `search "${q}"; fields id,name,cover.image_id; where version_parent = null; limit 10;`,
    });
    if (res.status === 429) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`IGDB ${res.status}: ${await res.text()}`);
    const results = await res.json();
    if (results.length === 0) return null;
    // Preferir coincidencia exacta del nombre; si no, el primer resultado de IGDB.
    const target = normalize(name);
    return results.find((g) => normalize(g.name) === target) ?? results[0];
  }
  throw new Error("IGDB: demasiadas peticiones (429)");
}

async function loadPendingRows(table) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("rawg_id, game_name")
      .is("igdb_id", null)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

async function main() {
  console.log(DRY_RUN ? "== Modo prueba (no se escribe nada) ==\n" : "== Aplicando cambios ==\n");

  // 1) Juegos distintos (por rawg_id) pendientes en todas las tablas.
  const pendingByTable = {};
  const games = new Map(); // rawg_id -> game_name
  for (const table of TABLES) {
    const rows = await loadPendingRows(table);
    pendingByTable[table] = rows.length;
    for (const r of rows) if (r.rawg_id != null && !games.has(r.rawg_id)) games.set(r.rawg_id, r.game_name);
  }
  console.log("Filas pendientes:", pendingByTable);
  console.log(`Juegos distintos a buscar: ${games.size}\n`);

  // 2) Buscar cada uno en IGDB (secuencial: límite de 4 peticiones/s).
  const token = await getToken();
  const matches = new Map(); // rawg_id -> { igdbId, name, cover }
  const unmatched = [];
  for (const [rawgId, name] of games) {
    const hit = await searchIgdb(token, name);
    await sleep(280);
    if (!hit) {
      unmatched.push({ rawgId, name });
      console.log(`  ✗ ${name}  (RAWG ${rawgId}) → sin resultados`);
      continue;
    }
    const cover = hit.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${hit.cover.image_id}.jpg`
      : null;
    matches.set(rawgId, { igdbId: hit.id, name: hit.name, cover });
    const flag = normalize(hit.name) === normalize(name) ? "✓" : "≈";
    console.log(`  ${flag} ${name}  →  ${hit.name} (IGDB ${hit.id})`);
  }

  // 3) Escribir igdb_id + carátula nueva.
  if (!DRY_RUN) {
    for (const table of TABLES) {
      for (const [rawgId, m] of matches) {
        const patch = { igdb_id: m.igdbId };
        if (m.cover) patch.background_image = m.cover;
        const { error } = await supabase
          .from(table)
          .update(patch)
          .eq("rawg_id", rawgId)
          .is("igdb_id", null);
        if (error) throw new Error(`${table} (RAWG ${rawgId}): ${error.message}`);
      }
    }
  }

  console.log(`\nVinculados: ${matches.size} · Sin vincular: ${unmatched.length}`);
  console.log("≈ = el nombre no coincide exactamente; revisa esos casos.");
  if (unmatched.length > 0) {
    console.log("\nSin vincular (021 los BORRARÁ si no les pones igdb_id a mano):");
    for (const u of unmatched) console.log(`  - ${u.name} (RAWG ${u.rawgId})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
