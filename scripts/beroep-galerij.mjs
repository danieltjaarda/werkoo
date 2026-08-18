/**
 * Lokaal overzicht van de gegenereerde beroepsbeelden, met per beroep een knop
 * om hem opnieuw te laten maken (roept scripts/beroep-images.mjs aan).
 *
 * Draaien met: node scripts/beroep-galerij.mjs   → http://localhost:4747
 */
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { copyFile, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";

const POORT = 4747;

const bron = await readFile("src/lib/dienst-data.ts", "utf8");
const beroepen = [...bron.matchAll(/^\s+slug: "([^"]+)",\s*\n\s+naam: "([^"]+)",\s*\n\s+meervoud:[\s\S]*?categorie: "([^"]+)"/gm)].map(
  ([, slug, naam, categorie]) => ({ slug, naam, categorie }),
);
const catNamen = Object.fromEntries([...bron.matchAll(/^\s+id: "([^"]+)",\s*\n\s+titel: "([^"]+)"/gm)].map(([, id, titel]) => [id, titel]));

/** Slugs die op dit moment opnieuw worden gemaakt. */
const bezig = new Set();

function draaiOpnieuw(slug) {
  if (bezig.has(slug)) return;
  bezig.add(slug);
  const kind = spawn(process.execPath, ["scripts/beroep-images.mjs", "--force", slug], { stdio: "inherit" });
  kind.on("exit", () => bezig.delete(slug));
}

/** De groepsfoto's: assets-src/groep-<variant>.png, uitgeknipt in public/images/groep/. */
function groepVarianten() {
  if (!existsSync("public/images/groep")) return [];
  return readdirSync("public/images/groep")
    .filter((n) => n.endsWith(".png"))
    .map((n) => n.replace(".png", ""))
    .sort((a, b) => Number(a) - Number(b));
}

function nieuweGroep() {
  const varianten = groepVarianten();
  const volgende = String(Math.max(0, ...varianten.map(Number)) + 1);
  bezig.add(`groep-${volgende}`);
  const kind = spawn(process.execPath, ["scripts/beroep-groep.mjs", `--variant=${volgende}`], { stdio: "inherit" });
  kind.on("exit", () => bezig.delete(`groep-${volgende}`));
  return volgende;
}

/** Welke variant de site nu gebruikt; vergelijken op inhoud, want het is een kopie. */
async function gekozenVariant() {
  if (!existsSync("public/images/beroepen-groep.png")) return null;
  const huidig = await readFile("public/images/beroepen-groep.png");
  for (const v of groepVarianten()) {
    if (huidig.equals(await readFile(`public/images/groep/${v}.png`))) return v;
  }
  return null;
}

async function pagina() {
  const perCategorie = new Map();
  for (const b of beroepen) {
    if (!perCategorie.has(b.categorie)) perCategorie.set(b.categorie, []);
    perCategorie.get(b.categorie).push(b);
  }
  let klaar = 0;
  const secties = [];

  const varianten = groepVarianten();
  const gekozen = await gekozenVariant();
  const groepBezig = [...bezig].filter((n) => n.startsWith("groep-"));
  const groepKaarten = await Promise.all(
    varianten.map(async (v) => {
      const versie = (await stat(`public/images/groep/${v}.png`)).mtimeMs;
      return `<figure class="kaart groep ${v === gekozen ? "gekozen" : ""}">
        <div class="beeld breed"><img src="/groep/${v}.webp?v=${versie}" alt="Groepsfoto variant ${v}" loading="lazy"></div>
        <figcaption><strong>Variant ${v}</strong>${v === gekozen ? "<span class=\"vink\">in gebruik op de site</span>" : ""}</figcaption>
        <div class="knoppen">
          <a class="knopje" href="/groep/${v}.png?download=1" download="werkoo-groepsfoto-${v}.png">Download png</a>
          ${v === gekozen ? "" : `<button data-kies="${v}">Gebruik deze</button>`}
        </div>
      </figure>`;
    }),
  );
  secties.push(`<section><h2>Groepsfoto <small>(7 vakmensen uit alle werkgebieden)</small></h2>
    <div class="rooster breed">${groepKaarten.join("") || "<p>Nog geen groepsfoto.</p>"}</div>
    <p class="regel">${groepBezig.length ? `Bezig met ${groepBezig.join(", ")}…` : ""}
      <button id="nieuwe-groep">Nieuwe variant genereren</button></p>
  </section>`);
  for (const [cat, lijst] of perCategorie) {
    const kaarten = [];
    for (const b of lijst) {
      const pad = `public/images/beroepen/${b.slug}.webp`;
      const bestaat = existsSync(pad);
      if (bestaat) klaar++;
      const versie = bestaat ? (await stat(pad)).mtimeMs : 0;
      const status = bezig.has(b.slug) ? "bezig" : bestaat ? "klaar" : "leeg";
      kaarten.push(`<figure class="kaart ${status}" data-slug="${b.slug}">
        <div class="beeld">${bestaat ? `<img src="/beeld/${b.slug}.webp?v=${versie}" alt="${b.naam}" loading="lazy">` : `<span class="geen">nog geen beeld</span>`}</div>
        <figcaption><strong>${b.naam}</strong><code>${b.slug}</code></figcaption>
        <button ${bezig.has(b.slug) ? "disabled" : ""}>${bezig.has(b.slug) ? "Bezig…" : "Opnieuw genereren"}</button>
      </figure>`);
    }
    secties.push(`<section><h2>${catNamen[cat] ?? cat} <small>(${lijst.length})</small></h2><div class="rooster">${kaarten.join("")}</div></section>`);
  }
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><title>Beroepsbeelden – Werkoo</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:-apple-system,system-ui,sans-serif;margin:0;background:#f4f6f9;color:#12141a}
  header{position:sticky;top:0;background:#fff;border-bottom:1px solid #e4e8ef;padding:14px 24px;display:flex;gap:16px;align-items:center;z-index:2}
  header h1{font-size:18px;margin:0}
  header .tel{color:#5a6478;font-size:14px}
  header .knop{background:#1eb1df;color:#fff;border-radius:8px;padding:8px 14px;font-weight:600;font-size:14px;text-decoration:none}
  header .knop.licht{background:#eaf7fc;color:#0d6f92}
  header .knop:first-of-type{margin-left:auto}
  header button{background:#1eb1df;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-weight:600;cursor:pointer}
  main{padding:20px 24px 60px;max-width:1500px;margin:0 auto}
  h2{font-size:16px;margin:28px 0 12px}
  h2 small{color:#5a6478;font-weight:400}
  .rooster.breed{grid-template-columns:repeat(auto-fill,minmax(420px,1fr))}
  .beeld.breed{aspect-ratio:16/9}
  .kaart.gekozen{outline:2px solid #1eb1df}
  .vink{color:#0d6f92;font-size:12px}
  .knoppen{display:flex;gap:8px}
  .knoppen>*{flex:1;text-align:center}
  .knopje{background:#fff;border:1px solid #cfd6e0;border-radius:8px;padding:6px;font-size:13px;text-decoration:none;color:#12141a}
  .regel{display:flex;gap:12px;align-items:center;color:#5a6478;font-size:14px;margin:12px 0 0}
  .regel button{background:#fff;border:1px solid #cfd6e0;border-radius:8px;padding:6px 12px;font-size:13px;cursor:pointer}
  .rooster{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px}
  .kaart{margin:0;background:#fff;border:1px solid #e4e8ef;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px}
  .kaart.bezig{outline:2px solid #f6ae2d}
  .beeld{aspect-ratio:1;background:#eaf7fc;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .beeld img{max-width:100%;max-height:100%;object-fit:contain}
  .geen{color:#5a6478;font-size:13px}
  figcaption{display:flex;flex-direction:column;gap:2px;font-size:14px}
  figcaption code{font-size:11px;color:#5a6478}
  .kaart button{background:#fff;border:1px solid #cfd6e0;border-radius:8px;padding:6px;font-size:13px;cursor:pointer}
  .kaart button:disabled{opacity:.5;cursor:default}
</style></head><body>
<header><h1>Beroepsbeelden</h1><span class="tel">${klaar} van ${beroepen.length} klaar${bezig.size ? ` · ${bezig.size} bezig` : ""}</span>
<a class="knop" href="/download/site.zip">Download alles (zip, uitgeknipt png+webp)</a>
<a class="knop licht" href="/download/origineel.zip">Download originelen (zip)</a>
<button onclick="location.reload()">Ververs</button></header>
<main>${secties.join("")}</main>
<script>
  document.querySelectorAll(".kaart button").forEach((knop) => knop.addEventListener("click", async () => {
    const kaart = knop.closest(".kaart");
    knop.disabled = true; knop.textContent = "Bezig…"; kaart.classList.add("bezig");
    await fetch("/opnieuw/" + kaart.dataset.slug, { method: "POST" });
    // Even wachten tot het klaar is, dan de pagina verversen.
    const wacht = setInterval(async () => {
      const r = await fetch("/status/" + kaart.dataset.slug);
      if ((await r.text()) === "klaar") { clearInterval(wacht); location.reload(); }
    }, 3000);
  }));
  document.querySelectorAll("[data-kies]").forEach((knop) => knop.addEventListener("click", async () => {
    knop.disabled = true;
    await fetch("/groep-kies/" + knop.dataset.kies, { method: "POST" });
    location.reload();
  }));
  const nieuw = document.getElementById("nieuwe-groep");
  if (nieuw) nieuw.addEventListener("click", async () => {
    nieuw.disabled = true; nieuw.textContent = "Bezig… (duurt ongeveer een minuut)";
    await fetch("/groep-nieuw", { method: "POST" });
    setTimeout(() => location.reload(), 20000);
  });
  // Automatisch verversen zolang er iets bezig is (bijvoorbeeld de grote batch).
  setTimeout(() => { if (document.querySelector(".kaart.bezig") || ${klaar} < ${beroepen.length}) location.reload(); }, 30000);
</script>
</body></html>`;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${POORT}`);
  if (url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(await pagina());
  }
  if (url.pathname.startsWith("/beeld/")) {
    const naam = url.pathname.slice(7).replace(/[^a-z0-9.-]/g, "");
    try {
      const data = await readFile(`public/images/beroepen/${naam}`);
      res.writeHead(200, { "content-type": naam.endsWith(".webp") ? "image/webp" : "image/png", "cache-control": "no-store" });
      return res.end(data);
    } catch {
      res.writeHead(404);
      return res.end();
    }
  }
  if (url.pathname === "/download/site.zip" || url.pathname === "/download/origineel.zip") {
    // Zip rechtstreeks naar de browser streamen; map heet in de zip "beroepen".
    const map = url.pathname.endsWith("site.zip") ? "public/images" : "assets-src";
    const bestandsnaam = url.pathname.endsWith("site.zip") ? "werkoo-beroepen.zip" : "werkoo-beroepen-origineel.zip";
    res.writeHead(200, { "content-type": "application/zip", "content-disposition": `attachment; filename="${bestandsnaam}"` });
    const zip = spawn("zip", ["-r", "-q", "-", "beroepen"], { cwd: map });
    zip.stdout.pipe(res);
    zip.on("error", () => res.end());
    return;
  }
  if (url.pathname.startsWith("/groep/")) {
    const naam = url.pathname.slice(7).replace(/[^0-9a-z.]/g, "");
    try {
      const data = await readFile(`public/images/groep/${naam}`);
      const kop = { "content-type": naam.endsWith(".webp") ? "image/webp" : "image/png", "cache-control": "no-store" };
      if (url.searchParams.has("download")) kop["content-disposition"] = `attachment; filename="werkoo-groepsfoto-${naam}"`;
      res.writeHead(200, kop);
      return res.end(data);
    } catch {
      res.writeHead(404);
      return res.end();
    }
  }
  if (req.method === "POST" && url.pathname.startsWith("/groep-kies/")) {
    const v = url.pathname.slice(12).replace(/[^0-9]/g, "");
    if (existsSync(`public/images/groep/${v}.png`)) {
      await copyFile(`public/images/groep/${v}.png`, "public/images/beroepen-groep.png");
      await copyFile(`public/images/groep/${v}.webp`, "public/images/beroepen-groep.webp");
    }
    res.writeHead(204);
    return res.end();
  }
  if (req.method === "POST" && url.pathname === "/groep-nieuw") {
    nieuweGroep();
    res.writeHead(202);
    return res.end();
  }
  if (req.method === "POST" && url.pathname.startsWith("/opnieuw/")) {
    const slug = url.pathname.slice(9);
    if (beroepen.some((b) => b.slug === slug)) draaiOpnieuw(slug);
    res.writeHead(202);
    return res.end();
  }
  if (url.pathname.startsWith("/status/")) {
    const slug = url.pathname.slice(8);
    res.writeHead(200, { "content-type": "text/plain" });
    return res.end(bezig.has(slug) ? "bezig" : "klaar");
  }
  res.writeHead(404);
  res.end();
}).listen(POORT, () => console.log(`Galerij: http://localhost:${POORT}`));
