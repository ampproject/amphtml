// options.js is left as is
// lang.json is minified because the path includes /_locales/
const options = JSON.parse("{\"plugins\":[\"../../../..\"],\"sourceType\":\"module\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
const lang = JSON.parse("{\"2\":\"foo\",\"15\":\"bar\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
