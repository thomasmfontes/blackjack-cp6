export interface APICard {
  code: string;
  image: string;
  suit: "HEARTS"|"DIAMONDS"|"CLUBS"|"SPADES";
  value:
    | "ACE"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"JACK"|"QUEEN"|"KING";
}

export interface DeckNewResp {
  success: boolean;
  deck_id: string;
  remaining: number;
  shuffled: boolean;
}

export interface DrawResp {
  success: boolean;
  deck_id: string;
  remaining: number;
  cards: APICard[];
}

export type GameStatus =
  | "Jogando" | "Blackjack" | "Perdeu" | "Dealer" | "Empate" | "Esperando Nova Rodada";