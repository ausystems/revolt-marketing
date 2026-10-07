// Media pipeline: turns the live site's original uploads into the art-directed assets the site uses.
// Source originals live in the scratchpad; outputs go to public/media. Run: node scripts/media.mjs <srcDir>
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = process.argv[2];
const OUT = path.resolve("public/media");
fs.mkdirSync(path.join(OUT, "blog"), { recursive: true });
fs.mkdirSync(path.join(OUT, "services"), { recursive: true });
const src = (id) => path.join(SRC, id);
const INK = { r: 10, g: 10, b: 10 };

// 1. Wordmark: trimmed to its bounds, transparent.
await sharp(src("92bbae_be4011fd8b7b4006ae9dc90cc7b98111~mv2.png")).trim({ threshold: 10 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, "wordmark.png"));

// 2. The bay: extracted from the homepage composite, flattened onto ink so the composite's rounded corner disappears into the dark wall.
await sharp(src("92bbae_eec60966cc29406288c2cccc08ae4002~mv2.png"))
  .extract({ left: 67, top: 67, width: 1145, height: 1033 })
  .flatten({ background: INK })
  .modulate({ saturation: 0.92 })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(OUT, "hero-bay.jpg"));

// 3. Founders: 3024x4032 phone portraits. Crop to 4:5 around the head and shoulders, keep colour, lift contrast a touch.
for (const [name, id] of [["founder-shayne", "92bbae_446abee2453b42568dad1b9c4bc17edf~mv2.png"], ["founder-tristan", "92bbae_3bca81a3998a4c2eaee452372eaf92b0~mv2.png"]]) {
  await sharp(src(id))
    .extract({ left: 302, top: 420, width: 2420, height: 3025 }) // 4:5, face in the upper third
    .resize(1600, 2000)
    .modulate({ saturation: 0.9 })
    .linear(1.06, -6)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `${name}.jpg`));
}

// 4. The golfer (the swing photograph on the homepage and services page).
await sharp(src("92bbae_4178f565bf5a4635ae3c76d7ba8b12aa~mv2.jpg")).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, "golfer.jpg"));

// 5. Service scenes from the services index, graded darker and cooler so they sit inside the ink world.
for (const [name, id] of [["branding", "92bbae_498367499a3049a282a0a96c3e879a71~mv2.jpg"], ["growth", "92bbae_8d4e50a1f7d548f19d7a384c67c62f99~mv2.jpg"], ["automation", "92bbae_1085b8d47bd54a2ea53590ecfe5f3c48~mv2.jpg"], ["events", "92bbae_cf854b67eb8246c6a66af8b6fa88e455~mv2.jpg"]]) {
  await sharp(src(id)).resize(1600, null, { withoutEnlargement: true }).modulate({ saturation: 0.82, brightness: 0.94 }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, "services", `${name}.jpg`));
}

// 6. Blog covers and inline images.
const posts = JSON.parse(fs.readFileSync(path.join(SRC, "..", "blog", "posts.json"), "utf8"));
const blogIds = new Set();
for (const p of posts) { if (p.cover) blogIds.add(p.cover); for (const b of p.blocks) if (b.t === "img") blogIds.add(b.id); }
for (const id of blogIds) {
  if (!fs.existsSync(src(id))) continue;
  const out = path.join(OUT, "blog", id.replace(/~mv2\.[a-z]+$/, "") + ".jpg");
  await sharp(src(id)).flatten({ background: INK }).resize(1600, null, { withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
}

// The share image is the live site's own (public/media/og-share.png), downloaded as published.

console.log("media done:", fs.readdirSync(OUT).length, "root files,", blogIds.size, "blog");
