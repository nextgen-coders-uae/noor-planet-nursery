/**
 * main.js – سلوك عام لكل الصفحات (بدون مكتبات):
 * القائمة الجانبية، قائمة "المزيد"، ظهور الأقسام، العدادات، العداد التنازلي،
 * المعرض و Lightbox، نماذج واتساب العامة، الطباعة.
 */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const T = window.NP_T || {};
  const lang = document.documentElement.lang || 'ar';
  const locale = lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-GB';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  /* ---------- سنة حقوق النشر ---------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- شريط الإعلان (يُغلق لباقي الجلسة) ---------- */
  const announce = $('[data-announce]');
  if (announce) {
    try {
      if (sessionStorage.getItem('np-announce')) announce.hidden = true;
    } catch (e) {}
    $('[data-announce-close]', announce).addEventListener('click', () => {
      announce.hidden = true;
      try {
        sessionStorage.setItem('np-announce', '1');
      } catch (e) {}
    });
  }

  /* ---------- القائمة الجانبية للجوال ---------- */
  const drawer = $('#drawer');
  const burger = $('.burger');
  if (drawer && burger) {
    let lastFocus = null;
    const open = () => {
      lastFocus = document.activeElement;
      drawer.hidden = false;
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      $('[data-drawer-close]', drawer).focus();
    };
    const close = () => {
      drawer.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    burger.addEventListener('click', open);
    $('[data-drawer-close]', drawer).addEventListener('click', close);
    drawer.addEventListener('click', (e) => e.target === drawer && close());
    drawer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab') return;
      // حبس التركيز داخل القائمة
      const items = $$('a, button', drawer);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
    });
  }

  /* ---------- قائمة "المزيد" ---------- */
  const moreBtn = $('.nav__more > button');
  if (moreBtn) {
    const setMore = (v) => moreBtn.setAttribute('aria-expanded', String(v));
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMore(moreBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('click', () => setMore(false));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && setMore(false));
  }

  /* ---------- ظهور الأقسام بنعومة ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- العدادات ---------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver((entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const end = Number(en.target.dataset.count);
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / 1400);
          en.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      })
    );
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- الفعالية القادمة + العداد التنازلي ---------- */
  $$('[data-next-event]').forEach((box) => {
    let list = [];
    try {
      list = JSON.parse(box.dataset.nextEvent);
    } catch (e) {}
    const now = new Date();
    const next = list
      .filter((ev) => new Date(ev.d + 'T23:59:59') >= now)
      .sort((a, b) => a.d.localeCompare(b.d))[0];
    if (!next) return;

    $('[data-ev-emoji]', box).textContent = next.e;
    $('[data-ev-title]', box).textContent = next.t;
    $('[data-ev-date]', box).textContent = next.f;
    box.hidden = false;

    const target = new Date(next.d + 'T08:00:00').getTime();
    const out = { d: $('[data-cd="d"]', box), h: $('[data-cd="h"]', box), m: $('[data-cd="m"]', box), s: $('[data-cd="s"]', box) };
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        $('.countdown', box).textContent = T.countdownToday || '🎉';
        return clearInterval(timer);
      }
      out.d.textContent = Math.floor(diff / 864e5);
      out.h.textContent = Math.floor((diff % 864e5) / 36e5);
      out.m.textContent = Math.floor((diff % 36e5) / 6e4);
      out.s.textContent = Math.floor((diff % 6e4) / 1e3);
    };
    const timer = setInterval(tick, 1000);
    tick();
  });

  /* ---------- تمييز الفعاليات المنتهية ---------- */
  $$('[data-event-date]').forEach((card) => {
    if (new Date(card.dataset.eventDate + 'T23:59:59') < new Date()) {
      card.classList.add('is-past');
      const chip = $('.chip--past', card);
      if (chip) chip.hidden = false;
    }
  });

  /* ---------- الطباعة ---------- */
  $$('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));

  /* ---------- المعرض: التصفية + Lightbox ---------- */
  const gallery = $('[data-gallery]');
  if (gallery) {
    const items = $$('li', gallery);
    $$('[data-filter]').forEach((btn) =>
      btn.addEventListener('click', () => {
        $$('[data-filter]').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
        const cat = btn.dataset.filter;
        items.forEach((li) => (li.hidden = cat !== 'all' && li.dataset.cat !== cat));
      })
    );

    const dialog = $('[data-lightbox-dialog]');
    if (dialog && dialog.showModal) {
      const big = $('img', dialog);
      const cap = $('figcaption', dialog);
      let current = 0;
      const visible = () => items.filter((li) => !li.hidden).map((li) => $('img', li));
      const show = (i) => {
        const list = visible();
        current = (i + list.length) % list.length;
        big.src = list[current].currentSrc || list[current].src;
        big.alt = list[current].alt;
        cap.textContent = list[current].alt;
      };
      gallery.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-lightbox]');
        if (!btn) return;
        show(visible().indexOf($('img', btn)));
        dialog.showModal();
      });
      $('[data-lb-close]', dialog).addEventListener('click', () => dialog.close());
      $('[data-lb-prev]', dialog).addEventListener('click', () => show(current - 1));
      $('[data-lb-next]', dialog).addEventListener('click', () => show(current + 1));
      dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
      dialog.addEventListener('keydown', (e) => {
        const fwd = document.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
        const back = document.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        if (e.key === fwd) show(current + 1);
        if (e.key === back) show(current - 1);
      });
    }
  }

  /* ---------- نماذج واتساب العامة (زيارة / تواصل / وظائف) ----------
     كل حقل يحمل data-label (و data-emoji اختياري) يتحول إلى سطر في الرسالة. */
  $$('form[data-wa-form]').forEach((form) => {
    const dateInput = $('[data-workday]', form);
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = isoDate(tomorrow);
      dateInput.addEventListener('input', () => dateInput.setCustomValidity(''));
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.classList.add('was-validated');

      // الزيارة في أيام العمل فقط
      if (dateInput && dateInput.value) {
        const day = new Date(dateInput.value + 'T12:00:00').getDay();
        const ok = form.dataset.workdays.split(',').map(Number).includes(day);
        dateInput.setCustomValidity(ok ? '' : form.dataset.workdayMsg);
      }
      if (!form.checkValidity()) return form.reportValidity();

      const lines = [form.dataset.waTitle, T.sep || '━━━━━━━━━━━━━━'];
      $$('[data-label]', form).forEach((el) => {
        let value = el.value.trim();
        if (!value) return;
        if (el.type === 'date') {
          value = new Date(value + 'T12:00:00').toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
        lines.push(`${el.dataset.emoji || '•'} ${el.dataset.label}: ${value}`);
      });

      window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');

      const done = form.parentElement.querySelector('[data-wa-done]');
      if (done) {
        done.hidden = false;
        done.focus();
      }
    });
  });

  /* ---------- صفحة الشكر: عرض رقم الطلب ---------- */
  const refEl = $('[data-ref]');
  if (refEl) {
    const ref = new URLSearchParams(location.search).get('ref') || '';
    if (/^NP-\d{8}-\d{3}$/.test(ref)) {
      refEl.textContent = ref;
      $('[data-ref-wrap]').hidden = false;
    }
  }
})();
