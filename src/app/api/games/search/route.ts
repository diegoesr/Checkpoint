import { NextResponse } from "next/server";
import { searchGames } from "@/lib/rawg";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const data = await searchGames(q, 1, 20);
  return NextResponse.json(data ?? { results: [], count: 0 });
}
