import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Editable SVG masters stay dependency-free; crawlers receive a conventional PNG.
await sharp("src/assets/social-preview.svg")
	.png()
	.toFile("src/assets/social-preview.png");

const favicon = await readFile("public/favicon.svg");
await sharp(favicon).resize(32, 32).png().toFile("public/favicon-sketch.png");
await sharp(favicon)
	.resize(180, 180)
	.png()
	.toFile("public/apple-touch-icon-sketch.png");

// Supply the conventional /favicon.ico URL for clients that request it directly.
const icon = await sharp(favicon).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 32;
header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(icon.length, 14);
header.writeUInt32LE(header.length, 18);
await writeFile("public/favicon.ico", Buffer.concat([header, icon]));
