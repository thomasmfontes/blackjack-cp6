import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
    const r = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", {
        cache: "no-store",
    });
    const text = await r.text();
    if (!r.ok) return NextResponse.json({ success: false, status: r.status, body: text }, { status: r.status });
    try { return NextResponse.json(JSON.parse(text)); }
    catch { return NextResponse.json({ success: false, error: "invalid json", body: text }, { status: 502 }); }
}