// מעלה תמונות placeholder ל-bucket images, לנתיבים שמופיעים ב-supabase/seed.sql.
// התמונות נוצרות כאן (מעבר צבע פשוט, PNG דרך zlib של Node), בלי הורדה ובלי ספרייה.
// הרצה: npm run db:seed-images   (משתמש ב-service role מתוך .env.local)

import { deflateSync, crc32 } from "node:zlib";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("חסרים NEXT_PUBLIC_SUPABASE_URL או SUPABASE_SERVICE_ROLE_KEY ב-.env.local");
  process.exit(1);
}

// [נתיב, רוחב, גובה, צבע עליון, צבע תחתון]
const COVER = [1600, 2000];
const WIDE = [1600, 1067];
const images = [
  ["seed/park-towers-cover.png", ...COVER, [196, 186, 170], [92, 88, 82]],
  ["seed/park-towers-1.png", ...WIDE, [210, 200, 184], [120, 112, 100]],
  ["seed/park-towers-2.png", ...WIDE, [180, 170, 156], [70, 66, 62]],
  ["seed/park-towers-3.png", ...WIDE, [220, 214, 200], [140, 130, 115]],
  ["seed/beach-house-cover.png", ...COVER, [214, 206, 190], [150, 140, 122]],
  ["seed/beach-house-1.png", ...WIDE, [230, 222, 206], [170, 158, 138]],
  ["seed/beach-house-2.png", ...WIDE, [200, 190, 172], [110, 102, 90]],
  ["seed/gefen-draft-cover.png", ...COVER, [170, 176, 160], [80, 84, 76]],
  ["seed/gefen-draft-1.png", ...WIDE, [190, 194, 180], [100, 104, 96]],
  ["seed/about.png", ...WIDE, [226, 218, 204], [130, 122, 110]],
];

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function gradientPng(width, height, top, bottom) {
  const row = 1 + width * 3; // בייט filter + RGB
  const raw = Buffer.alloc(row * height);
  for (let y = 0; y < height; y++) {
    const t = y / (height - 1);
    const rgb = top.map((c, i) => Math.round(c + (bottom[i] - c) * t));
    const offset = y * row;
    raw[offset] = 0;
    for (let x = 0; x < width; x++) {
      raw.set(rgb, offset + 1 + x * 3);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let failed = 0;
for (const [path, w, h, top, bottom] of images) {
  const png = gradientPng(w, h, top, bottom);
  const { error } = await supabase.storage
    .from("images")
    .upload(path, png, { contentType: "image/png", upsert: true });
  if (error) {
    failed++;
    console.error(`✗ ${path}: ${error.message}`);
  } else {
    console.log(`✓ ${path} (${Math.round(png.length / 1024)}KB)`);
  }
}
process.exit(failed ? 1 : 0);
