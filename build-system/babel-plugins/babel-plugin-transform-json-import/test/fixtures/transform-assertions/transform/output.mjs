
const key = JSON.parse("{\"plugins\":[\"../../../..\"],\"sourceType\":\"module\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
const string = JSON.parse("{\"plugins\":[\"../../../..\"],\"sourceType\":\"module\"}", function (key, val) {
  if (typeof val === 'object') Object.freeze(val);
  return val;
});
