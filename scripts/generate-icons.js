const Jimp = require('jimp');
const pngToIco = require('png-to-ico');
const { join } = require('path');
const { writeFileSync } = require('fs');

(async () => {
  try {
    const publicDir = join(__dirname, '..', 'public');
    const src = join(publicDir, 'IMG_940.PNG');

    const sizes = [16, 32, 48, 64, 192, 512];
    const generated = [];

    console.log('Reading source image:', src);
    const img = await Jimp.read(src);

    // Brand color to use as background when composing icons
    // Hex #162660 -> rgb(22,38,96)
    const brandColor = Jimp.rgbaToInt(22, 38, 96, 255);

    // radius for rounded corners (percentage of size)
    const cornerRadiusPct = 0.12; // 12% of the icon size by default

    function createRoundedMask(size, radius) {
      const mask = new Jimp(size, size, 0x00000000);
      const rr = radius;
      mask.scan(0, 0, size, size, function (x, y, idx) {
        let alpha = 0;
        if (x >= rr && x < size - rr && y >= 0 && y < size) alpha = 255;
        if (y >= rr && y < size - rr && x >= 0 && x < size) alpha = 255;
        if (alpha === 0) {
          let cx = x < rr ? rr - 1 : (x >= size - rr ? size - rr : -1);
          let cy = y < rr ? rr - 1 : (y >= size - rr ? size - rr : -1);
          if (cx !== -1 && cy !== -1) {
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy <= rr * rr) alpha = 255;
          }
        }
        this.bitmap.data[idx + 0] = 255;
        this.bitmap.data[idx + 1] = 255;
        this.bitmap.data[idx + 2] = 255;
        this.bitmap.data[idx + 3] = alpha;
      });
      return mask;
    }

    for (const s of sizes) {
      const outName = s <= 64 ? `favicon-${s}x${s}.png` : s === 192 ? 'logo192.png' : 'logo512.png';
      const outPath = join(publicDir, outName);

      // Create a solid-brand background canvas
      const bg = new Jimp(s, s, brandColor);

      // Prepare the source image: cover to crop and fill, then ensure size
      const copy = img.clone();
      await copy.cover(s, s, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
      await copy.resize(s, s, Jimp.RESIZE_BICUBIC);

      // Composite the logo on top of the brand background so the brand shows through any transparent areas
      bg.composite(copy, 0, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
      });

      // Apply rounded-corner mask
      const radius = Math.max(1, Math.round(s * cornerRadiusPct));
      const mask = createRoundedMask(s, radius);
      bg.mask(mask, 0, 0);

      await bg.writeAsync(outPath);
      console.log('Wrote', outPath);
      if (s <= 64) generated.push(outPath);
    }

    // Create multi-size ICO from 16,32,48,64 using buffers (more robust on Windows paths)
    const icoPaths = generated.slice(0, 4);
    if (icoPaths.length) {
      const fs = require('fs');
      const buffers = icoPaths.map(p => fs.readFileSync(p));
      // Try png-to-ico first, fall back to to-ico if it fails
      let icoBuffer = null;
      try {
        icoBuffer = await pngToIco(buffers);
      } catch (e) {
        console.warn('png-to-ico failed, trying to-ico fallback:', e && e.message);
        try {
          const toIco = require('to-ico');
          icoBuffer = await toIco(buffers);
        } catch (e2) {
          console.error('to-ico also failed:', e2 && e2.message);
          throw e2;
        }
      }
      const icoOut = join(publicDir, 'favicon.ico');
      writeFileSync(icoOut, icoBuffer);
      console.log('Wrote', icoOut);
    }

    console.log('Icon generation complete.');
  } catch (err) {
    console.error('Icon generation failed:', err);
    process.exit(1);
  }
})();
