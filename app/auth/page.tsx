"use client";

import { useState } from "react";
import { supabaseBrowser } from "../../lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMsg(null);
    const supabase = supabaseBrowser();

    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) return setMsg("❌ " + error.message);
    setMsg("✅ Compte créé. Tu peux maintenant te connecter.");
  }

  async function signIn() {
    setLoading(true);
    setMsg(null);
    const supabase = supabaseBrowser();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) return setMsg("❌ " + error.message);

    // Redirection vers le dashboard
    window.location.href = "/app";
  }

  return (
    <main style={{ padding: 40, maxWidth: 420 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Connexion</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Crée un compte ou connecte-toi.
      </p>

      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #444" }}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>Mot de passe</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #444" }}
          />
        </div>

        <button
          onClick={signIn}
          disabled={loading}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #666" }}
        >
          {loading ? "..." : "Se connecter"}
        </button>

        <button
          onClick={signUp}
          disabled={loading}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #666" }}
        >
          {loading ? "..." : "Créer un compte"}
        </button>

        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      </div>
    </main>
  );
}
