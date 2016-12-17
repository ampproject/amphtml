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
import {validateData, loadScript} from '../../3p/3p';
import {tryParseJson} from '../../src/json.js';

// Keep track of current height of AMP iframe
let currentAmpHeight = null;

/**
 * Request Custom Search Ads (Adsense for Search or AdSense for Shopping).
 * @param {!Window} global The window object of the iframe
 * @param {!Object} data
 */
export function csa(global, data) {
  // Get parent width in case we want to override
  const width = global.document.body.clientWidth;

  validateData(data, [], [
    'afshPageOptions',
    'afshAdblockOptions',
    'afsPageOptions',
    'afsAdblockOptions',
    'ampSlotIndex',
  ]);

  // Add the ad container to the document
  const containerDiv = global.document.createElement('div');
  const containerId = 'csacontainer';
  containerDiv.id = containerId;
  global.document.body.appendChild(containerDiv);

  // Parse all the options
  const pageOptions = {source: 'amp', referer: global.context.referrer};
  const adblockOptions = {container: containerId};
  const afshPageOptions = Object.assign(
      Object(tryParseJson(data['afshPageOptions'])), pageOptions);
  const afsPageOptions = Object.assign(
      Object(tryParseJson(data['afsPageOptions'])), pageOptions);
  const afshAdblockOptions = Object.assign(
      Object(tryParseJson(data['afshAdblockOptions'])), adblockOptions);
  const afsAdblockOptions = Object.assign(
      Object(tryParseJson(data['afsAdblockOptions'])), adblockOptions);

  // Special case for AFSh when "auto" is the requested width
  if (afshAdblockOptions != null && afshAdblockOptions['width'] == 'auto') {
    afshAdblockOptions['width'] = width;
  }

  /**
   * Resize the AMP iframe if the CSA container changes in size upon rotation.
   * This is needed for an iOS bug found in versions 10.0.1 and below that
   * doesn't properly reflow the iframe upon orientation change.
   */
  global.addEventListener('orientationchange', () => {
    // Save the height of the container before the event listener triggers
    const oldHeight = containerDiv.style.height;
    setTimeout(() => {
      // Force DOM reflow and repaint
      /*eslint-disable no-unused-vars*/
      const ignore = global.document.body.offsetHeight;
      /*eslint-enable no-unused-vars*/
      // Capture new height
      let newHeight = containerDiv.style.height;
      // In older versions of iOS, this height will be different because the
      // container height is resized.
      // In Chrome and iOS 10.0.2 the height is the same because
      // the container isn't resized.
      if (oldHeight != newHeight && newHeight != currentAmpHeight) {
        // style.height returns "60px" (for example), so turn this into an int
        newHeight = parseInt(newHeight, 10);
        // Also update the onclick function to resize to the right height.
        const overflow = global.document.getElementById('overflow');
        if (overflow) {
          overflow.onclick =
              global.context.requestResize.bind(null, undefined, newHeight);
        }
        // Resize the container to the correct height
        global.context.requestResize(undefined, newHeight);
      }
    }, 250); /* 250 is time in ms to wait before executing orientation */
  });

  // Only call for ads once the script has loaded
  loadScript(global, 'https://www.google.com/adsense/search/ads.js', () => {
    if (data['afsPageOptions'] != null && data['afshPageOptions'] == null) {
      // Do not backfill this request
      afsAdblockOptions['adLoadedCallback'] =
          resizeIframe.bind(null, global, null, null);
      // Make a call for AFS ads
      global._googCsa('ads', afsPageOptions, afsAdblockOptions);
    } else if (data['afsPageOptions'] == null
          && data['afshPageOptions'] != null) {
      // Do not backfill this request
      afshAdblockOptions['adLoadedCallback'] =
          resizeIframe.bind(null, global, null, null);
      // Make a call for AFSh ads
      global._googCsa('plas', afshPageOptions, afshAdblockOptions);
    } else if (data['afsPageOptions'] != null
          && data['afshPageOptions'] != null) {
      // Do backfill this request
      afshAdblockOptions['adLoadedCallback'] =
          resizeIframe.bind(null, global, afsPageOptions, afsAdblockOptions);
      // Make a call for AFSh ads (with AFS as backfill)
      global._googCsa('plas', afshPageOptions, afshAdblockOptions);
    }
  });
}

/**
 * CSA callback function to resize the iframe and/or request backfill
 * @param {?Object} backfillPageOptions AFS page options (if necessary)
 * @param {?Object} backfillAdblockOptions AFS ad unit options (if necessary)
 * @param {string} containerName
 * @param {boolean} adsLoaded
 * @visibleForTesting
 */
export function resizeIframe(global, backfillPageOptions,
    backfillAdblockOptions, containerName, adsLoaded) {
  if (adsLoaded) {
    // Get actual height of container
    const container = global.document.getElementById(containerName);
    const height = container.offsetHeight;
    currentAmpHeight =
        global.context.initialIntersection.boundingClientRect.height;
    const overflowHeight = 40;

    // If the height of the container is larger than the height of the
    // initially requested AMP tag, add the overflow element
    if (height > currentAmpHeight) {
      // Create the overflow
      createOverflow(global, overflowHeight, height, container,
          currentAmpHeight - overflowHeight);
    }

    // Attempt to resize to actual CSA container height
    global.context.requestResize(undefined, height);

    // If reisze succeeded, hide overflow and resize container
    global.context.onResizeSuccess(function(requestedHeight) {
      currentAmpHeight = requestedHeight;
      const overflow = global.document.getElementById('overflow');
      if (overflow) {
        overflow.style.display = 'none';
        resizeCsa(container, requestedHeight);
      }
    });

    // If resize was denied, show overflow element and resize container
    global.context.onResizeDenied(function(requestedHeight) {
      const overflow = global.document.getElementById('overflow');
      const containerHeight = parseInt(container.style.height, 10);

      if (containerHeight > currentAmpHeight) {
        if (overflow) {
          overflow.style.display = '';
          resizeCsa(container, currentAmpHeight - overflowHeight);
        } else {
          createOverflow(global, overflowHeight, requestedHeight, container,
              currentAmpHeight - overflowHeight);
        }
      }
    });
  } else {
    // If we need to backfill, make the call
    if (backfillPageOptions != null && backfillAdblockOptions != null) {
      // _googCsa is the ad request funciton and should already be defined
      const _googCsa = global['_googCsa'];
      // Make sure we don't try to backfill again
      backfillAdblockOptions['adLoadedCallback'] =
          resizeIframe.bind(null, global, null, null);
      _googCsa('ads', backfillPageOptions, backfillAdblockOptions);
    } else {
      // Let AMP know we didn't return anything
      global.context.noContentAvailable();
    }
  }
}

/**
 * Helper function to create an overflow element
 * @param {number} overflowH Height of the overflow element
 * @param {number} fullH Height the iframe should be when overflow is clicked
 * @param {Node} container HTML element of the CSA container
 * @param {number} containerH Height to resize the CSA container, in pixels
 */
function createOverflow(global, overflowH, fullH, container, containerH) {
  // Create and append an overflow element with line, chevron, and onclick
  const overflow = getOverflowElement(global, overflowH);
  overflow.appendChild(getOverflowLine(global));
  overflow.appendChild(getOverflowChevron(global));
  overflow.onclick = global.context.requestResize.bind(null, undefined, fullH);
  global.document.body.appendChild(overflow);
  // Force DOM reflow and repaint
  /*eslint-disable no-unused-vars*/
  const ignore = global.document.body.offsetHeight;
  /*eslint-enable no-unused-vars*/
  // Resize the CSA container to not conflict with overflow
  resizeCsa(container, containerH);
}

/**
 * Helper function to create the base overflow element
 * @param {number} height Height of the overflow element
 * @return {Node}
 */
function getOverflowElement(global, height) {
  const overflow = global.document.createElement('div');
  overflow.id = 'overflow';
  overflow.style.position = 'absolute';
  overflow.style.height = height + 'px';
  overflow.style.width = '100%';
  return overflow;
}

/**
 * Helper function to create a line element for the overflow element
 * @return {Node}
 */
function getOverflowLine(global) {
  const line = global.document.createElement('div');
  line.style.background = 'rgba(0,0,0,.16)';
  line.style.height = '1px';
  return line;
}

/**
 * Helper function to create a chevron element for the overflow element
 * @return {Node}
 */
function getOverflowChevron(global) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="36px" ' +
      'height="36px" viewBox="0 0 48 48" fill="#757575"><path d="M14.83' +
      ' 16.42L24 25.59l9.17-9.17L36 19.25l-12 12-12-12z"/>' +
      '<path d="M0-.75h48v48H0z" fill="none"/> </svg>';

  const chevron = global.document.createElement('div');
  chevron.style.width = '36px';
  chevron.style.height = '36px';
  chevron.style.marginLeft = 'auto';
  chevron.style.marginRight = 'auto';
  chevron.style.display = 'block';
  chevron.innerHTML = svg;
  return chevron;
}

/**
 * Helper function to resize the height of a CSA container and its child iframe
 * @param {Object} container HTML element of the CSA container
 * @param {number} height Height to resize, in pixels
 */
function resizeCsa(container, height) {
  container.firstChild.style.height = height + 'px';
  container.style.height = height + 'px';
}
