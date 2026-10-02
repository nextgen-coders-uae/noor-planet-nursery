/**
 * صفحة الرسوم والباقات + حاسبة الرسوم السريعة.
 * كل الأرقام تأتي من src/data/pricing.json
 */
const { fmtTime, fmtNum } = require('../helpers');
const art = require('../art');
const { secHead, pageHero, ctaBand, demoNote, infoCard } = require('../components');

/** حاسبة الرسوم (المنطق في assets/js/pricing.js). */
function calculator(ctx) {
  const { t, L, href, data } = ctx;
  const pr = data.pricing;
  return `
<form class="calc card reveal" data-calc novalidate>
  <div class="calc__fields">
    <div class="field">
      <label for="calc-program">${t('fees.calc.program')}</label>
      <select id="calc-program" name="program">
        ${data.programs.map((p) => `<option value="${p.id}">${p.emoji} ${L(p.name)} – ${L(p.age)}</option>`).join('')}
      </select>
    </div>
    <div class="field">
      <label for="calc-attendance">${t('fees.calc.attendance')}</label>
      <select id="calc-attendance" name="attendance">
        ${pr.attendance.map((a) => `<option value="${a.id}">${L(a.name)}</option>`).join('')}
      </select>
    </div>
    <div class="field" data-qty-wrap hidden>
      <label for="calc-qty" data-qty-label>${t('fees.calc.qty')}</label>
      <input id="calc-qty" name="qty" type="number" min="1" value="1" inputmode="numeric">
    </div>
    <div class="field" data-monthly-only>
      <label for="calc-transport">${t('fees.calc.transport')}</label>
      <select id="calc-transport" name="transport">
        <option value="">${t('fees.calc.noTransport')}</option>
        ${pr.extras.transport.map((z) => `<option value="${z.id}">${L(z.name)} (+${fmtNum(z.price)})</option>`).join('')}
      </select>
    </div>
  </div>

  <fieldset class="calc__checks">
    <legend class="sr-only">${t('fees.extras.title')}</legend>
    <label class="check" data-monthly-only><input type="checkbox" name="meals"> 🍎 ${t('fees.extras.meals')} <small>(+${fmtNum(pr.extras.meals.price)})</small></label>
    <label class="check" data-monthly-only><input type="checkbox" name="extended"> 🌙 ${t('fees.extras.extended')} <small>(+${fmtNum(pr.extras.extended.price)})</small></label>
    <label class="check"><input type="checkbox" name="uniform"> 👕 ${t('fees.extras.uniform')} <small>(+${fmtNum(pr.extras.uniform.price)})</small></label>
    <label class="check" data-monthly-only><input type="checkbox" name="sibling"> 👨‍👩‍👧‍👦 ${t('fees.discounts.sibling')} <small>(−${pr.discounts.sibling}%)</small></label>
    <label class="check" data-monthly-only><input type="checkbox" name="institute"> 🎓 ${t('fees.discounts.institute')} <small>(−${pr.discounts.institute}%)</small></label>
  </fieldset>
  <p class="hint" data-monthly-note hidden>${t('fees.calc.monthlyOnly')}</p>

  <div class="calc__result" aria-live="polite">
    <div><small>${t('fees.calc.recurring')}</small><b><span data-out="recurring">0</span> ${t('ui.currency')}</b></div>
    <div><small>${t('fees.calc.oneTime')}</small><b><span data-out="oneTime">0</span> ${t('ui.currency')}</b></div>
    <div class="calc__total"><small>${t('fees.calc.total')}</small><b><span data-out="total">0</span> ${t('ui.currency')}</b></div>
  </div>
  <p class="hint">${t('fees.calc.note')}</p>
  <a class="btn btn-primary" data-calc-register href="${href('register')}">${t('fees.calc.cta')}</a>
</form>`;
}

function render(ctx) {
  const { t, L, href, data, lang } = ctx;
  const pr = data.pricing;
  const cur = t('ui.currency');

  return `
${pageHero(ctx, { title: t('fees.title'), lead: t('fees.lead'), pose: 'wink' })}

<section class="section">
  <div class="container">
    ${demoNote(ctx, 'ui.demoPrices')}
    ${secHead(t('fees.table.kicker'), t('fees.table.title'), t('fees.table.lead'))}
    <div class="table-wrap reveal">
      <table class="table table--fees">
        <thead><tr>
          <th scope="col">${t('programs.compare.program')}</th>
          ${pr.attendance.map((a) => `<th scope="col">${a.emoji} ${L(a.name)}<small>/ ${t('ui.unit.' + a.unit)}</small></th>`).join('')}
        </tr></thead>
        <tbody>
          ${data.programs
            .map(
              (p) => `<tr>
            <th scope="row">${p.emoji} ${L(p.name)}<small>${L(p.age)}</small></th>
            ${pr.attendance.map((a) => `<td><b>${fmtNum(pr.fees[p.id][a.id])}</b> ${cur}</td>`).join('')}
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <p class="hint center">${t('fees.table.regFee', { n: fmtNum(pr.registrationFee) })}</p>

    <div class="grid grid-4 mt">
      ${pr.attendance
        .map(
          (a, i) => `<article class="card info-card t-${['sun', 'sky', 'mint', 'pink'][i]} reveal">
        <span class="bubble" aria-hidden="true">${a.emoji}</span>
        <h3>${L(a.name)}</h3>
        <p>${L(a.desc)}</p>
        <p class="chip"><span>${fmtTime(a.hours.from, lang)} – ${fmtTime(a.hours.to, lang)}</span></p>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section--soft">
  ${art.wave('var(--violet-soft)', { cls: 'wave--top' })}
  <div class="container">
    ${secHead(t('fees.extras.kicker'), t('fees.extras.title'))}
    <div class="grid grid-4">
      <article class="card info-card t-sky reveal">
        <span class="bubble" aria-hidden="true">🚌</span>
        <h3>${t('fees.extras.transport')}</h3>
        <ul class="price-list">
          ${pr.extras.transport.map((z) => `<li><span>${L(z.name)}</span><b>${fmtNum(z.price)} ${cur}</b></li>`).join('')}
        </ul>
        <small>${t('fees.extras.perMonth')}</small>
      </article>
      <article class="card info-card t-orange reveal">
        <span class="bubble" aria-hidden="true">🍎</span>
        <h3>${t('fees.extras.meals')}</h3>
        <p>${t('fees.extras.mealsText')}</p>
        <p class="price"><b>${fmtNum(pr.extras.meals.price)}</b> ${cur} <small>${t('fees.extras.perMonth')}</small></p>
      </article>
      <article class="card info-card t-pink reveal">
        <span class="bubble" aria-hidden="true">👕</span>
        <h3>${t('fees.extras.uniform')}</h3>
        <p>${t('fees.extras.uniformText')}</p>
        <p class="price"><b>${fmtNum(pr.extras.uniform.price)}</b> ${cur} <small>${t('fees.extras.once')}</small></p>
      </article>
      <article class="card info-card t-violet reveal">
        <span class="bubble" aria-hidden="true">🌙</span>
        <h3>${t('fees.extras.extended')}</h3>
        <p>${t('fees.extras.extendedText', { time: `<span>${fmtTime(pr.extras.extended.until, lang)}</span>` })}</p>
        <p class="price"><b>${fmtNum(pr.extras.extended.price)}</b> ${cur} <small>${t('fees.extras.perMonth')}</small></p>
      </article>
    </div>
  </div>
  ${art.wave('var(--cream)')}
</section>

<section class="section">
  <div class="container">
    ${secHead(t('fees.discounts.kicker'), t('fees.discounts.title'))}
    <div class="grid grid-3">
      ${infoCard({ emoji: '👨‍👩‍👧‍👦', tone: 'mint', title: `${t('fees.discounts.sibling')} ${pr.discounts.sibling}%`, text: t('fees.discounts.siblingText') })}
      ${infoCard({ emoji: '🎓', tone: 'sun', title: `${t('fees.discounts.institute')} ${pr.discounts.institute}%`, text: t('fees.discounts.instituteText') })}
      ${infoCard({ emoji: '🗓️', tone: 'sky', title: t('fees.discounts.installments'), text: t('fees.discounts.installmentsText', { n: pr.installments }) })}
    </div>
  </div>
</section>

<section class="section section--tight" id="calculator">
  <div class="container container--narrow">
    ${secHead(t('fees.calc.kicker'), t('fees.calc.title'), t('fees.calc.lead'))}
    ${calculator(ctx)}
  </div>
</section>

${ctaBand(ctx)}`;
}

module.exports = [{ slug: 'fees', key: 'fees', priority: '0.9', scripts: ['js/pricing.js'], render }];
