"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const updateUsername = () => {
      try {
        setUsername(localStorage.getItem("username"));
      } catch {}
    };
    
    updateUsername();
    window.addEventListener('storage', updateUsername);
    
    return () => window.removeEventListener('storage', updateUsername);
  }, []);

  function logout() {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      window.dispatchEvent(new Event('storage'));
    } catch {}
    setUsername(null);
    router.push("/login");
  }

  return (
    <header style={{ 
      background: '#007bff',
      borderBottom: '1px solid #0056b3',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: '12px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link 
          href="/blackjack" 
          style={{ 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <h1 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
          }}>
            Blackjack
          </h1>
        </Link>

        <div style={{ 
          display: "flex", 
          gap: 12, 
          alignItems: "center" 
        }}>
          <span 
            suppressHydrationWarning
            style={{
              display: username ? 'inline' : 'none',
              color: 'white',
              fontSize: '14px'
            }}
          >
            {username ? `Olá, ${username}` : ""}
          </span>

          <button
            onClick={logout}
            style={{ 
              visibility: username ? "visible" : "hidden",
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}