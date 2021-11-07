const DOC_INPUT_ATTR = 'doc';

// Extracts a dictionary of parameters from window.location.hash.
function getLocationHashParams() {
  const paramStrings = window.location.hash.substr(1).split('&');
  const params = {};
  for (let ii = 0; ii < paramStrings.length; ii++) {
    const keyValue = paramStrings[ii].split('=');
    if (keyValue[0].length > 0) {
      params[keyValue[0]] = keyValue[1]
        ? decodeURIComponent(keyValue[1]) : undefined;
    }
  }
  return params;
}

// Removes given parameter from window.location.hash.
function removeParamFromLocationHashParams(param) {
  const params = getLocationHashParams();
  delete params[param];
  setLocationHashParams(params);
}

// Sets window.location hash based on a dictionary of parameters.
function setLocationHashParams(params) {
  const out = [];
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      out.push(key + '=' + encodeURIComponent(params[key]));
    }
  }
  window.location.hash = out.join('&');
}

// Base64 encoded ascii to ucs-2 string.
function atou(str) {
  return decodeURIComponent(escape(atob(str)));
}

// Get query param that may contain an encoded document to be validated. Decode
// and return.
function getIncomingDoc(params) {
  if (!params || !params[DOC_INPUT_ATTR]) {
    return null;
  }
  return atou(params[DOC_INPUT_ATTR]);
}
