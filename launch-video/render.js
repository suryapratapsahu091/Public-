// Renders video.html frame by frame to frames/%04d.png (3840x2160, 24 fps, 10 s).
// Usage: node render.js [--frames 0,60,120] (optional subset for stills)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FPS = 24, DURATION = 10, TOTAL = FPS * DURATION, WORKERS = 4;
const outDir = path.join(__dirname, 'frames');
fs.mkdirSync(outDir, { recursive: true });

const arg = process.argv.indexOf('--frames');
const frames = arg > 0 ? process.argv[arg + 1].split(',').map(Number) : [...Array(TOTAL).keys()];
const dataUri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'assets', f)).toString('base64');
const assets = { mark: dataUri('mark-dark.png'), lockup: dataUri('lockup-dark.png') };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--disable-gpu-vsync'] });
  const started = Date.now();
  let done = 0;
  await Promise.all([...Array(WORKERS).keys()].map(async w => {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('file://' + path.join(__dirname, 'video.html'));
    await page.evaluate(a => window.init(a), assets);
    for (let i = w; i < frames.length; i += WORKERS) {
      const f = frames[i];
      const b64 = await page.evaluate(f => { window.render(f / 24, f); return window.canvas.toDataURL('image/png').split(',')[1]; }, f);
      fs.writeFileSync(path.join(outDir, String(f).padStart(4, '0') + '.png'), Buffer.from(b64, 'base64'));
      if (++done % 24 === 0) console.log(`${done}/${frames.length} frames, ${((Date.now() - started) / 1000).toFixed(0)}s`);
    }
  }));
  await browser.close();
  console.log(`done: ${done} frames in ${((Date.now() - started) / 1000).toFixed(0)}s`);
})();
