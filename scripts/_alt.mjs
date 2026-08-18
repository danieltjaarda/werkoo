import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
async function bestanden(map){const uit=[];for(const d of await readdir(map,{withFileTypes:true})){const p=path.join(map,d.name);if(d.isDirectory())uit.push(...await bestanden(p));else if(/\.tsx$/.test(d.name))uit.push(p);}return uit;}
let zonder=0, leeg=0, gevuld=0;
for (const f of await bestanden("src")) {
  const t = await readFile(f,"utf8");
  // elk <Image ...> of <img ...> blok
  for (const m of t.matchAll(/<(Image|img)\b([\s\S]*?)\/?>/g)) {
    const attrs = m[2];
    const alt = attrs.match(/\balt=(?:"([^"]*)"|\{([^}]*)\})/);
    if (!alt) { zonder++; console.log(`GEEN ALT  ${f}: ${m[0].slice(0,80).replace(/\s+/g," ")}`); }
    else if (alt[1] === "") { leeg++; console.log(`leeg alt  ${f}: ${(attrs.match(/src=\{?["`]?([^"`}\s]+)/)?.[1]??"?").slice(0,60)}`); }
    else gevuld++;
  }
}
console.log(`\n${gevuld} met tekst, ${leeg} bewust leeg (decoratief), ${zonder} zonder alt-attribuut`);
process.exit(zonder===0?0:1);
