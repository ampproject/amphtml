import {Services} from '#service';

import {user} from '#utils/log';

import {
  assertSuccess,
  getViewerInterceptResponse,
  setupAMPCors,
  setupInit,
  setupInput,
} from './utils/xhr-utils';

/**
 *
 *
 * @param {!Window} win
 * @param {string} input
 * @param {?FetchInitDef=} opt_init
 * @return {!Promise<!Document>}
 * @ignore
 */
export function fetchDocument(win, input, opt_init) {
  let init = setupInit(opt_init, 'text/html');
  init = setupAMPCors(win, input, init);
  input = setupInput(win, input, init);
  const ampdocService = Services.ampdocServiceFor(win);
  const ampdocSingle = ampdocService.isSingleDoc()
    ? ampdocService.getSingleDoc()
    : null;
  init.responseType = 'document';
  return getViewerInterceptResponse(win, ampdocSingle, input, init).then(
    (interceptorResponse) => {
      if (interceptorResponse) {
        return interceptorResponse
          .text()
          .then((body) => new DOMParser().parseFromString(body, 'text/html'));
      }
      return xhrRequest(input, init).then((resp) => {
        const {xhr} = resp;
        return xhr.responseXML;
      });
    }
  );
}

/**
 *
 *
 * @param {string} input
 * @param {!FetchInitDef} init
 * @return {!Promise<!{response: !Response, xhr: !XMLHttpRequest}>}
 * @private
 */
function xhrRequest(input, init) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(init.method || 'GET', input, true);
    xhr.withCredentials = init.credentials == 'include';
    xhr.responseType = 'document';
    // Incoming headers are in fetch format,
    // so we need to convert them into xhr.
    for (const header in init.headers) {
      xhr.setRequestHeader(header, init.headers[header]);
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(user().createExpectedError(`Unknown HTTP status ${xhr.status}`));
        return;
      }
      // TODO(dvoytenko): This is currently simplified: we will wait for the
      // whole document loading to complete. This is fine for the use cases
      // we have now, but may need to be reimplemented later.
      if (xhr.readyState == /* COMPLETE */ 4) {
        const options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders()),
        };
        const response = new Response(
          '',
          /** @type {!ResponseInit} */ (options)
        );
        const promise = assertSuccess(response).then((response) => ({
          response,
          xhr,
        }));
        resolve(promise);
      }
    };
    xhr.onerror = () => {
      reject(user().createExpectedError('Request failure'));
    };
    xhr.onabort = () => {
      reject(user().createExpectedError('Request aborted'));
    };
    if (init.method == 'POST') {
      xhr.send(/** @type {!FormData} */ (init.body));
    } else {
      xhr.send();
    }
  });
}

/**
 * Parses XHR's response headers into JSONObject.
 * @param {string} rawHeaders
 * @return {!JsonObject}
 */
function parseHeaders(rawHeaders) {
  const headers = {};
  // Replace instances of \r\n and \n followed by at least one space or
  // horizontal tab with a space.
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
    const parts = line.split(':');
    const key = parts.shift().trim();
    if (key) {
      const value = parts.join(':').trim();
      headers[key] = value;
    }
  });
  return headers;
}
