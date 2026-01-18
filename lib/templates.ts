export type Channel = "sms" | "whatsapp" | "email";
export type Tone = "cordial" | "pro" | "direct";

type Stage = 1 | 2 | 3;
type Key = `${Channel}:${Tone}:${Stage}`;

const TEMPLATES: Record<Key, string> = {
  "whatsapp:pro:1":
    "Bonjour {client}, je reviens vers vous au sujet du devis du {date} pour {work}. Avez-vous eu le temps d’en prendre connaissance ? {sig}",
  "whatsapp:pro:2":
    "Bonjour {client}, je vous relance concernant le devis du {date} ({work}). Souhaitez-vous un ajustement ou un échange rapide ? {sig}",
  "whatsapp:pro:3":
    "Bonjour {client}, faute de retour je clôture le devis du {date} ({work}). Je reste disponible si besoin. {sig}",

  "whatsapp:cordial:1":
    "Bonjour {client}, je me permets de revenir vers vous concernant le devis envoyé le {date} pour {work}. Avez-vous eu le temps d’y jeter un œil ? {sig}",
  "whatsapp:cordial:2":
    "Bonjour {client}, petit rappel pour le devis du {date} ({work}). Je reste disponible si vous avez des questions. {sig}",
  "whatsapp:cordial:3":
    "Bonjour {client}, sans retour de votre part je vais clôturer le devis du {date} ({work}). Je reste disponible si vous souhaitez reprendre le projet. {sig}",

  "whatsapp:direct:1":
    "Bonjour {client}, avez-vous pu consulter le devis du {date} pour {work} ? {sig}",
  "whatsapp:direct:2":
    "Bonjour {client}, avez-vous pris une décision pour le devis du {date} ({work}) ? {sig}",
  "whatsapp:direct:3":
    "Bonjour {client}, je clôture le devis du {date} ({work}) sans retour. Recontactez-moi si vous souhaitez relancer le projet. {sig}",

  "sms:pro:1":
    "Bonjour {client}, devis du {date} pour {work} : avez-vous eu le temps de le consulter ? {sig}",
  "sms:pro:2":
    "Bonjour {client}, relance devis {date} ({work}). Besoin d’un ajustement ? {sig}",
  "sms:pro:3":
    "Bonjour {client}, je clôture le devis {date} ({work}) sans retour. {sig}",

  "sms:cordial:1":
    "Bonjour {client}, je reviens vers vous pour le devis du {date} ({work}). Avez-vous eu le temps d’y jeter un œil ? {sig}",
  "sms:cordial:2":
    "Bonjour {client}, petit rappel pour le devis du {date} ({work}). Je reste dispo si besoin. {sig}",
  "sms:cordial:3":
    "Bonjour {client}, sans retour je vais clôturer le devis du {date} ({work}). {sig}",

  "sms:direct:1":
    "Bonjour {client}, avez-vous vu le devis du {date} ({work}) ? {sig}",
  "sms:direct:2":
    "Bonjour {client}, décision pour le devis du {date} ({work}) ? {sig}",
  "sms:direct:3":
    "Bonjour {client}, je clôture le devis du {date} ({work}) sans retour. {sig}",

  "email:pro:1":
    "Bonjour {client},\n\nJe reviens vers vous concernant le devis transmis le {date} pour {work}.\nPouvez-vous me confirmer si le projet est toujours d’actualité ?\n\nCordialement,\n{sig}",
  "email:pro:2":
    "Bonjour {client},\n\nRelance concernant le devis du {date} pour {work}.\nSouhaitez-vous un ajustement du devis ou un échange rapide afin de finaliser la décision ?\n\nCordialement,\n{sig}",
  "email:pro:3":
    "Bonjour {client},\n\nFaute de retour, je clôture le devis du {date} pour {work}.\nJe reste disponible si vous souhaitez reprendre le dossier.\n\nCordialement,\n{sig}",

  "email:cordial:1":
    "Bonjour {client},\n\nJe me permets de revenir vers vous concernant le devis envoyé le {date} pour {work}.\nAvez-vous eu le temps d’en prendre connaissance ?\n\nBien cordialement,\n{sig}",
  "email:cordial:2":
    "Bonjour {client},\n\nJe me permets de vous relancer au sujet du devis transmis le {date} pour {work}.\nJe reste à votre disposition si vous avez des questions.\n\nBien cordialement,\n{sig}",
  "email:cordial:3":
    "Bonjour {client},\n\nSans retour de votre part, je vais clôturer le devis du {date} concernant {work}.\nJe reste disponible si vous souhaitez reprendre le projet ultérieurement.\n\nBonne continuation,\n{sig}",

  "email:direct:1":
    "Bonjour {client},\n\nAvez-vous pu consulter le devis du {date} pour {work} ?\n\nCordialement,\n{sig}",
  "email:direct:2":
    "Bonjour {client},\n\nAvez-vous pris une décision concernant le devis du {date} ({work}) ?\n\nCordialement,\n{sig}",
  "email:direct:3":
    "Bonjour {client},\n\nSans retour, je clôture le devis du {date} pour {work}.\nRecontactez-moi si vous souhaitez relancer le projet.\n\nCordialement,\n{sig}",
};

function fill(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export function buildMessages(input: {
  client: string;
  work: string;
  date: string; // YYYY-MM-DD
  channel: Channel;
  tone: Tone;
  signature: string;
}) {
  const fr = new Date(input.date + "T00:00:00").toLocaleDateString("fr-FR");
  const vars = {
    client: input.client.trim(),
    work: input.work.trim(),
    date: fr,
    sig: input.signature.trim(),
  };

  const k1 = `${input.channel}:${input.tone}:1` as const;
  const k2 = `${input.channel}:${input.tone}:2` as const;
  const k3 = `${input.channel}:${input.tone}:3` as const;

  return {
    stage1: fill(TEMPLATES[k1], vars).trim(),
    stage2: fill(TEMPLATES[k2], vars).trim(),
    stage3: fill(TEMPLATES[k3], vars).trim(),
  };
}
