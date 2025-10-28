"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Protected from "../../components/Protected";
import { scoreHand } from "../../lib/score";
import type { APICard, DrawResp, GameStatus } from "../../lib/types";

interface Hand { 
  cards: APICard[] 
}

export default function BlackjackPage() {
  const [deckId, setDeckId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Hand>({ cards: [] });
  const [dealer, setDealer] = useState<Hand>({ cards: [] });
  const [status, setStatus] = useState<GameStatus>("Esperando Nova Rodada");
  const [loading, setLoading] = useState(false);

  const deckIdRef = useRef<string | null>(null);
  const inFlightRef = useRef<"reset" | "hit" | "stand" | null>(null);

  const playerScore = useMemo(() => scoreHand(player.cards), [player.cards]);
  const dealerScore = useMemo(() => scoreHand(dealer.cards), [dealer.cards]);

  async function resetGame() {
    if (inFlightRef.current || loading) return;
    
    inFlightRef.current = "reset";
    setLoading(true);
    setStatus("Esperando Nova Rodada");

    try {
      console.log("🎯 Iniciando nova rodada...");
      
      const startRes = await fetch("/api/deck/start", { cache: "no-store" });
      const responseText = await startRes.clone().text();
      
      console.log("START DEBUG:", startRes.status, responseText);
      
      if (!startRes.ok) {
        throw new Error(`Falha ao criar baralho: ${startRes.status}`);
      }

      const data = JSON.parse(responseText) as { deck_id: string; cards: APICard[] };
      
      if (!data?.deck_id || !data.cards || data.cards.length < 4) {
        throw new Error("Resposta inválida da API: dados insuficientes");
      }

      const newDeckId = data.deck_id;
      deckIdRef.current = newDeckId;
      setDeckId(newDeckId);

      setPlayer({ cards: [data.cards[0], data.cards[2]] });
      setDealer({ cards: [data.cards[1], data.cards[3]] });

      setStatus("Jogando");
      
      console.log("✅ Nova rodada iniciada com deck:", newDeckId);
    } catch (error) {
      console.error("❌ Erro ao iniciar rodada:", error);
      setStatus("Esperando Nova Rodada");
      deckIdRef.current = null;
      setDeckId(null);
    } finally {
      inFlightRef.current = null;
      setLoading(false);
    }
  }

  async function hit() {
    if (loading || status !== "Jogando" || inFlightRef.current) {
      console.log("🚫 Hit bloqueado:", { loading, status, inFlight: inFlightRef.current });
      return;
    }

    const currentDeckId = deckIdRef.current;
    
    if (!currentDeckId) {
      console.log("⚠️ Nenhum deck válido, reiniciando jogo...");
      await resetGame();
      return;
    }

    inFlightRef.current = "hit";
    setLoading(true);

    try {
      console.log("🎲 Tentando hit com deck:", currentDeckId);
      
      const drawRes = await fetch(`/api/deck/${currentDeckId}/draw?count=1`, { 
        cache: "no-store" 
      });
      const responseText = await drawRes.clone().text();
      
      console.log("HIT DEBUG:", drawRes.status, responseText);

      if (drawRes.status === 404) {
        console.warn("⏰ Deck expirado, reiniciando rodada...");
        deckIdRef.current = null;
        setDeckId(null);
        await resetGame();
        return;
      }

      if (!drawRes.ok) {
        console.error("❌ Erro na API de compra:", drawRes.status);
        return;
      }

      const drawData = JSON.parse(responseText) as DrawResp;
      
      if (!drawData.cards || drawData.cards.length === 0) {
        console.error("❌ Nenhuma carta recebida");
        return;
      }

      setPlayer(prevPlayer => ({
        cards: [...prevPlayer.cards, ...drawData.cards]
      }));

      console.log("✅ Carta adicionada:", drawData.cards[0]);
    } catch (error) {
      console.error("❌ Erro durante hit:", error);
    } finally {
      inFlightRef.current = null;
      setLoading(false);
    }
  }

  async function stand() {
    if (loading || status !== "Jogando" || inFlightRef.current) {
      console.log("🚫 Stand bloqueado:", { loading, status, inFlight: inFlightRef.current });
      return;
    }

    const currentDeckId = deckIdRef.current;
    
    if (!currentDeckId) {
      console.error("⚠️ Nenhum deck válido para stand");
      return;
    }

    inFlightRef.current = "stand";
    setLoading(true);

    try {
      console.log("🎯 Executando stand com deck:", currentDeckId);
      
      let dealerCards = [...dealer.cards];
      
      while (scoreHand(dealerCards) < 17) {
        const drawRes = await fetch(`/api/deck/${currentDeckId}/draw?count=1`, { 
          cache: "no-store" 
        });
        const responseText = await drawRes.text();
        
        console.log("DEALER DRAW DEBUG:", drawRes.status, responseText);
        
        if (!drawRes.ok) {
          console.error("❌ Erro ao comprar carta para dealer:", drawRes.status);
          break;
        }
        
        const drawData = JSON.parse(responseText) as DrawResp;
        if (drawData.cards && drawData.cards.length > 0) {
          dealerCards = [...dealerCards, ...drawData.cards];
          console.log("🃏 Dealer recebeu carta:", drawData.cards[0]);
        }
      }

      setDealer({ cards: dealerCards });

      const finalPlayerScore = scoreHand(player.cards);
      const finalDealerScore = scoreHand(dealerCards);

      console.log("📊 Pontuação final - Jogador:", finalPlayerScore, "Dealer:", finalDealerScore);

      let gameResult: GameStatus;
      
      if (finalDealerScore > 21) {
        gameResult = "Blackjack";
      } else if (finalPlayerScore > finalDealerScore) {
        gameResult = "Blackjack";
      } else if (finalPlayerScore < finalDealerScore) {
        gameResult = "Dealer";
      } else {
        gameResult = "Empate";
      }

      setStatus(gameResult);
      
      deckIdRef.current = null;
      setDeckId(null);
      
      console.log("🏁 Rodada finalizada:", gameResult);
    } catch (error) {
      console.error("❌ Erro durante stand:", error);
    } finally {
      inFlightRef.current = null;
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status !== "Jogando" || inFlightRef.current) return;

    if (playerScore === 21 && player.cards.length === 2) {
      setStatus("Blackjack");
      deckIdRef.current = null;
      setDeckId(null);
      console.log("🎉 Blackjack natural!");
    } else if (playerScore > 21) {
      setStatus("Perdeu");
      deckIdRef.current = null;
      setDeckId(null);
      console.log("💥 Jogador estourou!");
    }
  }, [playerScore, player.cards.length, status]);

  const colors = {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    background: '#f5f5f5',
    cardBg: '#ffffff',
    playerBg: '#e7f3ff',
    dealerBg: '#ffe7e7',
  };

  return (
    <Protected>
      <section style={{
        minHeight: '100vh',
        background: colors.background,
        padding: '20px',
        color: '#333'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '10px'
            }}>
              Blackjack
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#666'
            }}>
              Tente chegar o mais próximo de 21 sem ultrapassar!
            </p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: 20, 
            marginBottom: 30
          }}>
            <div style={{ 
              background: colors.playerBg,
              borderRadius: 8, 
              padding: 20,
              border: '1px solid #ddd'
            }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#333'
              }}>
                Jogador
              </h2>
              <CardRow cards={player.cards} />
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'center',
                border: '1px solid #dee2e6'
              }}>
                <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                  Pontuação: <strong style={{ 
                    fontSize: '1.2rem', 
                    color: playerScore > 21 ? colors.danger : colors.success
                  }}>{playerScore}</strong>
                </span>
              </div>
            </div>
            
            <div style={{ 
              background: colors.dealerBg,
              borderRadius: 8, 
              padding: 20,
              border: '1px solid #ddd'
            }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#333'
              }}>
                Dealer
              </h2>
              <CardRow cards={dealer.cards} />
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'center',
                border: '1px solid #dee2e6'
              }}>
                <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                  Pontuação: <strong style={{ 
                    fontSize: '1.2rem', 
                    color: dealerScore > 21 ? colors.danger : colors.success
                  }}>{dealerScore}</strong>
                </span>
              </div>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: '25px'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: status === 'Blackjack' ? colors.success : 
                         status === 'Perdeu' || status === 'Dealer' ? colors.danger : 
                         status === 'Empate' ? colors.warning : 
                         colors.primary,
              color: 'white',
              border: '1px solid #ddd'
            }}>
              {status}
            </div>
          </div>

          <div style={{ 
            display: "flex", 
            gap: 15, 
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '30px'
          }}>
            <button 
              onClick={resetGame} 
              disabled={loading}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: loading ? colors.secondary : colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                minWidth: '120px'
              }}
            >
              {loading && inFlightRef.current === 'reset' ? 'Iniciando...' : 'Nova Rodada'}
            </button>
            
            <button 
              onClick={hit} 
              disabled={loading || status !== "Jogando"}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: (loading || status !== "Jogando") ? colors.secondary : colors.success,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (loading || status !== "Jogando") ? 'not-allowed' : 'pointer',
                minWidth: '120px'
              }}
            >
              {loading && inFlightRef.current === 'hit' ? 'Comprando...' : 'Hit'}
            </button>
            
            <button 
              onClick={stand} 
              disabled={loading || status !== "Jogando"}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: (loading || status !== "Jogando") ? colors.secondary : colors.danger,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (loading || status !== "Jogando") ? 'not-allowed' : 'pointer',
                minWidth: '120px'
              }}
            >
              {loading && inFlightRef.current === 'stand' ? 'Finalizando...' : 'Stand'}
            </button>
          </div>

          <div style={{ 
            marginTop: 30,
            padding: 20,
            background: 'white',
            borderRadius: 8,
            border: '1px solid #ddd'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#333',
              textAlign: 'center'
            }}>
              Como Jogar
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
              fontSize: '14px'
            }}>
              <div style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                <strong>Hit:</strong> Compre uma carta adicional
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                <strong>Stand:</strong> Mantenha suas cartas
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                <strong>Objetivo:</strong> Chegue próximo de 21
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                <strong>Ás:</strong> Vale 1 ou 11 pontos
              </div>
            </div>
          </div>
        </div>
      </section>
    </Protected>
  );
}

function CardRow({ cards }: { cards: APICard[] }) {
  if (cards.length === 0) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "120px",
        background: '#f8f9fa',
        borderRadius: '4px',
        border: '2px dashed #dee2e6',
        color: "#666",
        fontStyle: "italic"
      }}>
        <div>Aguardando cartas...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      gap: 10, 
      flexWrap: "wrap", 
      justifyContent: 'center',
      marginTop: 8,
      minHeight: "120px",
      padding: '10px'
    }}>
      {cards.map((card, index) => (
        <figure 
          key={`${card.code}-${index}`} 
          style={{ 
            width: 80,
            margin: 0
          }}
        >
          <img 
            src={card.image} 
            alt={`${card.value} of ${card.suit}`} 
            style={{ 
              width: "100%", 
              borderRadius: 4,
              border: '1px solid #ddd'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const container = target.parentElement as HTMLElement;
              target.style.display = 'none';
              
              const fallback = document.createElement('div');
              fallback.style.cssText = `
                width: 100%;
                height: 120px;
                background: white;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #333;
                font-size: 0.8rem;
                text-align: center;
                border: 1px solid #ddd;
              `;
              fallback.innerHTML = `
                <div>${card.value}</div>
                <div>of ${card.suit}</div>
              `;
              container.insertBefore(fallback, target);
            }}
          />
          <figcaption style={{ 
            fontSize: 10, 
            textAlign: 'center',
            marginTop: 4,
            color: '#666'
          }}>
            {card.value} {getSuitEmoji(card.suit)}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function getSuitEmoji(suit: string): string {
  switch (suit) {
    case 'HEARTS': return '♥️';
    case 'DIAMONDS': return '♦️';
    case 'CLUBS': return '♣️';
    case 'SPADES': return '♠️';
    default: return '🃏';
  }
}