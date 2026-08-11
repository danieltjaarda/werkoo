/** Snijdt een stuk uit een screenshot: node scripts/crop.mjs /tmp/full-1440.png 0 0 1440 200 /tmp/uitsnede.png */
import sharp from "sharp";

const [bron, x, y, breedte, hoogte, doel = "/tmp/uitsnede.png", schaal = "1"] = process.argv.slice(2);
const factor = 2; // screenshots worden op deviceScaleFactor 2 gemaakt

await sharp(bron)
  .extract({
    left: Number(x) * factor,
    top: Number(y) * factor,
    width: Number(breedte) * factor,
    height: Number(hoogte) * factor,
  })
  .resize({ width: Math.round(Number(breedte) * Number(schaal)) })
  .toFile(doel);

console.log(doel);
