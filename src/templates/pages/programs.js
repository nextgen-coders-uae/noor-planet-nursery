/**
 * صفحة البرامج + صفحة تفصيلية لكل برنامج (تُولَّد من src/data/programs.json).
 */
const { fmtTime, fmtNum } = require('../helpers');
const art = require('../art');
const { secHead, pageHero, programCard, ctaBand, seats, checkList, demoNote, img } = require('../components');

/* ---------- صفحة كل البرامج ---------- */
function renderList(ctx) {
  const { t, L, href, data } = ctx;
  return `
${pageHero(ctx, { title: t('programs.title'), lead: t('programs.lead'), pose: 'wow' })}

<section class="section">
  <div class="container">
    <div class="grid grid-4">${data.programs.map((p) => programCard(ctx, p)).join('')}</div>
  </div>
</section>

<section class="section section--soft">
  ${art.wave('var(--violet-soft)', { cls: 'wave--top' })}
  <div class="container">
    ${secHead(t('programs.compare.kicker'), t('programs.compare.title'))}
    <div class="table-wrap reveal">
      <table class="table">
        <thead><tr>
          <th scope="col">${t('programs.compare.program')}</th>
          <th scope="col">${t('programs.compare.age')}</th>
          <th scope="col">${t('ui.ratio')}</th>
          <th scope="col">${t('programs.compare.focus')}</th>
          <th scope="col">${t('programs.compare.seats')}</th>
        </tr></thead>
        <tbody>
          ${data.programs
            .map(
              (p) => `<tr>
            <th scope="row"><a href="${href('program-' + p.id)}">${p.emoji} ${L(p.name)}</a></th>
            <td>${L(p.age)}</td>
            <td dir="ltr">${p.ratio}</td>
            <td>${L(p.tagline)}</td>
            <td>${p.seats.available} / ${p.seats.total}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div class="note-card reveal">
      <span class="bubble t-orange" aria-hidden="true">🎓</span>
      <div><h3>${t('programs.bridge.title')}</h3><p>${t('programs.bridge.text')}</p></div>
    </div>
  </div>
  ${art.wave('var(--cream)')}
</section>

${ctaBand(ctx)}`;
}

/* ---------- صفحة برنامج واحد ---------- */
function renderOne(p) {
  return function (ctx) {
    const { t, L, href, data, lang } = ctx;
    const pr = data.pricing;
    const fees = pr.fees[p.id];
    const others = data.programs.filter((x) => x.id !== p.id);

    return `
${pageHero(ctx, { title: `${p.emoji} ${L(p.name)}`, lead: L(p.tagline), parent: 'programs', pose: p.id === 'little-moons' ? 'sleep' : 'happy' })}

<section class="section">
  <div class="container split">
    <div class="reveal">
      <span class="chip chip--lg t-${p.tone}">${L(p.age)}</span>
      <p class="lead">${L(p.summary)}</p>

      <h2 class="h3">${t('programs.goals')}</h2>
      ${checkList(L(p.goals))}

      <h2 class="h3">${t('programs.skills')}</h2>
      <ul class="tag-list t-${p.tone}">${L(p.skills).map((s) => `<li>${s}</li>`).join('')}</ul>
    </div>

    <aside class="program-aside t-${p.tone} reveal">
      ${img(ctx, p.image, L(p.name), { cls: 'program-aside__img' })}
      <dl class="facts">
        <div><dt>👶 ${t('programs.compare.age')}</dt><dd>${L(p.age)}</dd></div>
        <div><dt>👩‍🏫 ${t('ui.ratio')}</dt><dd dir="ltr">${p.ratio}</dd></div>
        ${pr.attendance
          .filter((a) => a.unit === 'month')
          .map(
            (a) =>
              `<div><dt>${a.emoji} ${L(a.name)}</dt><dd><span>${fmtTime(a.hours.from, lang)} – ${fmtTime(a.hours.to, lang)}</span><br><small>${fmtNum(
                fees[a.id]
              )} ${t('ui.currency')} / ${t('ui.unit.month')}</small></dd></div>`
          )
          .join('')}
      </dl>
      ${seats(ctx, p)}
      ${demoNote(ctx, 'ui.demoPrices')}
      <div class="btn-row">
        <a class="btn btn-primary" href="${href('register')}?program=${p.id}">${t('ui.register')}</a>
        <a class="btn btn-ghost" href="${href('fees')}">${t('nav.fees')}</a>
      </div>
    </aside>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    ${secHead('', t('programs.others'))}
    <div class="grid grid-3">${others.map((o) => programCard(ctx, o)).join('')}</div>
  </div>
</section>

${ctaBand(ctx)}`;
  };
}

/** يُرجع تعريفات الصفحات (القائمة + صفحة لكل برنامج). */
module.exports = (data) => [
  { slug: 'programs', key: 'programs', priority: '0.9', render: renderList },
  ...data.programs.map((p) => ({
    slug: 'program-' + p.id,
    key: 'program',
    navKey: 'programs',
    priority: '0.8',
    title: (ctx) => `${ctx.L(p.name)} (${ctx.L(p.age)})`,
    desc: (ctx) => ctx.L(p.summary),
    render: renderOne(p),
  })),
];
