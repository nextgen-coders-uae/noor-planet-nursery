/**
 * فهرس الصفحات – كل صفحة: { slug, key, render(ctx), priority?, noindex?, scripts?, schema?, title?, desc? }
 * لإضافة صفحة جديدة: أنشئ دالة render في أحد الملفات وأضف نصوصها في ar.json و en.json تحت meta.<key>.
 */
module.exports = (data) => [
  ...require('./home'),
  ...require('./programs')(data),
  ...require('./fees'),
  ...require('./register'),
  ...require('./forms'),
  ...require('./info'),
  ...require('./parents'),
  ...require('./misc'),
];
module.exports.notFound = require('./misc').notFound;
