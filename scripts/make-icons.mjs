/**
 * Render the app icon to the PNG sizes a PWA install needs.
 *
 * The maskable variant drops the rounded corner and bleeds past the viewBox,
 * so Android can crop it to a circle, squircle or squabble without clipping
 * the mountain.
 *
 * Run: npm run data:icons
 */
import fs from 'node:fs/promises';
import sharp from 'sharp';

const src = await fs.readFile('public/icon.svg', 'utf8');

const maskable = src
  .replace('<rect width="64" height="64" rx="14" fill="#F4EBDC"/>', '<rect x="-12" y="-12" width="88" height="88" fill="#F4EBDC"/>')
  .replace('viewBox="0 0 64 64"', 'viewBox="-11 -11 86 86"');

const jobs = [
  ['icon-192.png', 192, src],
  ['icon-512.png', 512, src],
  ['icon-maskable-512.png', 512, maskable],
  ['apple-touch-icon.png', 180, src],
];

for (const [file, size, svg] of jobs) {
  await sharp(Buffer.from(svg), { density: 600 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile('public/' + file);
  const { size: bytes } = await fs.stat('public/' + file);
  console.log('  public/' + file.padEnd(26) + size + 'px  ' + (bytes / 1024).toFixed(1) + ' KB');
}
