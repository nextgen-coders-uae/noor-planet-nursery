/**
 * الصفحات القانونية (الخصوصية – الشروط) + لوحة الهوية البصرية + صفحة 404.
 */
const art = require('../art');
const { pageHero, secHead, checkList } = require('../components');
const { NAV_MAIN, NAV_MORE } = require('../layout');

/* ------------------------------ صفحة قانونية عامة ------------------------------ */
const renderLegal = (key) => (ctx) => {
  const { t, href, site } = ctx;
  return `
${pageHero(ctx, { title: t(key + '.title'), lead: t(key + '.lead') })}
<section class="section section--tight">
  <div class="container container--narrow prose legal">
    <p class="hint">${t('legal.updated')}</p>
    ${t(key + '.sections')
      .map(
        (s) => `<h2>${s.title}</h2>
      ${(s.paras || []).map((p) => `<p>${p}</p>`).join('')}
      ${s.items ? checkList(s.items, 'check-list--sm') : ''}`
      )
      .join('')}
    <div class="note-card mt">
      <span class="bubble t-sky" aria-hidden="true">✉️</span>
      <div><h3>${t('legal.contactTitle')}</h3>
      <p>${t('legal.contactText')} <a href="mailto:${site.email}" dir="ltr">${site.email}</a> · <a href="${href('contact')}">${t('nav.contact')}</a></p></div>
    </div>
  </div>
</section>`;
};

/* ------------------------------ لوحة الهوية البصرية ------------------------------ */
const PALETTE = [
  ['--sun', '#FFC93C'],
  ['--sky', '#4FC3F7'],
  ['--violet', '#9B8AFB'],
  ['--pink', '#FF8FAB'],
  ['--mint', '#6FD3A8'],
  ['--orange', '#FF9F45'],
  ['--cream', '#FFF9EF'],
  ['--night', '#2B2D6E'],
];

function renderBrand(ctx) {
  const { t, href, data, L } = ctx;
  const names = t('brandPage.colorNames');
  const poses = ['happy', 'wink', 'wow', 'sleep'];
  const poseNames = t('brandPage.poses');
  const extra = ['register', 'visit', 'privacy', 'terms'];

  return `
${pageHero(ctx, { title: t('brandPage.title'), lead: t('brandPage.lead') })}

<section class="section section--tight">
  <div class="container">
    ${secHead('01', t('brandPage.colors'))}
    <ul class="swatches">
      ${PALETTE.map(
        ([v, hex], i) => `<li><span style="background:var(${v})"></span><b>${names[i]}</b><code dir="ltr">${hex}</code></li>`
      ).join('')}
    </ul>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    ${secHead('02', t('brandPage.fonts'))}
    <div class="grid grid-2">
      <div class="card"><small>Baloo Bhaijaan 2 – ${t('brandPage.headings')}</small><p class="type-head">${t('home.hero.title')}</p><p class="type-head" lang="en" dir="ltr">Noor Planet Nursery</p></div>
      <div class="card"><small>Tajawal / Nunito – ${t('brandPage.body')}</small><p>${t('home.hero.lead')}</p><p dir="ltr" lang="en" style="font-family:Nunito,sans-serif">A safe, warm place where little ones discover the world.</p></div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    ${secHead('03', t('brandPage.mascot'), t('brandPage.mascotText'))}
    <ul class="poses">
      ${poses.map((p, i) => `<li class="card">${art.noor({ pose: p })}<b>${poseNames[i]}</b></li>`).join('')}
    </ul>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    ${secHead('04', t('brandPage.components'))}
    <div class="card">
      <div class="btn-row">
        <a class="btn btn-primary" href="#">${t('ui.register')}</a>
        <a class="btn btn-ghost" href="#">${t('ui.bookVisit')}</a>
        <a class="btn btn-night" href="#">${t('ui.learnMore')}</a>
        <a class="btn btn-wa" href="#">${art.icon('whatsapp')} ${t('ui.whatsapp')}</a>
      </div>
      <p class="btn-row">
        ${['sun', 'sky', 'violet', 'pink', 'mint', 'orange'].map((c) => `<span class="chip t-${c}">${c}</span>`).join('')}
      </p>
      <div class="brand-deco" aria-hidden="true">${art.rocket()}${art.rainbow()}${art.miniPlanet('#FF8FAB')}${art.miniPlanet('#4FC3F7')}<span style="color:var(--violet)">${art.cloud()}</span></div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    ${secHead('05', t('brandPage.sitemap'))}
    <div class="card sitemap-tree">
      <ul>
        ${NAV_MAIN.map((k) =>
          k === 'programs'
            ? `<li><a href="${href(k)}">${t('nav.' + k)}</a><ul>${data.programs
                .map((p) => `<li><a href="${href('program-' + p.id)}">${p.emoji} ${L(p.name)}</a></li>`)
                .join('')}</ul></li>`
            : `<li><a href="${href(k)}">${t('nav.' + k)}</a></li>`
        ).join('')}
        ${[...NAV_MORE, ...extra].map((k) => `<li><a href="${href(k)}">${t('nav.' + k)}</a></li>`).join('')}
        <li><a href="${href('thank-you')}">${t('meta.thanks.title')}</a></li>
        <li><a href="${href('registration-form')}">${t('meta.printForm.title')}</a></li>
        <li><a href="${href('index')}../404.html">404</a></li>
      </ul>
    </div>
  </div>
</section>`;
}

/* ------------------------------ 404 ------------------------------ */
function render404(ctx) {
  const { t, href } = ctx;
  return `
<section class="section notfound">
  ${art.sparkles(24, 404)}
  <div class="container container--narrow center">
    <div class="notfound__art" aria-hidden="true">${art.rocket()}<span>404</span>${art.miniPlanet('#9B8AFB')}</div>
    <h1>${t('notFound.title')}</h1>
    <p class="lead">${t('notFound.text')}</p>
    <p lang="en" dir="ltr" class="hint">Looks like the rocket lost its way! <a href="/en/">Back to the planet</a></p>
    <div class="btn-row btn-row--center">
      <a class="btn btn-primary btn-lg" href="${href('index')}">🪐 ${t('notFound.cta')}</a>
      <a class="btn btn-light" href="${href('contact')}">${t('nav.contact')}</a>
    </div>
  </div>
</section>`;
}

module.exports = [
  { slug: 'privacy', key: 'privacy', priority: '0.3', render: renderLegal('privacy') },
  { slug: 'terms', key: 'terms', priority: '0.3', render: renderLegal('terms') },
  { slug: 'brand', key: 'brandPage', noindex: true, render: renderBrand },
];
module.exports.notFound = { slug: '404', key: 'notFound', noindex: true, render: render404 };
