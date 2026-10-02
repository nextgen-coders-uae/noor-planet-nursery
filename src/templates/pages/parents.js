/**
 * ركن الأهل – معرض الصور والفيديو – الفعاليات والأخبار – الأسئلة الشائعة.
 */
const { esc, fmtDate } = require('../helpers');
const art = require('../art');
const { secHead, pageHero, ctaBand, checkList, img, nextEvent } = require('../components');
const { menuTable } = require('./info');

/* ------------------------------ ركن الأهل ------------------------------ */
function renderParents(ctx) {
  const { t, L, data, lang } = ctx;
  const anchors = ['articles', 'menu', 'calendar', 'checklist', 'policies'];
  const range = (c) =>
    c.to
      ? `${fmtDate(c.from, lang, { day: 'numeric', month: 'short' })} – ${fmtDate(c.to, lang)}`
      : fmtDate(c.from, lang);

  return `
${pageHero(ctx, { title: t('parents.title'), lead: t('parents.lead'), pose: 'wink' })}

<nav class="anchor-nav no-print" aria-label="${t('parents.title')}">
  <div class="container"><ul>
    ${anchors.map((a) => `<li><a href="#${a}">${t('parents.' + a + '.nav')}</a></li>`).join('')}
  </ul></div>
</nav>

<section class="section section--tight no-print" id="articles">
  <div class="container">
    ${secHead(t('parents.articles.kicker'), t('parents.articles.title'))}
    <div class="grid grid-2">
      ${data.articles
        .map(
          (a) => `<details class="article t-${a.tone} reveal">
        <summary><span class="bubble" aria-hidden="true">${a.emoji}</span><h3>${L(a.title)}</h3>${art.icon('down')}</summary>
        <ul>${L(a.body).map((p) => `<li>${p}</li>`).join('')}</ul>
      </details>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section--tight no-print" id="menu">
  <div class="container">
    ${secHead(t('menu.kicker'), t('menu.title'), t('menu.lead'))}
    ${menuTable(ctx)}
  </div>
</section>

<section class="section section--tight no-print" id="calendar">
  <div class="container container--narrow">
    ${secHead(t('parents.calendar.kicker'), t('parents.calendar.title'), t('parents.calendar.lead'))}
    <ul class="cal-list">
      ${data.events.calendar
        .map((c) => `<li class="reveal"><span aria-hidden="true">${c.emoji}</span><b>${L(c.title)}</b><time datetime="${c.from}">${range(c)}</time></li>`)
        .join('')}
    </ul>
  </div>
</section>

<section class="section section--tight" id="checklist">
  <div class="container container--narrow">
    <div class="no-print">${secHead(t('parents.checklist.kicker'), t('parents.checklist.title'), t('parents.checklist.lead'))}</div>
    <div class="card printable reveal">
      <h3 class="print-only">${t('parents.checklist.title')} – ${t('brand.full')}</h3>
      <ul class="tick-list">
        ${t('parents.checklist.items').map((i, n) => `<li><label><input type="checkbox" id="ck-${n}"> <span>${i}</span></label></li>`).join('')}
      </ul>
      <p class="hint">${t('parents.checklist.note')}</p>
      <button class="btn btn-ghost btn-sm no-print" type="button" data-print>${art.icon('print')} ${t('parents.checklist.print')}</button>
    </div>
  </div>
</section>

<section class="section section--tight no-print" id="policies">
  <div class="container">
    ${secHead(t('parents.policies.kicker'), t('parents.policies.title'))}
    <div class="grid grid-3">
      ${t('parents.policies.items')
        .map(
          (p, i) => `<article class="card info-card t-${['sky', 'pink', 'mint'][i % 3]} reveal">
        <span class="bubble" aria-hidden="true">${p.emoji}</span>
        <h3>${p.title}</h3>
        ${checkList(p.items, 'check-list--sm')}
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<div class="no-print">${ctaBand(ctx)}</div>`;
}

/* ------------------------------ المعرض ------------------------------ */
function renderGallery(ctx) {
  const { t, L, data } = ctx;
  const g = data.gallery;
  return `
${pageHero(ctx, { title: t('gallery.title'), lead: t('gallery.lead'), pose: 'wow' })}

<section class="section section--tight">
  <div class="container">
    <div class="filters" role="group" aria-label="${t('gallery.filter')}">
      <button type="button" class="is-active" data-filter="all" aria-pressed="true">${t('gallery.all')}</button>
      ${g.categories.map((c) => `<button type="button" data-filter="${c.id}" aria-pressed="false">${L(c.name)}</button>`).join('')}
    </div>
    <ul class="gallery" data-gallery>
      ${g.items
        .map(
          (it, i) => `<li data-cat="${it.cat}">
        <button type="button" data-lightbox="${i}" aria-label="${esc(t('gallery.open') + ': ' + L(it.alt))}">
          ${img(ctx, it.image, L(it.alt))}
          <span class="gallery__cap">${L(it.alt)}</span>
        </button>
      </li>`
        )
        .join('')}
    </ul>
    <p class="hint center">${t('gallery.consent')}</p>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    ${secHead(t('gallery.videos.kicker'), t('gallery.videos.title'))}
    <div class="grid grid-2">
      ${g.videos
        .map((v) =>
          v.youtubeId
            ? `<div class="video reveal"><iframe src="https://www.youtube-nocookie.com/embed/${v.youtubeId}" title="${esc(L(v.title))}" loading="lazy" allowfullscreen></iframe></div>`
            : `<div class="video video--soon t-${v.tone} reveal"><span class="video__play" aria-hidden="true">${art.icon('play')}</span><b>${v.emoji} ${L(v.title)}</b><small>${t('gallery.videos.soon')}</small></div>`
        )
        .join('')}
    </div>
  </div>
</section>

<dialog class="lightbox" data-lightbox-dialog aria-label="${t('gallery.title')}">
  <button type="button" class="lightbox__close" data-lb-close aria-label="${t('ui.close')}">${art.icon('close')}</button>
  <button type="button" class="lightbox__nav lightbox__nav--prev" data-lb-prev aria-label="${t('gallery.prev')}">${art.icon('arrow', { flip: true, cls: 'icon--back' })}</button>
  <figure><img src="" alt=""><figcaption></figcaption></figure>
  <button type="button" class="lightbox__nav lightbox__nav--next" data-lb-next aria-label="${t('gallery.next')}">${art.icon('arrow', { flip: true })}</button>
</dialog>

${ctaBand(ctx)}`;
}

/* ------------------------------ الفعاليات والأخبار ------------------------------ */
function renderEvents(ctx) {
  const { t, L, data, lang } = ctx;
  const ev = data.events;
  return `
${pageHero(ctx, { title: t('events.title'), lead: t('events.lead'), pose: 'wow' })}

<section class="section section--tight">
  <div class="container">${nextEvent(ctx, { cta: false })}</div>
</section>

<section class="section section--tight">
  <div class="container">
    ${secHead(t('events.upcoming.kicker'), t('events.upcoming.title'))}
    <div class="grid grid-3" data-events>
      ${ev.events
        .map(
          (e) => `<article class="card event-card t-${e.tone} reveal" data-event-date="${e.date}">
        <div class="event-card__date"><b>${fmtDate(e.date, lang, { day: 'numeric' })}</b><span>${fmtDate(e.date, lang, { month: 'short', year: 'numeric' })}</span></div>
        <div>
          <h3>${e.emoji} ${L(e.title)}</h3>
          <p>${L(e.desc)}</p>
          <span class="chip chip--past" hidden>${t('events.past')}</span>
        </div>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section--soft">
  ${art.wave('var(--violet-soft)', { cls: 'wave--top' })}
  <div class="container">
    ${secHead(t('events.news.kicker'), t('events.news.title'))}
    <div class="grid grid-3">
      ${ev.news
        .map(
          (n) => `<article class="card info-card t-${n.tone} reveal">
        <span class="bubble" aria-hidden="true">${n.emoji}</span>
        <time datetime="${n.date}">${fmtDate(n.date, lang)}</time>
        <h3>${L(n.title)}</h3>
        <p>${L(n.desc)}</p>
      </article>`
        )
        .join('')}
    </div>
  </div>
  ${art.wave('var(--cream)')}
</section>

${ctaBand(ctx)}`;
}

/* ------------------------------ الأسئلة الشائعة ------------------------------ */
function renderFaq(ctx) {
  const { t, L, href, data, site } = ctx;
  return `
${pageHero(ctx, { title: t('faq.title'), lead: t('faq.lead'), pose: 'wink' })}

<section class="section section--tight">
  <div class="container container--narrow">
    <div class="faq">
      ${data.faq
        .map(
          (f, i) => `<details class="faq__item reveal"${i === 0 ? ' open' : ''}>
        <summary><h2>${L(f.q)}</h2>${art.icon('down')}</summary>
        <p>${L(f.a)}</p>
      </details>`
        )
        .join('')}
    </div>
    <div class="note-card reveal mt">
      <span class="bubble t-mint" aria-hidden="true">💬</span>
      <div>
        <h3>${t('faq.more.title')}</h3>
        <p>${t('faq.more.text')}</p>
        <div class="btn-row">
          <a class="btn btn-wa btn-sm" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener">${art.icon('whatsapp')} ${t('ui.whatsapp')}</a>
          <a class="btn btn-ghost btn-sm" href="${href('contact')}">${t('nav.contact')}</a>
        </div>
      </div>
    </div>
  </div>
</section>

${ctaBand(ctx)}`;
}

/** Schema.org FAQPage */
const faqSchema = (ctx) => [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ctx.data.faq.map((f) => ({
      '@type': 'Question',
      name: ctx.L(f.q),
      acceptedAnswer: { '@type': 'Answer', text: ctx.L(f.a) },
    })),
  },
];

module.exports = [
  { slug: 'parents', key: 'parents', priority: '0.7', render: renderParents },
  { slug: 'gallery', key: 'gallery', priority: '0.6', render: renderGallery },
  { slug: 'events', key: 'events', priority: '0.6', render: renderEvents },
  { slug: 'faq', key: 'faq', priority: '0.7', schema: faqSchema, render: renderFaq },
];
