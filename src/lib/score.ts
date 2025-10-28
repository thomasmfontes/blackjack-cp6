import type { APICard } from "./types";

// Converte uma carta para pontos (Ás flexível)
export function scoreHand(cards: APICard[]): number {
    const base = cards.reduce((acc, c) => {
        if (c.value === "ACE") return acc + 11; // trataremos depois se passar de 21
        if (["KING", "QUEEN", "JACK"].includes(c.value)) return acc + 10;
        return acc + Number(c.value);
    }, 0);

    // Reduz Aces de 11 para 1 se estourar
    let aces = cards.filter((c) => c.value === "ACE").length;
    let total = base;
    while (total > 21 && aces > 0) {
        total -= 10; // 11 -> 1
        aces--;
    }
    return total;
}