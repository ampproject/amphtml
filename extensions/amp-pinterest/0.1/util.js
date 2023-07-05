// characters to be used in the creation of guids
const BASE60 = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ_abcdefghijkmnopqrstuvwxyz';

// make a 12-digit base-60 number for performance tracking
let guid = '';
for (let i = 0; i < 12; i = i + 1) {
  guid = guid + BASE60.substr(Math.floor(Math.random() * 60), 1);
}

/**
 * Prepare the render data, create the node and add handlers
 * @param {string} queryParams - optional query string to append
 */
function log(queryParams) {
  const call = new Image();
  let query = 'https://log.pinterest.com/?guid=' + guid;
  query = query + '&amp=1';
  if (queryParams) {
    query = query + queryParams;
  }
  query = query + '&via=' + encodeURIComponent(window.location.href);
  call.src = query;
}

/**
 * Pinterest provides text HTML encoded. This utility transforms it back
 * into UTF-8 text.
 * @param {string} str - the string to filter
 * @return {string}
 */
function filter(str) {
  try {
    return new DOMParser().parseFromString(str, 'text/html').body.textContent;
  } catch (e) {
    return str;
  }
}

/**
 * Create a DOM element with attributes
 * @param {Document} doc
 * @param {object} data - the string to filter
 * @return {Element}
 */
function make(doc, data) {
  let el = null,
    tag,
    attr;
  for (tag in data) {
    el = doc.createElement(tag);
    for (attr in data[tag]) {
      if (typeof data[tag][attr] === 'string') {
        set(el, attr, data[tag][attr]);
      }
    }
    break;
  }
  return el;
}

/**
 * Set a DOM element attribute
 * @param {Element} el - The element
 * @param {string} attr - the attribute key
 * @param {string} value - the attribute value
 */
function set(el, attr, value) {
  if (typeof el[attr] === 'string') {
    el[attr] = value;
  } else {
    el.setAttribute(attr, value);
  }
}

export const Util = {filter, guid, log, make, set};
