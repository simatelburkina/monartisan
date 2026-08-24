import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/icons", { recursive: true });

const svg = (size, pad = 0) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="${pad ? 0 : 96}" fill="#c2410c"/>
  <text x="256" y="300" font-size="260" text-anchor="middle" font-family="Arial, sans-serif">🛠️</text>
</svg>`;

async function make(name, size, { maskable = false } = {}) {
  const pad = maskable ? 1 : 0;
  await sharp(Buffer.from(svg(size, pad))).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log("wrote", name);
}

await make("icon-192.png", 192);
await make("icon-512.png", 512);
await make("icon-maskable-512.png", 512, { maskable: true });
await make("apple-touch-icon.png", 180);
