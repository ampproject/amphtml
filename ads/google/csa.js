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
  const csaContainerDiv = global.document.createElement('div');
  const containerId = 'csacontainer';
  csaContainerDiv.id = containerId;
  global.document.body.appendChild(csaContainerDiv);

  // Parse AFSh page options
  const afshPageOptions = Object.assign(
    Object(tryParseJson(data['afshPageOptions'])),
    {source: 'amp', referer: global.context.referrer});


  // Parse AFSh adblock options
  const afshAdblockOptions = Object.assign(
    Object(tryParseJson(data['afshAdblockOptions'])),
    {container: containerId});

  // Set the width to the width of the screen if necessary
  if (afshAdblockOptions != null &&
    afshAdblockOptions['width'] == 'auto') {
    afshAdblockOptions['width'] = width;
  }

  // Parse AFS page options
  const afsPageOptions = Object.assign(
    Object(tryParseJson(data['afsPageOptions'])),
    {source: 'amp', referer: global.context.referrer});

  // Parse AFS adblock options
  const afsAdblockOptions = Object.assign(
    Object(tryParseJson(data['afsAdblockOptions'])),
    {container: containerId});

  /* Time in ms to wait before executing orientation change function logic */
  const orientationChangeTimeout = 250;

  /**
   * Resize the AMP iframe if the CSA container changes in size upon rotation.
   * This is needed for an iOS bug found in versions 10.0.1 and below that
   * doesn't properly reflow the iframe upon orientation change.
   */
  global.addEventListener('orientationchange', () => {

    // Save the height of the container before the event listener triggers
    const oldHeight =
      global.document.getElementById('csacontainer').style.height;

    setTimeout(() => {

      // Force DOM reflow and repaint
      /*eslint-disable no-unused-vars*/
      const ignore = global.document.body.offsetHeight;
      /*eslint-enable no-unused-vars*/

      // Capture new height
      const container = global.document.getElementById('csacontainer');
      let newHeight = container.style.height;

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
          overflow.onclick = function() {
            global.context.requestResize(undefined, newHeight);
          };
        }

        // Resize the container to the correct height
        global.context.requestResize(undefined, newHeight);
      }

    }, orientationChangeTimeout);

  }, false);

  // Only call for ads once the script has loaded
  loadScript(global, 'https://www.google.com/adsense/search/ads.js', () => {

    // Make the call for CSA ads
    // Call the right product based on arguments passed
    if (data['afsPageOptions'] != null && data['afshPageOptions'] == null) {
      // AFS only

      // Add a callback without any backfill options
      afsAdblockOptions['adLoadedCallback'] =
        resizeIframe.bind(null, global, null, null);

      global._googCsa('ads', afsPageOptions, afsAdblockOptions);

    } else if (data['afsPageOptions'] == null
      && data['afshPageOptions'] != null) {
      // AFSH only

      // Create the callback without any backfill options
      afshAdblockOptions['adLoadedCallback'] =
        resizeIframe.bind(null, global, null, null);

      global._googCsa('plas', afshPageOptions, afshAdblockOptions);

    } else if (data['afsPageOptions'] != null
      && data['afshPageOptions'] != null) {
      // AFSh backfilled with AFS

      // Create a callback with the AFS options
      afshAdblockOptions['adLoadedCallback'] =
        resizeIframe.bind(null, global, afsPageOptions, afsAdblockOptions);

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

    // Get actual height and width of container
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

    // Listen for success
    global.context.onResizeSuccess(function(requestedHeight) {

      currentAmpHeight = requestedHeight;

      const overflow = global.document.getElementById('overflow');

      // Hide overflow and resize container to full height
      if (overflow) {
        overflow.style.display = 'none';
        resizeCsa(container, requestedHeight);
      }

    });

    global.context.onResizeDenied(function(requestedHeight) {
      const overflow = global.document.getElementById('overflow');
      const containerHeight =
      parseInt(global.document.getElementById('csacontainer').style.height, 10);

      if (containerHeight > currentAmpHeight) {

        // Show overflow element and resize container to include overflow
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
    if (backfillPageOptions != null &&
        backfillAdblockOptions != null) {

      const _googCsa = global['_googCsa'];

      backfillAdblockOptions['adLoadedCallback'] =
        resizeIframe.bind(null, global, null, null);

      // Call AFS
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
  // Create the element with line and chevron
  const overflow = getOverflowElement(global, overflowH);
  overflow.appendChild(getOverflowLine(global));
  overflow.appendChild(getOverflowChevron(global));

  // When the overflow element is clicked, resize the AMP iframe
  // to what we tried to resize before
  overflow.onclick = function() {
    global.context.requestResize(undefined, fullH);
  };

  // Add overflow to global.document and resize container as necessary
  global.document.body.appendChild(overflow);
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
