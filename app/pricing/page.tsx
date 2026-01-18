"use client";

import { supabaseBrowser } from "../../lib/supabaseClient";

export default function PricingPage() {
  async function goPro() {
    try {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        alert("Tu dois être connecté.");
        window.location.href = "/auth";
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, email: data.user.email }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert("Erreur checkout: " + (json.error || res.statusText));
        return;
      }

      window.location.href = json.url;
    } catch (e: any) {
      alert("Erreur goPro: " + (e?.message || String(e)));
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 800 }}>Offre Pro</h1>
      <p style={{ marginTop: 10, opacity: 0.8 }}>
        3 essais gratuits, puis Pro à 19€/mois.
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <div style={{ border: "1px solid #444", borderRadius: 12, padding: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Gratuit</h2>
          <ul style={{ marginTop: 10, lineHeight: 1.8 }}>
            <li>✅ 3 générations</li>
            <li>✅ WhatsApp / SMS / Email</li>
            <li>✅ 3 relances prêtes à copier</li>
          </ul>
        </div>

        <div style={{ border: "2px solid #22c55e", borderRadius: 12, padding: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Pro</h2>
          <p style={{ marginTop: 6, fontSize: 28, fontWeight: 900 }}>
            19€ / mois
          </p>
          <ul style={{ marginTop: 10, lineHeight: 1.8 }}>
            <li>🚀 Relances illimitées</li>
            <li>📚 Historique complet</li>
            <li>⚡ Déblocage automatique après paiement</li>
          </ul>

          <button
            style={{
              marginTop: 14,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #22c55e",
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={goPro}
            type="button"
          >
            Passer Pro
          </button>
        </div>
      </div>
    </main>
  );
}
