/**
 * wizard.js – معالج التسجيل (4 خطوات) ← رسالة واتساب.
 *  1) تاريخ الميلاد ← اقتراح البرنامج تلقائياً
 *  2) نظام الدوام والخدمات الإضافية (الحساب في pricing.js)
 *  3) بيانات الطفل وولي الأمر
 *  4) ملخص بالتكلفة المبدئية + إرسال عبر واتساب
 */
(function () {
  'use strict';
  const form = document.getElementById('wizard');
  const NP = window.NP;
  if (!form || !NP) return;

  const T = window.NP_T;
  const D = window.NP_DATA;
  const P = D.pricing;
  const LB = T.labels;
  const lang = document.documentElement.lang || 'ar';
  const locale = lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-GB';
  const f = form.elements;
  const $ = (sel) => form.querySelector(sel);
  const $$ = (sel, root = form) => Array.from(root.querySelectorAll(sel));
  const money = (n) => `${NP.fmt(n)} ${T.currency}`;

  const panels = $$('[data-step]');
  const tabs = $$('[data-step-tab]');
  const prevBtn = $('[data-prev]');
  const nextBtn = $('[data-next]');
  const errorBox = $('[data-error]');
  const suggestBox = $('[data-suggest]');
  const LAST = panels.length;
  let step = 1;

  /* ---------- العمر ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const today = new Date();
  f.dob.max = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  f.dob.min = `${today.getFullYear() - 7}-01-01`;

  function ageInMonths(iso) {
    const b = new Date(iso + 'T00:00:00');
    if (isNaN(b) || b > today) return null;
    let m = (today.getFullYear() - b.getFullYear()) * 12 + (today.getMonth() - b.getMonth());
    if (today.getDate() < b.getDate()) m--;
    return m;
  }

  /** صيغ الجمع من ملف الترجمة: [مفرد، مثنى، 3–10، 11 فأكثر] */
  const plural = (forms, n) => (n === 1 ? forms[0] : n === 2 ? forms[1] : n <= 10 ? forms[2] : forms[3] || forms[2]).replace('{n}', n);

  function ageText(months) {
    const y = Math.floor(months / 12);
    const m = months % 12;
    const parts = [];
    if (y) parts.push(plural(T.age.years, y));
    if (m || !y) parts.push(plural(T.age.months, m));
    return parts.join(T.age.and);
  }

  function suggestProgram() {
    $$('.choice').forEach((c) => c.classList.remove('is-suggested'));
    suggestBox.classList.remove('is-warn');
    if (!f.dob.value) return (suggestBox.hidden = true);

    const months = ageInMonths(f.dob.value);
    const list = D.programs;
    let text;
    if (months === null) {
      text = T.suggest.invalid;
      suggestBox.classList.add('is-warn');
    } else if (months < list[0].minMonths) {
      text = T.suggest.tooYoung;
      suggestBox.classList.add('is-warn');
      f.program.value = list[0].id;
    } else {
      const last = list[list.length - 1];
      const match = list.find((p) => months >= p.minMonths && months < p.maxMonths) || (months === last.maxMonths ? last : null);
      if (match) {
        f.program.value = match.id;
        const radio = $(`input[name="program"][value="${match.id}"]`);
        radio.closest('.choice').classList.add('is-suggested');
        text = T.suggest.match.replace('{age}', ageText(months)).replace('{program}', `${match.emoji} ${NP.L(match.name)}`);
      } else {
        text = T.suggest.tooOld;
        suggestBox.classList.add('is-warn');
      }
    }
    suggestBox.textContent = text;
    suggestBox.hidden = false;
    refreshPrices();
  }

  /* ---------- الأسعار المعروضة على بطاقات نظام الدوام ---------- */
  function refreshPrices() {
    const fees = P.fees[f.program.value];
    $$('[data-att-price]').forEach((el) => (el.textContent = fees ? NP.fmt(fees[el.dataset.attPrice]) : '–'));
    NP.syncForm(form);
  }

  /* ---------- التنقل بين الخطوات ---------- */
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = !msg;
  }

  function show(n) {
    step = n;
    panels.forEach((p) => (p.hidden = Number(p.dataset.step) !== n));
    tabs.forEach((t) => {
      const i = Number(t.dataset.stepTab);
      t.classList.toggle('is-active', i === n);
      t.classList.toggle('is-done', i < n);
      if (i === n) t.setAttribute('aria-current', 'step');
      else t.removeAttribute('aria-current');
    });
    prevBtn.hidden = n === 1;
    nextBtn.hidden = n === LAST;
    showError('');
    if (n === LAST) buildSummary();
    const heading = panels[n - 1].querySelector('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validate(n) {
    if (n === 1) {
      const months = f.dob.value ? ageInMonths(f.dob.value) : null;
      const ok = months !== null && months <= D.programs[D.programs.length - 1].maxMonths && !!f.program.value;
      f.dob.setAttribute('aria-invalid', String(!f.dob.value || months === null));
      if (!ok) showError(months !== null && months > 48 ? T.suggest.tooOld : T.errors.program);
      return ok;
    }
    if (n === 3) {
      let firstBad = null;
      $$('input, select, textarea', panels[2]).forEach((el) => {
        const bad = !el.checkValidity();
        if (el.type !== 'checkbox') el.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) {
        showError(firstBad.name === 'consent' ? T.errors.consent : T.errors.required);
        firstBad.focus();
        return false;
      }
    }
    return true;
  }

  nextBtn.addEventListener('click', () => validate(step) && show(step + 1));
  prevBtn.addEventListener('click', () => show(step - 1));
  f.dob.addEventListener('change', suggestProgram);
  form.addEventListener('input', (e) => {
    if (e.target.name === 'program') return refreshPrices();
    if (e.target.closest('[data-step="2"]')) NP.syncForm(form);
    if (e.target.hasAttribute('aria-invalid')) e.target.setAttribute('aria-invalid', String(!e.target.checkValidity()));
  });

  /* ---------- جمع البيانات ---------- */
  function collect() {
    const sel = NP.readSelection(form);
    const cost = NP.calc(sel);
    const program = NP.program(sel.program);
    const months = ageInMonths(f.dob.value);
    const dobText = new Date(f.dob.value + 'T12:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let attendance = NP.L(cost.att.name);
    if (!cost.monthly) attendance += ` (${cost.qty} × ${NP.fmt(cost.rate)} ${T.currency} / ${T.units[cost.att.unit]})`;
    const val = (name) => (f[name].value || '').trim();
    return {
      sel, cost, attendance, dobText,
      program: `${program.emoji} ${NP.L(program.name)}`,
      programPlain: NP.L(program.name),
      age: ageText(months),
      child: val('childName'), gender: val('gender'), health: val('health') || LB.none,
      sleep: val('sleep'), toilet: val('toilet'),
      parent: val('parentName'), phone: val('phone'), email: val('email'), area: val('area'), emergency: val('emergency'),
      discountName: cost.discountKeys.map((k) => LB[k]).join(' + '),
      zoneName: cost.zone ? NP.L(cost.zone.name) : '',
    };
  }

  /* ---------- الملخص (الخطوة 4) ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const row = (label, value, cls = '') => (value ? `<div class="${cls}"><dt>${label}</dt><dd>${esc(value)}</dd></div>` : '');

  function buildSummary() {
    const d = collect();
    const c = d.cost;
    $('[data-summary]').innerHTML = `
      <section><h3>👶 ${T.summary.child}</h3><dl>
        ${row(LB.child, d.child)}${row(LB.dob, `${d.dobText} (${d.age})`)}${row(LB.gender, d.gender)}
        ${row(LB.health, d.health)}${row(LB.sleep, d.sleep)}${row(LB.toilet, d.toilet)}
      </dl></section>
      <section><h3>🪐 ${T.summary.plan}</h3><dl>
        ${row(LB.program, d.program)}${row(LB.attendance, d.attendance)}
      </dl></section>
      <section><h3>💰 ${T.summary.cost}</h3><dl>
        ${row(LB.fees, money(c.base))}
        ${c.discount ? row(`${d.discountName} (${c.pct}%)`, '− ' + money(c.discount), 'is-discount') : ''}
        ${c.transport ? row(`${LB.transport} – ${d.zoneName}`, money(c.transport)) : ''}
        ${c.meals ? row(LB.meals, money(c.meals)) : ''}
        ${c.extended ? row(LB.extended, money(c.extended)) : ''}
        ${c.uniform ? row(LB.uniform, money(c.uniform)) : ''}
        ${c.registration ? row(LB.registration, money(c.registration)) : ''}
        ${row(LB.total, money(c.total), 'is-total')}
      </dl></section>
      <section><h3>👨‍👩‍👧 ${T.summary.parent}</h3><dl>
        ${row(LB.parent, d.parent)}${row(LB.phone, d.phone)}${row(LB.emergency, d.emergency)}
        ${row(LB.email, d.email)}${row(LB.area, d.area)}
      </dl></section>`;
  }

  /* ---------- رسالة واتساب ---------- */
  function buildMessage(d, ref) {
    const c = d.cost;
    const SEP = T.sep;
    const lines = [
      `🌟 ${T.wa.title}`,
      SEP,
      `👶 ${LB.child}: ${d.child}`,
      `🎂 ${LB.dob}: ${d.dobText} (${LB.age}: ${d.age})`,
      `🚻 ${LB.gender}: ${d.gender}`,
      `🪐 ${LB.program}: ${d.programPlain}`,
      `⏰ ${LB.attendance}: ${d.attendance}`,
      SEP,
      `💰 ${LB.fees}: ${money(c.base)}`,
      c.discount ? `🎁 ${d.discountName} (${c.pct}%): -${money(c.discount)}` : null,
      `🚌 ${LB.transport}: ${c.transport ? `${money(c.transport)} (${d.zoneName})` : LB.none}`,
      `🍎 ${LB.meals}: ${c.meals ? money(c.meals) : LB.none}`,
      c.extended ? `🌙 ${LB.extended}: ${money(c.extended)}` : null,
      `👕 ${LB.uniform}: ${c.uniform ? money(c.uniform) : LB.none}`,
      c.registration ? `📝 ${LB.registration}: ${money(c.registration)}` : null,
      `💵 ${LB.total}: ${money(c.total)}`,
      SEP,
      `⚠️ ${LB.health}: ${d.health}`,
      d.sleep ? `😴 ${LB.sleep}: ${d.sleep}` : null,
      d.toilet ? `🚼 ${LB.toilet}: ${d.toilet}` : null,
      `👨‍👩‍👧 ${LB.parent}: ${d.parent}`,
      `📞 ${LB.phone}: ${d.phone} | ☎️ ${LB.emergency}: ${d.emergency}`,
      d.email ? `✉️ ${LB.email}: ${d.email}` : null,
      `📍 ${LB.area}: ${d.area}`,
      `🔖 ${LB.ref}: ${ref}`,
    ];
    return lines.filter(Boolean).join('\n');
  }

  /** رقم الطلب: NP-[التاريخ]-[رقم من 3 خانات] */
  const makeRef = () => `NP-${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}-${Math.floor(100 + Math.random() * 900)}`;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (step !== LAST) return void (validate(step) && show(step + 1));
    if (!validate(1)) return show(1);
    if (!validate(3)) return (show(3), validate(3));

    const ref = makeRef();
    const url = `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(buildMessage(collect(), ref))}`;
    window.open(url, '_blank', 'noopener');
    setTimeout(() => (location.href = `${form.dataset.thanks}?ref=${ref}`), 600);
  });

  /* ---------- القيم القادمة من الرابط (من صفحة البرنامج أو الحاسبة) ---------- */
  const q = new URLSearchParams(location.search);
  if (NP.program(q.get('program'))) f.program.value = q.get('program');
  if (q.get('attendance') && P.attendance.some((a) => a.id === q.get('attendance'))) f.attendance.value = q.get('attendance');
  if (q.get('qty')) {
    f.qty.value = parseInt(q.get('qty'), 10) || 1;
    $('[data-qty-wrap]').dataset.keep = '1';
  }
  if (q.get('transport')) f.transport.value = q.get('transport');
  ['meals', 'extended', 'uniform', 'sibling', 'institute'].forEach((k) => {
    if (q.get(k)) f[k].checked = true;
  });

  refreshPrices();
})();
