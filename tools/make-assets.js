#!/usr/bin/env node
/**
 * tools/make-assets.js – (اختياري) يولّد ملفات تحتاج متصفحاً:
 *   1) نموذج التسجيل PDF باللغتين  → src/assets/docs/registration-form-{ar,en}.pdf
 *   2) صورة المشاركة og-image.png  → src/assets/img/og-image.png (1200×630)
 *
 * يستخدم Google Chrome أو Microsoft Edge المثبّت على الجهاز (وضع headless) بدون أي مكتبات.
 * التشغيل:  npm run assets
 * أعد تشغيله بعد تعديل البرامج/الأسعار/بيانات التواصل حتى يتحدّث ملف PDF.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');
const { build } = require('../build');

const ROOT = path.join(__dirname, '..');
const CANDIDATES = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const browser = CANDIDATES.find((p) => fs.existsSync(p));
if (!browser) {
  console.error('✖ لم يُعثر على Chrome أو Edge. حدّد المسار عبر المتغيّر BROWSER_PATH.');
  process.exit(1);
}

// نعمل داخل مجلد مؤقت ثم ننسخ النتائج إلى src دفعة واحدة،
// حتى لا يعيد خادم التطوير (npm run dev) بناء dist أثناء الطباعة.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'np-assets-'));
// ملف تعريف مستقل: بدونه يُسلَّم الأمر لنافذة المتصفح المفتوحة ولا يُنتَج أي ملف
const profile = path.join(tmp, 'profile');

function run(args, out) {
  execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, ...args], { stdio: 'ignore', timeout: 90000 });
  if (!fs.existsSync(out)) {
    console.error(`✖ لم يُنتَج الملف: ${path.basename(out)}`);
    process.exit(1);
  }
}

build();
fs.cpSync(path.join(ROOT, 'dist'), path.join(tmp, 'site'), { recursive: true });

const jobs = [];

// 1) PDF
for (const lang of ['ar', 'en']) {
  const out = path.join(tmp, `registration-form-${lang}.pdf`);
  const url = pathToFileURL(path.join(tmp, 'site', lang, 'registration-form.html')).href;
  run(['--no-pdf-header-footer', '--virtual-time-budget=10000', `--print-to-pdf=${out}`, url], out);
  jobs.push([out, path.join(ROOT, 'src/assets/docs', path.basename(out))]);
}

// 2) og-image.png
const og = path.join(tmp, 'og-image.png');
run(['--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${og}`, pathToFileURL(path.join(ROOT, 'src/assets/img/og-image.svg')).href], og);
jobs.push([og, path.join(ROOT, 'src/assets/img/og-image.png')]);

for (const [from, to] of jobs) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`✔ ${path.relative(ROOT, to)}`);
}
fs.rmSync(tmp, { recursive: true, force: true });

build();
