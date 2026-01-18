"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../lib/supabaseClient";
import Generator from "../../components/Generator";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/auth";
        return;
      }

      setConnected(true);
      setLoading(false);
    }

    checkAuth();
  }, []);

  async function logout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  if (loading) {
    return <p style={{ padding: 40 }}>Chargement...</p>;
  }

  return (
    <main>
      <div style={{ padding: 20, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={logout}>Se déconnecter</button>
      </div>
<button
  onClick={async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const res = await fetch("/api/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: data.user.id }),
    });

    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else alert("Erreur portal: " + (json.error || "URL manquante"));
  }}
  style={{
    marginTop: 12,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid #444",
    cursor: "pointer",
  }}
  type="button"
>
  Gérer mon abonnement
</button>

      {connected && <Generator />}
    </main>
  );
}
