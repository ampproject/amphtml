/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

/** @typedef {{name: string, value: (string|number|null)}} */
export let QueryParameterDef;

/**
 * Iframing related components result.
 * @typedef {{
 *   topAvailableWindow: !Window,
 *   topLocation: !TopLocationResult,
 *   inAdframe: boolean,
 *   iframing: string
 * }}
 */
export let IframingValuesResult;

/**
 * The topmost available URL and whether or not it is the topmost URL.
 * @typedef {{url: string, isTopUrl: boolean}}
 */
export let TopLocationResult;

/**
 * Builds a URL from query parameters, truncating to a maximum length if
 * necessary.
 * @param {string} baseUrl scheme, domain, and path for the URL.
 * @param {!Array<!QueryParameterDef>} queryParams query parameters for the URL.
 * @param {number} maxLength length to truncate the URL to if necessary.
 * @param {?QueryParameterDef=} opt_truncationQueryParam query parameter to
 *     append to the URL iff any query parameters were truncated.
 * @return {string} the fully constructed URL.
 */
export function buildUrl(
    baseUrl, queryParams, maxLength, opt_truncationQueryParam) {
  const encodedParams = [];
  const encodedTruncationParam =
      opt_truncationQueryParam &&
      !(opt_truncationQueryParam.value == null ||
      opt_truncationQueryParam.value === '') ?
      encodeURIComponent(opt_truncationQueryParam.name) + '=' +
      encodeURIComponent(String(opt_truncationQueryParam.value)) :
      null;
  let capacity = maxLength - baseUrl.length;
  if (encodedTruncationParam) {
    capacity -= encodedTruncationParam.length + 1;
  }
  for (let i = 0; i < queryParams.length; i++) {
    const param = queryParams[i];
    if (param.value == null || param.value === '') {
      continue;
    }
    const encodedNameAndSep = encodeURIComponent(param.name) + '=';
    const encodedValue = encodeURIComponent(String(param.value));
    const fullLength = encodedNameAndSep.length + encodedValue.length + 1;
    if (fullLength > capacity) {
      const truncatedValue = encodedValue
          .substr(0, capacity - encodedNameAndSep.length - 1)
      // Don't end with a partially truncated escape sequence
          .replace(/%\w?$/, '');
      if (truncatedValue) {
        encodedParams.push(encodedNameAndSep + truncatedValue);
      }
      if (encodedTruncationParam) {
        encodedParams.push(encodedTruncationParam);
      }
      break;
    }
    encodedParams.push(encodedNameAndSep + encodedValue);
    capacity -= fullLength;
  }
  if (!encodedParams.length) {
    return baseUrl;
  }
  return baseUrl + '?' + encodedParams.join('&');
}

/**
 * Generate iframing parameter value. This is used to concatenate with the
 * parameter 'frm='.
 * @param {!Window} w The window object.
 * @return {?string} Return a string integer of the parameter value.
 */
export function generateFrmAdParamValue(w) {
  const iframeComponents = getIframeMapValues(w, w.document);
  return iframeComponents.iframing || null;
}

/**
 * Get iframing parameter and related components. These components include:
 *   topAvailableWindow - the top most available window
 *   topLocation - the top most reachable url location
 *   inAdframe - infer if the script is called in a separate frame
 *   iframing - iframing value as described in getIframingParameter_().
 * @param {!Window} w The window object, values provided by AdSense snippet are
 *     read from it.
 * @param {!Document} d The document object - values will be set based on
 *     method logic and values in this object.
 * @return {!IframingValuesResult} map defining iframe
 *     components: top available window, top location url, is in ad frame and
 *     iframing result.
 */
function getIframeMapValues(w, d) {
  const iframeMap = {};
  iframeMap.topAvailableWindow = topSharedWindow(w, false).win;
  iframeMap.topLocation = getTopLocation(iframeMap.topAvailableWindow);
  const googleAdWidth = w.google_ad_width || null;
  const googleAdHeight = w.google_ad_height || null;
  iframeMap.inAdframe = isInAdFrame(window, d, googleAdWidth, googleAdHeight);
  iframeMap.iframing = getIframingParameter(
      w, iframeMap.inAdframe, iframeMap.topLocation.isTopUrl);
  return iframeMap;
}

/**
 * Finds the topmost available URL . If there is no cross-domain embedding we
 * will successfully get the top page URL. Otherwise we take URL or referrer (if
 * present) of the topmost available in-domain iframe.
 *
 * @param {!Window} topAvailableWindow the topmost writable window.
 * @return {!TopLocationResult} a map with top
 *     available URL and a boolean that defines if that URL is for the top
 *     level page.
 */
function getTopLocation(topAvailableWindow) {
  let topUrl = topAvailableWindow.location.href;
  // If we have the top level URL - we are done.
  if (topAvailableWindow == topAvailableWindow.top) {
    return {url: topUrl, isTopUrl: true};
  }
  let isTopUrl = false;
  const doc = topAvailableWindow.document;
  // We are not on the top level, but we have a referrer - use it as an URL.
  if (doc && doc.referrer) {
    topUrl = doc.referrer;
    // Besides, if we know that parent (referrer is its URL) is a top level
    // page - we have the top level URL.
    if (topAvailableWindow.parent == topAvailableWindow.top) {
      isTopUrl = true;
    }
  }
  // We are not on the top level, but Webkit provides us with a way for reading
  // the top window's origin (not the entire url). We use that in place of the
  // topUrl if the origins do not match. This can override isTopUrl as well.
  // Possible scenarios are:
  // [Origin1, Url1A] -> [Origin1, Url1B] -> [Origin2, Url2]
  //     With the above logic, we read {url: Url1B, isTopUrl: false} and this is
  //     left unchanged.
  // [Origin1, Url1] -> [Origin2, Url2] -> [Origin3, Url3]
  //     With the above logic, we read {url: Url2, isTopUrl: false} and this
  //     would change to {url: Origin1, isTopUrl: false}. False indicating here
  //     that we are not able to read the top URL, Url1.
  // [Origin1, Url1] -> [Origin2, Url2] --Redirect/Refresh--> [Origin3, Url3]
  //     With the above logic, we read {url: Url2, isTopUrl: true} and this
  //     would change to {url: Origin1, isTopUrl: false}, this is because due to
  //     the redirection (not a 300 redirect) we tend to believe, since we are
  //     one level below the top window, that our referrer is the top URL, which
  //     is not the case. On Webkit, we would potentially be able to detect
  //     that.
  // Also, note that ancestorOrigins is only available in webkit after April'12,
  // see http://goo.gl/7xv4u (Peter Beverloo blog).
  // It doesn't matter which window's ancestorOrigins we read, since
  // topAvailableWindow is the one used across this function, we will use it
  // here as well.
  const ancestorOrigins = topAvailableWindow.location.ancestorOrigins;
  if (ancestorOrigins) {
    const topOrigin = ancestorOrigins[ancestorOrigins.length - 1];
    if (topOrigin && topUrl.indexOf(topOrigin) == -1) {
      isTopUrl = false;
      topUrl = topOrigin;
    }
  }
  return {url: topUrl, isTopUrl};
}

/**
 * Infer whether the script is called in a separate iframe. This is to
 * decide if we want to do targeting towards doc.URL or doc.referrer.
 * The logic implemented is the following:
 * - if we are not in any iframe, then obviously show_ads.js is not called
 *   in a separate iframe.
 * - otherwise, we check the size of an iframe we are called in.
 * - if the iframe width or height is more than 2x ads width or height,
 *   we infer, that the iframe we are called in is not only for ads. Ie.
 *   website layout contains a navigation frame and a big main frame, which
 *   calls show_ads.js. Then we do targeting towards the big frame.
 * @param {!Window} w The window object.
 * @param {!Document} d The document object.
 * @param {number|null} adWidth The ad width.
 * @param {number|null} adHeight The ad height.
 * @return {boolean} true iff. we should use doc.referrer, not doc.URL, for
 *     targeting.
 */
function isInAdFrame(w, d, adWidth, adHeight) {
  if (!!w && w.top == w) {
    return false;
  }
  const documentElement = d.documentElement;
  if (adWidth && adHeight) {
    let wd = 1;
    let ht = 1;
    if (w.innerHeight) {
      wd = w.innerWidth;
      ht = w.innerHeight;
    } else if (documentElement && documentElement.clientHeight) {
      wd = documentElement.clientWidth;
      ht = documentElement.clientHeight;
    } else if (d.body) {
      wd = d.body.clientWidth;
      ht = d.body.clientHeight;
    }

    if (ht > 2 * adHeight || wd > 2 * adWidth) {
      return false;
    }
  }

  return true;
}

/**
 * This function walks up the iframe hierarchy looking for the friendly iframes.
 * Friendly iframes are the ones that pass the Same Origin Policy test, and are
 * therefore accessible by JavaScript in our frame.
 *
 * This function either stops at the first non-friendly frame (and returns its
 * immediate friendly child), or walks through the whole hierarchy looking for
 * the topmost friendly iframe. returnFirst flag controls this choice.
 *
 * @param {!Window} win The window object that we start from.
 * @param {boolean} returnFirst If true, the function stops on the first
 *     non-friendly window and returns the previous (friendly) iframe.
 *     Otherwise walks through the whole hierarchy, looking for the topmost
 *     friendly iframe.
 * @return {{win: !Window, level: number}} The located window and number of
 *     steps we did in order to reach it.
 */
function topSharedWindow(win, returnFirst) {
  let topLevel = 0;
  let topWindow = win;
  let level = 0;
  while (win && win != win.parent) {
    win = win.parent;
    level++;
    if (canInspectWindow(win)) {
      topWindow = win;
      topLevel = level;
    } else {
      if (returnFirst) {
        break;
      }
    }
  }
  return {win: topWindow, level: topLevel};
}

/**
 * Checks if we can access properties of the given window object.
 * False indicates this is a cross-origin window, or a same-origin
 * window where document.domain has been changed in one window.
 * @param {Window} win The window we want to access.
 * @return {boolean} True if properties of the window are accessible
 *     from the current context.
 */
function canInspectWindow(win) {
  // Note that this may not be a sufficient test as per the note found here:
  // https://cs.corp.google.com/piper///depot/google3/tagging/common/common_util.js?gsn=topmostSharedWindow&rcl=144277178&l=42
  try {
    return !!win && !!win.location && !!win.location.href;
  } catch (err) {
    return false;
  }
}

/**
 * Get "iframing" value to be set in ad query URL as "frm=" parameter.
 * This parameter is used by Adspam team.
 * Originally this parameter used to take 4 values:
 * 0 or 2 - No iframing
 * 1 or 3 - Small iframe
 * Values 2 and 3 would indicate that google_referrer_url was set.
 * These values were deprecated by cl/21490054.
 * As of 2011/05/25, the 'frm' parameter can take 10 new values:
 * 4 or 9 - No iframing
 * 5 or 10 - Same domain iframe large in at least one direction
 * 6 or 11 - Cross domain iframe large in at least one direction
 * 7 or 12 - Same domain iframe small in both directions
 * 8 or 13 - Cross domain iframe small in both directions
 * Values from 9 to 13 are used to indicate that google_referrer_url was set.
 * As of 2011/10/26, the 'frm' parameter was changed to indicate whether the
 * top url is available. The first 4 bits in the 'frm' parameter still have
 * the same meaning and can take values between 0 and 13.
 * The 5th bit is set to indicate that the top window's url is available.
 * The values where this bit is set range between 16 and 29.
 * ///////////////////////////  WARNING  ///////////////////////////////////////
 * Changes to the frm parameter below should be reflected in both the
 * bow-request-params.def where the range check should be updated as well as
 * in the Bow modifiers which process the frm parameter and use it to
 * transmit parameters for logging in the backend logs.
 * /////////////////////////////////////////////////////////////////////////////
 * There is no need to encode wether the google_page_url was set or not
 * because this will be reflected by the location parameter.
 * TODO(mturski): consider clearing the referrer_url value supplied by a
 * snippet. This is only left as a honeypot and not an intended feature.
 * @param {?Window} w The window object to read google_referrer_url from.
 * @param {boolean} inAdFrame The value of google_in_adframe() function.
 * @param {boolean} isTop True if we have access to top level URL, comes from
 *     getTopLocation() function.
 * @return {string} "iframing" value as described above. This is string
 * to ensure the value will be put in ad query URL, even if it is zero.
 * @private
 */
function getIframingParameter(w, inAdFrame, isTop) {
  const iframingState = getIframingState(window);
  let frm = NO_IFRAMING_PARAMETER;
  if (!inAdFrame && iframingState == SAME_DOMAIN_IFRAMING) {
    frm = LARGE_SAME_DOMAIN_IFRAMING_PARAMETER;
  } else if (
      !inAdFrame && iframingState == CROSS_DOMAIN_IFRAMING) {
    frm = LARGE_CROSS_DOMAIN_IFRAMING_PARAMETER;
  } else if (inAdFrame && iframingState == SAME_DOMAIN_IFRAMING) {
    frm = SMALL_SAME_DOMAIN_IFRAMING_PARAMETER;
  } else if (
      inAdFrame && iframingState == CROSS_DOMAIN_IFRAMING) {
    frm = SMALL_CROSS_DOMAIN_IFRAMING_PARAMETER;
  }
  if (isTop) {
    frm |= TOP_MASK;
  }
  // NOTE: before adding more frm values, see WARNING in function jsdoc.
  return String(frm);
}

/**
 * Gets the iframing state of the window given as an argument with respect
 * to the top window.
 * @param {!Window} w The window which iframing state relative to the top window
 *     is returned.
 * @param {boolean=} opt_avoidWarnings Whether we should avoid causing on Chrome
 *     warnings of the type "Unsafe JavaScript attempt to access frame".
 *     Avoiding such warnings, will provide a less accurate cross-domain
 *     Iframe detection, in particular when it comes to the scenario where two
 *     windows with the same origin are in cross-domain w.r.t each other because
 *     one of them is using document.domain = '' - effectively resetting the
 *     port to zero, and the other doesn't. We try to avoid the warnings using
 *     ancestorOrigins, however this is not guaranteed to be part of the API and
 *     is only available on Webkit browsers after April 2012, see
 *     http://goo.gl/7xv4u (Peter Beverloo blog).
 * @return {number} The iframing state of the window w.
 */
function getIframingState(w, opt_avoidWarnings) {
  if (w.top == w) {
    return NO_IFRAMING;
  }
  if (opt_avoidWarnings) {
    const ancestorOrigins = w.location.ancestorOrigins;
    if (ancestorOrigins) {
      return (ancestorOrigins[ancestorOrigins.length - 1] == w.location.origin
          ? SAME_DOMAIN_IFRAMING
          : CROSS_DOMAIN_IFRAMING);
    }
  }
  return canInspectWindow(w.top) ? SAME_DOMAIN_IFRAMING :
      CROSS_DOMAIN_IFRAMING;
}

/**
 * Value for the parameter indicating no iframing.
 * @type {number}
 */
const NO_IFRAMING_PARAMETER = 4;
/**
 * Value for the parameter indicating large same domain iframing.
 * @type {number}
 */
const LARGE_SAME_DOMAIN_IFRAMING_PARAMETER = 5;
/**
 * Value for the parameter indicating large cross domain iframing.
 * @type {number}
 */
const LARGE_CROSS_DOMAIN_IFRAMING_PARAMETER = 6;
/**
 * Value for the parameter indicating small same domain iframing.
 * @type {number}
 */
const SMALL_SAME_DOMAIN_IFRAMING_PARAMETER = 7;
/**
 * Value for the parameter indicating small cross domain iframing.
 * @type {number}
 */
const SMALL_CROSS_DOMAIN_IFRAMING_PARAMETER = 8;
/**
 * Bit mask for the bit indicating that &top parameter represents the URL of the
 * real top-level page.
 *
 * @type {number}
 */
const TOP_MASK = (1 << 4);
/**
 * Value for the state of no iframing.
 * @const {number}
 */
const NO_IFRAMING = 0;
/**
 * Value for the state of same domain iframing.
 * @const {number}
 */
const SAME_DOMAIN_IFRAMING = 1;
/**
 * Value for the state of cross domain iframing.
 * @const {number}
 */
const CROSS_DOMAIN_IFRAMING = 2;
