/**
 * components.js – مكوّنات قابلة لإعادة الاستخدام في كل الصفحات.
 * كل مكوّن دالة تستقبل ctx (سياق الصفحة: اللغة، الترجمة t، البيانات…) وتُرجع HTML.
 */
const { esc, fmtTime } = require('./helpers');
const art = require('./art');

/** عنوان قسم: شارة صغيرة + عنوان + وصف. */
const secHead = (kicker, title, lead = '') => `
<header class="sec-head reveal">
  ${kicker ? `<span class="kicker">${kicker}</span>` : ''}
  <h2>${title}</h2>
  ${lead ? `<p>${lead}</p>` : ''}
</header>`;

/** ترويسة الصفحات الداخلية. */
function pageHero(ctx, { title, lead = '', pose = 'happy', parent = null }) {
  const { t, href } = ctx;
  return `
<section class="page-hero">
  ${art.sparkles(12, title.length)}
  ${art.cloud('page-hero__cloud')}
  <div class="container page-hero__in">
    <div>
      <nav class="crumbs" aria-label="${t('ui.breadcrumb')}">
        <a href="${href('index')}">${t('nav.index')}</a><span aria-hidden="true">›</span>
        ${parent ? `<a href="${href(parent)}">${t('nav.' + parent)}</a><span aria-hidden="true">›</span>` : ''}
        <span aria-current="page">${title}</span>
      </nav>
      <h1>${title}</h1>
      ${lead ? `<p class="lead">${lead}</p>` : ''}
    </div>
    <div class="page-hero__art">${art.noor({ pose })}</div>
  </div>
  ${art.wave('var(--cream)')}
</section>`;
}

/** تنبيه "بيانات تجريبية" – يظهر فقط إذا كان demo=true في site.config.json */
const demoNote = (ctx, key = 'ui.demo') => (ctx.site.demo ? `<p class="demo-note" role="note">⚠️ ${ctx.t(key)}</p>` : '');

/** مؤشر الأماكن المتاحة لبرنامج. */
function seats(ctx, p) {
  const { t } = ctx;
  const { total, available } = p.seats;
  const filled = Math.round(((total - available) / total) * 100);
  const low = available <= 3;
  const label = available === 0 ? t('ui.seatsFull') : t('ui.seats', { n: available, total });
  return `
<div class="seats ${low ? 'is-low' : ''}">
  <div class="seats__bar" role="img" aria-label="${esc(label)}"><span style="width:${filled}%"></span></div>
  <small>${low && available > 0 ? '🔥 ' : ''}${label}</small>
</div>`;
}

/** بطاقة برنامج. */
function programCard(ctx, p) {
  const { t, L, href } = ctx;
  return `
<article class="card program-card t-${p.tone} reveal">
  <div class="program-card__top">
    <span class="bubble" aria-hidden="true">${p.emoji}</span>
    <span class="chip">${L(p.age)}</span>
  </div>
  <h3>${L(p.name)}</h3>
  <p>${L(p.tagline)}</p>
  <ul class="meta-list">
    <li>👩‍🏫 ${t('ui.ratio')}: <b dir="ltr">${p.ratio}</b></li>
  </ul>
  ${seats(ctx, p)}
  <a class="link-more" href="${href('program-' + p.id)}">${t('ui.learnMore')} ${art.icon('arrow', { flip: true })}<span class="sr-only"> – ${L(p.name)}</span></a>
</article>`;
}

/** شريط الدعوة للتسجيل (يتكرر أسفل أغلب الصفحات). */
function ctaBand(ctx) {
  const { t, href } = ctx;
  return `
<section class="cta-band">
  ${art.wave('var(--night)', { cls: 'wave--top' })}
  ${art.sparkles(16, 21)}
  <div class="container cta-band__in reveal">
    <div class="cta-band__art">${art.noor({ pose: 'wink' })}</div>
    <div>
      <h2>${t('cta.title')}</h2>
      <p>${t('cta.text')}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="${href('register')}">${t('ui.register')}</a>
        <a class="btn btn-light" href="${href('visit')}">${t('ui.bookVisit')}</a>
      </div>
    </div>
  </div>
</section>`;
}

/**
 * حقل نموذج. data-label و data-emoji يُستخدمان لبناء رسالة واتساب.
 * f: { name, label, type, required, options, placeholder, hint, full, emoji, attrs }
 */
function field(f) {
  const id = 'f-' + f.name;
  const common = `id="${id}" name="${f.name}" data-label="${esc(f.label)}"${f.emoji ? ` data-emoji="${f.emoji}"` : ''}${
    f.required ? ' required' : ''
  }${f.attrs ? ' ' + f.attrs : ''}`;
  let control;
  if (f.type === 'select') {
    const opts = f.options
      .map((o) => (typeof o === 'string' ? `<option>${o}</option>` : `<option value="${esc(o.value)}">${o.label}</option>`))
      .join('');
    control = `<select ${common}>${f.placeholder ? `<option value="">${f.placeholder}</option>` : ''}${opts}</select>`;
  } else if (f.type === 'textarea') {
    control = `<textarea ${common} rows="3"${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}></textarea>`;
  } else {
    control = `<input type="${f.type || 'text'}" ${common}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}>`;
  }
  return `
<div class="field${f.full ? ' field--full' : ''}">
  <label for="${id}">${f.label}${f.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
  ${control}
  ${f.hint ? `<small class="hint">${f.hint}</small>` : ''}
</div>`;
}

/** قائمة بعلامات ✓ */
const checkList = (items, cls = '') =>
  `<ul class="check-list ${cls}">${items.map((i) => `<li>${art.icon('check')}<span>${i}</span></li>`).join('')}</ul>`;

/** بطاقة أيقونة + عنوان + نص. */
const infoCard = ({ emoji, tone = 'sky', title, text }) => `
<article class="card info-card t-${tone} reveal">
  <span class="bubble" aria-hidden="true">${emoji}</span>
  <h3>${title}</h3>
  <p>${text}</p>
</article>`;

/** صورة مع تحميل كسول وأبعاد ثابتة (تمنع قفز التخطيط). */
const img = (ctx, src, alt, { w = 800, h = 600, cls = '' } = {}) =>
  `<img class="${cls}" src="${ctx.asset('img/' + src)}" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">`;

/** نص ساعات العمل: "الأحد – الخميس · 7:00 ص – 4:00 م" */
function hoursText(ctx) {
  const { t, site, lang } = ctx;
  const d = site.hours.days;
  const days = t('ui.days');
  return `${days[d[0]]} – ${days[d[d.length - 1]]} · <span>${fmtTime(site.hours.open, lang)} – ${fmtTime(site.hours.close, lang)}</span>`;
}

/** لوحة النجاح بعد إرسال نموذج عبر واتساب. */
const waDone = (ctx) => `
<div class="wa-done" data-wa-done hidden tabindex="-1">
  ${art.noor({ pose: 'wow' })}
  <h3>${ctx.t('forms.doneTitle')}</h3>
  <p>${ctx.t('forms.doneText')}</p>
</div>`;

/**
 * بطاقة "الفعالية القادمة" مع عداد تنازلي.
 * تُمرَّر كل الفعاليات في data-next-event والسكربت يختار أقرب فعالية لم تبدأ بعد.
 */
function nextEvent(ctx, { cta = true } = {}) {
  const { t, L, href, data, lang } = ctx;
  const { fmtDate } = require('./helpers');
  const list = data.events.events.map((e) => ({ d: e.date, t: L(e.title), e: e.emoji, f: fmtDate(e.date, lang) }));
  return `
<div class="next-event reveal" data-next-event="${esc(JSON.stringify(list))}" hidden>
  <div class="next-event__info">
    <span class="kicker">${t('home.event.kicker')}</span>
    <h2><span data-ev-emoji aria-hidden="true"></span> <span data-ev-title></span></h2>
    <p>${art.icon('calendar')} <span data-ev-date></span></p>
  </div>
  <div class="countdown" role="timer" aria-live="off">
    <div><b data-cd="d">0</b><small>${t('ui.cd.d')}</small></div>
    <div><b data-cd="h">0</b><small>${t('ui.cd.h')}</small></div>
    <div><b data-cd="m">0</b><small>${t('ui.cd.m')}</small></div>
    <div><b data-cd="s">0</b><small>${t('ui.cd.s')}</small></div>
  </div>
  ${cta ? `<a class="btn btn-ghost btn-sm" href="${href('events')}">${t('home.event.cta')}</a>` : ''}
</div>`;
}

module.exports = { nextEvent, secHead, pageHero, demoNote, seats, programCard, ctaBand, field, checkList, infoCard, img, hoursText, waDone };
