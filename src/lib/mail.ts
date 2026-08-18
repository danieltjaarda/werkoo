import "server-only";
import { after } from "next/server";
import { CONTACT, SITE_NAAM } from "@/lib/site";

/**
 * Uitgaande mail via de API van Forward Email (forwardemail.net). Eén sleutel
 * in FORWARDEMAIL_API_KEY is genoeg; het afzendadres moet bij een geverifieerd
 * domein daar horen. Zonder sleutel — lokaal, in een preview — loggen we de
 * mail alleen, zodat de rest van de site gewoon doorwerkt.
 */
const API = "https://api.forwardemail.net/v1/emails";

export type Mail = {
  aan: string;
  onderwerp: string;
  tekst: string;
  html?: string;
};

function afzender(): string {
  return process.env.MAIL_VAN ?? `${SITE_NAAM} <${CONTACT.email}>`;
}

/**
 * Verstuurt één mail en wacht op het antwoord. Gooit bij een fout, zodat de
 * aanroeper kan kiezen wat hij daarmee doet.
 */
export async function verstuurMail(mail: Mail): Promise<void> {
  const sleutel = process.env.FORWARDEMAIL_API_KEY;
  if (!sleutel) {
    console.warn(`[mail niet verstuurd, geen FORWARDEMAIL_API_KEY] aan ${mail.aan}: ${mail.onderwerp}`);
    return;
  }

  const antwoord = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sleutel}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: afzender(),
      to: mail.aan,
      subject: mail.onderwerp,
      text: mail.tekst,
      html: mail.html ?? tekstNaarHtml(mail.tekst),
    }),
  });

  if (!antwoord.ok) {
    throw new Error(`Forward Email gaf ${antwoord.status}: ${(await antwoord.text()).slice(0, 300)}`);
  }
}

/**
 * Voor meldingen die de bezoeker niet hoeven op te houden: de mail gaat de
 * deur uit nadat het antwoord al terug is, en een fout komt in het log en niet
 * op het scherm. Een aanvraag mag nooit mislukken omdat een melding dat doet.
 */
export function mailNaderhand(maak: () => Promise<Mail[]>): void {
  after(async () => {
    try {
      const mails = await maak();
      await Promise.all(
        mails.map((m) =>
          verstuurMail(m).catch((fout) =>
            console.error(`Mail aan ${m.aan} (${m.onderwerp}) mislukt:`, fout),
          ),
        ),
      );
    } catch (fout) {
      console.error("Mail voorbereiden mislukt:", fout);
    }
  });
}

function ontsnap(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Eenvoudige, overal leesbare html: alinea's, en kale urls worden klikbaar. */
export function tekstNaarHtml(tekst: string): string {
  const alineas = tekst
    .trim()
    .split(/\n{2,}/)
    .map((a) =>
      ontsnap(a)
        .replace(/\n/g, "<br>")
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#0f4c5c">$1</a>'),
    )
    .map((a) => `<p style="margin:0 0 16px">${a}</p>`)
    .join("");

  return `<!doctype html><html lang="nl"><body style="margin:0;padding:24px;background:#f6f7f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a1d1c;font-size:16px;line-height:1.55">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
<p style="margin:0 0 24px;font-weight:700;font-size:20px">${SITE_NAAM}</p>
${alineas}
<p style="margin:24px 0 0;font-size:13px;color:#6b7472">Deze mail is automatisch verstuurd door ${SITE_NAAM}. Vragen? Mail ${CONTACT.email}.</p>
</div></body></html>`;
}
