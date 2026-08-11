/** Genereert het pad voor het schulprandje van het keurmerk-vinkje. */
const lobben = 11;
const buiten = 15.4;
const binnen = 12.6;
const midden = 16;

const punten = [];
for (let i = 0; i < lobben * 2; i++) {
  const hoek = (i * Math.PI) / lobben - Math.PI / 2;
  const straal = i % 2 === 0 ? buiten : binnen;
  punten.push([midden + Math.cos(hoek) * straal, midden + Math.sin(hoek) * straal]);
}

// Gesloten Catmull-Rom, omgezet naar cubic bezier: geeft een vloeiende golfrand.
const rond = (n) => Math.round(n * 100) / 100;
const bij = (i) => punten[(i + punten.length) % punten.length];

let d = `M${rond(punten[0][0])} ${rond(punten[0][1])}`;
for (let i = 0; i < punten.length; i++) {
  const [x0, y0] = bij(i - 1);
  const [x1, y1] = bij(i);
  const [x2, y2] = bij(i + 1);
  const [x3, y3] = bij(i + 2);
  d += `C${rond(x1 + (x2 - x0) / 6)} ${rond(y1 + (y2 - y0) / 6)} ${rond(x2 - (x3 - x1) / 6)} ${rond(y2 - (y3 - y1) / 6)} ${rond(x2)} ${rond(y2)}`;
}
console.log(`${d}Z`);
