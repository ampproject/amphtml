/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Version: 0.1.22.152 */
/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// NOTE: Please don't edit this file directly!
//   This document describes how to change i18n strings in swg-js: https://docs.google.com/document/d/1FMEKJ_TmjHhqON0krE4xhDbTEj0I0DnvzxMzB2cWUWA/edit?resourcekey=0-TQ7hPOzAD4hX8x9PfweGSg#heading=h.q9gi7t4h1tyj

const I18N_STRINGS = {
  'SHOWCASE_REGWALL_TITLE': {
    'de': 'Immer gut informiert mit Google',
    'en': 'Get more with Google',
    'es-ar': 'Disfruta más artículos con Google',
    'fr': 'Plus de contenus avec Google',
    'pt-br': 'Veja mais com o Google',
  },
  'SHOWCASE_REGWALL_DESCRIPTION': {
    'de':
      '<strong></strong>Dieser Inhalt ist normalerweise kostenpflichtig. Google gewährt dir jedoch kostenlos Zugriff auf diesen Artikel und andere Inhalte, wenn du dich mit deinem Google-Konto bei <ph name="PUBLICATION"><ex>AP News</ex>{publication}</ph> registrierst.',
    'en':
      '<strong></strong>This content usually requires payment, but Google is giving you free access to this article and more when you register with <ph name="PUBLICATION"><ex>AP News</ex>{publication}</ph> using your Google Account.',
    'es-ar':
      '<strong></strong>Normalmente, es necesario pagar para ver este contenido, pero Google te ofrece acceso gratuito a este y otros artículos si te registras en <ph name="PUBLICATION"><ex>AP News</ex>{publication}</ph> con tu Cuenta&nbsp;de&nbsp;Google.',
    'fr':
      '<strong></strong>Ce contenu est généralement payant, mais vous pouvez lire cet article et d\'autres contenus gratuitement grâce à Google en vous inscrivant sur <ph name="PUBLICATION"><ex>AP News</ex>{publication}</ph> avec votre compte Google.',
    'pt-br':
      '<strong></strong>Normalmente, é preciso pagar por este conteúdo. Porém, basta você se registrar na publicação <ph name="PUBLICATION"><ex>AP News</ex>{publication}</ph> usando sua Conta do Google para ter acesso gratuito a esta matéria e muito mais.',
  },
  'SHOWCASE_REGWALL_PUBLISHER_SIGN_IN_BUTTON': {
    'de': 'Du hast bereits ein Konto?',
    'en': 'Already have an account?',
    'es-ar': '¿Ya tienes una cuenta?',
    'fr': 'Vous avez déjà un compte&nbsp;?',
    'pt-br': 'Já tem uma conta?',
  },
  'SHOWCASE_REGWALL_GOOGLE_SIGN_IN_BUTTON': {
    'de': 'Über Google anmelden',
    'en': 'Sign in with Google',
    'es-ar': 'Acceder con Google',
    'fr': 'Se connecter avec Google',
    'pt-br': 'Fazer login com o Google',
  },
};

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** English is the default language. */
const DEFAULT_LANGUAGE_CODE = 'en';

/**
 * Gets a message for a given language code, from a map of messages.
 * @param {!Object<string, string>} map
 * @param {?string|?Element} languageCodeOrElement
 * @return {?string}
 */
function msg(map, languageCodeOrElement) {
  const defaultMsg = map[DEFAULT_LANGUAGE_CODE];

  // Verify params.
  if (typeof map !== 'object' || !languageCodeOrElement) {
    return defaultMsg;
  }

  // Get language code.
  let languageCode =
    typeof languageCodeOrElement === 'string'
      ? languageCodeOrElement
      : getLanguageCodeFromElement(languageCodeOrElement);

  // Normalize language code.
  languageCode = languageCode.toLowerCase();
  languageCode = languageCode.replace(/_/g, '-');

  // Search for a message matching the language code.
  // If a message can't be found, try again with a less specific language code.
  const languageCodeSegments = languageCode.split('-');
  while (languageCodeSegments.length) {
    const key = languageCodeSegments.join('-');
    if (key in map) {
      return map[key];
    }

    // Simplify language code.
    // Ex: "en-US-SF" => "en-US"
    languageCodeSegments.pop();
  }

  // There was an attempt.
  return defaultMsg;
}

/**
 * Gets a language code (ex: "en-US") from a given Element.
 * @param {!Element} element
 * @return {string}
 */
function getLanguageCodeFromElement(element) {
  if (element.lang) {
    // Get language from element itself.
    return element.lang;
  }

  if (element.ownerDocument && element.ownerDocument.documentElement.lang) {
    // Get language from element's document.
    return element.ownerDocument.documentElement.lang;
  }

  // There was an attempt.
  return DEFAULT_LANGUAGE_CODE;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns a map-like object.
 * If initial is provided, copies its own properties into the
 * newly created object.
 * @param {Object=} initial This should typically be an object literal.
 * @return {!Object}
 * @template T
 */
function map(initial) {
  const obj = Object.create(null);
  if (initial) {
    Object.assign(obj, initial);
  }
  return obj;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview This module declares JSON types as defined in the
 * {@link http://json.org/}.
 */

/**
 * Simple wrapper around JSON.parse that casts the return value
 * to JsonObject.
 * Create a new wrapper if an array return value is desired.
 * @param {*} json JSON string to parse
 * @return {?JsonObject|undefined} May be extend to parse arrays.
 */
function parseJson(json) {
  return /** @type {?JsonObject} */ (JSON.parse(/** @type {string} */ (json)));
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param  {...*} var_args [description]
 */
function warn(var_args) {
  console.warn.apply(console, arguments);
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */
let a;

/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {Object<string, !LocationDef>}
 */
let cache;

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {string} url
 * @return {!LocationDef}
 */
function parseUrl(url) {
  if (!a) {
    a = /** @type {!HTMLAnchorElement} */ (self.document.createElement('a'));
    cache = self.UrlCache || (self.UrlCache = Object.create(null));
  }

  const fromCache = cache[url];
  if (fromCache) {
    return fromCache;
  }

  const info = parseUrlWithA(a, url);

  return (cache[url] = info);
}

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * @param {!HTMLAnchorElement} a
 * @param {string} url
 * @return {!LocationDef}
 */
function parseUrlWithA(a, url) {
  a.href = url;

  // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick.
  if (!a.protocol) {
    a.href = a.href;
  }

  /** @type {!LocationDef} */
  const info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: '', // Set below.
  };

  // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  }

  // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.
  if (
    (info.protocol == 'http:' && info.port == 80) ||
    (info.protocol == 'https:' && info.port == 443)
  ) {
    info.port = '';
    info.host = info.hostname;
  }

  // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  if (a.origin && a.origin != 'null') {
    info.origin = a.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    info.origin = info.href;
  } else {
    info.origin = info.protocol + '//' + info.host;
  }
  return info;
}

/**
 * Parses and builds Object of URL query string.
 * @param {string} query The URL query string.
 * @return {!Object<string, string>}
 */
function parseQueryString(query) {
  if (!query) {
    return {};
  }
  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      const item = param.split('=');
      try {
        const key = decodeURIComponent(item[0] || '');
        const value = decodeURIComponent(item[1] || '');
        if (key) {
          params[key] = value;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        warn(`SwG could not parse a URL query param: ${item[0]}`);
      }
      return params;
    }, {});
}

/**
 * Adds a parameter to a query string.
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @return {string}
 */
function addQueryParam(url, param, value) {
  const queryIndex = url.indexOf('?');
  const fragmentIndex = url.indexOf('#');
  let fragment = '';
  if (fragmentIndex != -1) {
    fragment = url.substring(fragmentIndex);
    url = url.substring(0, fragmentIndex);
  }
  if (queryIndex == -1) {
    url += '?';
  } else if (queryIndex < url.length - 1) {
    url += '&';
  }
  url += encodeURIComponent(param) + '=' + encodeURIComponent(value);
  return url + fragment;
}

parseUrl(self.window.location.href);
parseUrl(self.document.referrer);

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Polyfill for String.prototype.startsWith.
 * @param {string} string
 * @param {string} prefix
 * @return {boolean}
 */
function startsWith(string, prefix) {
  if (prefix.length > string.length) {
    return false;
  }
  return string.lastIndexOf(prefix, 0) == 0;
}

/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @type {Object<string, string>} */
let propertyNameCache;

/** @const {!Array<string>} */
const vendorPrefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'ms', 'O', 'o'];

/**
 * @param {string} camelCase camel cased string
 * @return {string} title cased string
 */
function camelCaseToTitleCase(camelCase) {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Checks the style if a prefixed version of a property exists and returns
 * it or returns an empty string.
 * @private
 * @param {!Object} style
 * @param {string} titleCase the title case version of a css property name
 * @return {string} the prefixed property name or null.
 */
function getVendorJsPropertyName_(style, titleCase) {
  for (let i = 0; i < vendorPrefixes.length; i++) {
    const propertyName = vendorPrefixes[i] + titleCase;
    if (style[propertyName] !== undefined) {
      return propertyName;
    }
  }
  return '';
}

/**
 * Returns the possibly prefixed JavaScript property name of a style property
 * (ex. WebkitTransitionDuration) given a camelCase'd version of the property
 * (ex. transitionDuration).
 * @param {!Object} style
 * @param {string} camelCase the camel cased version of a css property name
 * @param {boolean=} bypassCache bypass the memoized cache of property
 *   mapping
 * @return {string}
 */
function getVendorJsPropertyName(style, camelCase, bypassCache) {
  if (startsWith(camelCase, '--')) {
    // CSS vars are returned as is.
    return camelCase;
  }
  if (!propertyNameCache) {
    propertyNameCache = map();
  }
  let propertyName = propertyNameCache[camelCase];
  if (!propertyName || bypassCache) {
    propertyName = camelCase;
    if (style[camelCase] === undefined) {
      const titleCase = camelCaseToTitleCase(camelCase);
      const prefixedPropertyName = getVendorJsPropertyName_(style, titleCase);

      if (style[prefixedPropertyName] !== undefined) {
        propertyName = prefixedPropertyName;
      }
    }
    if (!bypassCache) {
      propertyNameCache[camelCase] = propertyName;
    }
  }
  return propertyName;
}

/**
 * Sets the CSS styles of the specified element with !important. The styles
 * are specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, string|number>} styles
 */
function setImportantStyles(element, styles) {
  for (const k in styles) {
    element.style.setProperty(
      getVendorJsPropertyName(styles, k),
      styles[k].toString(),
      'important'
    );
  }
}

/**
 * Copyright 2020 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Stamp for post messages. */
const POST_MESSAGE_STAMP = 'swg-gaa-post-message-stamp';

/** Introduction command for post messages. */
const POST_MESSAGE_COMMAND_INTRODUCTION = 'introduction';

/** User command for post messages. */
const POST_MESSAGE_COMMAND_USER = 'user';

/** Error command for post messages. */
const POST_MESSAGE_COMMAND_ERROR = 'error';

/** ID for the Google Sign-In iframe element. */
const GOOGLE_SIGN_IN_IFRAME_ID = 'swg-google-sign-in-iframe';

/** ID for the Google Sign-In button element. */
const GOOGLE_SIGN_IN_BUTTON_ID = 'swg-google-sign-in-button';

/** ID for the Publisher sign-in button element. */
const PUBLISHER_SIGN_IN_BUTTON_ID = 'swg-publisher-sign-in-button';

/** ID for the Regwall container element. */
const REGWALL_CONTAINER_ID = 'swg-regwall-container';

/** ID for the Regwall dialog element. */
const REGWALL_DIALOG_ID = 'swg-regwall-dialog';

/** ID for the Regwall title element. */
const REGWALL_TITLE_ID = 'swg-regwall-title';

/**
 * HTML for the metering regwall dialog, where users can sign in with Google.
 * The script creates a dialog based on this HTML.
 *
 * The HTML includes an iframe that loads the Google Sign-In button.
 * This iframe can live on a different origin.
 */
const REGWALL_HTML = `
<style>
  .gaa-metering-regwall--dialog-spacer,
  .gaa-metering-regwall--dialog,
  .gaa-metering-regwall--logo,
  .gaa-metering-regwall--title,
  .gaa-metering-regwall--description,
  .gaa-metering-regwall--description strong,
  .gaa-metering-regwall--iframe,
  .gaa-metering-regwall--publisher-no-thanks-button {
    all: initial;
    box-sizing: border-box;
    font-family: Roboto, arial, sans-serif;
  }

  .gaa-metering-regwall--dialog-spacer {
    bottom: 0;
    display: block;
    position: fixed;
    width: 100%;
  }

  @keyframes slideUp {
    from {transform: translate(0, 200px);}
    to {transform: translate(0, 0);}
  }

  .gaa-metering-regwall--dialog {
    animation: slideUp 0.5s;
    background: white;
    border-radius: 12px 12px 0 0;
    box-shadow: 0px -2px 6px rgba(0, 0, 0, 0.3);
    display: block;
    margin: 0 auto;
    max-width: 100%;
    padding: 24px 20px;
    width: 410px;
  }

  .gaa-metering-regwall--logo {
    display: block;
    margin: 0 auto 24px;
  }

  .gaa-metering-regwall--title {
    color: #000;
    display: block;
    font-size: 16px;
    margin: 0 0 8px;
  }
  
  .gaa-metering-regwall--description {
    color: #646464;
    display: block;
    font-size: 14px;
    line-height: 19px;
    margin: 0 0 30px;
  }

  .gaa-metering-regwall--description strong {
    color: #646464;
    font-size: 14px;
    line-height: 19px;
    font-weight: bold;
  }

  .gaa-metering-regwall--iframe {
    border: none;
    display: block;
    height: 36px;
    margin: 0 0 30px;
    width: 100%;
  }

  .gaa-metering-regwall--line {
    background-color: #ddd;
    display: block;
    height: 1px;
    margin: 0 0 24px;
  }

  .gaa-metering-regwall--publisher-sign-in-button,
  .gaa-metering-regwall--publisher-no-thanks-button {
    color: #1967d2;
    display: block;
    cursor: pointer;
    font-size: 12px;
  }

  .gaa-metering-regwall--publisher-sign-in-button {
  }

  .gaa-metering-regwall--publisher-no-thanks-button {
    display: none;
    float: right;
  }

  .gaa-metering-regwall--google-sign-in-button {
    height: 36px;
    margin: 0 auto 30px;
  }

  .gaa-metering-regwall--google-sign-in-button > div {
    animation: swgGoogleSignInButtonfadeIn 0.32s;
  }

  @keyframes swgGoogleSignInButtonfadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

<div class="gaa-metering-regwall--dialog-spacer">
  <div role="dialog" aria-modal="true" class="gaa-metering-regwall--dialog" id="${REGWALL_DIALOG_ID}" aria-labelledby="${REGWALL_TITLE_ID}">
    <img alt="Google" class="gaa-metering-regwall--logo" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3NCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDc0IDI0Ij48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNOS4yNCA4LjE5djIuNDZoNS44OGMtLjE4IDEuMzgtLjY0IDIuMzktMS4zNCAzLjEtLjg2Ljg2LTIuMiAxLjgtNC41NCAxLjgtMy42MiAwLTYuNDUtMi45Mi02LjQ1LTYuNTRzMi44My02LjU0IDYuNDUtNi41NGMxLjk1IDAgMy4zOC43NyA0LjQzIDEuNzZMMTUuNCAyLjVDMTMuOTQgMS4wOCAxMS45OCAwIDkuMjQgMCA0LjI4IDAgLjExIDQuMDQuMTEgOXM0LjE3IDkgOS4xMyA5YzIuNjggMCA0LjctLjg4IDYuMjgtMi41MiAxLjYyLTEuNjIgMi4xMy0zLjkxIDIuMTMtNS43NSAwLS41Ny0uMDQtMS4xLS4xMy0xLjU0SDkuMjR6Ii8+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTI1IDYuMTljLTMuMjEgMC01LjgzIDIuNDQtNS44MyA1LjgxIDAgMy4zNCAyLjYyIDUuODEgNS44MyA1LjgxczUuODMtMi40NiA1LjgzLTUuODFjMC0zLjM3LTIuNjItNS44MS01LjgzLTUuODF6bTAgOS4zM2MtMS43NiAwLTMuMjgtMS40NS0zLjI4LTMuNTIgMC0yLjA5IDEuNTItMy41MiAzLjI4LTMuNTJzMy4yOCAxLjQzIDMuMjggMy41MmMwIDIuMDctMS41MiAzLjUyLTMuMjggMy41MnoiLz48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNNTMuNTggNy40OWgtLjA5Yy0uNTctLjY4LTEuNjctMS4zLTMuMDYtMS4zQzQ3LjUzIDYuMTkgNDUgOC43MiA0NSAxMmMwIDMuMjYgMi41MyA1LjgxIDUuNDMgNS44MSAxLjM5IDAgMi40OS0uNjIgMy4wNi0xLjMyaC4wOXYuODFjMCAyLjIyLTEuMTkgMy40MS0zLjEgMy40MS0xLjU2IDAtMi41My0xLjEyLTIuOTMtMi4wN2wtMi4yMi45MmMuNjQgMS41NCAyLjMzIDMuNDMgNS4xNSAzLjQzIDIuOTkgMCA1LjUyLTEuNzYgNS41Mi02LjA1VjYuNDloLTIuNDJ2MXptLTIuOTMgOC4wM2MtMS43NiAwLTMuMS0xLjUtMy4xLTMuNTIgMC0yLjA1IDEuMzQtMy41MiAzLjEtMy41MiAxLjc0IDAgMy4xIDEuNSAzLjEgMy41NC4wMSAyLjAzLTEuMzYgMy41LTMuMSAzLjV6Ii8+PHBhdGggZmlsbD0iI0ZCQkMwNSIgZD0iTTM4IDYuMTljLTMuMjEgMC01LjgzIDIuNDQtNS44MyA1LjgxIDAgMy4zNCAyLjYyIDUuODEgNS44MyA1LjgxczUuODMtMi40NiA1LjgzLTUuODFjMC0zLjM3LTIuNjItNS44MS01LjgzLTUuODF6bTAgOS4zM2MtMS43NiAwLTMuMjgtMS40NS0zLjI4LTMuNTIgMC0yLjA5IDEuNTItMy41MiAzLjI4LTMuNTJzMy4yOCAxLjQzIDMuMjggMy41MmMwIDIuMDctMS41MiAzLjUyLTMuMjggMy41MnoiLz48cGF0aCBmaWxsPSIjMzRBODUzIiBkPSJNNTggLjI0aDIuNTF2MTcuNTdINTh6Ii8+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTY4LjI2IDE1LjUyYy0xLjMgMC0yLjIyLS41OS0yLjgyLTEuNzZsNy43Ny0zLjIxLS4yNi0uNjZjLS40OC0xLjMtMS45Ni0zLjctNC45Ny0zLjctMi45OSAwLTUuNDggMi4zNS01LjQ4IDUuODEgMCAzLjI2IDIuNDYgNS44MSA1Ljc2IDUuODEgMi42NiAwIDQuMi0xLjYzIDQuODQtMi41N2wtMS45OC0xLjMyYy0uNjYuOTYtMS41NiAxLjYtMi44NiAxLjZ6bS0uMTgtNy4xNWMxLjAzIDAgMS45MS41MyAyLjIgMS4yOGwtNS4yNSAyLjE3YzAtMi40NCAxLjczLTMuNDUgMy4wNS0zLjQ1eiIvPjwvc3ZnPg==" />

    <div class="gaa-metering-regwall--title" id="${REGWALL_TITLE_ID}" tabindex="0">$SHOWCASE_REGWALL_TITLE$</div>

    <div class="gaa-metering-regwall--description">
      $SHOWCASE_REGWALL_DESCRIPTION$
    </div>

    <iframe
        id="${GOOGLE_SIGN_IN_IFRAME_ID}"
        class="gaa-metering-regwall--iframe"
        src="$iframeUrl$">
    </iframe>

    <div class="gaa-metering-regwall--line"></div>

    <a
        id="${PUBLISHER_SIGN_IN_BUTTON_ID}"
        class="gaa-metering-regwall--publisher-sign-in-button"
        tabindex="0"
        href="#">
      $SHOWCASE_REGWALL_PUBLISHER_SIGN_IN_BUTTON$
    </a>
  </div>
</div>
`;

/** Styles for the Google Sign-In button iframe. */
const GOOGLE_SIGN_IN_IFRAME_STYLES = `
body {
  margin: 0;
  overflow: hidden;
}
#${GOOGLE_SIGN_IN_BUTTON_ID} {
  margin: 0 auto;
}
#${GOOGLE_SIGN_IN_BUTTON_ID} > div {
  animation: fadeIn 0.32s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
#${GOOGLE_SIGN_IN_BUTTON_ID} .abcRioButton.abcRioButtonBlue {
  background-color: #1A73E8;
  box-shadow: none;
  -webkit-box-shadow: none;
  border-radius: 4px;
  width: 100% !important;
}
#${GOOGLE_SIGN_IN_BUTTON_ID} .abcRioButton.abcRioButtonBlue .abcRioButtonIcon {
  display: none;
}
/** Hides default "Sign in with Google" text. */
#${GOOGLE_SIGN_IN_BUTTON_ID} .abcRioButton.abcRioButtonBlue .abcRioButtonContents span[id^=not_signed_] {
  font-size: 0 !important;
}
/** Renders localized "Sign in with Google" text instead. */
#${GOOGLE_SIGN_IN_BUTTON_ID} .abcRioButton.abcRioButtonBlue .abcRioButtonContents span[id^=not_signed_]::before {
  content: '$SHOWCASE_REGWALL_GOOGLE_SIGN_IN_BUTTON$';
  font-size: 15px;
}
`;

/**
 * User object that Publisher JS receives after users sign in.
 * @typedef {{
 *   idToken: string,
 *   name: string,
 *   givenName: string,
 *   familyName: string,
 *   imageUrl: string,
 *   email: string,
 * }} GaaUserDef
 */
let GaaUserDef;

/**
 * GoogleUser object that Google Sign-In returns after users sign in.
 * https://developers.google.com/identity/sign-in/web/reference#googleusergetbasicprofile
 * @typedef {{
 *   getAuthResponse: function(): {id_token: string},
 *   getBasicProfile: function(): {
 *     getName: function(): string,
 *     getGivenName: function(): string,
 *     getFamilyName: function(): string,
 *     getImageUrl: function(): string,
 *     getEmail: function(): string,
 *   },
 * }} GoogleUserDef
 */
let GoogleUserDef;

/**
 * Returns true if the query string contains fresh Google Article Access (GAA) params.
 * @param {string} queryString
 * @return {boolean}
 */
function queryStringHasFreshGaaParams(queryString) {
  const params = parseQueryString(queryString);

  // Verify GAA params exist.
  if (
    !params['gaa_at'] ||
    !params['gaa_n'] ||
    !params['gaa_sig'] ||
    !params['gaa_ts']
  ) {
    return false;
  }

  // Verify timestamp isn't stale.
  const expirationTimestamp = parseInt(params['gaa_ts'], 16);
  const currentTimestamp = Date.now() / 1000;
  if (expirationTimestamp < currentTimestamp) {
    return false;
  }

  return true;
}

/** Renders Google Article Access (GAA) Metering Regwall. */
class GaaMeteringRegwall {
  /**
   * Returns a promise for a Google Sign-In user object.
   * https://developers.google.com/identity/sign-in/web/reference#googleusergetbasicprofile
   *
   * This method opens a metering regwall dialog,
   * where users can sign in with Google.
   * @nocollapse
   * @param {{ iframeUrl: string }} params
   * @return {!Promise<!GaaUserDef>}
   */
  static show({iframeUrl}) {
    const queryString = GaaUtils.getQueryString();
    if (!queryStringHasFreshGaaParams(queryString)) {
      const errorMessage =
        '[swg-gaa.js:GaaMeteringRegwall.show]: URL needs fresh GAA params.';
      warn(errorMessage);
      return Promise.reject(errorMessage);
    }

    GaaMeteringRegwall.render_({iframeUrl});
    GaaMeteringRegwall.sendIntroMessageToGsiIframe_({iframeUrl});
    return GaaMeteringRegwall.getGaaUser_()
      .then((gaaUser) => {
        GaaMeteringRegwall.remove_();
        return gaaUser;
      })
      .catch((err) => {
        // Close the Regwall, since the flow failed.
        GaaMeteringRegwall.remove_();

        // Rethrow error.
        throw err;
      });
  }

  /**
   * Signs out of Google Sign-In.
   * This is useful for developers who are testing their
   * SwG integrations.
   * @nocollapse
   * @return {!Promise}
   */
  static signOut() {
    return configureGoogleSignIn().then(() =>
      self.gapi.auth2.getAuthInstance().signOut()
    );
  }

  /**
   * Renders the Regwall.
   * @private
   * @nocollapse
   * @param {{ iframeUrl: string }} params
   */
  static render_({iframeUrl}) {
    const languageCode = getLanguageCodeFromElement(self.document.body);

    // Tell the iframe which language to render.
    iframeUrl = addQueryParam(iframeUrl, 'lang', languageCode);

    const containerEl = /** @type {!HTMLDivElement} */ (self.document.createElement(
      'div'
    ));
    containerEl.id = REGWALL_CONTAINER_ID;
    setImportantStyles(containerEl, {
      'all': 'unset',
      'background-color': 'rgba(32, 33, 36, 0.6)',
      'border': 'none',
      'bottom': '0',
      'height': '100%',
      'left': '0',
      'opacity': '0',
      'position': 'fixed',
      'right': '0',
      'transition': 'opacity 0.5s',
      'top': '0',
      'width': '100%',
      'z-index': 2147483646,
    });
    containerEl./*OK*/ innerHTML = REGWALL_HTML.replace(
      '$iframeUrl$',
      iframeUrl
    )
      .replace(
        '$SHOWCASE_REGWALL_TITLE$',
        msg(I18N_STRINGS['SHOWCASE_REGWALL_TITLE'], languageCode)
      )
      .replace(
        '$SHOWCASE_REGWALL_DESCRIPTION$',
        msg(I18N_STRINGS['SHOWCASE_REGWALL_DESCRIPTION'], languageCode)
      )
      .replace(
        '$SHOWCASE_REGWALL_PUBLISHER_SIGN_IN_BUTTON$',
        msg(
          I18N_STRINGS['SHOWCASE_REGWALL_PUBLISHER_SIGN_IN_BUTTON'],
          languageCode
        )
      );
    containerEl.querySelector('ph')./*OK*/ innerHTML =
      '<strong>' +
      GaaMeteringRegwall.getPublisherNameFromPageConfig_() +
      '</strong>';
    self.document.body.appendChild(containerEl);
    /** @suppress {suspiciousCode} */
    containerEl.offsetHeight; // Trigger a repaint (to prepare the CSS transition).
    setImportantStyles(containerEl, {'opacity': 1});
    GaaMeteringRegwall.addClickListenerOnPublisherSignInButton_();

    // Focus on the title after the dialog animates in.
    // This helps people using screenreaders.
    const dialogEl = self.document.getElementById(REGWALL_DIALOG_ID);
    dialogEl.addEventListener('animationend', () => {
      const titleEl = self.document.getElementById(REGWALL_TITLE_ID);
      titleEl.focus();
    });
  }

  /**
   * Gets publisher name from page config.
   * @private
   * @nocollapse
   * @return {string}
   */
  static getPublisherNameFromPageConfig_() {
    const ldJsonElements = self.document.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    for (let i = 0; i < ldJsonElements.length; i++) {
      const ldJsonElement = ldJsonElements[i];
      const ldJson = /** @type {?{ publisher: ?{ name: string } }} */ (parseJson(
        ldJsonElement.textContent
      ));
      if (ldJson?.publisher?.name) {
        return ldJson.publisher.name;
      }
    }

    throw new Error('Article needs JSON-LD with a publisher name.');
  }

  /**
   * Adds a click listener on the publisher sign-in button.
   * @private
   * @nocollapse
   */
  static addClickListenerOnPublisherSignInButton_() {
    self.document
      .getElementById(PUBLISHER_SIGN_IN_BUTTON_ID)
      .addEventListener('click', (e) => {
        e.preventDefault();
        (self.SWG = self.SWG || []).push((subscriptions) => {
          /** @type {!Subscriptions} */ (subscriptions).triggerLoginRequest({
            linkRequested: false,
          });
        });
      });
  }

  /**
   * Returns the GAA user, after the user signs in.
   * @private
   * @nocollapse
   * @return {!Promise<!GoogleUserDef>}
   */
  static getGaaUser_() {
    // Listen for GAA user.
    return new Promise((resolve, reject) => {
      self.addEventListener('message', (e) => {
        if (e.data.stamp === POST_MESSAGE_STAMP) {
          if (e.data.command === POST_MESSAGE_COMMAND_USER) {
            // Pass along GAA user.
            resolve(e.data.gaaUser);
          }

          if (e.data.command === POST_MESSAGE_COMMAND_ERROR) {
            // Reject promise due to Google Sign-In error.
            reject('Google Sign-In failed to initialize');
          }
        }
      });
    });
  }

  /**
   * Sends intro post message to Google Sign-In iframe.
   * @private
   * @nocollapse
   * @param {{ iframeUrl: string }} params
   */
  static sendIntroMessageToGsiIframe_({iframeUrl}) {
    // Introduce this window to the publisher's Google Sign-In iframe.
    // This lets the iframe send post messages back to this window.
    // Without the introduction, the iframe wouldn't have a reference to this window.
    const googleSignInIframe = /** @type {!HTMLIFrameElement} */ (self.document.getElementById(
      GOOGLE_SIGN_IN_IFRAME_ID
    ));
    googleSignInIframe.onload = () => {
      googleSignInIframe.contentWindow.postMessage(
        {
          stamp: POST_MESSAGE_STAMP,
          command: POST_MESSAGE_COMMAND_INTRODUCTION,
        },
        new URL(iframeUrl).origin
      );
    };
  }

  /**
   * Removes the Regwall.
   * @private
   * @nocollapse
   */
  static remove_() {
    const regwallContainer = self.document.getElementById(REGWALL_CONTAINER_ID);
    if (regwallContainer) {
      regwallContainer.remove();
    }
  }
}

class GaaGoogleSignInButton {
  /**
   * Renders the Google Sign-In button.
   * @nocollapse
   * @param {{ allowedOrigins: !Array<string> }} params
   */
  static show({allowedOrigins}) {
    // Optionally grab language code from URL.
    const queryString = GaaUtils.getQueryString();
    const queryParams = parseQueryString(queryString);
    const languageCode = queryParams['lang'] || 'en';

    // Apply iframe styles.
    const styleEl = self.document.createElement('style');
    styleEl./*OK*/ innerText = GOOGLE_SIGN_IN_IFRAME_STYLES.replace(
      '$SHOWCASE_REGWALL_GOOGLE_SIGN_IN_BUTTON$',
      msg(I18N_STRINGS['SHOWCASE_REGWALL_GOOGLE_SIGN_IN_BUTTON'], languageCode)
    );
    self.document.head.appendChild(styleEl);

    // Promise a function that sends messages to the parent frame.
    // Note: A function is preferable to a reference to the parent frame
    // because referencing the parent frame outside of the 'message' event
    // handler throws an Error. A function defined within the handler can
    // effectively save a reference to the parent frame though.
    const sendMessageToParentFnPromise = new Promise((resolve) => {
      self.addEventListener('message', (e) => {
        if (
          allowedOrigins.indexOf(e.origin) !== -1 &&
          e.data.stamp === POST_MESSAGE_STAMP &&
          e.data.command === POST_MESSAGE_COMMAND_INTRODUCTION
        ) {
          resolve((message) => {
            e.source.postMessage(message, e.origin);
          });
        }
      });
    });

    // Render the Google Sign-In button.
    configureGoogleSignIn()
      .then(
        // Promise credentials.
        () =>
          new Promise((resolve) => {
            // Render the Google Sign-In button.
            const buttonEl = self.document.createElement('div');
            buttonEl.id = GOOGLE_SIGN_IN_BUTTON_ID;
            buttonEl.tabIndex = 0;
            self.document.body.appendChild(buttonEl);
            self.gapi.signin2.render(GOOGLE_SIGN_IN_BUTTON_ID, {
              'longtitle': true,
              'onsuccess': resolve,
              'prompt': 'select_account',
              'scope': 'profile email',
              'theme': 'dark',
            });
          })
      )
      .then((googleUser) => {
        // Gather GAA user details.
        const basicProfile = /** @type {!GoogleUserDef} */ (googleUser).getBasicProfile();
        /** @type {!GaaUserDef} */
        const gaaUser = {
          idToken: /** @type {!GoogleUserDef} */ (googleUser).getAuthResponse()
            .id_token,
          name: basicProfile.getName(),
          givenName: basicProfile.getGivenName(),
          familyName: basicProfile.getFamilyName(),
          imageUrl: basicProfile.getImageUrl(),
          email: basicProfile.getEmail(),
        };

        // Send GAA user to parent frame.
        sendMessageToParentFnPromise.then((sendMessageToParent) => {
          sendMessageToParent({
            stamp: POST_MESSAGE_STAMP,
            command: POST_MESSAGE_COMMAND_USER,
            gaaUser,
          });
        });
      })
      .catch(() => {
        // Report error to parent frame.
        sendMessageToParentFnPromise.then((sendMessageToParent) => {
          sendMessageToParent({
            stamp: POST_MESSAGE_STAMP,
            command: POST_MESSAGE_COMMAND_ERROR,
          });
        });
      });
  }
}

/**
 * Loads the Google Sign-In API.
 *
 * This function is used in two places.
 * 1. The publisher's Google Sign-In iframe.
 * 2. (Optional) Demos that allow users to sign out.
 *
 * @return {!Promise}
 */
function configureGoogleSignIn() {
  // Wait for Google Sign-In API.
  return (
    new Promise((resolve) => {
      const apiCheckInterval = setInterval(() => {
        if (!!self.gapi) {
          clearInterval(apiCheckInterval);
          resolve();
        }
      }, 50);
    })
      // Load Auth2 module.
      .then(() => new Promise((resolve) => self.gapi.load('auth2', resolve)))
      // Specify "redirect" mode. It plays nicer with webviews.
      .then(
        () =>
          // Only initialize Google Sign-In once.
          self.gapi.auth2.getAuthInstance() || self.gapi.auth2.init()
      )
  );
}

class GaaUtils {
  /**
   * Returns query string from current URL.
   * Tests can override this method to return different URLs.
   * @return {string}
   */
  static getQueryString() {
    return self.location.search;
  }
}

export { GaaGoogleSignInButton, GaaMeteringRegwall, GaaUserDef, GoogleUserDef };
