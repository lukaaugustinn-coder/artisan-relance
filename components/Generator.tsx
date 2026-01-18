"use client";

import History from "./History";
import { useMemo, useState } from "react";
import { buildMessages, Channel, Tone } from "../lib/templates";
import { supabaseBrowser } from "../lib/supabaseClient";

export default function Generator() {
  const [client, setClient] = useState("");
  const [work, setWork] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [tone, setTone] = useState<Tone>("pro");
  const [signature, setSignature] = useState("Luka");
  const [pack, setPack] = useState<{
    stage1: string;
    stage2: string;
    stage3: string;
  } | null>(null);

  const canGenerate = useMemo(
    () => client.trim().length > 1 && work.trim().length > 2,
    [client, work]
  );

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  // ✅ Quota 3 essais si pas PRO / Illimité si PRO
  async function generate() {
    const supabase = supabaseBrowser();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      alert("Vous devez être connecté.");
      return;
    }

    // ✅ Lire le statut PRO
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profErr) {
      alert("Erreur lecture profil: " + profErr.message);
      return;
    }

    const isPro = !!prof?.is_pro;

    // ✅ Appliquer le quota seulement si pas PRO
    if (!isPro) {
      const { count, error: countError } = await supabase
        .from("message_generations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.user.id);

      if (countError) {
        alert("Erreur vérification quota : " + countError.message);
        return;
      }

      if ((count ?? 0) >= 3) {
        const go = confirm(
          "🚫 Limite gratuite atteinte (3 essais).\n\nOK = Voir l’offre Pro"
        );
        if (go) window.location.href = "/pricing";
        return;
      }
    }

    // ✨ Générer les messages
    const result = buildMessages({
      client,
      work,
      date,
      channel,
      tone,
      signature,
    });

    setPack(result);

    // 💾 Sauvegarder en base
    const { error } = await supabase.from("message_generations").insert({
      user_id: auth.user.id,
      client_first_name: client,
      work_type: work,
      quote_sent_date: date,
      channel,
      tone,
      stage_pack: result,
    });

    if (error) {
      alert("Erreur sauvegarde Supabase : " + error.message);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl font-bold">Relance devis – Artisans</h1>
        <p className="text-gray-600 mt-1">
          Remplis 3 infos → copie-colle la relance.
        </p>

        <div className="mt-6 grid gap-4 rounded-lg border bg-white p-4">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Prénom client</label>
            <input
              className="border rounded px-3 py-2"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Jean"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Type de travaux</label>
            <input
              className="border rounded px-3 py-2"
              value={work}
              onChange={(e) => setWork(e.target.value)}
              placeholder="Peinture salon / chauffe-eau / tableau électrique..."
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Date d’envoi du devis</label>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Canal</label>
              <select
                className="border rounded px-3 py-2"
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Ton</label>
              <select
                className="border rounded px-3 py-2"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
              >
                <option value="pro">Professionnel</option>
                <option value="cordial">Cordial</option>
                <option value="direct">Direct</option>
              </select>
            </div>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Signature</label>
            <input
              className="border rounded px-3 py-2"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Votre nom / entreprise"
            />
          </div>

          <p className="text-sm text-gray-500">
            Offre gratuite : 3 générations maximum (illimité en Pro)
          </p>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={generate}
            className="px-4 py-3 rounded bg-black text-white disabled:opacity-40"
          >
            Générer 3 relances
          </button>
        </div>

        {pack && (
          <div className="mt-6 grid gap-4">
            {([
              ["Relance 1 (douce)", pack.stage1],
              ["Relance 2 (rappel)", pack.stage2],
              ["Relance 3 (dernier message)", pack.stage3],
            ] as const).map(([title, text]) => (
              <div key={title} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{title}</h2>
                  <button
                    className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
                    onClick={() => copy(text)}
                    type="button"
                  >
                    Copier
                  </button>
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                  {text}
                </pre>
              </div>
            ))}
          </div>
        )}

        <History onSelect={(p) => setPack(p)} />
      </div>
    </main>
  );
}
