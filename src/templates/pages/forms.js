/**
 * صفحات النماذج التي تُرسل عبر واتساب: احجز زيارة – تواصل معنا – انضم لفريقنا.
 * كل نموذج يحمل data-wa-form، والسكربت العام (main.js) يحوّل الحقول إلى رسالة واتساب.
 */
const { esc, fmtTime } = require('../helpers');
const art = require('../art');
const { pageHero, field, waDone, hoursText, checkList, secHead, infoCard } = require('../components');

const PHONE_ATTRS = 'autocomplete="tel" inputmode="tel" dir="ltr" pattern="[0-9+ \\-]{7,}"';

/** غلاف نموذج واتساب. */
const waForm = (ctx, { title, fields, submit, extraAttrs = '' }) => `
<form class="card wa-form reveal" data-wa-form data-wa="${ctx.site.whatsapp}" data-wa-title="${esc(title)}" ${extraAttrs} novalidate>
  <div class="form-grid">${fields.join('')}</div>
  <p class="form-error" data-error role="alert" hidden></p>
  <button class="btn btn-wa btn-lg" type="submit">${art.icon('whatsapp')} ${submit || ctx.t('forms.sendWa')}</button>
  <p class="hint">${ctx.t('forms.waNote')}</p>
</form>
${waDone(ctx)}`;

/* ------------------------------ احجز زيارة ------------------------------ */
function renderVisit(ctx) {
  const { t, L, site, data, lang } = ctx;
  const fields = [
    field({ name: 'parentName', label: t('forms.parentName'), required: true, emoji: '👤', attrs: 'autocomplete="name"' }),
    field({ name: 'phone', label: t('forms.phone'), type: 'tel', required: true, emoji: '📞', placeholder: '05X XXX XXXX', attrs: PHONE_ATTRS }),
    field({ name: 'childAge', label: t('visit.childAge'), required: true, emoji: '👶', placeholder: t('visit.childAgePh') }),
    field({
      name: 'program', label: t('visit.program'), type: 'select', emoji: '🪐', placeholder: t('visit.notSure'),
      options: data.programs.map((p) => `${L(p.name)} (${L(p.age)})`),
    }),
    field({ name: 'date', label: t('visit.date'), type: 'date', required: true, emoji: '📅', hint: t('visit.dateHint'), attrs: 'data-workday' }),
    field({
      name: 'time', label: t('visit.time'), type: 'select', required: true, emoji: '⏰', placeholder: t('forms.choose'),
      options: site.visitSlots.map((s) => fmtTime(s, lang)),
    }),
    field({ name: 'notes', label: t('forms.notes'), type: 'textarea', full: true, emoji: '📝' }),
  ];

  return `
${pageHero(ctx, { title: t('visit.title'), lead: t('visit.lead'), pose: 'wink' })}
<section class="section section--tight">
  <div class="container split split--form">
    <div>
      ${waForm(ctx, {
        title: '🗓️ ' + t('visit.waTitle'),
        fields,
        extraAttrs: `data-workdays="${site.hours.days.join(',')}" data-workday-msg="${esc(t('visit.workdayMsg'))}"`,
      })}
    </div>
    <aside class="reveal">
      <div class="card info-card t-sun">
        <span class="bubble" aria-hidden="true">👀</span>
        <h2 class="h3">${t('visit.what.title')}</h2>
        ${checkList(t('visit.what.items'))}
      </div>
      <div class="card info-card t-sky">
        <span class="bubble" aria-hidden="true">🕘</span>
        <h2 class="h3">${t('contact.hours')}</h2>
        <p>${hoursText(ctx)}</p>
        <p>${art.icon('pin')} ${L(site.address.street)} – ${L(site.address.city)}</p>
      </div>
    </aside>
  </div>
</section>`;
}

/* ------------------------------ تواصل معنا ------------------------------ */
function renderContact(ctx) {
  const { t, L, site } = ctx;
  const fields = [
    field({ name: 'name', label: t('forms.name'), required: true, emoji: '👤', attrs: 'autocomplete="name"' }),
    field({ name: 'phone', label: t('forms.phone'), type: 'tel', required: true, emoji: '📞', placeholder: '05X XXX XXXX', attrs: PHONE_ATTRS }),
    field({ name: 'subject', label: t('contact.subject'), type: 'select', emoji: '🏷️', full: true, options: t('contact.subjects') }),
    field({ name: 'message', label: t('contact.message'), type: 'textarea', required: true, full: true, emoji: '💬' }),
  ];
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`;

  return `
${pageHero(ctx, { title: t('contact.title'), lead: t('contact.lead'), pose: 'happy' })}
<section class="section section--tight">
  <div class="container split split--form">
    <div>
      ${waForm(ctx, { title: '💌 ' + t('contact.waTitle'), fields })}
    </div>
    <aside class="reveal">
      <div class="card contact-card">
        <ul class="contact-list contact-list--lg">
          <li>${art.icon('pin')}<span><b>${t('contact.address')}</b>${L(site.address.street)} – ${L(site.address.city)} – ${L(site.address.country)}</span></li>
          <li>${art.icon('phone')}<span><b>${t('contact.phones')}</b>${site.phones.map((p) => `<a href="tel:${p.tel}" dir="ltr">${p.display}</a>`).join('<br>')}</span></li>
          <li>${art.icon('whatsapp')}<span><b>${t('ui.whatsapp')}</b><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener" dir="ltr">+${site.whatsapp}</a></span></li>
          <li>${art.icon('mail')}<span><b>${t('forms.email')}</b><a href="mailto:${site.email}" dir="ltr">${site.email}</a></span></li>
          <li>${art.icon('clock')}<span><b>${t('contact.hours')}</b>${hoursText(ctx)}</span></li>
        </ul>
      </div>
    </aside>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    <h2 class="sr-only">${t('contact.map')}</h2>
    <div class="map reveal">
      <iframe src="${mapSrc}" title="${esc(t('contact.map'))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    </div>
  </div>
</section>`;
}

/* ------------------------------ انضم لفريقنا ------------------------------ */
function renderCareers(ctx) {
  const { t, site } = ctx;
  const fields = [
    field({ name: 'name', label: t('forms.name'), required: true, emoji: '👤', attrs: 'autocomplete="name"' }),
    field({ name: 'phone', label: t('forms.phone'), type: 'tel', required: true, emoji: '📞', placeholder: '05X XXX XXXX', attrs: PHONE_ATTRS }),
    field({ name: 'email', label: t('forms.email'), type: 'email', emoji: '✉️', attrs: 'autocomplete="email" dir="ltr"' }),
    field({ name: 'position', label: t('careers.position'), type: 'select', required: true, emoji: '💼', placeholder: t('forms.choose'), options: t('careers.positions') }),
    field({ name: 'qualification', label: t('careers.qualification'), required: true, emoji: '🎓' }),
    field({ name: 'experience', label: t('careers.experience'), type: 'number', emoji: '⭐', attrs: 'min="0" max="40" inputmode="numeric"' }),
    field({ name: 'visa', label: t('careers.visa'), type: 'select', emoji: '🛂', placeholder: t('forms.choose'), options: t('careers.visas') }),
    field({ name: 'about', label: t('careers.about'), type: 'textarea', full: true, emoji: '📝' }),
  ];
  const perks = t('careers.perks');

  return `
${pageHero(ctx, { title: t('careers.title'), lead: t('careers.lead'), pose: 'wow' })}
<section class="section">
  <div class="container">
    ${secHead(t('careers.why.kicker'), t('careers.why.title'))}
    <div class="grid grid-3">
      ${perks.map((p, i) => infoCard({ emoji: p.emoji, tone: ['pink', 'sky', 'mint'][i % 3], title: p.title, text: p.text })).join('')}
    </div>
  </div>
</section>
<section class="section section--tight">
  <div class="container container--narrow">
    ${secHead('', t('careers.formTitle'), t('careers.formLead'))}
    ${waForm(ctx, { title: '💼 ' + t('careers.waTitle'), fields })}
    <p class="hint center">${t('careers.cv')} <a href="mailto:${site.email}?subject=${encodeURIComponent(t('careers.cvSubject'))}" dir="ltr">${site.email}</a></p>
  </div>
</section>`;
}

module.exports = [
  { slug: 'visit', key: 'visit', priority: '0.9', render: renderVisit },
  { slug: 'contact', key: 'contact', priority: '0.8', render: renderContact },
  { slug: 'careers', key: 'careers', priority: '0.5', render: renderCareers },
];
