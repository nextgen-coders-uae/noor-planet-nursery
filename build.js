#!/usr/bin/env node
/**
 * build.js – مولّد الموقع الثابت لحضانة كوكب نور (بدون أي اعتماديات خارجية).
 *
 *   node build.js            يبني الموقع داخل dist/
 *   node build.js --serve    يبني ثم يشغّل خادماً محلياً على http://localhost:4173 ويعيد البناء عند أي تعديل
 *
 * المدخلات:
 *   src/site.config.json   إعدادات عامة (الهاتف، الرابط، ساعات العمل…)
 *   src/i18n/{ar,en}.json  كل النصوص
 *   src/data/*.json        البرامج، الأسعار، الجدول، القائمة الغذائية، الفعاليات…
 *   src/templates/         القوالب والمكوّنات
 *   src/assets/            CSS / JS / الصور
 *   src/static/            ملفات تُنسخ كما هي إلى جذر الموقع (.htaccess …)
 *
 * المخرجات: dist/ar/*.html و dist/en/*.html + sitemap.xml + robots.txt + 404.html
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const LANGS = ['ar', 'en'];

/* ------------------------------ أدوات ملفات ------------------------------ */
const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));
const write = (p, content) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

/* ------------------------------ الترجمة ------------------------------ */
/** يجمع كل المفاتيح (a.b.c) للمقارنة بين اللغتين. */
function flatKeys(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatKeys(v, key, out);
    else out.push(key);
  }
  return out;
}

function makeT(dict, lang, missing) {
  return (key, vars) => {
    let val = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
    if (val == null) {
      missing.add(`${lang}: ${key}`);
      return `⟦${key}⟧`;
    }
    if (typeof val === 'string' && vars) val = val.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return val;
  };
}

/* ------------------------------ البناء ------------------------------ */
function build() {
  const t0 = Date.now();

  // تفريغ الكاش حتى تُقرأ القوالب المعدّلة عند إعادة البناء في وضع --serve
  for (const k of Object.keys(require.cache)) if (k.startsWith(path.join(SRC, 'templates'))) delete require.cache[k];
  const { layout } = require('./src/templates/layout');
  const art = require('./src/templates/art');
  const pagesFactory = require('./src/templates/pages');

  const site = readJSON(path.join(SRC, 'site.config.json'));
  const data = {};
  for (const f of fs.readdirSync(path.join(SRC, 'data'))) {
    if (f.endsWith('.json')) data[path.basename(f, '.json')] = readJSON(path.join(SRC, 'data', f));
  }
  const i18n = Object.fromEntries(LANGS.map((l) => [l, readJSON(path.join(SRC, 'i18n', `${l}.json`))]));
  const missing = new Set();
  const version = Date.now().toString(36);

  fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'));
  copyDir(path.join(SRC, 'static'), DIST);

  /* --- صور مؤقتة: تُولَّد لكل صورة مذكورة في البيانات وغير موجودة في src/assets/img --- */
  const imgDir = path.join(DIST, 'assets', 'img');
  let placeholders = 0;
  const ensureImage = (rel, make) => {
    const target = path.join(imgDir, rel);
    if (fs.existsSync(target)) return;
    if (!rel.endsWith('.svg')) return console.warn(`  ⚠ صورة غير موجودة: src/assets/img/${rel}`);
    write(target, make());
    placeholders++;
  };
  data.gallery.items.forEach((g, i) => ensureImage(g.image, () => art.placeholderSvg({ emoji: g.emoji, tone: g.tone, seed: i + 1 })));
  data.facilities.forEach((f, i) => ensureImage(f.image, () => art.placeholderSvg({ emoji: f.emoji, tone: f.tone, seed: i + 20 })));
  data.programs.forEach((p, i) => ensureImage(p.image, () => art.placeholderSvg({ emoji: p.emoji, tone: p.tone, seed: i + 40 })));
  data.team.forEach((m, i) => ensureImage(m.image, () => art.avatarSvg({ tone: m.tone, seed: i })));

  const ogImage = fs.existsSync(path.join(imgDir, 'og-image.png')) ? 'og-image.png' : 'og-image.svg';

  /* --- بيانات وسلاسل نصية للمتصفح (الحاسبة ومعالج التسجيل) --- */
  const clientData = {
    whatsapp: site.whatsapp,
    programs: data.programs.map(({ id, emoji, name, age, minMonths, maxMonths, seats }) => ({ id, emoji, name, age, minMonths, maxMonths, seats })),
    pricing: data.pricing,
  };
  write(path.join(DIST, 'assets/js/np-data.js'), `window.NP_DATA=${JSON.stringify(clientData)};`);
  for (const l of LANGS) write(path.join(DIST, `assets/js/i18n.${l}.js`), `window.NP_T=${JSON.stringify(i18n[l].js)};`);

  /* --- الصفحات --- */
  const pages = pagesFactory(data);
  const makeCtx = (lang, { root = false } = {}) => {
    const other = lang === 'ar' ? 'en' : 'ar';
    const pdfRel = `docs/registration-form-${lang}.pdf`;
    const hasPdf = fs.existsSync(path.join(SRC, 'assets', pdfRel));
    const ctx = {
      lang,
      other,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      site,
      data,
      version,
      ogImage,
      t: makeT(i18n[lang], lang, missing),
      L: (o) => (o && typeof o === 'object' && !Array.isArray(o) && lang in o ? o[lang] : o),
      // root=true لصفحة 404 التي قد تُعرض من أي مسار، فتحتاج روابط مطلقة
      asset: (p) => (root ? '/assets/' : '../assets/') + p,
      href: (slug) => (root ? `/${lang}/` : '') + (slug === 'index' ? (root ? '' : './') : slug + '.html'),
      langHref: (l, slug) => (root ? `/${l}/` : `../${l}/${slug === 'index' ? '' : slug + '.html'}`),
    };
    ctx.pdfForm = hasPdf ? { href: ctx.asset(pdfRel), download: true } : { href: ctx.href('registration-form'), download: false };
    return ctx;
  };

  const renderPage = (ctx, page) => {
    const p = { ...page };
    p.title = typeof page.title === 'function' ? page.title(ctx) : ctx.t(`meta.${page.key}.title`);
    p.desc = typeof page.desc === 'function' ? page.desc(ctx) : ctx.t(`meta.${page.key}.desc`);
    return layout(ctx, p, page.render(ctx));
  };

  for (const lang of LANGS) {
    const ctx = makeCtx(lang);
    for (const page of pages) write(path.join(DIST, lang, `${page.slug}.html`), renderPage(ctx, page));
  }

  /* --- 404 (عربي افتراضياً مع سطر إنجليزي) --- */
  write(path.join(DIST, '404.html'), renderPage(makeCtx(site.defaultLang, { root: true }), pagesFactory.notFound));

  /* --- الصفحة الجذرية: تحويل إلى اللغة المحفوظة أو الافتراضية --- */
  write(
    path.join(DIST, 'index.html'),
    `<!doctype html><html lang="${site.defaultLang}"><head><meta charset="utf-8"><title>${i18n[site.defaultLang].brand.full}</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${site.baseUrl}/${site.defaultLang}/">
<script>var l='${site.defaultLang}';try{var s=localStorage.getItem('np-lang');if(s==='ar'||s==='en')l=s}catch(e){}location.replace(l+'/');</script>
<meta http-equiv="refresh" content="0;url=${site.defaultLang}/"></head>
<body><a href="ar/">العربية</a> · <a href="en/">English</a></body></html>`
  );

  /* --- sitemap.xml + robots.txt --- */
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .filter((p) => !p.noindex)
    .flatMap((p) => {
      const file = p.slug === 'index' ? '' : `${p.slug}.html`;
      return LANGS.map(
        (l) => `  <url>
    <loc>${site.baseUrl}/${l}/${file}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p.priority || '0.5'}</priority>
${LANGS.map((a) => `    <xhtml:link rel="alternate" hreflang="${a}" href="${site.baseUrl}/${a}/${file}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${site.baseUrl}/${site.defaultLang}/${file}"/>
  </url>`
      );
    });
  write(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
  );
  write(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl}/sitemap.xml\n`);

  /* --- تقارير --- */
  const [ka, ke] = LANGS.map((l) => new Set(flatKeys(i18n[l])));
  const diff = [...ka].filter((k) => !ke.has(k)).map((k) => `en ينقصه: ${k}`).concat([...ke].filter((k) => !ka.has(k)).map((k) => `ar ينقصه: ${k}`));
  if (missing.size) console.warn(`  ⚠ مفاتيح ترجمة مفقودة (${missing.size}):\n    ` + [...missing].join('\n    '));
  if (diff.length) console.warn(`  ⚠ اختلاف بين ملفي الترجمة (${diff.length}):\n    ` + diff.join('\n    '));
  console.log(`✔ تم بناء ${pages.length * LANGS.length + 2} صفحة (${placeholders} صورة مؤقتة) في ${Date.now() - t0}ms → dist/`);
  return { missing: missing.size, diff: diff.length };
}

/* ------------------------------ خادم التطوير ------------------------------ */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf', '.ico': 'image/x-icon',
};

function serve(port) {
  http
    .createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      let file = path.join(DIST, p);
      if (!file.startsWith(DIST)) file = path.join(DIST, '404.html');
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        res.writeHead(301, { Location: p + '/' });
        return res.end();
      }
      const found = fs.existsSync(file);
      if (!found) file = path.join(DIST, '404.html');
      res.writeHead(found ? 200 : 404, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    })
    .listen(port, () => console.log(`▶ http://localhost:${port}/  (Ctrl+C للإيقاف)`));

  // إعادة البناء عند تعديل أي ملف داخل src/
  let timer;
  fs.watch(SRC, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (e) {
        console.error('✖ فشل البناء:', e.message);
      }
    }, 150);
  });
}

if (require.main === module) {
  const result = build();
  if (process.argv.includes('--serve')) serve(Number(process.env.PORT) || 4173);
  else if (process.argv.includes('--strict') && (result.missing || result.diff)) process.exit(1);
}

module.exports = { build };
