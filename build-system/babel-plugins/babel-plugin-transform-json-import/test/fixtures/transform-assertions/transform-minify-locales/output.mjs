const options = JSON.parse("{\"plugins\":[\"../../../..\"],\"sourceType\":\"module\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
const lang = JSON.parse("{\"2\":\"foo\",\"15\":\"bar\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
}); // same as input

console.log(options); // minified because path includes /_locales/

console.log(lang);
