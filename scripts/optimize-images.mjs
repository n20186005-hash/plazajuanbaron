/**
 * Compress JPEGs in public/gallery (in place) to speed up page loading.
 * - Re-encodes to progressive JPEG, quality 76, chroma 4:2:0
 * - Downscales oversized images to a max width of 1800px
 * - Strips EXIF metadata (keeps orientation)
 * Usage: npm run images:optimize
 */
import { readdirSync, statSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const dir = join(process.cwd(), 'public', 'gallery');
const MAX_WIDTH = 1800;
const QUALITY = 76;

const files = readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f));

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const path = join(dir, file);
  const before = statSync(path).size;
  const image = sharp(path, { failOn: 'none' });
  const meta = await image.metadata();

  let pipeline = image;
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const out = await pipeline
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' })
    .toBuffer();

  if (out.length < before) {
    const tmp = `${path}.opt.tmp`;
    writeFileSync(tmp, out);
    renameSync(tmp, path);
    totalAfter += out.length;
  } else {
    totalAfter += before;
  }
  totalBefore += before;
  console.log(
    `${file.padEnd(30)} ${(before / 1024).toFixed(0).padStart(6)}KB -> ${(out.length / 1024).toFixed(0).padStart(6)}KB`
  );
}

console.log('\nTotal:', (totalBefore / 1024 / 1024).toFixed(2), 'MB ->', (totalAfter / 1024 / 1024).toFixed(2), 'MB');
