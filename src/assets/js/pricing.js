/**
 * pricing.js – منطق حساب الرسوم (مشترك بين حاسبة الرسوم ومعالج التسجيل).
 * يعتمد على window.NP_DATA (يُولَّد من src/data/pricing.json عند البناء).
 *
 * القواعد:
 *  - الدوام الكامل ونصف الدوام: رسوم شهرية. اليومي وبالساعة: السعر × العدد.
 *  - المواصلات والوجبات والدوام الممتد والخصومات متاحة للباقات الشهرية فقط.
 *  - الخصومات تُطبَّق على الرسوم الدراسية فقط، ولا تُجمع إلا إذا كان discounts.combine = true.
 */
(function () {
  'use strict';
  const D = window.NP_DATA;
  if (!D) return;

  const P = D.pricing;
  const T = window.NP_T || {};
  const lang = document.documentElement.lang || 'ar';
  const NP = (window.NP = window.NP || {});

  NP.fmt = (n) => Number(n).toLocaleString('en-US');
  NP.L = (o) => (o && o[lang]) || (o && o.ar) || '';
  NP.attendance = (id) => P.attendance.find((a) => a.id === id) || P.attendance[0];
  NP.program = (id) => D.programs.find((p) => p.id === id);

  /** يحسب التكلفة من اختيارات المستخدم. */
  NP.calc = function (s) {
    const att = NP.attendance(s.attendance);
    const monthly = att.unit === 'month';
    const rate = (P.fees[s.program] || {})[att.id] || 0;
    const qty = monthly ? 1 : Math.max(1, Math.min(att.maxQty || 999, parseInt(s.qty, 10) || 1));
    const base = rate * qty;

    // الخصومات
    let pct = 0;
    let discountKeys = [];
    if (monthly) {
      const chosen = ['sibling', 'institute'].filter((k) => s[k]).map((k) => [k, P.discounts[k]]);
      if (chosen.length) {
        if (P.discounts.combine) {
          pct = chosen.reduce((sum, c) => sum + c[1], 0);
          discountKeys = chosen.map((c) => c[0]);
        } else {
          chosen.sort((a, b) => b[1] - a[1]);
          pct = chosen[0][1];
          discountKeys = [chosen[0][0]];
        }
      }
    }
    const discount = Math.round((base * pct) / 100);

    const zone = monthly ? P.extras.transport.find((z) => z.id === s.transport) : null;
    const transport = zone ? zone.price : 0;
    const meals = monthly && s.meals ? P.extras.meals.price : 0;
    const extended = monthly && s.extended ? P.extras.extended.price : 0;
    const uniform = s.uniform ? P.extras.uniform.price : 0;
    const registration = P.registrationFee || 0;

    const recurring = base - discount + transport + meals + extended;
    const oneTime = uniform + registration;
    return { att, monthly, rate, qty, base, pct, discountKeys, discount, zone, transport, meals, extended, uniform, registration, recurring, oneTime, total: recurring + oneTime };
  };

  /** يقرأ الاختيارات من أي نموذج يحمل الحقول القياسية. */
  NP.readSelection = function (form) {
    const f = form.elements;
    const on = (name) => !!(f[name] && f[name].checked && !f[name].disabled);
    return {
      program: f.program.value,
      attendance: f.attendance.value,
      qty: f.qty ? f.qty.value : 1,
      transport: f.transport && !f.transport.disabled ? f.transport.value : '',
      meals: on('meals'),
      extended: on('extended'),
      uniform: on('uniform'),
      sibling: on('sibling'),
      institute: on('institute'),
    };
  };

  /** يحدّث واجهة النموذج: حقل العدد، تعطيل الخدمات الشهرية، والمخرجات [data-out]. */
  NP.syncForm = function (form) {
    const sel = NP.readSelection(form);
    const att = NP.attendance(sel.attendance);
    const monthly = att.unit === 'month';

    const qtyWrap = form.querySelector('[data-qty-wrap]');
    if (qtyWrap) {
      const input = form.elements.qty;
      if (!monthly && qtyWrap.dataset.unit !== att.unit) {
        // تغيّر نوع الدوام: نضبط القيمة الافتراضية والحد الأقصى
        // (data-keep يضعه معالج التسجيل عند قراءة العدد من الرابط حتى لا نستبدله)
        if (qtyWrap.dataset.keep) delete qtyWrap.dataset.keep;
        else input.value = att.defaultQty || 1;
        input.max = att.maxQty || '';
      }
      qtyWrap.dataset.unit = monthly ? '' : att.unit;
      qtyWrap.hidden = monthly;
      const label = form.querySelector('[data-qty-label]');
      if (label && T.qtyLabel && T.qtyLabel[att.unit]) label.textContent = T.qtyLabel[att.unit];
    }

    form.querySelectorAll('[data-monthly-only]').forEach((wrap) => {
      wrap.querySelectorAll('input, select').forEach((el) => (el.disabled = !monthly));
      if (wrap.matches('fieldset, .field')) wrap.hidden = !monthly;
    });
    const note = form.querySelector('[data-monthly-note]');
    if (note) note.hidden = monthly;

    const result = NP.calc(NP.readSelection(form));
    form.querySelectorAll('[data-out]').forEach((el) => (el.textContent = NP.fmt(result[el.dataset.out])));
    return result;
  };

  /* ---------- حاسبة الرسوم (صفحة الرسوم) ---------- */
  const calc = document.querySelector('form[data-calc]');
  if (calc) {
    const link = calc.querySelector('[data-calc-register]');
    const baseHref = link ? link.getAttribute('href') : '';
    const update = () => {
      NP.syncForm(calc);
      if (!link) return;
      // ننقل الاختيارات إلى معالج التسجيل عبر الرابط
      const s = NP.readSelection(calc);
      const q = new URLSearchParams();
      Object.keys(s).forEach((k) => {
        if (s[k] === true) q.set(k, '1');
        else if (s[k] && s[k] !== false) q.set(k, s[k]);
      });
      link.href = baseHref + '?' + q.toString();
    };
    calc.addEventListener('input', update);
    calc.addEventListener('submit', (e) => e.preventDefault());
    update();
  }
})();
