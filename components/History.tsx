"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabaseClient";

type StagePack = { stage1: string; stage2: string; stage3: string };

type Row = {
  id: string;
  created_at: string;
  client_first_name: string;
  work_type: string;
  quote_sent_date: string;
  channel: string;
  tone: string;
  stage_pack: StagePack;
};

function prettyDate(ts: string) {
  return new Date(ts).toLocaleString("fr-FR");
}

export default function History(props: {
  onSelect: (pack: StagePack) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    const supabase = supabaseBrowser();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("message_generations")
      .select(
        "id, created_at, client_first_name, work_type, quote_sent_date, channel, tone, stage_pack"
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      setErr(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as Row[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="mt-6 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Historique (10 derniers)</h2>
        <button className="text-sm underline" type="button" onClick={load}>
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600 mt-3">Chargement...</p>
      ) : err ? (
        <p className="text-sm text-red-600 mt-3">Erreur : {err}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-600 mt-3">Aucun historique.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              className="text-left rounded border p-3 hover:bg-gray-50"
              onClick={() => props.onSelect(r.stage_pack)}
              title="Cliquer pour recharger les 3 relances"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">
                  {r.client_first_name} — {r.work_type}
                </div>
                <div className="text-xs text-gray-500">
                  {prettyDate(r.created_at)}
                </div>
              </div>

              <div className="text-xs text-gray-600 mt-1">
                Canal: {r.channel} • Ton: {r.tone} • Devis:{" "}
                {new Date(r.quote_sent_date).toLocaleDateString("fr-FR")}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
