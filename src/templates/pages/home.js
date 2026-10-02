/**
 * الصفحة الرئيسية.
 */
const { esc, fmtTime } = require('../helpers');
const art = require('../art');
const { secHead, programCard, ctaBand, demoNote, img, nextEvent } = require('../components');

function render(ctx) {
  const { t, L, href, data, site, lang } = ctx;
  const features = t('home.features');
  const stats = [
    ['years', '🏅'],
    ['children', '👶'],
    ['teachers', '👩‍🏫'],
    ['activities', '🎨'],
  ];

  return `
<!-- ============ Hero ============ -->
<section class="hero">
  ${art.sparkles(26, 4)}
  <div class="container hero__in">
    <div class="hero__copy">
      <span class="kicker kicker--light">🪐 ${t('home.hero.kicker')}</span>
      <h1>${t('home.hero.title')}</h1>
      <p class="lead">${t('home.hero.lead')}</p>
      <div class="btn-row">
        <a class="btn btn-primary btn-lg" href="${href('visit')}">${t('ui.bookVisit')}</a>
        <a class="btn btn-light btn-lg" href="${href('register')}">${t('ui.register')}</a>
      </div>
      <ul class="hero__trust">
        ${t('home.hero.trust').map((x) => `<li>${art.icon('check')}${x}</li>`).join('')}
      </ul>
    </div>
    <div class="hero__art">
      ${art.planet()}
      <div class="hero__noor">${art.noor({ pose: 'happy', title: esc(t('brand.mascot')) })}</div>
      ${art.rocket('hero__rocket')}
    </div>
  </div>
  ${art.wave('var(--cream)')}
</section>

<!-- ============ شريط المميزات ============ -->
<section class="features" aria-label="${t('home.featuresLabel')}">
  <div class="container">
    <ul class="features__list">
      ${features
        .map(
          (f, i) => `<li class="reveal t-${['mint', 'sky', 'orange', 'pink', 'violet'][i % 5]}">
        <span class="bubble" aria-hidden="true">${f.emoji}</span><b>${f.title}</b><small>${f.text}</small></li>`
        )
        .join('')}
    </ul>
  </div>
</section>

<!-- ============ البرامج ============ -->
<section class="section">
  <div class="container">
    ${secHead(t('home.programs.kicker'), t('home.programs.title'), t('home.programs.lead'))}
    <div class="grid grid-4">${data.programs.map((p) => programCard(ctx, p)).join('')}</div>
    <p class="center"><a class="btn btn-ghost" href="${href('programs')}">${t('home.programs.cta')}</a></p>
  </div>
</section>

<!-- ============ يوم في كوكب نور ============ -->
<section class="section section--soft">
  ${art.wave('var(--violet-soft)', { cls: 'wave--top' })}
  <div class="container">
    ${secHead(t('home.day.kicker'), t('home.day.title'), t('home.day.lead'))}
    <ol class="day-strip">
      ${data.schedule
        .map(
          (s) => `<li class="t-${s.tone} reveal">
        <span class="bubble" aria-hidden="true">${s.emoji}</span>
        <time>${fmtTime(s.time, lang)}</time>
        <b>${L(s.title)}</b>
      </li>`
        )
        .join('')}
    </ol>
    <p class="center"><a class="btn btn-night" href="${href('day')}">${t('home.day.cta')} ${art.icon('arrow', { flip: true })}</a></p>
  </div>
  ${art.wave('var(--cream)')}
</section>

<!-- ============ الأنشطة ============ -->
<section class="section">
  ${art.rainbow('deco--tr')}
  <div class="container">
    ${secHead(t('home.activities.kicker'), t('home.activities.title'), t('home.activities.lead'))}
    <ul class="activity-chips">
      ${data.activities
        .map((a) => `<li class="t-${a.tone} reveal"><span aria-hidden="true">${a.emoji}</span>${L(a.title)}</li>`)
        .join('')}
    </ul>
    <p class="center"><a class="btn btn-ghost" href="${href('activities')}">${t('home.activities.cta')}</a></p>
  </div>
</section>

<!-- ============ معرض مختصر ============ -->
<section class="section section--tight">
  <div class="container">
    ${secHead(t('home.gallery.kicker'), t('home.gallery.title'))}
    <div class="gallery-strip">
      ${data.gallery.items
        .filter((g) => g.featured)
        .slice(0, 6)
        .map((g) => `<a class="gallery-strip__item reveal" href="${href('gallery')}">${img(ctx, g.image, L(g.alt))}</a>`)
        .join('')}
    </div>
    <p class="center"><a class="btn btn-ghost" href="${href('gallery')}">${t('home.gallery.cta')}</a></p>
  </div>
</section>

<!-- ============ آراء الأهالي ============ -->
<section class="section section--sun">
  ${art.wave('var(--sun-soft)', { cls: 'wave--top' })}
  <div class="container">
    ${secHead(t('home.testimonials.kicker'), t('home.testimonials.title'))}
    ${demoNote(ctx, 'ui.demoTestimonials')}
    <div class="grid grid-3">
      ${data.testimonials
        .map(
          (x) => `<figure class="quote t-${x.tone} reveal">
        <div class="quote__stars" aria-hidden="true">★★★★★</div>
        <blockquote><p>${L(x.text)}</p></blockquote>
        <figcaption><b>${L(x.name)}</b><small>${L(x.meta)}</small></figcaption>
      </figure>`
        )
        .join('')}
    </div>
  </div>
  ${art.wave('var(--cream)')}
</section>

<!-- ============ العدادات ============ -->
<section class="section section--tight">
  <div class="container">
    <h2 class="sr-only">${t('home.stats.title')}</h2>
    <ul class="stats">
      ${stats
        .map(
          ([k, e], i) => `<li class="t-${['sun', 'pink', 'sky', 'mint'][i]} reveal">
        <span aria-hidden="true">${e}</span>
        <b><span data-count="${site.stats[k]}">${site.stats[k]}</span>+</b>
        <small>${t('home.stats.' + k)}</small>
      </li>`
        )
        .join('')}
    </ul>
    ${demoNote(ctx, 'ui.demoStats')}
  </div>
</section>

<!-- ============ الفعالية القادمة (عداد تنازلي) ============ -->
<section class="section section--tight">
  <div class="container">
    ${nextEvent(ctx)}
  </div>
</section>

${ctaBand(ctx)}`;
}

module.exports = [{ slug: 'index', key: 'index', priority: '1.0', render }];
