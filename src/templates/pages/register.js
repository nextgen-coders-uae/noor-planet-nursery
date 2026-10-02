/**
 * التسجيل: معالج من 4 خطوات يرسل الطلب عبر واتساب + صفحة الشكر + نموذج التسجيل الورقي (للطباعة / PDF).
 * منطق المعالج في assets/js/wizard.js والحساب في assets/js/pricing.js
 */
const { fmtNum, fmtTime } = require('../helpers');
const art = require('../art');
const { pageHero, field, seats, demoNote, checkList } = require('../components');

/* ------------------------------ المعالج ------------------------------ */
function renderWizard(ctx) {
  const { t, L, href, data, lang } = ctx;
  const pr = data.pricing;
  const steps = t('register.steps');

  return `
${pageHero(ctx, { title: t('register.title'), lead: t('register.lead'), pose: 'happy' })}

<section class="section section--tight">
  <div class="container container--narrow">
    <form class="wizard card" id="wizard" novalidate data-thanks="${href('thank-you')}">
      <ol class="wizard__steps" aria-label="${t('register.stepsLabel')}">
        ${steps.map((s, i) => `<li data-step-tab="${i + 1}"${i === 0 ? ' class="is-active" aria-current="step"' : ''}><span>${i + 1}</span><b>${s}</b></li>`).join('')}
      </ol>

      <!-- الخطوة 1: العمر والبرنامج -->
      <section class="wizard__panel" data-step="1">
        <h2>${t('register.s1.title')}</h2>
        <div class="form-grid">
          ${field({ name: 'dob', label: t('register.child.dob'), type: 'date', required: true, hint: t('register.s1.dobHint') })}
        </div>
        <p class="suggest" data-suggest aria-live="polite" hidden></p>
        <fieldset class="choice-grid">
          <legend>${t('register.s1.choose')}</legend>
          ${data.programs
            .map(
              (p) => `<label class="choice t-${p.tone}">
            <input type="radio" name="program" value="${p.id}" required>
            <span class="choice__body">
              <span class="bubble" aria-hidden="true">${p.emoji}</span>
              <b>${L(p.name)}</b>
              <small>${L(p.age)}</small>
              ${seats(ctx, p)}
            </span>
          </label>`
            )
            .join('')}
        </fieldset>
      </section>

      <!-- الخطوة 2: نظام الدوام والخدمات -->
      <section class="wizard__panel" data-step="2" hidden>
        <h2>${t('register.s2.title')}</h2>
        ${demoNote(ctx, 'ui.demoPrices')}
        <fieldset class="choice-grid choice-grid--2">
          <legend>${t('fees.calc.attendance')}</legend>
          ${pr.attendance
            .map(
              (a, i) => `<label class="choice t-${['sun', 'sky', 'mint', 'pink'][i]}">
            <input type="radio" name="attendance" value="${a.id}"${i === 0 ? ' checked' : ''}>
            <span class="choice__body">
              <span class="bubble" aria-hidden="true">${a.emoji}</span>
              <b>${L(a.name)}</b>
              <small><span>${fmtTime(a.hours.from, lang)} – ${fmtTime(a.hours.to, lang)}</span></small>
              <small class="choice__price"><span data-att-price="${a.id}">–</span> ${t('ui.currency')} / ${t('ui.unit.' + a.unit)}</small>
            </span>
          </label>`
            )
            .join('')}
        </fieldset>

        <div class="form-grid">
          <div class="field" data-qty-wrap hidden>
            <label for="f-qty" data-qty-label>${t('fees.calc.qty')}</label>
            <input id="f-qty" name="qty" type="number" min="1" value="1" inputmode="numeric">
          </div>
          <div class="field" data-monthly-only>
            <label for="f-transport">🚌 ${t('fees.calc.transport')}</label>
            <select id="f-transport" name="transport">
              <option value="">${t('fees.calc.noTransport')}</option>
              ${pr.extras.transport.map((z) => `<option value="${z.id}">${L(z.name)} (+${fmtNum(z.price)})</option>`).join('')}
            </select>
          </div>
        </div>

        <fieldset class="calc__checks">
          <legend>${t('fees.extras.title')}</legend>
          <label class="check" data-monthly-only><input type="checkbox" name="meals"> 🍎 ${t('fees.extras.meals')} <small>(+${fmtNum(pr.extras.meals.price)})</small></label>
          <label class="check" data-monthly-only><input type="checkbox" name="extended"> 🌙 ${t('fees.extras.extended')} <small>(+${fmtNum(pr.extras.extended.price)})</small></label>
          <label class="check"><input type="checkbox" name="uniform"> 👕 ${t('fees.extras.uniform')} <small>(+${fmtNum(pr.extras.uniform.price)})</small></label>
        </fieldset>
        <fieldset class="calc__checks" data-monthly-only>
          <legend>${t('fees.discounts.title')}</legend>
          <label class="check"><input type="checkbox" name="sibling"> 👨‍👩‍👧‍👦 ${t('fees.discounts.sibling')} <small>(−${pr.discounts.sibling}%)</small></label>
          <label class="check"><input type="checkbox" name="institute"> 🎓 ${t('fees.discounts.institute')} <small>(−${pr.discounts.institute}%)</small></label>
        </fieldset>
        <p class="hint" data-monthly-note hidden>${t('fees.calc.monthlyOnly')}</p>

        <p class="wizard__live" aria-live="polite">${t('fees.calc.total')}: <b><span data-out="total">0</span> ${t('ui.currency')}</b></p>
      </section>

      <!-- الخطوة 3: بيانات الطفل وولي الأمر -->
      <section class="wizard__panel" data-step="3" hidden>
        <h2>${t('register.s3.child')}</h2>
        <div class="form-grid">
          ${field({ name: 'childName', label: t('register.child.name'), required: true, attrs: 'autocomplete="off"' })}
          ${field({ name: 'gender', label: t('register.child.gender'), type: 'select', required: true, placeholder: t('forms.choose'), options: t('register.child.genders') })}
          ${field({ name: 'sleep', label: t('register.child.sleep'), placeholder: t('register.child.sleepPh') })}
          ${field({ name: 'toilet', label: t('register.child.toilet'), type: 'select', placeholder: t('forms.choose'), options: t('register.child.toilets') })}
          ${field({ name: 'health', label: t('register.child.health'), type: 'textarea', full: true, placeholder: t('register.child.healthPh') })}
        </div>

        <h2>${t('register.s3.parent')}</h2>
        <div class="form-grid">
          ${field({ name: 'parentName', label: t('forms.parentName'), required: true, attrs: 'autocomplete="name"' })}
          ${field({ name: 'phone', label: t('forms.phone'), type: 'tel', required: true, placeholder: '05X XXX XXXX', attrs: 'autocomplete="tel" inputmode="tel" dir="ltr" pattern="[0-9+ \\-]{7,}"' })}
          ${field({ name: 'email', label: t('forms.email'), type: 'email', attrs: 'autocomplete="email" dir="ltr"' })}
          ${field({ name: 'area', label: t('forms.area'), required: true, placeholder: t('forms.areaPh') })}
          ${field({ name: 'emergency', label: t('register.parent.emergency'), type: 'tel', required: true, placeholder: '05X XXX XXXX', attrs: 'inputmode="tel" dir="ltr" pattern="[0-9+ \\-]{7,}"', hint: t('register.parent.emergencyHint') })}
        </div>
        <label class="check check--consent"><input type="checkbox" name="consent" required> <span>${t('register.consent', { link: `<a href="${href('privacy')}" target="_blank" rel="noopener">${t('nav.privacy')}</a>` })}</span></label>
      </section>

      <!-- الخطوة 4: الملخص والإرسال -->
      <section class="wizard__panel" data-step="4" hidden>
        <h2>${t('register.s4.title')}</h2>
        <div class="summary" data-summary></div>
        <p class="hint">${t('fees.calc.note')}</p>
        <div class="btn-row">
          <button class="btn btn-wa btn-lg" type="submit">${art.icon('whatsapp')} ${t('forms.sendWa')}</button>
          <a class="btn btn-ghost" href="${ctx.pdfForm.href}"${ctx.pdfForm.download ? ' download' : ' target="_blank"'}>${art.icon('download')} ${t('register.pdf')}</a>
        </div>
      </section>

      <div class="wizard__nav">
        <button class="btn btn-ghost" type="button" data-prev hidden>${art.icon('arrow', { flip: true, cls: 'icon--back' })} ${t('forms.back')}</button>
        <button class="btn btn-primary" type="button" data-next>${t('forms.next')} ${art.icon('arrow', { flip: true })}</button>
      </div>
      <p class="form-error" data-error role="alert" hidden></p>
    </form>

    <div class="note-card reveal">
      <span class="bubble t-sky" aria-hidden="true">📄</span>
      <div><h3>${t('register.docs.title')}</h3>${checkList(t('register.docs.items'))}</div>
    </div>
  </div>
</section>`;
}

/* ------------------------------ صفحة الشكر ------------------------------ */
function renderThanks(ctx) {
  const { t, href, site } = ctx;
  return `
<section class="section thanks">
  ${art.sparkles(18, 31)}
  <div class="container container--narrow center">
    <div class="thanks__noor">${art.noor({ pose: 'wow' })}</div>
    <h1>${t('thanks.title')}</h1>
    <p class="lead">${t('thanks.lead')}</p>
    <p class="thanks__ref" data-ref-wrap hidden>${t('thanks.ref')}: <b data-ref dir="ltr"></b></p>

    <div class="note-card note-card--start">
      <span class="bubble t-sun" aria-hidden="true">📄</span>
      <div><h2 class="h3">${t('register.docs.title')}</h2>${checkList(t('register.docs.items'))}</div>
    </div>

    <ol class="steps-list">
      ${t('thanks.next').map((s) => `<li>${s}</li>`).join('')}
    </ol>

    <div class="btn-row btn-row--center">
      <a class="btn btn-wa" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener">${art.icon('whatsapp')} ${t('thanks.openWa')}</a>
      <a class="btn btn-ghost" href="${ctx.pdfForm.href}"${ctx.pdfForm.download ? ' download' : ' target="_blank"'}>${art.icon('download')} ${t('register.pdf')}</a>
      <a class="btn btn-primary" href="${href('index')}">🪐 ${t('ui.backHome')}</a>
    </div>
  </div>
</section>`;
}

/* ------------------- نموذج التسجيل الورقي (طباعة / PDF) ------------------- */
function renderPrintForm(ctx) {
  const { t, L, data, site } = ctx;
  const line = (label, wide) => `<div class="pf-line${wide ? ' pf-line--wide' : ''}"><span>${label}</span><i></i></div>`;
  const box = (label) => `<span class="pf-box"><i></i>${label}</span>`;
  const pr = data.pricing;

  return `
<section class="section section--tight print-page">
  <div class="container container--narrow">
    <div class="btn-row no-print">
      <button class="btn btn-primary" type="button" data-print>${art.icon('print')} ${t('printForm.print')}</button>
      <p class="hint">${t('printForm.hint')}</p>
    </div>

    <article class="paper">
      <header class="paper__head">
        ${art.noor({ glow: false })}
        <div>
          <h1>${t('printForm.title')}</h1>
          <p>${t('brand.full')} – ${t('brand.instituteLine')}</p>
        </div>
        <div class="paper__photo">${t('printForm.photo')}</div>
      </header>

      <h2>${t('register.s3.child')}</h2>
      <div class="pf-grid">
        ${line(t('register.child.name'), true)}
        ${line(t('register.child.dob'))}
        ${line(t('register.child.gender'))}
        ${line(t('printForm.nationality'))}
        ${line(t('printForm.startDate'))}
      </div>

      <h2>${t('printForm.program')}</h2>
      <p class="pf-boxes">${data.programs.map((p) => box(`${L(p.name)} (${L(p.age)})`)).join('')}</p>
      <h2>${t('fees.calc.attendance')}</h2>
      <p class="pf-boxes">${pr.attendance.map((a) => box(L(a.name))).join('')}</p>
      <h2>${t('fees.extras.title')}</h2>
      <p class="pf-boxes">${[
        ...pr.extras.transport.map((z) => `${t('fees.extras.transport')} – ${L(z.name)}`),
        t('fees.extras.meals'),
        t('fees.extras.uniform'),
        t('fees.extras.extended'),
      ]
        .map(box)
        .join('')}</p>

      <h2>${t('printForm.health')}</h2>
      <div class="pf-grid">
        ${line(t('register.child.health'), true)}
        ${line(t('register.child.sleep'))}
        ${line(t('register.child.toilet'))}
      </div>

      <h2>${t('register.s3.parent')}</h2>
      <div class="pf-grid">
        ${line(t('printForm.father'))}
        ${line(t('forms.phone'))}
        ${line(t('printForm.mother'))}
        ${line(t('forms.phone'))}
        ${line(t('forms.email'))}
        ${line(t('forms.area'))}
        ${line(t('register.parent.emergency'), true)}
        ${line(t('printForm.pickup'), true)}
      </div>

      <h2>${t('register.docs.title')}</h2>
      <p class="pf-boxes">${t('register.docs.items').map(box).join('')}</p>

      <p class="pf-declare">${t('printForm.declare')}</p>
      <div class="pf-grid">
        ${line(t('printForm.signature'))}
        ${line(t('printForm.date'))}
      </div>

      <footer class="paper__foot">
        ${L(site.address.street)} – ${L(site.address.city)} · <span dir="ltr">${site.phones.map((p) => p.display).join(' | ')}</span> · <span dir="ltr">${site.email}</span>
      </footer>
    </article>
  </div>
</section>`;
}

module.exports = [
  { slug: 'register', key: 'register', priority: '0.9', scripts: ['js/pricing.js', 'js/wizard.js'], render: renderWizard },
  { slug: 'thank-you', key: 'thanks', navKey: 'register', noindex: true, render: renderThanks },
  { slug: 'registration-form', key: 'printForm', navKey: 'register', noindex: true, render: renderPrintForm },
];
