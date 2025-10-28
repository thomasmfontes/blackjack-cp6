"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("access_token", data.token);
                localStorage.setItem("username", data.username);
                window.dispatchEvent(new Event('storage'));
                router.push("/blackjack");
            } else {
                const j = await res.json();
                setError(j.error || "Falha no login");
            }
        } catch (err) {
            setError("Erro de conexão. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #ddd',
                padding: '40px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '8px'
                    }}>
                        Login
                    </h1>
                    <p style={{
                        color: '#666',
                        fontSize: '1rem'
                    }}>
                        Entre e comece a jogar
                    </p>
                </div>

                <form onSubmit={onSubmit} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 20
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#333'
                        }}>
                            Usuário
                        </label>
                        <input
                            placeholder="Digite seu usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: 'white',
                                color: '#333',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#333'
                        }}>
                            Senha
                        </label>
                        <input
                            placeholder="Digite sua senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: 'white',
                                color: '#333',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username.trim() || !password.trim()}
                        style={{
                            padding: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            background: (isLoading || !username.trim() || !password.trim()) ?
                                '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (isLoading || !username.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>

                    {error && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '4px',
                            color: '#721c24',
                            fontSize: '14px',
                            textAlign: 'center',
                            marginTop: '10px'
                        }}>
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}