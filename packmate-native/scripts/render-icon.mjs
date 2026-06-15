import sharp from 'sharp';

const SVG = `<svg width="1024" height="1024" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg">
  <circle cx="54" cy="54" r="52" fill="#3B2510"/>
  <circle cx="54" cy="54" r="43" fill="#E8CFA0"/>
  <circle cx="54" cy="54" r="40" fill="none" stroke="#8B5A2B" stroke-width="0.8" opacity="0.5"/>
  <path d="M40 44 L40 36 Q40 29 47 29 L61 29 Q68 29 68 36 L68 44" fill="none" stroke="#3B2510" stroke-width="5" stroke-linecap="round"/>
  <rect x="46" y="26" width="16" height="7" rx="3.5" fill="#5C3D1E" stroke="#E8CFA0" stroke-width="1.2"/>
  <rect x="28" y="44" width="52" height="38" rx="6" fill="#3B2510"/>
  <path d="M34 55.5 L37.5 59 L43 52" fill="none" stroke="#E8CFA0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="47" y1="55.5" x2="72" y2="55.5" stroke="#E8CFA0" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
  <path d="M34 64 L37.5 67.5 L43 60.5" fill="none" stroke="#E8CFA0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
  <line x1="47" y1="64" x2="68" y2="64" stroke="#E8CFA0" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
  <path d="M34 72.5 L37.5 76 L43 69" fill="none" stroke="#E8CFA0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
  <line x1="47" y1="72.5" x2="71" y2="72.5" stroke="#E8CFA0" stroke-width="1.8" stroke-linecap="round" opacity="0.35"/>
</svg>`;

const buf = Buffer.from(SVG);

// Native app icons
await sharp(buf).resize(512, 512).png().toFile('assets/icon.png');
await sharp(buf).resize(192, 192).png().toFile('assets/icon-192.png');
await sharp(buf).resize(1024, 1024).png().toFile('assets/icon-1024.png');

// Adaptive icon foreground (centered in 108x108 safe zone within 216x216 canvas)
await sharp(buf)
  .resize(432, 432)
  .extend({ top: 90, bottom: 90, left: 90, right: 90, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('assets/android-icon-foreground.png');

// Splash icon (centered on transparent)
await sharp(buf)
  .resize(200, 200)
  .extend({ top: 112, bottom: 112, left: 112, right: 112, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('assets/splash-icon.png');

// PWA icons
await sharp(buf).resize(192, 192).png().toFile('../packmate-pwa/icons/icon-192.png');
await sharp(buf).resize(512, 512).png().toFile('../packmate-pwa/icons/icon-512.png');

console.log('All icons written.');
