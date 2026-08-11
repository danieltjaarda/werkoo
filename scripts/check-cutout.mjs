import sharp from "sharp";

const src = "public/images/videograaf.png";
const scaled = await sharp(src).resize({ width: 760 }).png().toBuffer();
const { width, height } = await sharp(scaled).metadata();

await sharp({ create: { width, height, channels: 4, background: "#5A8BFC" } })
  .composite([{ input: scaled }])
  .png()
  .toFile("/tmp/check-blue.png");

console.log(`${width}x${height} -> /tmp/check-blue.png`);
