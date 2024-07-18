import { validateData, writeScript } from "#3p/3p";

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function openadstream(global, data) {
  validateData(data, ["adhost", "urlpath", "sitepage", "pos"], ["query"]);

  let url =
    "https://" +
    encodeURIComponent(data.adhost) +
    "/" +
    data.urlpath +
    "/" +
    data.sitepage +
    "@" +
    data.pos;

  if (data.query) {
    url = url + "?" + data.query;
  }
  writeScript(global, url);
}
