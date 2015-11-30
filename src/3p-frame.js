/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


import {assert} from './asserts';
import {getLengthNumeral} from '../src/layout';
import {documentInfoFor} from './document-info';
import {getMode} from './mode';
import {dashToCamelCase} from './string';
import {parseUrl} from './url';


/** @type {!Object<string,number>} Number of 3p frames on the for that type. */
var count = {};


/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!Element} element
 * @param {string=} opt_type
 * @return {!Object} Contains
 *     - type, width, height, src attributes of <amp-ad> tag. These have
 *       precedence over the data- attributes.
 *     - data-* attributes of the <amp-ad> tag with the "data-" removed.
 *     - A _context object for internal use.
 */
function getFrameAttributes(parentWindow, element, opt_type) {
  var width = element.getAttribute('width');
  var height = element.getAttribute('height');
  var type = opt_type || element.getAttribute('type');
  assert(type, 'Attribute type required for <amp-ad>: %s', element);
  var attributes = {};
  // Do these first, as the other attributes have precedence.
  addDataAndJsonAttributes_(element, attributes);
  attributes.width = getLengthNumeral(width);
  attributes.height = getLengthNumeral(height);
  var box = element.getLayoutBox();
  attributes.initialWindowWidth = box.width;
  attributes.initialWindowHeight = box.height;
  attributes.type = type;
  attributes._context = {
    referrer: parentWindow.document.referrer,
    canonicalUrl: documentInfoFor(parentWindow).canonicalUrl,
    location: {
      href: parentWindow.location.href
    },
    mode: getMode()
  };
  var adSrc = element.getAttribute('src');
  if (adSrc) {
    attributes.src = adSrc;
  }
  return attributes;
}

/**
 * Creates the iframe for the embed. Applies correct size and passes the embed
 * attributes to the frame via JSON inside the fragment.
 * @param {!Window} parentWindow
 * @param {!Element} element
 * @param {string=} opt_type
 * @return {!Element} The iframe.
 */
export function getIframe(parentWindow, element, opt_type) {
  var attributes = getFrameAttributes(parentWindow, element, opt_type);
  var iframe = document.createElement('iframe');
  if (!count[attributes.type]) {
    count[attributes.type] = 0;
  }
  iframe.name = 'frame_' + attributes.type + '_' + count[attributes.type]++;

  // Pass ad attributes to iframe via the fragment.
  var src = getBootstrapBaseUrl(parentWindow) + '#' +
      JSON.stringify(attributes);

  iframe.src = src;
  iframe.width = attributes.width;
  iframe.height = attributes.height;
  iframe.style.border = 'none';
  iframe.setAttribute('scrolling', 'no');
  iframe.onload = function() {
    // Chrome does not reflect the iframe readystate.
    this.readyState = 'complete';
  };
  return iframe;
}

/**
 * Allows listening for message from the iframe.
 * @param {!Element} iframe
 * @param {string} typeOfMessage
 * @param {function(!Object)} callback Called when a message of this type
 *     arrives for this iframe.
 */
export function listen(iframe, typeOfMessage, callback) {
  var win = iframe.ownerDocument.defaultView;
  var origin = parseUrl(getBootstrapBaseUrl(win)).origin;
  win.addEventListener('message', function(event) {
    if (event.origin != origin) {
      return;
    }
    if (event.source != iframe.contentWindow) {
      return;
    }
    if (!event.data || event.data.sentinel != 'amp-3p') {
      return;
    }
    if (event.data.type != typeOfMessage) {
      return;
    }
    callback(event.data);
  });
}

/**
 * Copies data- attributes from the element into the attributes object.
 * Removes the data- from the name and capitalizes after -. If there
 * is an attribute called json, parses the JSON and adds it to the
 * attributes.
 * @param {!Element} element
 * @param {!Object} attributes The destination.
 * visibleForTesting
 */
export function addDataAndJsonAttributes_(element, attributes) {
  for (var i = 0; i < element.attributes.length; i++) {
    var attr = element.attributes[i];
    if (attr.name.indexOf('data-') != 0) {
      continue;
    }
    attributes[dashToCamelCase(attr.name.substr(5))] = attr.value;
  }
  var json = element.getAttribute('json');
  if (json) {
    var obj;
    try {
      obj = JSON.parse(json);
    } catch (e) {
      assert(false, 'Error parsing JSON in json attribute in element %s',
          element);
    }
    for (var key in obj) {
      attributes[key] = obj[key];
    }
  }
}

/**
 * Returns the base URL for ad bootstrap iframes.
 * @param {!Window} parentWindow
 * @return {string}
 */
function getBootstrapBaseUrl(parentWindow) {
  // TODO(malteubl): Change to final URL.
  var url =
      'https://3p.ampproject.net/$internalRuntimeVersion$/frame.html';
  if (getMode().localDev) {
    url = 'http://ads.localhost:' + parentWindow.location.port +
        '/dist.3p/current' +
        (getMode().minified ? '-min/frame' : '/frame.max') +
        '.html';
  }
  return url;
}
