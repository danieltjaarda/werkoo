const basis = process.env.URL ?? "https://werkoo.vercel.app";
const paden = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/diensten", "/diensten/klussen-en-onderhoud", "/loodgieter", "/loodgieter/amsterdam", "/videograaf/joure", "/aanmelden", "/over-ons", "/privacy", "/inloggen", "/aanvraag?dienst=loodgieter"];
const pak = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
for (const pad of paden) {
  const r = await fetch(basis + pad, { redirect: "manual" });
  const html = await r.text();
  const meta = (n) => pak(html, new RegExp(`<meta[^>]+(?:name|property)="${n}"[^>]+content="([^"]*)"`, "g"))[0] ?? pak(html, new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:name|property)="${n}"`, "g"))[0];
  const h1 = pak(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g).map((s) => s.replace(/<[^>]+>/g, "").trim());
  const imgsZonderAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/g) ?? []).length;
  const legeAlt = (html.match(/<img[^>]*\balt=""[^>]*>/g) ?? []).length;
  const ld = pak(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((j) => { try { const d = JSON.parse(j); return (d["@graph"] ?? [d]).map((x) => x["@type"]).join("+"); } catch { return "?" } });
  console.log(`\n${pad}  [${r.status}] ${(html.length/1024).toFixed(0)}kB`);
  console.log("  title:", pak(html, /<title>([^<]*)<\/title>/g)[0]);
  console.log("  desc :", (meta("description") ?? "—").slice(0, 110));
  console.log("  canon:", pak(html, /<link rel="canonical" href="([^"]*)"/g)[0] ?? "—", "| robots:", meta("robots") ?? "—");
  console.log("  og   :", meta("og:title") ?? "—", "|", meta("og:image") ?? "geen og:image", "| tw:", meta("twitter:card") ?? "—");
  console.log("  h1   :", h1.length, JSON.stringify(h1).slice(0, 120));
  console.log("  ld   :", ld.join(" ; ") || "—", "| img zonder alt:", imgsZonderAlt, "| alt leeg:", legeAlt);
}
