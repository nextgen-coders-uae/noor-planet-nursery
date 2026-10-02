/**
 * art.js – كل الرسومات الأصلية بصيغة SVG:
 * الشخصية "نور"، الكوكب، الموجات، النجوم المتلألئة، السحب، الصاروخ، قوس قزح، وأيقونات الواجهة.
 * الرسومات تُحقن داخل الصفحة مباشرة (inline) فلا تحتاج طلبات شبكة إضافية.
 */
const { seeded } = require('./helpers');

let uid = 0;
const nextId = (p) => `${p}${++uid}`;

/* ------------------------------------------------------------------ */
/* الشخصية "نور" – نجمة صغيرة مبتسمة                                   */
/* pose: happy | wink | sleep | wow                                    */
/* ------------------------------------------------------------------ */
const STAR_POINTS = '100,20 125.9,64.4 176.1,75.3 141.8,113.6 147,164.7 100,144 53,164.7 58.2,113.6 23.9,75.3 74.1,64.4';

function noor({ pose = 'happy', glow = true, cls = '', title = '' } = {}) {
  const g = nextId('ng');
  const h = nextId('nh');

  const eyes = {
    happy: `<circle cx="82" cy="97" r="9.5" fill="#2B2D6E"/><circle cx="118" cy="97" r="9.5" fill="#2B2D6E"/>
            <circle cx="85" cy="93.5" r="3.2" fill="#fff"/><circle cx="121" cy="93.5" r="3.2" fill="#fff"/>`,
    wink: `<circle cx="82" cy="97" r="9.5" fill="#2B2D6E"/><circle cx="85" cy="93.5" r="3.2" fill="#fff"/>
           <path d="M109 98q9-8 18 0" fill="none" stroke="#2B2D6E" stroke-width="4.5" stroke-linecap="round"/>`,
    sleep: `<path d="M73 98q9 7 18 0M109 98q9 7 18 0" fill="none" stroke="#2B2D6E" stroke-width="4.5" stroke-linecap="round"/>`,
    wow: `<circle cx="82" cy="96" r="10.5" fill="#2B2D6E"/><circle cx="118" cy="96" r="10.5" fill="#2B2D6E"/>
          <circle cx="85.5" cy="92" r="3.6" fill="#fff"/><circle cx="121.5" cy="92" r="3.6" fill="#fff"/>`,
  }[pose];

  const mouth = {
    happy: `<path d="M87 113q13 14 26 0" fill="#fff" stroke="#2B2D6E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    wink: `<path d="M87 113q13 14 26 0" fill="#fff" stroke="#2B2D6E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    sleep: `<path d="M93 116q7 5 14 0" fill="none" stroke="#2B2D6E" stroke-width="4" stroke-linecap="round"/>`,
    wow: `<ellipse cx="100" cy="119" rx="7" ry="8.5" fill="#2B2D6E"/>`,
  }[pose];

  const extra =
    pose === 'sleep'
      ? `<g fill="#9B8AFB" font-family="Baloo Bhaijaan 2, sans-serif" font-weight="800"><text x="150" y="52" font-size="26">z</text><text x="168" y="34" font-size="18">z</text></g>`
      : '';

  return `<svg class="noor ${cls}" viewBox="-20 -20 240 240" xmlns="http://www.w3.org/2000/svg" ${
    title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"'
  }>
  <defs>
    <radialGradient id="${h}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE38A" stop-opacity=".85"/><stop offset="1" stop-color="#FFE38A" stop-opacity="0"/></radialGradient>
    <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFDD6E"/><stop offset="1" stop-color="#FFB81F"/></linearGradient>
  </defs>
  ${glow ? `<circle class="noor__glow" cx="100" cy="100" r="118" fill="url(#${h})"/>` : ''}
  <g class="noor__body">
    <polygon points="${STAR_POINTS}" fill="url(#${g})" stroke="url(#${g})" stroke-width="24" stroke-linejoin="round"/>
    <path d="M62 62q14-16 36-22" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="66" cy="113" rx="9" ry="6" fill="#FF8FAB" opacity=".85"/>
    <ellipse cx="134" cy="113" rx="9" ry="6" fill="#FF8FAB" opacity=".85"/>
    ${eyes}${mouth}${extra}
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* الكوكب المضيء (قسم Hero)                                            */
/* ------------------------------------------------------------------ */
function planet() {
  const p = nextId('pl');
  return `<svg class="planet" viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="${p}h" cx="50%" cy="50%" r="50%"><stop offset=".45" stop-color="#FFC93C" stop-opacity=".5"/><stop offset="1" stop-color="#FFC93C" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}b" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#C9BEFF"/><stop offset=".55" stop-color="#9B8AFB"/><stop offset="1" stop-color="#6C59E0"/></radialGradient>
    <linearGradient id="${p}r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFC93C"/><stop offset=".5" stop-color="#FF9F45"/><stop offset="1" stop-color="#FF8FAB"/></linearGradient>
    <clipPath id="${p}c"><circle cx="260" cy="270" r="165"/></clipPath>
  </defs>
  <circle class="planet__halo" cx="260" cy="270" r="250" fill="url(#${p}h)"/>
  <!-- الحلقة: النصف الخلفي -->
  <g transform="rotate(-16 260 270)"><path d="M15 270A245 58 0 0 1 505 270" fill="none" stroke="url(#${p}r)" stroke-width="16" stroke-linecap="round" opacity=".75"/></g>
  <!-- جسم الكوكب -->
  <circle cx="260" cy="270" r="165" fill="url(#${p}b)"/>
  <g clip-path="url(#${p}c)">
    <path d="M70 250q70-50 150-18t170-22q40-10 70 6v-40H70z" fill="#fff" opacity=".16"/>
    <path d="M80 330q90 40 180 10t190 24v30H80z" fill="#4FC3F7" opacity=".45"/>
    <path d="M90 392q80-30 170-6t180-10v80H90z" fill="#6FD3A8" opacity=".65"/>
    <circle cx="190" cy="205" r="20" fill="#fff" opacity=".2"/>
    <circle cx="335" cy="300" r="13" fill="#fff" opacity=".2"/>
    <circle cx="236" cy="322" r="8" fill="#fff" opacity=".22"/>
  </g>
  <!-- بيت الحضانة الصغير فوق الكوكب -->
  <g transform="translate(222 66)">
    <rect x="8" y="26" width="60" height="42" rx="9" fill="#FFF9EF"/>
    <path d="M0 32L38 2l38 30z" fill="#FF8FAB" stroke="#FF8FAB" stroke-width="8" stroke-linejoin="round"/>
    <rect x="30" y="44" width="16" height="24" rx="8" fill="#FF9F45"/>
    <circle cx="20" cy="42" r="6" fill="#4FC3F7"/><circle cx="56" cy="42" r="6" fill="#4FC3F7"/>
    <path d="M38-4v-26" stroke="#FFF9EF" stroke-width="4" stroke-linecap="round"/>
    <path d="M40-30h24l-7 8 7 8H40z" fill="#FFC93C"/>
  </g>
  <g transform="translate(150 120)"><rect x="9" y="18" width="6" height="18" rx="3" fill="#B26A2C"/><circle cx="12" cy="12" r="15" fill="#6FD3A8"/></g>
  <g transform="translate(332 112)"><rect x="9" y="20" width="6" height="18" rx="3" fill="#B26A2C"/><circle cx="12" cy="13" r="17" fill="#6FD3A8"/></g>
  <!-- الحلقة: النصف الأمامي -->
  <g transform="rotate(-16 260 270)"><path d="M15 270A245 58 0 0 0 505 270" fill="none" stroke="url(#${p}r)" stroke-width="16" stroke-linecap="round"/></g>
  <!-- أقمار صغيرة تدور -->
  <g class="planet__orbit">
    <circle cx="470" cy="150" r="20" fill="#4FC3F7"/><circle cx="463" cy="144" r="5" fill="#fff" opacity=".5"/>
    <circle cx="58" cy="398" r="14" fill="#FF8FAB"/><circle cx="54" cy="394" r="4" fill="#fff" opacity=".5"/>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* فاصل موجي بين الأقسام – fill = لون القسم التالي                      */
/* ------------------------------------------------------------------ */
function wave(fill = 'var(--cream)', { flip = false, cls = '' } = {}) {
  return `<svg class="wave ${flip ? 'wave--flip' : ''} ${cls}" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path fill="${fill}" d="M0 48c120-40 240-40 360-8s240 56 360 40 240-72 360-64 240 48 360 40v34H0z"/></svg>`;
}

/* ------------------------------------------------------------------ */
/* نجوم متلألئة موزّعة عشوائياً (ثابتة بين مرات البناء)                 */
/* ------------------------------------------------------------------ */
function sparkles(n = 14, seed = 7) {
  const rnd = seeded(seed);
  const colors = ['#FFC93C', '#fff', '#FF8FAB', '#4FC3F7', '#6FD3A8'];
  let out = '<div class="sparkles" aria-hidden="true">';
  for (let i = 0; i < n; i++) {
    const size = 8 + Math.round(rnd() * 14);
    out += `<i style="inset-inline-start:${(rnd() * 96).toFixed(1)}%;top:${(rnd() * 88).toFixed(1)}%;--s:${size}px;--d:${(rnd() * 4).toFixed(1)}s;--c:${colors[i % colors.length]}"></i>`;
  }
  return out + '</div>';
}

/* عناصر زخرفية صغيرة */
const cloud = (cls = '') =>
  `<svg class="deco deco-cloud ${cls}" viewBox="0 0 160 80" aria-hidden="true" focusable="false"><path fill="currentColor" d="M36 76a28 28 0 0 1-3-55.8A36 36 0 0 1 101 12a30 30 0 0 1 33 31 17 17 0 0 1-4 33z"/></svg>`;

const rocket = (cls = '') =>
  `<svg class="deco deco-rocket ${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
    <path d="M60 8c22 14 30 40 26 66H34C30 48 38 22 60 8z" fill="#FFF9EF"/>
    <path d="M60 8c11 7 18 17 22 28H38c4-11 11-21 22-28z" fill="#FF8FAB"/>
    <circle cx="60" cy="52" r="11" fill="#4FC3F7" stroke="#2B2D6E" stroke-width="4"/>
    <path d="M34 62 18 84l18-6zM86 62l16 22-18-6z" fill="#9B8AFB"/>
    <path d="M48 76h24l-4 12H52z" fill="#2B2D6E"/>
    <path class="deco-rocket__fire" d="M52 88h16q-2 18-8 26-6-8-8-26z" fill="#FFC93C"/>
  </svg>`;

const rainbow = (cls = '') =>
  `<svg class="deco deco-rainbow ${cls}" viewBox="0 0 200 110" aria-hidden="true" focusable="false" fill="none" stroke-width="13" stroke-linecap="round">
    <path d="M14 100a86 86 0 0 1 172 0" stroke="#FF8FAB"/><path d="M30 100a70 70 0 0 1 140 0" stroke="#FF9F45"/>
    <path d="M46 100a54 54 0 0 1 108 0" stroke="#FFC93C"/><path d="M62 100a38 38 0 0 1 76 0" stroke="#6FD3A8"/>
    <path d="M78 100a22 22 0 0 1 44 0" stroke="#4FC3F7"/>
  </svg>`;

const miniPlanet = (color = '#FF8FAB', cls = '') =>
  `<svg class="deco deco-planet ${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <ellipse cx="50" cy="50" rx="46" ry="12" fill="none" stroke="#FFC93C" stroke-width="5" transform="rotate(-20 50 50)"/>
    <circle cx="50" cy="50" r="27" fill="${color}"/><circle cx="41" cy="42" r="6" fill="#fff" opacity=".35"/>
  </svg>`;

/* ------------------------------------------------------------------ */
/* أيقونات الواجهة (24×24)                                             */
/* ------------------------------------------------------------------ */
const ICONS = {
  whatsapp: `<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/><path fill="var(--icon-in,#fff)" d="M8.6 7.1c.3-.5.5-.6.8-.6h.6c.2 0 .5 0 .7.6l.8 1.9c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4-.1.6.6 1 1.7 2 2.9 2.5.3.1.5.1.7-.1l.8-1c.2-.3.4-.3.7-.2l1.9.9c.3.2.5.3.5.5 0 .5-.2 1.300-.7 1.700-.6.5-1.5.8-2.4.6-1.300-.3-3-1-4.600-2.600-1.400-1.400-2.300-3-2.600-4.100-.2-.9.1-1.600.7-2.200z"/>`,
  phone: `<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6.500 3.500h3l1.500 4-2 1.500a11 11 0 0 0 6 6l1.500-2 4 1.500v3a2 2 0 0 1-2.200 2A17 17 0 0 1 4.500 5.700a2 2 0 0 1 2-2.200z"/>`,
  mail: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 8 8 6 8-6"/></g>`,
  pin: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.200 7-11.500a7 7 0 0 0-14 0C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/></g>`,
  clock: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g>`,
  menu: `<path fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/>`,
  close: `<path fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/>`,
  down: `<path fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/>`,
  arrow: `<path fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/>`,
  check: `<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="m5 12.500 4.500 4.500L19 7.500"/>`,
  globe: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.200 3 14.800 0 18M12 3c-3 3.200-3 14.800 0 18"/></g>`,
  print: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/></g>`,
  download: `<path fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round" d="M12 4v11m0 0-4.500-4.500M12 15l4.500-4.500M5 20h14"/>`,
  calendar: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></g>`,
  play: `<path fill="currentColor" d="M8 5.500v13a1 1 0 0 0 1.500.900l10.500-6.500a1 1 0 0 0 0-1.800L9.500 4.600A1 1 0 0 0 8 5.500z"/>`,
};

/** أيقونة واجهة. flip=true تنقلب تلقائياً في RTL (للأسهم). */
function icon(name, { cls = '', flip = false } = {}) {
  return `<svg class="icon ${flip ? 'icon--flip' : ''} ${cls}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

/* ------------------------------------------------------------------ */
/* صورة مؤقتة (Placeholder) – تُولَّد كملف SVG لكل صورة غير موجودة     */
/* ------------------------------------------------------------------ */
const TONE_HEX = {
  sun: ['#FFF1C9', '#FFC93C'],
  sky: ['#DFF4FE', '#4FC3F7'],
  violet: ['#ECE8FF', '#9B8AFB'],
  pink: ['#FFE4EC', '#FF8FAB'],
  mint: ['#DDF6EA', '#6FD3A8'],
  orange: ['#FFE8D2', '#FF9F45'],
};

function placeholderSvg({ emoji = '🌟', tone = 'sky', w = 800, h = 600, seed = 3 } = {}) {
  const [soft, main] = TONE_HEX[tone] || TONE_HEX.sky;
  const rnd = seeded(seed * 13 + 5);
  let stars = '';
  for (let i = 0; i < 14; i++) {
    const x = Math.round(rnd() * w);
    const y = Math.round(rnd() * h);
    const r = 3 + Math.round(rnd() * 6);
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${soft}"/><stop offset="1" stop-color="${main}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${stars}
  <circle cx="${w / 2}" cy="${h / 2}" r="${Math.round(h * 0.27)}" fill="#fff" opacity=".55"/>
  <path d="M0 ${h * 0.82}c${w * 0.2}-${h * 0.1} ${w * 0.35}-${h * 0.1} ${w * 0.5} 0s${w * 0.3} ${h * 0.1} ${w * 0.5} 0V${h}H0z" fill="#fff" opacity=".5"/>
  <text x="50%" y="50%" font-size="${Math.round(h * 0.3)}" text-anchor="middle" dominant-baseline="central">${emoji}</text>
</svg>`;
}

/** صورة رمزية مؤقتة لعضو الفريق. */
function avatarSvg({ tone = 'pink', seed = 1 } = {}) {
  const [soft, main] = TONE_HEX[tone] || TONE_HEX.pink;
  const hair = ['#3B2A20', '#5A3A28', '#2B2D6E', '#4A3426'][seed % 4];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="${soft}"/>
  <circle cx="60" cy="70" r="8" fill="#fff"/><circle cx="340" cy="110" r="6" fill="#fff"/><circle cx="320" cy="50" r="10" fill="#fff" opacity=".7"/>
  <path d="M70 400c0-90 60-140 130-140s130 50 130 140z" fill="${main}"/>
  <path d="M110 190c0-70 40-110 90-110s90 40 90 110c0 40-10 90-30 110H140c-20-20-30-70-30-110z" fill="${hair}"/>
  <circle cx="200" cy="190" r="68" fill="#F6CDA8"/>
  <path d="M132 180c6-52 40-76 68-76s62 24 68 76c-30-6-50-22-68-46-18 24-38 40-68 46z" fill="${hair}"/>
  <circle cx="176" cy="196" r="7" fill="#2B2D6E"/><circle cx="224" cy="196" r="7" fill="#2B2D6E"/>
  <ellipse cx="160" cy="216" rx="11" ry="7" fill="#FF8FAB" opacity=".6"/><ellipse cx="240" cy="216" rx="11" ry="7" fill="#FF8FAB" opacity=".6"/>
  <path d="M182 222q18 16 36 0" fill="none" stroke="#2B2D6E" stroke-width="5" stroke-linecap="round"/>
</svg>`;
}

module.exports = { noor, planet, wave, sparkles, cloud, rocket, rainbow, miniPlanet, icon, placeholderSvg, avatarSvg, TONE_HEX };
