import {loadScript, validateData} from '#3p/3p';

import {getStyle, setStyle, setStyles} from '#core/dom/style';
import {tryParseJson} from '#core/types/object/json';

import {devAssert} from '#utils/log';

// Keep track of current height of AMP iframe
let currentAmpHeight = null;

// Height of overflow element
const overflowHeight = 40;

/**
 * Enum for different AdSense Products
 * @enum {number}
 * @visibleForTesting
 */
export const AD_TYPE = {
  /** Value if we can't determine which product to request */
  UNSUPPORTED: 0,
  /** AdSense for Search */
  AFS: 1,
  /** AdSense for Shopping */
  AFSH: 2,
  /** AdSense for Shopping, backfilled with AdSense for Search */
  AFSH_BACKFILL: 3,
};

/**
 * Request Custom Search Ads (Adsense for Search or AdSense for Shopping).
 * @param {!Window} global The window object of the iframe
 * @param {!Object} data
 */
export function csa(global, data) {
  // Get parent width in case we want to override
  const width = global.document.body./*OK*/ clientWidth;

  validateData(
    data,
    [],
    [
      'afshPageOptions',
      'afshAdblockOptions',
      'afsPageOptions',
      'afsAdblockOptions',
      'ampSlotIndex',
    ]
  );

  // Add the ad container to the document
  const containerDiv = global.document.createElement('div');
  const containerId = 'csacontainer';
  containerDiv.id = containerId;
  global.document.getElementById('c').appendChild(containerDiv);

  const pageOptions = {source: 'amp', referer: global.context.referrer};
  const adblockOptions = {container: containerId};

  // Parse all the options
  const afshPage = Object.assign(
    Object(tryParseJson(data['afshPageOptions'])),
    pageOptions
  );
  const afsPage = Object.assign(
    Object(tryParseJson(data['afsPageOptions'])),
    pageOptions
  );
  const afshAd = Object.assign(
    Object(tryParseJson(data['afshAdblockOptions'])),
    adblockOptions
  );
  const afsAd = Object.assign(
    Object(tryParseJson(data['afsAdblockOptions'])),
    adblockOptions
  );

  // Special case for AFSh when "auto" is the requested width
  if (afshAd['width'] == 'auto') {
    afshAd['width'] = width;
  }

  // Event listener needed for iOS9 bug
  global.addEventListener(
    'orientationchange',
    orientationChangeHandler.bind(null, global, containerDiv)
  );

  // Only call for ads once the script has loaded
  loadScript(
    global,
    'https://www.google.com/adsense/search/ads.js',
    requestCsaAds.bind(null, global, data, afsPage, afsAd, afshPage, afshAd)
  );
}

/**
 * Resize the AMP iframe if the CSA container changes in size upon rotation.
 * This is needed for an iOS bug found in versions 10.0.1 and below that
 * doesn't properly reflow the iframe upon orientation change.
 * @param {!Window} global The window object of the iframe
 * @param {!Element} containerDiv The CSA container
 */
function orientationChangeHandler(global, containerDiv) {
  // Save the height of the container before the event listener triggers
  const oldHeight = getStyle(containerDiv, 'height');
  global.setTimeout(() => {
    // Force DOM reflow and repaint.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ignore = global.document.body./*OK*/ offsetHeight;
    // Capture new height.
    const newHeight = getStyle(containerDiv, 'height');
    // In older versions of iOS, this height will be different because the
    // container height is resized.
    // In Chrome and iOS 10.0.2 the height is the same because
    // the container isn't resized.
    if (oldHeight != newHeight && newHeight != currentAmpHeight) {
      // style.height returns "60px" (for example), so turn this into an int
      const newHeightPx = parseInt(newHeight, 10);
      // Also update the onclick function to resize to the right height.
      const overflow = global.document.getElementById('overflow');
      if (overflow) {
        overflow.onclick = () =>
          requestResizeInternal(global, containerDiv, newHeightPx);
      }
      // Resize the container to the correct height.
      requestResizeInternal(global, containerDiv, newHeightPx);
    }
  }, 250); /* 250 is time in ms to wait before executing orientation */
}

/**
 * Hanlder for when a resize request succeeds
 * Hide the overflow and resize the container
 * @param {!Window} global The window object of the iframe
 * @param {!Element} container The CSA container
 * @param {number} requestedHeight The height of the resize request
 * @visibleForTesting
 */
export function resizeSuccessHandler(global, container, requestedHeight) {
  currentAmpHeight = requestedHeight;
  const overflow = global.document.getElementById('overflow');
  if (overflow) {
    setStyle(overflow, 'display', 'none');
    resizeCsa(container, requestedHeight);
  }
}

/**
 * Hanlder for When a resize request is denied
 * If the container is larger than the AMP container and an overflow already
 * exists, show the overflow and resize the container to fit inside the AMP
 * container.  If an overflow doesn't exist, create one.
 * @param {!Window} global The window object of the iframe
 * @param {!Element} container The CSA container
 * @param {number} requestedHeight The height of the resize request
 * @visibleForTesting
 */
export function resizeDeniedHandler(global, container, requestedHeight) {
  const overflow = global.document.getElementById('overflow');
  const containerHeight = parseInt(getStyle(container, 'height'), 10);
  if (containerHeight > currentAmpHeight) {
    if (overflow) {
      setStyle(overflow, 'display', '');
      resizeCsa(container, currentAmpHeight - overflowHeight);
    } else {
      createOverflow(global, container, requestedHeight);
    }
  }
}

/**
 * Make a request for either AFS or AFSh
 * @param {!Window} global The window object of the iframe
 * @param {!Object} data The data passed in by the partner
 * @param {!Object} afsP The parsed AFS page options object
 * @param {!Object} afsA The parsed AFS adblock options object
 * @param {!Object} afshP The parsed AFSh page options object
 * @param {!Object} afshA The parsed AFSh adblock options object
 */
function requestCsaAds(global, data, afsP, afsA, afshP, afshA) {
  const type = getAdType(data);
  const callback = callbackWithNoBackfill.bind(null, global);
  const callbackBackfill = callbackWithBackfill.bind(null, global, afsP, afsA);

  switch (type) {
    case AD_TYPE.AFS:
      /** Do not backfill, request AFS */
      afsA['adLoadedCallback'] = callback;
      global._googCsa('ads', afsP, afsA);
      break;
    case AD_TYPE.AFSH:
      /** Do not backfill, request AFSh */
      afshA['adLoadedCallback'] = callback;
      global._googCsa('plas', afshP, afshA);
      break;
    case AD_TYPE.AFSH_BACKFILL:
      /** Backfill with AFS, request AFSh */
      afshA['adLoadedCallback'] = callbackBackfill;
      global._googCsa('plas', afshP, afshA);
      break;
  }
}

/**
 * Helper function to determine which product to request
 * @param {!Object} data The data passed in by the partner
 * @return {number} Enum of ad type
 */
function getAdType(data) {
  if (data['afsPageOptions'] != null && data['afshPageOptions'] == null) {
    return AD_TYPE.AFS;
  }
  if (data['afsPageOptions'] == null && data['afshPageOptions'] != null) {
    return AD_TYPE.AFSH;
  }
  if (data['afsPageOptions'] != null && data['afshPageOptions'] != null) {
    return AD_TYPE.AFSH_BACKFILL;
  } else {
    return AD_TYPE.UNSUPPORTED;
  }
}

/**
 * The adsLoadedCallback for requests without a backfill.  If ads were returned,
 * resize the iframe.  If ads weren't returned, tell AMP we don't have ads.
 * @param {!Window} global The window object of the iframe
 * @param {string} containerName The name of the CSA container
 * @param {boolean} hasAd Whether or not CSA returned an ad
 * @visibleForTesting
 */
export function callbackWithNoBackfill(global, containerName, hasAd) {
  if (hasAd) {
    resizeIframe(global, containerName);
  } else {
    global.context.noContentAvailable();
  }
}

/**
 * The adsLoadedCallback for requests with a backfill.  If ads were returned,
 * resize the iframe.  If ads weren't returned, backfill the ads.
 * @param {!Window} global The window object of the iframe
 * @param {!Object} page The parsed AFS page options to backfill the unit with
 * @param {!Object} ad The parsed AFS page options to backfill the unit with
 * @param {string} containerName The name of the CSA container
 * @param {boolean} hasAd Whether or not CSA returned an ad
 * @visibleForTesting
 */
export function callbackWithBackfill(global, page, ad, containerName, hasAd) {
  if (hasAd) {
    resizeIframe(global, containerName);
  } else {
    ad['adLoadedCallback'] = callbackWithNoBackfill.bind(null, global);
    global['_googCsa']('ads', page, ad);
  }
}

/**
 * CSA callback function to resize the iframe when ads were returned
 * @param {!Window} global
 * @param {string} containerName Name of the container ('csacontainer')
 * @visibleForTesting
 */
export function resizeIframe(global, containerName) {
  // Get actual height of container
  const container = global.document.getElementById(containerName);
  const height = container./*OK*/ offsetHeight;
  // Set initial AMP height
  currentAmpHeight =
    global.context.initialIntersection.boundingClientRect.height;

  // If the height of the container is larger than the height of the
  // initially requested AMP tag, add the overflow element
  if (height > currentAmpHeight) {
    createOverflow(global, container, height);
  }
  // Attempt to resize to actual CSA container height
  requestResizeInternal(global, devAssert(container), height);
}

/**
 * Helper function to call requestResize
 * @param {!Window} global
 * @param {!Element} container
 * @param {number} height
 */
function requestResizeInternal(global, container, height) {
  global.context
    .requestResize(undefined, height)
    .then(() => {
      resizeSuccessHandler(global, container, height);
    })
    .catch(() => {
      resizeDeniedHandler(global, container, height);
    });
}

/**
 * Helper function to create an overflow element
 * @param {!Window} global The window object of the iframe
 * @param {!Element} container HTML element of the CSA container
 * @param {number} height The full height the CSA container should be when the
 * overflow element is clicked.
 */
function createOverflow(global, container, height) {
  const overflow = getOverflowElement(global);
  // When overflow is clicked, resize to full height
  overflow.onclick = () => requestResizeInternal(global, container, height);
  global.document.getElementById('c').appendChild(overflow);
  // Resize the CSA container to not conflict with overflow
  resizeCsa(container, currentAmpHeight - overflowHeight);
}

/**
 * Helper function to create the base overflow element
 * @param {!Window} global The window object of the iframe
 * @return {!Element}
 */
function getOverflowElement(global) {
  const overflow = global.document.createElement('div');
  overflow.id = 'overflow';
  setStyles(overflow, {
    position: 'absolute',
    height: overflowHeight + 'px',
    width: '100%',
  });
  overflow.appendChild(getOverflowLine(global));
  overflow.appendChild(getOverflowChevron(global));
  return overflow;
}

/**
 * Helper function to create a line element for the overflow element
 * @param {!Window} global The window object of the iframe
 * @return {!Element}
 */
function getOverflowLine(global) {
  const line = global.document.createElement('div');
  setStyles(line, {
    background: 'rgba(0,0,0,.16)',
    height: '1px',
  });
  return line;
}

/**
 * Helper function to create a chevron element for the overflow element
 * @param {!Window} global The window object of the iframe
 * @return {!Element}
 */
function getOverflowChevron(global) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="36px" ' +
    'height="36px" viewBox="0 0 48 48" fill="#757575"><path d="M14.83' +
    ' 16.42L24 25.59l9.17-9.17L36 19.25l-12 12-12-12z"/>' +
    '<path d="M0-.75h48v48H0z" fill="none"/> </svg>';

  const chevron = global.document.createElement('div');
  setStyles(chevron, {
    width: '36px',
    height: '36px',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
  });
  chevron./*OK*/ innerHTML = svg;
  return chevron;
}

/**
 * Helper function to resize the height of a CSA container and its child iframe
 * @param {!Element} container HTML element of the CSA container
 * @param {number} height Height to resize, in pixels
 */
function resizeCsa(container, height) {
  const iframe = container.firstElementChild;
  if (iframe) {
    setStyles(iframe, {
      height: height + 'px',
      width: '100%',
    });
  }
  setStyle(container, 'height', height + 'px');
}
