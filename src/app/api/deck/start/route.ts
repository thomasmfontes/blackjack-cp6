import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
    const r = await fetch("https://deckofcardsapi.com/api/deck/new/draw/?count=4", {
        cache: "no-store",
    });
    const text = await r.text();
    if (!r.ok) {
        return NextResponse.json({ success: false, status: r.status, body: text }, { status: r.status });
    }
    try {
        // body tem: { success, deck_id, cards:[4], remaining, ... }
        const data = JSON.parse(text);
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ success: false, error: "invalid json", body: text }, { status: 502 });
    }
}