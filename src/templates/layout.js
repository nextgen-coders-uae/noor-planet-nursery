/**
 * layout.js – الهيكل العام لكل صفحة:
 * <head> (SEO + Open Graph + hreflang + Schema.org) ثم شريط الإعلان، الترويسة، المحتوى، التذييل،
 * والأزرار العائمة (واتساب على شكل "نور" + اتصال مباشر).
 */
const { esc, fmtTime } = require('./helpers');
const art = require('./art');
const { hoursText } = require('./components');

/* ترتيب روابط القائمة */
const NAV_MAIN = ['index', 'about', 'programs', 'day', 'fees', 'parents', 'contact'];
const NAV_MORE = ['activities', 'safety', 'facilities', 'team', 'gallery', 'events', 'faq', 'careers'];

const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Schema.org: ChildCare + LocalBusiness (يُضاف لكل الصفحات). */
function orgSchema(ctx) {
  const { site, t, L, lang } = ctx;
  return {
    '@context': 'https://schema.org',
    '@type': ['ChildCare', 'LocalBusiness'],
    '@id': site.baseUrl + '/#nursery',
    name: t('brand.full'),
    alternateName: ['حضانة كوكب نور', 'Noor Planet Nursery'],
    description: t('meta.index.desc'),
    url: `${site.baseUrl}/${lang}/`,
    image: `${site.baseUrl}/assets/img/${ctx.ogImage}`,
    logo: `${site.baseUrl}/assets/img/favicon.svg`,
    telephone: site.phones[0].tel,
    email: site.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: L(site.address.street),
      addressLocality: L(site.address.city),
      addressCountry: 'AE',
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: site.hours.days.map((d) => SCHEMA_DAYS[d]),
        opens: site.hours.open,
        closes: site.hours.close,
      },
    ],
    areaServed: ['Ajman', 'Sharjah', 'Dubai'],
    availableLanguage: ['Arabic', 'English'],
    parentOrganization: { '@type': 'EducationalOrganization', name: t('brand.institute'), url: site.institute.url },
    sameAs: Object.values(site.social).filter(Boolean),
  };
}

/** أكواد التحليلات – تُفعَّل تلقائياً عند وضع المعرّفات في site.config.json */
function analytics(site) {
  const { gaId, metaPixelId } = site.analytics;
  let out = '';
  out += gaId
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');</script>`
    : `<!-- Google Analytics: ضع المعرّف في analytics.gaId داخل src/site.config.json -->`;
  out += '\n';
  out += metaPixelId
    ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');</script>`
    : `<!-- Meta Pixel: ضع المعرّف في analytics.metaPixelId داخل src/site.config.json -->`;
  return out;
}

function head(ctx, page) {
  const { site, t, lang, other, asset } = ctx;
  // الرئيسية تحمل عنواناً كاملاً خاصاً بها، وباقي الصفحات: "عنوان الصفحة | اسم الحضانة"
  const title = page.slug === 'index' ? page.title : `${page.title} | ${t('brand.name')}`;
  const desc = page.desc || t('meta.index.desc');
  const path = page.slug === 'index' ? '' : page.slug + '.html';
  const canonical = `${site.baseUrl}/${lang}/${path}`;
  const schemas = [orgSchema(ctx), ...(page.schema ? page.schema(ctx) : [])];

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="keywords" content="${esc(t('meta.keywords'))}">
${page.noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${other}" href="${site.baseUrl}/${other}/${path}">
<link rel="alternate" hreflang="x-default" href="${site.baseUrl}/${site.defaultLang}/${path}">
<meta name="theme-color" content="#2B2D6E">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(t('brand.full'))}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.baseUrl}/assets/img/${ctx.ogImage}">
<meta property="og:locale" content="${lang === 'ar' ? 'ar_AE' : 'en_AE'}">
<meta property="og:locale:alternate" content="${lang === 'ar' ? 'en_AE' : 'ar_AE'}">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="${asset('img/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@500;700;800&family=${
    lang === 'ar' ? 'Tajawal:wght@400;500;700' : 'Nunito:wght@400;600;700'
  }&display=swap">
<link rel="stylesheet" href="${asset('css/main.css')}?v=${ctx.version}">
<script>document.documentElement.classList.add('js');try{localStorage.setItem('np-lang','${lang}')}catch(e){}</script>
${schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
${analytics(site)}`;
}

function header(ctx, page) {
  const { t, href, other, site } = ctx;
  const active = page.navKey || page.slug;
  const link = (key) =>
    `<li><a href="${href(key)}"${key === active ? ' aria-current="page"' : ''}>${t('nav.' + key)}</a></li>`;
  const otherHref = ctx.langHref(other, page.slug);

  const announce = site.announcement.show
    ? `<div class="announce" data-announce>
  <p>📣 ${t('ui.announce')} <a href="${href('register')}">${t('ui.announceCta')}</a></p>
  <button type="button" data-announce-close aria-label="${t('ui.close')}">${art.icon('close')}</button>
</div>`
    : '';

  return `<a class="skip-link" href="#main">${t('ui.skip')}</a>
${announce}
<header class="site-header">
  <div class="container site-header__bar">
    <a class="logo" href="${href('index')}" aria-label="${esc(t('brand.full'))}">
      ${art.noor({ glow: false, cls: 'logo__mark' })}
      <span class="logo__text"><b>${t('brand.short')}</b><small>${t('brand.sub')}</small></span>
    </a>

    <nav class="nav" aria-label="${t('ui.mainNav')}">
      <ul>
        ${NAV_MAIN.map(link).join('')}
        <li class="nav__more">
          <button type="button" aria-expanded="false" aria-controls="more-menu">${t('ui.more')} ${art.icon('down')}</button>
          <ul id="more-menu">${NAV_MORE.map(link).join('')}</ul>
        </li>
      </ul>
    </nav>

    <div class="site-header__actions">
      <a class="lang-switch" href="${otherHref}" lang="${other}" hreflang="${other}" data-lang-switch="${other}">${art.icon('globe')}<span>${t('ui.otherLang')}</span></a>
      <a class="btn btn-primary btn-sm site-header__cta" href="${href('register')}">${t('ui.register')}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="drawer" aria-label="${t('ui.menu')}">${art.icon('menu')}</button>
    </div>
  </div>
</header>

<div class="drawer" id="drawer" hidden>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="${t('ui.menu')}">
    <div class="drawer__head">
      <span class="logo">${art.noor({ glow: false, cls: 'logo__mark' })}<span class="logo__text"><b>${t('brand.short')}</b></span></span>
      <button type="button" data-drawer-close aria-label="${t('ui.close')}">${art.icon('close')}</button>
    </div>
    <ul class="drawer__links">${[...NAV_MAIN, ...NAV_MORE].map(link).join('')}</ul>
    <div class="drawer__cta">
      <a class="btn btn-primary" href="${href('register')}">${t('ui.register')}</a>
      <a class="btn btn-ghost" href="${href('visit')}">${t('ui.bookVisit')}</a>
      <a class="lang-switch" href="${otherHref}" lang="${other}" hreflang="${other}" data-lang-switch="${other}">${art.icon('globe')}<span>${t('ui.otherLang')}</span></a>
    </div>
  </div>
</div>`;
}

function footer(ctx) {
  const { t, L, href, site, data } = ctx;
  const fl = (key) => `<li><a href="${href(key)}">${t('nav.' + key)}</a></li>`;
  const socials = Object.entries(site.social)
    .filter(([, url]) => url)
    .map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener">${name}</a>`)
    .join('');

  return `<footer class="site-footer">
  ${art.wave('var(--night)', { cls: 'wave--top' })}
  ${art.sparkles(18, 99)}
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <a class="logo logo--light" href="${href('index')}">
        ${art.noor({ glow: false, cls: 'logo__mark' })}
        <span class="logo__text"><b>${t('brand.short')}</b><small>${t('brand.sub')}</small></span>
      </a>
      <p>${t('footer.about')}</p>
      <p class="site-footer__aff">${t('footer.affiliated')} <a href="${site.institute.url}" target="_blank" rel="noopener">${t('brand.institute')}</a></p>
      ${socials ? `<div class="site-footer__social">${socials}</div>` : ''}
    </div>

    <nav aria-label="${t('footer.links')}">
      <h2>${t('footer.links')}</h2>
      <ul>${['about', 'safety', 'fees', 'parents', 'gallery', 'events', 'faq', 'careers'].map(fl).join('')}</ul>
    </nav>

    <nav aria-label="${t('nav.programs')}">
      <h2>${t('nav.programs')}</h2>
      <ul>
        ${data.programs.map((p) => `<li><a href="${href('program-' + p.id)}">${p.emoji} ${L(p.name)}</a></li>`).join('')}
        ${fl('day')}${fl('activities')}
      </ul>
    </nav>

    <div>
      <h2>${t('nav.contact')}</h2>
      <ul class="contact-list">
        <li>${art.icon('pin')}<span>${L(site.address.street)} – ${L(site.address.city)} – ${L(site.address.country)}</span></li>
        <li>${art.icon('phone')}<span>${site.phones.map((p) => `<a href="tel:${p.tel}" dir="ltr">${p.display}</a>`).join(' · ')}</span></li>
        <li>${art.icon('mail')}<a href="mailto:${site.email}" dir="ltr">${site.email}</a></li>
        <li>${art.icon('clock')}<span>${hoursText(ctx)}</span></li>
      </ul>
    </div>
  </div>

  <div class="container site-footer__bottom">
    <p>© <span data-year>2026</span> ${t('brand.full')} – ${t('footer.rights')}</p>
    <p><a href="${href('privacy')}">${t('nav.privacy')}</a> · <a href="${href('terms')}">${t('nav.terms')}</a></p>
  </div>
</footer>

<!-- أزرار عائمة: واتساب (على شكل نور) + اتصال مباشر -->
<div class="floaters">
  <a class="floater floater--call" href="tel:${site.phones[0].tel}" aria-label="${esc(t('ui.call'))}">${art.icon('phone')}</a>
  <a class="floater floater--wa" href="https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t('ui.waHello'))}" target="_blank" rel="noopener" aria-label="${esc(t('ui.whatsapp'))}">
    ${art.noor({ glow: false })}
    <span class="floater__badge">${art.icon('whatsapp')}</span>
    <span class="floater__tip">${t('ui.waTip')}</span>
  </a>
</div>`;
}

/** يجمع الصفحة كاملة. */
function layout(ctx, page, body) {
  const { lang, dir, asset } = ctx;
  const scripts = ['js/main.js', ...(page.scripts || [])];
  const needsData = page.scripts && page.scripts.length;
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
${head(ctx, page)}
</head>
<body class="page-${page.key || page.slug}">
${header(ctx, page)}
<main id="main">
${body}
</main>
${footer(ctx)}
<script src="${asset(`js/i18n.${lang}.js`)}?v=${ctx.version}" defer></script>
${needsData ? `<script src="${asset('js/np-data.js')}?v=${ctx.version}" defer></script>` : ''}
${scripts.map((s) => `<script src="${asset(s)}?v=${ctx.version}" defer></script>`).join('\n')}
</body>
</html>`;
}

module.exports = { layout, head, NAV_MAIN, NAV_MORE, fmtTime };
