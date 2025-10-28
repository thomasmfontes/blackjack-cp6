import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: Request, { params }: { params: Promise<{ deck_id: string }> }) {
    const { deck_id } = await params;
    const count = new URL(req.url).searchParams.get("count") ?? "1";

    const upstream = await fetch(
        `https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${count}`,
        { cache: "no-store" }
    );
    const body = await upstream.text();

    if (!upstream.ok) {
        return NextResponse.json(
            { success: false, error: "deck api error", status: upstream.status, deck_id, body },
            { status: upstream.status }
        );
    }

    try { return NextResponse.json(JSON.parse(body)); }
    catch { return NextResponse.json({ success: false, error: "invalid json", deck_id, body }, { status: 502 }); }
}