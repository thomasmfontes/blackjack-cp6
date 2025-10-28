import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { username, password } = await req.json();
    const secret = process.env.API_SECRET;

    if (!secret) {
        return NextResponse.json({ error: "API_SECRET não configurado" }, { status: 500 });
    }

    // validação simples: senha precisa ser igual ao SECRET
    if (password === secret && typeof username === "string" && username.length > 0) {
        // token fake só para exercício
        const token = `access_token.${Buffer.from(username).toString("base64")}`;
        return NextResponse.json({ token, username });
    }

    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
}