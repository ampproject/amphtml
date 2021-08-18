const key = JSON.parse("{\"plugins\":[[\"../../../..\",{\"freeze\":true}]],\"sourceType\":\"module\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
const string = JSON.parse("{\"plugins\":[[\"../../../..\",{\"freeze\":true}]],\"sourceType\":\"module\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
