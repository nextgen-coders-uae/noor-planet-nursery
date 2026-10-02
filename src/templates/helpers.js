/**
 * helpers.js – دوال مساعدة صغيرة تُستخدم في كل القوالب.
 */

/** تهريب النص لاستخدامه داخل HTML أو داخل خصائص الوسوم. */
const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** "07:30" → "7:30 ص" / "7:30 AM" */
function fmtTime(hhmm, lang) {
  const [h, m] = hhmm.split(':').map(Number);
  const pm = h >= 12;
  const suffix = lang === 'ar' ? (pm ? 'م' : 'ص') : pm ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** "2026-12-02" → "2 ديسمبر 2026" / "2 December 2026" */
function fmtDate(iso, lang, opts = { day: 'numeric', month: 'long', year: 'numeric' }) {
  const locale = lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'UTC' }).format(new Date(iso + 'T00:00:00Z'));
}

/** تنسيق الأرقام بفواصل الآلاف (أرقام لاتينية في اللغتين لسهولة القراءة). */
const fmtNum = (n) => Number(n).toLocaleString('en-US');

/** مولّد أرقام شبه عشوائية ثابت (لتوزيع النجوم بنفس الشكل في كل بناء). */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

module.exports = { esc, fmtTime, fmtDate, fmtNum, seeded };
