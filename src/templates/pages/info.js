/**
 * الصفحات التعريفية: من نحن – يوم في كوكب نور – الأنشطة والمنهج – الأمان والرعاية – المرافق – الفريق.
 */
const { fmtTime } = require('../helpers');
const art = require('../art');
const { secHead, pageHero, ctaBand, infoCard, checkList, demoNote, img } = require('../components');

const TONES = ['sky', 'pink', 'mint', 'sun', 'violet', 'orange'];

/** جدول قائمة الوجبات الأسبوعية (يُستخدم في صفحتي الأمان وركن الأهل). */
function menuTable(ctx) {
  const { t, L, data } = ctx;
  const days = t('ui.days');
  return `
<div class="table-wrap reveal">
  <table class="table table--menu">
    <thead><tr>
      <th scope="col">${t('menu.day')}</th>
      <th scope="col">🥣 ${t('menu.breakfast')}</th>
      <th scope="col">🍎 ${t('menu.snack')}</th>
      <th scope="col">🍲 ${t('menu.lunch')}</th>
    </tr></thead>
    <tbody>
      ${data.menu.week
        .map((d) => `<tr><th scope="row">${days[d.day]}</th><td>${L(d.breakfast)}</td><td>${L(d.snack)}</td><td>${L(d.lunch)}</td></tr>`)
        .join('')}
    </tbody>
  </table>
</div>
<p class="hint center">${t('menu.note')}</p>`;
}

/* ------------------------------ من نحن ------------------------------ */
function renderAbout(ctx) {
  const { t, site } = ctx;
  return `
${pageHero(ctx, { title: t('about.title'), lead: t('about.lead') })}

<section class="section">
  <div class="container split">
    <div class="reveal prose">
      <span class="kicker">${t('about.story.kicker')}</span>
      <h2>${t('about.story.title')}</h2>
      ${t('about.story.paras').map((p) => `<p>${p}</p>`).join('')}
    </div>
    <div class="about-art reveal" aria-hidden="true">${art.planet()}${art.rocket('about-art__rocket')}</div>
  </div>
</section>

<section class="section section--soft">
  ${art.wave('var(--violet-soft)', { cls: 'wave--top' })}
  <div class="container">
    <div class="grid grid-2">
      ${infoCard({ emoji: '🔭', tone: 'violet', title: t('about.vision.title'), text: t('about.vision.text') })}
      ${infoCard({ emoji: '💛', tone: 'sun', title: t('about.mission.title'), text: t('about.mission.text') })}
    </div>
    <div class="mt">
      ${secHead('', t('about.values.title'))}
      <div class="grid grid-3">
        ${t('about.values.items').map((v, i) => infoCard({ ...v, tone: TONES[i % 6] })).join('')}
      </div>
    </div>
  </div>
  ${art.wave('var(--cream)')}
</section>

<section class="section">
  <div class="container">
    ${secHead(t('about.philosophy.kicker'), t('about.philosophy.title'), t('about.philosophy.lead'))}
    <div class="grid grid-3">
      ${t('about.philosophy.items').map((v, i) => infoCard({ ...v, tone: TONES[(i + 2) % 6] })).join('')}
    </div>
    <div class="note-card reveal mt">
      <span class="bubble t-orange" aria-hidden="true">🎓</span>
      <div>
        <h3>${t('about.institute.title')}</h3>
        <p>${t('about.institute.text')}</p>
        <a class="link-more" href="${site.institute.url}" target="_blank" rel="noopener">${t('about.institute.cta')} ${art.icon('arrow', { flip: true })}</a>
      </div>
    </div>
  </div>
</section>

${ctaBand(ctx)}`;
}

/* ------------------------------ يوم في كوكب نور ------------------------------ */
function renderDay(ctx) {
  const { t, L, data, lang } = ctx;
  return `
${pageHero(ctx, { title: t('day.title'), lead: t('day.lead'), pose: 'wow' })}

<section class="section">
  <div class="container container--narrow">
    <ol class="journey">
      <li class="journey__start" aria-hidden="true">${art.rocket()}</li>
      ${data.schedule
        .map(
          (s) => `<li class="journey__stop t-${s.tone} reveal">
        <span class="journey__planet" aria-hidden="true">${s.emoji}</span>
        <div class="journey__card">
          <time>${fmtTime(s.time, lang)}</time>
          <h2>${L(s.title)}</h2>
          <p>${L(s.desc)}</p>
        </div>
      </li>`
        )
        .join('')}
    </ol>
    <div class="note-card reveal">
      <span class="bubble t-violet" aria-hidden="true">🌙</span>
      <div><h3>${t('day.noteTitle')}</h3><p>${t('day.note')}</p></div>
    </div>
  </div>
</section>

${ctaBand(ctx)}`;
}

/* ------------------------------ الأنشطة والمنهج ------------------------------ */
function renderActivities(ctx) {
  const { t, L, data } = ctx;
  return `
${pageHero(ctx, { title: t('activities.title'), lead: t('activities.lead') })}

<section class="section">
  ${art.rainbow('deco--tr')}
  <div class="container">
    <div class="grid grid-3">
      ${data.activities.map((a) => infoCard({ emoji: a.emoji, tone: a.tone, title: L(a.title), text: L(a.desc) })).join('')}
    </div>
  </div>
</section>

<section class="section section--soft">
  ${art.wave('var(--violet-soft)', { cls: 'wave--top' })}
  <div class="container container--narrow">
    ${secHead(t('activities.approach.kicker'), t('activities.approach.title'), t('activities.approach.lead'))}
    <div class="card reveal">${checkList(t('activities.approach.items'))}</div>
  </div>
  ${art.wave('var(--cream)')}
</section>

${ctaBand(ctx)}`;
}

/* ------------------------------ الأمان والرعاية ------------------------------ */
function renderSafety(ctx) {
  const { t, L, data } = ctx;
  return `
${pageHero(ctx, { title: t('safety.title'), lead: t('safety.lead'), pose: 'wink' })}

<section class="section">
  <div class="container">
    ${secHead(t('safety.pillars.kicker'), t('safety.pillars.title'))}
    <div class="grid grid-3">
      ${t('safety.pillars.items').map((v, i) => infoCard({ ...v, tone: TONES[i % 6] })).join('')}
    </div>
  </div>
</section>

<section class="section section--soft">
  ${art.wave('var(--violet-soft)', { cls: 'wave--top' })}
  <div class="container">
    ${secHead(t('safety.ratios.kicker'), t('safety.ratios.title'), t('safety.ratios.lead'))}
    <ul class="ratio-list">
      ${data.programs
        .map(
          (p) => `<li class="t-${p.tone} reveal"><span class="bubble" aria-hidden="true">${p.emoji}</span><b dir="ltr">${p.ratio}</b><span>${L(p.name)}</span><small>${L(p.age)}</small></li>`
        )
        .join('')}
    </ul>
  </div>
  ${art.wave('var(--cream)')}
</section>

<section class="section" id="menu">
  <div class="container">
    ${secHead(t('menu.kicker'), t('menu.title'), t('menu.lead'))}
    ${menuTable(ctx)}
    <div class="note-card reveal mt">
      <span class="bubble t-pink" aria-hidden="true">🥜</span>
      <div><h3>${t('safety.allergy.title')}</h3>${checkList(t('safety.allergy.items'))}</div>
    </div>
  </div>
</section>

${ctaBand(ctx)}`;
}

/* ------------------------------ المرافق ------------------------------ */
function renderFacilities(ctx) {
  const { t, L, href, data } = ctx;
  return `
${pageHero(ctx, { title: t('facilities.title'), lead: t('facilities.lead') })}

<section class="section">
  <div class="container">
    <div class="grid grid-3">
      ${data.facilities
        .map(
          (f) => `<article class="card media-card t-${f.tone} reveal">
        ${img(ctx, f.image, L(f.title))}
        <div class="media-card__body"><h2 class="h3">${f.emoji} ${L(f.title)}</h2><p>${L(f.desc)}</p></div>
      </article>`
        )
        .join('')}
    </div>
    <div class="note-card reveal mt">
      <span class="bubble t-sky" aria-hidden="true">🎬</span>
      <div>
        <h3>${t('facilities.tour.title')}</h3>
        <p>${t('facilities.tour.text')}</p>
        <div class="btn-row">
          <a class="btn btn-primary btn-sm" href="${href('visit')}">${t('ui.bookVisit')}</a>
          <a class="btn btn-ghost btn-sm" href="${href('gallery')}">${t('nav.gallery')}</a>
        </div>
      </div>
    </div>
  </div>
</section>

${ctaBand(ctx)}`;
}

/* ------------------------------ الفريق ------------------------------ */
function renderTeam(ctx) {
  const { t, L, href, data } = ctx;
  return `
${pageHero(ctx, { title: t('team.title'), lead: t('team.lead') })}

<section class="section">
  <div class="container">
    ${demoNote(ctx, 'ui.demoTeam')}
    <div class="grid grid-3">
      ${data.team
        .map(
          (m) => `<article class="card team-card t-${m.tone} reveal">
        ${img(ctx, m.image, L(m.role), { w: 400, h: 400 })}
        <h2 class="h3">${L(m.name)}</h2>
        <p class="team-card__role">${L(m.role)}</p>
        <p><small>${L(m.qualification)}</small></p>
      </article>`
        )
        .join('')}
    </div>
    <div class="grid grid-3 mt">
      ${t('team.standards').map((v, i) => infoCard({ ...v, tone: TONES[(i + 3) % 6] })).join('')}
    </div>
    <div class="note-card reveal mt">
      <span class="bubble t-pink" aria-hidden="true">💼</span>
      <div><h3>${t('team.join.title')}</h3><p>${t('team.join.text')}</p>
      <a class="link-more" href="${href('careers')}">${t('nav.careers')} ${art.icon('arrow', { flip: true })}</a></div>
    </div>
  </div>
</section>

${ctaBand(ctx)}`;
}

module.exports = [
  { slug: 'about', key: 'about', priority: '0.8', render: renderAbout },
  { slug: 'day', key: 'day', priority: '0.7', render: renderDay },
  { slug: 'activities', key: 'activities', priority: '0.7', render: renderActivities },
  { slug: 'safety', key: 'safety', priority: '0.8', render: renderSafety },
  { slug: 'facilities', key: 'facilities', priority: '0.6', render: renderFacilities },
  { slug: 'team', key: 'team', priority: '0.6', render: renderTeam },
];
module.exports.menuTable = menuTable;
