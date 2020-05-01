/**
 * Format data for pingback.
 * @param {any} obj
 * @return {string}
 */
export function stringifyForPingback(obj) {
    // If there's json for pingback use that if not use json if not go deeper
    if (obj.jsonForPingback) {
      return JSON.stringify(obj.jsonForPingback());
    } else if (obj.json) {
      return JSON.stringify(obj.json());
    }
    if (isObject(obj)) {
      const result = {};
      Object.keys(obj).forEach((key) => {
        result[key] = stringifyForPingback(obj[key]);
      });
      return JSON.stringify(result);
    }
    if (isArray(obj)) {
      const objArray = [];
      obj.forEach((element) => {
        objArray.push(stringifyForPingback(element));
      });
      return '[' + objArray.join(',') + ']';
    }
    return JSON.stringify(obj);
  }
  