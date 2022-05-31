const appendQueryParamsToUrl = (url, params) =>
  url +
  '?' +
  Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

const leadingSlashRegex = /^\//;
const replaceLeadingSlash = (subject, replacement) =>
  subject.replace(leadingSlashRegex, replacement);

module.exports = {
  appendQueryParamsToUrl,
  replaceLeadingSlash,
};
