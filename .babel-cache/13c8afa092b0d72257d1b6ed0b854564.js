function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { RENDERING_TYPE_HEADER, XORIGIN_MODE } from "../../amp-a4a/0.1/amp-a4a";
import { dev, devAssert } from "../../../src/log";
import { getEnclosingContainerTypes } from "../../../ads/google/a4a/utils";
import { getPageLayoutBoxBlocking } from "../../../src/core/dom/layout/page-layout-box";
import { isInManualExperiment } from "../../../ads/google/a4a/traffic-experiments";
import { isObject } from "../../../src/core/types";
import { tryResolve } from "../../../src/core/data-structures/promise";
import { utf8Encode } from "../../../src/core/types/string/bytes";

/** @type {string} */
var TAG = 'amp-ad-network-doubleclick-impl';

/**
 * @const {string}
 * @visibleForTesting
 */
export var TFCD = 'tagForChildDirectedTreatment';

/** @private {!Array<function(!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>):?Object<string,string>>} */
var SRA_JOINERS = [combineInventoryUnits, getCookieOptOut, getAdks, getSizes, getTfcd, isAdTest, getTargetingAndExclusions, getExperimentIds, getIdentity, getForceSafeframe, getPageOffsets, getContainers, getIsFluid];

/**
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {!Object<string, *>}
 */
export function constructSRABlockParameters(impls) {
  var parameters = {
    'output': 'ldjh',
    'impl': 'fifs'
  };
  SRA_JOINERS.forEach(function (joiner) {
    return Object.assign(parameters, joiner(impls));
  });
  return parameters;
}

/**
 * Given array of instances, execute extractFn on each and return first non-
 * falsey value or null if none are truthy.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @param {function(!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl):?T} extractFn
 * @return {?T} value of first instance with non-null/undefined value or null
 *    if none can be found
 * @template T
 * @private
 */
function getFirstInstanceValue_(impls, extractFn) {
  for (var i = 0; i < impls.length; i++) {
    var val = extractFn(impls[i]);

    if (val) {
      return val;
    }
  }

  return null;
}

/**
 * Combines inventory unit paths for multiple blocks by building list of
 * unique path parts in iu_parts and then comma separated list of block
 * paths using index into iu_parts list.
 * Example: /123/foo/bar and /blah/foo/bar/123 =>
 *    iu_parts=123,foo,bar,blah & enc_prev_ius=/0/1/2,/3/1/2/0
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function combineInventoryUnits(impls) {
  var uniqueIuNames = {};
  var iuNamesOutput = [];
  var uniqueIuNamesCount = 0;
  var prevIusEncoded = [];
  impls.forEach(function (instance) {
    var iu = devAssert(instance.element.getAttribute('data-slot'));
    var componentNames = iu.split('/');
    var encodedNames = [];

    for (var i = 0; i < componentNames.length; i++) {
      if (componentNames[i] == '') {
        continue;
      }

      var index = uniqueIuNames[componentNames[i]];

      if (index == undefined) {
        iuNamesOutput.push(componentNames[i]);
        uniqueIuNames[componentNames[i]] = index = uniqueIuNamesCount++;
      }

      encodedNames.push(index);
    }

    prevIusEncoded.push(encodedNames.join('/'));
  });
  return {
    'iu_parts': iuNamesOutput.join(),
    'enc_prev_ius': prevIusEncoded.join()
  };
}

/**
 * Indicates SRA request is cookie opt out if any of the blocks includes
 * cookie opt out in targeting.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getCookieOptOut(impls) {
  return getFirstInstanceValue_(impls, function (impl) {
    return impl.jsonTargeting && impl.jsonTargeting['cookieOptOut'] ? {
      'co': '1'
    } : null;
  });
}

/**
 * Combine ad unit key of each block via comma separated values.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getAdks(impls) {
  return {
    'adks': impls.map(function (impl) {
      return devAssert(impl.adKey);
    }).join()
  };
}

/**
 * Combine block sizes via comma separated values.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getSizes(impls) {
  return {
    'prev_iu_szs': impls.map(function (impl) {
      return devAssert(impl.parameterSize);
    }).join()
  };
}

/**
 * Indicate SRA request is tagForChildDirectedTreatment if any blocks includes
 * in targeting.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getTfcd(impls) {
  return getFirstInstanceValue_(impls, function (impl) {
    return impl.jsonTargeting && impl.jsonTargeting[TFCD] ? {
      'tfcd': impl.jsonTargeting[TFCD]
    } : null;
  });
}

/**
 * Indicate SRA request should include adtest=on if any block includes the
 * manual experiment id.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function isAdTest(impls) {
  return getFirstInstanceValue_(impls, function (impl) {
    return isInManualExperiment(impl.element) ? {
      'adtest': 'on'
    } : null;
  });
}

/**
 * Join block targeting values by separating by pipes (each key/value pair for
 * a given block is separated by =) and exclusions are given special excl_cat
 * key (list of categories are comma separated).
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getTargetingAndExclusions(impls) {
  var commonKVs = null;

  var _loop = function _loop(i) {
    var impl = impls[i];

    if (!impl.jsonTargeting || !impl.jsonTargeting['targeting']) {
      commonKVs = null;
      return "break";
    }

    if (commonKVs) {
      Object.keys(commonKVs).map(function (key) {
        if (commonKVs[key] != impl.jsonTargeting['targeting'][key]) {
          delete commonKVs[key];
        }
      });
    } else {
      // Need to create a copy otherwise later delete operations will modify
      // first slot's targeting.
      commonKVs = _extends({}, impl.jsonTargeting['targeting']);
    }
  };

  // Find common key/values.
  for (var i = 0; i < impls.length; i++) {
    var _ret = _loop(i);

    if (_ret === "break") break;
  }

  var hasScp = false;
  var scps = [];

  var hasTargeting = function hasTargeting(impl) {
    return impl.jsonTargeting && (impl.jsonTargeting['targeting'] || impl.jsonTargeting['categoryExclusions']);
  };

  impls.forEach(function (impl) {
    if (hasTargeting(impl)) {
      hasScp = true;
      scps.push(serializeTargeting(impl.jsonTargeting['targeting'] || null, impl.jsonTargeting['categoryExclusions'] || null, commonKVs));
    } else {
      scps.push('');
    }
  });

  if (!commonKVs && !hasScp) {
    return null;
  }

  var result = {};

  if (commonKVs && Object.keys(commonKVs).length) {
    result['csp'] = serializeTargeting(commonKVs, null, null);
  }

  if (hasScp) {
    result['prev_scp'] = scps.join('|');
  }

  return result;
}

/**
 * Experiment ids are assumed to be page level given that is all that is
 * supported for SRA requests therefore block values are combined by building
 * the unique set of experiment ids which are comma separated (order does not
 * matter).
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getExperimentIds(impls) {
  var eids = {};
  var deid = impls.length && /(?:#|,)deid=([\d,]+)/i.exec(impls[0].win.location.hash) || [];

  /** @type {!Array} */
  (deid[1] || '').split(',').forEach(function (eid) {
    return eid && (eids[eid] = 1);
  });
  impls.forEach(function (impl) {
    return impl.experimentIds.forEach(function (eid) {
      return eids[eid] = 1;
    });
  });
  var eidKeys = Object.keys(eids).join();
  return eidKeys ? {
    'eid': eidKeys
  } : null;
}

/**
 * Identity token is page level therefore SRA uses the value of the first
 * block.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getIdentity(impls) {
  return getFirstInstanceValue_(impls, function (impl) {
    return impl.buildIdentityParams();
  });
}

/**
 * Combine force safeframe values for each block via comma separated numeric
 * values based on boolean value (e.g. false = 0, true = 1).  If none of the
 * blocks has force safeframe, parameter is not included in SRA request.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getForceSafeframe(impls) {
  var safeframeForced = false;
  var forceSafeframes = [];
  impls.forEach(function (impl) {
    safeframeForced = safeframeForced || impl.forceSafeframe;
    forceSafeframes.push(Number(impl.forceSafeframe));
  });
  return safeframeForced ? {
    'fsfs': forceSafeframes.join()
  } : null;
}

/**
 * Combine page offset info for each block by constructing separate parameter
 * for left (adxs) and top (adyx) via comma separated.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getPageOffsets(impls) {
  var adxs = [];
  var adys = [];
  impls.forEach(function (impl) {
    var layoutBox = getPageLayoutBoxBlocking(impl.element);
    adxs.push(layoutBox.left);
    adys.push(layoutBox.top);
  });
  return {
    'adxs': adxs.join(),
    'adys': adys.join()
  };
}

/**
 * Combine which containers exist for each block (e.g. sticky) via pipe
 * separator (as block can have multiple values that are comma separated).  If
 * none of the blocks have a container, then parameter is not sent.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getContainers(impls) {
  var hasAmpContainer = false;
  var result = [];
  impls.forEach(function (impl) {
    var containers = getEnclosingContainerTypes(impl.element);
    result.push(containers.join());
    hasAmpContainer = hasAmpContainer || !!containers.length;
  });
  return hasAmpContainer ? {
    'acts': result.join('|')
  } : null;
}

/**
 * Combine fluid settings for each block via comma separator.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getIsFluid(impls) {
  var hasFluid = false;
  var result = [];
  impls.forEach(function (impl) {
    if (impl.isFluidRequest()) {
      hasFluid = true;
      result.push('height');
    } else {
      result.push('0');
    }
  });
  return hasFluid ? {
    'fluid': result.join()
  } : null;
}

/**
 * @param {?Object<string, (!Array<string>|string)>} targeting
 * @param {?(!Array<string>|string)} categoryExclusions
 * @param {?Object<string, (!Array<string>|string)>} commonTargeting
 * @return {?string}
 */
export function serializeTargeting(targeting, categoryExclusions, commonTargeting) {
  var serialized = targeting ? Object.keys(targeting).filter(function (key) {
    return !commonTargeting || commonTargeting[key] === undefined;
  }).map(function (key) {
    return serializeItem_(key, targeting[key]);
  }) : [];

  if (categoryExclusions) {
    serialized.push(serializeItem_('excl_cat', categoryExclusions));
  }

  return serialized.length ? serialized.join('&') : null;
}

/**
 * @param {string} key
 * @param {(!Array<string>|string)} value
 * @return {string}
 * @private
 */
function serializeItem_(key, value) {
  var serializedValue = (Array.isArray(value) ? value : [value]).map(encodeURIComponent).join();
  return encodeURIComponent(key) + "=" + serializedValue;
}

/**
 * Callback for streaming SRA response given creative and JSON parsed Object
 * containing headers (as if request had been sent via non-SRA flow).  Creative
 * and headers object is converted to XHR FetchResponse object and passed to
 * resolver popped off stack of resolvers (in order of expected block responses)
 * such that sendXhrRequest is resolved from standard A4A flow.  Done boolean
 * used to verify array of resolvers is empty once all results are returned.
 * @param {string} creative
 * @param {!Object<string,string>} headersObj
 * @param {boolean} done
 * @param {!Array<function(?Response)>} sraRequestAdUrlResolvers
 * @param {string} sraUrl url of SRA request for error reporting
 * @param {boolean=} isNoSigning
 */
export function sraBlockCallbackHandler(creative, headersObj, done, sraRequestAdUrlResolvers, sraUrl, isNoSigning) {
  var headerNames = Object.keys(headersObj);

  if (headerNames.length == 1 && isObject(headersObj[headerNames[0]])) {
    // TODO(keithwrightbos) - fix upstream so response does
    // not improperly place headers under key.
    headersObj =
    /** @type {!Object} */
    headersObj[headerNames[0]];
    headersObj = Object.keys(headersObj).reduce(function (newObj, key) {
      newObj[key.toLowerCase()] = headersObj[key];
      return newObj;
    }, {});
  }

  // Force safeframe rendering method.
  headersObj[RENDERING_TYPE_HEADER.toLowerCase()] = XORIGIN_MODE.SAFEFRAME;
  // Construct pseudo fetch response to be passed down the A4A
  // promise chain for this block.
  var headers =
  /** @type {?Headers} */
  {
    get: function get(name) {
      // TODO(keithwrightbos) - fix upstream so response writes
      // all metadata values as strings.
      var header = headersObj[name.toLowerCase()];

      if (header && typeof header != 'string') {
        header = JSON.stringify(header);
      }

      return header;
    },
    has: function has(name) {
      return !!headersObj[name.toLowerCase()];
    }
  };
  var fetchResponse;

  if (isNoSigning) {
    var stringifiedHeaders = stringifyHeaderValues(headersObj);
    fetchResponse = new Response(creative, {
      headers: stringifiedHeaders
    });
  } else {
    fetchResponse =
    /** @type {?Response} */
    {
      headers: headers,
      arrayBuffer: function arrayBuffer() {
        return tryResolve(function () {
          return utf8Encode(creative);
        });
      }
    };
  }

  // Pop head off of the array of resolvers as the response
  // should match the order of blocks declared in the ad url.
  // This allows the block to start rendering while the SRA
  // response is streaming back to the client.
  devAssert(sraRequestAdUrlResolvers.shift())(fetchResponse);

  // If done, expect array to be empty (ensures ad response
  // included data for all slots).
  if (done && sraRequestAdUrlResolvers.length) {
    dev().warn(TAG, 'Premature end of SRA response', sraRequestAdUrlResolvers.length, sraUrl);
  }
}

/**
 * Takes any parsed header values from the object that are not strings and
 * converts them back to the orginal stringified version.
 * TODO above indicates this might get fixed upstream at some point.
 * @param {!Object} headersObj
 * @return {!Object<string, string>}
 */
function stringifyHeaderValues(headersObj) {
  return Object.keys(headersObj).reduce(function (stringifiedHeaders, headerName) {
    var headerValue = headersObj[headerName];

    if (headerValue && typeof headerValue != 'string') {
      headerValue = JSON.stringify(headerValue);
    }

    stringifiedHeaders[headerName] = headerValue;
    return stringifiedHeaders;
  }, {});
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYS11dGlscy5qcyJdLCJuYW1lcyI6WyJSRU5ERVJJTkdfVFlQRV9IRUFERVIiLCJYT1JJR0lOX01PREUiLCJkZXYiLCJkZXZBc3NlcnQiLCJnZXRFbmNsb3NpbmdDb250YWluZXJUeXBlcyIsImdldFBhZ2VMYXlvdXRCb3hCbG9ja2luZyIsImlzSW5NYW51YWxFeHBlcmltZW50IiwiaXNPYmplY3QiLCJ0cnlSZXNvbHZlIiwidXRmOEVuY29kZSIsIlRBRyIsIlRGQ0QiLCJTUkFfSk9JTkVSUyIsImNvbWJpbmVJbnZlbnRvcnlVbml0cyIsImdldENvb2tpZU9wdE91dCIsImdldEFka3MiLCJnZXRTaXplcyIsImdldFRmY2QiLCJpc0FkVGVzdCIsImdldFRhcmdldGluZ0FuZEV4Y2x1c2lvbnMiLCJnZXRFeHBlcmltZW50SWRzIiwiZ2V0SWRlbnRpdHkiLCJnZXRGb3JjZVNhZmVmcmFtZSIsImdldFBhZ2VPZmZzZXRzIiwiZ2V0Q29udGFpbmVycyIsImdldElzRmx1aWQiLCJjb25zdHJ1Y3RTUkFCbG9ja1BhcmFtZXRlcnMiLCJpbXBscyIsInBhcmFtZXRlcnMiLCJmb3JFYWNoIiwiam9pbmVyIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0Rmlyc3RJbnN0YW5jZVZhbHVlXyIsImV4dHJhY3RGbiIsImkiLCJsZW5ndGgiLCJ2YWwiLCJ1bmlxdWVJdU5hbWVzIiwiaXVOYW1lc091dHB1dCIsInVuaXF1ZUl1TmFtZXNDb3VudCIsInByZXZJdXNFbmNvZGVkIiwiaW5zdGFuY2UiLCJpdSIsImVsZW1lbnQiLCJnZXRBdHRyaWJ1dGUiLCJjb21wb25lbnROYW1lcyIsInNwbGl0IiwiZW5jb2RlZE5hbWVzIiwiaW5kZXgiLCJ1bmRlZmluZWQiLCJwdXNoIiwiam9pbiIsImltcGwiLCJqc29uVGFyZ2V0aW5nIiwibWFwIiwiYWRLZXkiLCJwYXJhbWV0ZXJTaXplIiwiY29tbW9uS1ZzIiwia2V5cyIsImtleSIsImhhc1NjcCIsInNjcHMiLCJoYXNUYXJnZXRpbmciLCJzZXJpYWxpemVUYXJnZXRpbmciLCJyZXN1bHQiLCJlaWRzIiwiZGVpZCIsImV4ZWMiLCJ3aW4iLCJsb2NhdGlvbiIsImhhc2giLCJlaWQiLCJleHBlcmltZW50SWRzIiwiZWlkS2V5cyIsImJ1aWxkSWRlbnRpdHlQYXJhbXMiLCJzYWZlZnJhbWVGb3JjZWQiLCJmb3JjZVNhZmVmcmFtZXMiLCJmb3JjZVNhZmVmcmFtZSIsIk51bWJlciIsImFkeHMiLCJhZHlzIiwibGF5b3V0Qm94IiwibGVmdCIsInRvcCIsImhhc0FtcENvbnRhaW5lciIsImNvbnRhaW5lcnMiLCJoYXNGbHVpZCIsImlzRmx1aWRSZXF1ZXN0IiwidGFyZ2V0aW5nIiwiY2F0ZWdvcnlFeGNsdXNpb25zIiwiY29tbW9uVGFyZ2V0aW5nIiwic2VyaWFsaXplZCIsImZpbHRlciIsInNlcmlhbGl6ZUl0ZW1fIiwidmFsdWUiLCJzZXJpYWxpemVkVmFsdWUiLCJBcnJheSIsImlzQXJyYXkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJzcmFCbG9ja0NhbGxiYWNrSGFuZGxlciIsImNyZWF0aXZlIiwiaGVhZGVyc09iaiIsImRvbmUiLCJzcmFSZXF1ZXN0QWRVcmxSZXNvbHZlcnMiLCJzcmFVcmwiLCJpc05vU2lnbmluZyIsImhlYWRlck5hbWVzIiwicmVkdWNlIiwibmV3T2JqIiwidG9Mb3dlckNhc2UiLCJTQUZFRlJBTUUiLCJoZWFkZXJzIiwiZ2V0IiwibmFtZSIsImhlYWRlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJoYXMiLCJmZXRjaFJlc3BvbnNlIiwic3RyaW5naWZpZWRIZWFkZXJzIiwic3RyaW5naWZ5SGVhZGVyVmFsdWVzIiwiUmVzcG9uc2UiLCJhcnJheUJ1ZmZlciIsInNoaWZ0Iiwid2FybiIsImhlYWRlck5hbWUiLCJoZWFkZXJWYWx1ZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxxQkFBUixF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aUJBQU1DLFVBQVUsQ0FBQzRGLFFBQUQsQ0FBaEI7QUFBQSxTQUFELENBQWhCO0FBQUE7QUFGZCxLQUZIO0FBTUQ7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQWxHLEVBQUFBLFNBQVMsQ0FBQ3FHLHdCQUF3QixDQUFDb0IsS0FBekIsRUFBRCxDQUFULENBQTRDTCxhQUE1Qzs7QUFDQTtBQUNBO0FBQ0EsTUFBSWhCLElBQUksSUFBSUMsd0JBQXdCLENBQUNwRSxNQUFyQyxFQUE2QztBQUMzQ2xDLElBQUFBLEdBQUcsR0FBRzJILElBQU4sQ0FDRW5ILEdBREYsRUFFRSwrQkFGRixFQUdFOEYsd0JBQXdCLENBQUNwRSxNQUgzQixFQUlFcUUsTUFKRjtBQU1EO0FBQ0Y7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTZ0IscUJBQVQsQ0FBK0JuQixVQUEvQixFQUEyQztBQUN6QyxTQUFPdkUsTUFBTSxDQUFDNEIsSUFBUCxDQUFZMkMsVUFBWixFQUF3Qk0sTUFBeEIsQ0FBK0IsVUFBQ1ksa0JBQUQsRUFBcUJNLFVBQXJCLEVBQW9DO0FBQ3hFLFFBQUlDLFdBQVcsR0FBR3pCLFVBQVUsQ0FBQ3dCLFVBQUQsQ0FBNUI7O0FBQ0EsUUFBSUMsV0FBVyxJQUFJLE9BQU9BLFdBQVAsSUFBc0IsUUFBekMsRUFBbUQ7QUFDakRBLE1BQUFBLFdBQVcsR0FBR1gsSUFBSSxDQUFDQyxTQUFMLENBQWVVLFdBQWYsQ0FBZDtBQUNEOztBQUNEUCxJQUFBQSxrQkFBa0IsQ0FBQ00sVUFBRCxDQUFsQixHQUFpQ0MsV0FBakM7QUFDQSxXQUFPUCxrQkFBUDtBQUNELEdBUE0sRUFPSixFQVBJLENBQVA7QUFRRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTggVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1JFTkRFUklOR19UWVBFX0hFQURFUiwgWE9SSUdJTl9NT0RFfSBmcm9tICcuLi8uLi9hbXAtYTRhLzAuMS9hbXAtYTRhJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtnZXRFbmNsb3NpbmdDb250YWluZXJUeXBlc30gZnJvbSAnI2Fkcy9nb29nbGUvYTRhL3V0aWxzJztcbmltcG9ydCB7Z2V0UGFnZUxheW91dEJveEJsb2NraW5nfSBmcm9tICcjY29yZS9kb20vbGF5b3V0L3BhZ2UtbGF5b3V0LWJveCc7XG5pbXBvcnQge2lzSW5NYW51YWxFeHBlcmltZW50fSBmcm9tICcjYWRzL2dvb2dsZS9hNGEvdHJhZmZpYy1leHBlcmltZW50cyc7XG5pbXBvcnQge2lzT2JqZWN0fSBmcm9tICcjY29yZS90eXBlcyc7XG5pbXBvcnQge3RyeVJlc29sdmV9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcbmltcG9ydCB7dXRmOEVuY29kZX0gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL2J5dGVzJztcblxuLyoqIEB0eXBlIHtzdHJpbmd9ICovXG5jb25zdCBUQUcgPSAnYW1wLWFkLW5ldHdvcmstZG91YmxlY2xpY2staW1wbCc7XG5cbi8qKlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IFRGQ0QgPSAndGFnRm9yQ2hpbGREaXJlY3RlZFRyZWF0bWVudCc7XG5cbi8qKiBAcHJpdmF0ZSB7IUFycmF5PGZ1bmN0aW9uKCFBcnJheTwhLi9hbXAtYWQtbmV0d29yay1kb3VibGVjbGljay1pbXBsLkFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbD4pOj9PYmplY3Q8c3RyaW5nLHN0cmluZz4+fSAqL1xuY29uc3QgU1JBX0pPSU5FUlMgPSBbXG4gIGNvbWJpbmVJbnZlbnRvcnlVbml0cyxcbiAgZ2V0Q29va2llT3B0T3V0LFxuICBnZXRBZGtzLFxuICBnZXRTaXplcyxcbiAgZ2V0VGZjZCxcbiAgaXNBZFRlc3QsXG4gIGdldFRhcmdldGluZ0FuZEV4Y2x1c2lvbnMsXG4gIGdldEV4cGVyaW1lbnRJZHMsXG4gIGdldElkZW50aXR5LFxuICBnZXRGb3JjZVNhZmVmcmFtZSxcbiAgZ2V0UGFnZU9mZnNldHMsXG4gIGdldENvbnRhaW5lcnMsXG4gIGdldElzRmx1aWQsXG5dO1xuXG4vKipcbiAqIEBwYXJhbSB7IUFycmF5PCEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsPn0gaW1wbHNcbiAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCAqPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0cnVjdFNSQUJsb2NrUGFyYW1ldGVycyhpbXBscykge1xuICBjb25zdCBwYXJhbWV0ZXJzID0geydvdXRwdXQnOiAnbGRqaCcsICdpbXBsJzogJ2ZpZnMnfTtcbiAgU1JBX0pPSU5FUlMuZm9yRWFjaCgoam9pbmVyKSA9PiBPYmplY3QuYXNzaWduKHBhcmFtZXRlcnMsIGpvaW5lcihpbXBscykpKTtcbiAgcmV0dXJuIHBhcmFtZXRlcnM7XG59XG5cbi8qKlxuICogR2l2ZW4gYXJyYXkgb2YgaW5zdGFuY2VzLCBleGVjdXRlIGV4dHJhY3RGbiBvbiBlYWNoIGFuZCByZXR1cm4gZmlyc3Qgbm9uLVxuICogZmFsc2V5IHZhbHVlIG9yIG51bGwgaWYgbm9uZSBhcmUgdHJ1dGh5LlxuICogQHBhcmFtIHshQXJyYXk8IS4vYW1wLWFkLW5ldHdvcmstZG91YmxlY2xpY2staW1wbC5BbXBBZE5ldHdvcmtEb3VibGVjbGlja0ltcGw+fSBpbXBsc1xuICogQHBhcmFtIHtmdW5jdGlvbighLi9hbXAtYWQtbmV0d29yay1kb3VibGVjbGljay1pbXBsLkFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbCk6P1R9IGV4dHJhY3RGblxuICogQHJldHVybiB7P1R9IHZhbHVlIG9mIGZpcnN0IGluc3RhbmNlIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlIG9yIG51bGxcbiAqICAgIGlmIG5vbmUgY2FuIGJlIGZvdW5kXG4gKiBAdGVtcGxhdGUgVFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZ2V0Rmlyc3RJbnN0YW5jZVZhbHVlXyhpbXBscywgZXh0cmFjdEZuKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW1wbHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB2YWwgPSBleHRyYWN0Rm4oaW1wbHNbaV0pO1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIENvbWJpbmVzIGludmVudG9yeSB1bml0IHBhdGhzIGZvciBtdWx0aXBsZSBibG9ja3MgYnkgYnVpbGRpbmcgbGlzdCBvZlxuICogdW5pcXVlIHBhdGggcGFydHMgaW4gaXVfcGFydHMgYW5kIHRoZW4gY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgYmxvY2tcbiAqIHBhdGhzIHVzaW5nIGluZGV4IGludG8gaXVfcGFydHMgbGlzdC5cbiAqIEV4YW1wbGU6IC8xMjMvZm9vL2JhciBhbmQgL2JsYWgvZm9vL2Jhci8xMjMgPT5cbiAqICAgIGl1X3BhcnRzPTEyMyxmb28sYmFyLGJsYWggJiBlbmNfcHJldl9pdXM9LzAvMS8yLC8zLzEvMi8wXG4gKiBAcGFyYW0geyFBcnJheTwhLi9hbXAtYWQtbmV0d29yay1kb3VibGVjbGljay1pbXBsLkFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbD59IGltcGxzXG4gKiBAcmV0dXJuIHs/T2JqZWN0PHN0cmluZyxzdHJpbmc+fVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lSW52ZW50b3J5VW5pdHMoaW1wbHMpIHtcbiAgY29uc3QgdW5pcXVlSXVOYW1lcyA9IHt9O1xuICBjb25zdCBpdU5hbWVzT3V0cHV0ID0gW107XG4gIGxldCB1bmlxdWVJdU5hbWVzQ291bnQgPSAwO1xuICBjb25zdCBwcmV2SXVzRW5jb2RlZCA9IFtdO1xuICBpbXBscy5mb3JFYWNoKChpbnN0YW5jZSkgPT4ge1xuICAgIGNvbnN0IGl1ID0gZGV2QXNzZXJ0KGluc3RhbmNlLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXNsb3QnKSk7XG4gICAgY29uc3QgY29tcG9uZW50TmFtZXMgPSBpdS5zcGxpdCgnLycpO1xuICAgIGNvbnN0IGVuY29kZWROYW1lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcG9uZW50TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChjb21wb25lbnROYW1lc1tpXSA9PSAnJykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGxldCBpbmRleCA9IHVuaXF1ZUl1TmFtZXNbY29tcG9uZW50TmFtZXNbaV1dO1xuICAgICAgaWYgKGluZGV4ID09IHVuZGVmaW5lZCkge1xuICAgICAgICBpdU5hbWVzT3V0cHV0LnB1c2goY29tcG9uZW50TmFtZXNbaV0pO1xuICAgICAgICB1bmlxdWVJdU5hbWVzW2NvbXBvbmVudE5hbWVzW2ldXSA9IGluZGV4ID0gdW5pcXVlSXVOYW1lc0NvdW50Kys7XG4gICAgICB9XG4gICAgICBlbmNvZGVkTmFtZXMucHVzaChpbmRleCk7XG4gICAgfVxuICAgIHByZXZJdXNFbmNvZGVkLnB1c2goZW5jb2RlZE5hbWVzLmpvaW4oJy8nKSk7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgICdpdV9wYXJ0cyc6IGl1TmFtZXNPdXRwdXQuam9pbigpLFxuICAgICdlbmNfcHJldl9pdXMnOiBwcmV2SXVzRW5jb2RlZC5qb2luKCksXG4gIH07XG59XG5cbi8qKlxuICogSW5kaWNhdGVzIFNSQSByZXF1ZXN0IGlzIGNvb2tpZSBvcHQgb3V0IGlmIGFueSBvZiB0aGUgYmxvY2tzIGluY2x1ZGVzXG4gKiBjb29raWUgb3B0IG91dCBpbiB0YXJnZXRpbmcuXG4gKiBAcGFyYW0geyFBcnJheTwhLi9hbXAtYWQtbmV0d29yay1kb3VibGVjbGljay1pbXBsLkFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbD59IGltcGxzXG4gKiBAcmV0dXJuIHs/T2JqZWN0PHN0cmluZyxzdHJpbmc+fVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb29raWVPcHRPdXQoaW1wbHMpIHtcbiAgcmV0dXJuIGdldEZpcnN0SW5zdGFuY2VWYWx1ZV8oaW1wbHMsIChpbXBsKSA9PlxuICAgIGltcGwuanNvblRhcmdldGluZyAmJiBpbXBsLmpzb25UYXJnZXRpbmdbJ2Nvb2tpZU9wdE91dCddXG4gICAgICA/IHsnY28nOiAnMSd9XG4gICAgICA6IG51bGxcbiAgKTtcbn1cblxuLyoqXG4gKiBDb21iaW5lIGFkIHVuaXQga2V5IG9mIGVhY2ggYmxvY2sgdmlhIGNvbW1hIHNlcGFyYXRlZCB2YWx1ZXMuXG4gKiBAcGFyYW0geyFBcnJheTwhLi9hbXAtYWQtbmV0d29yay1kb3VibGVjbGljay1pbXBsLkFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbD59IGltcGxzXG4gKiBAcmV0dXJuIHs/T2JqZWN0PHN0cmluZyxzdHJpbmc+fVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBZGtzKGltcGxzKSB7XG4gIHJldHVybiB7J2Fka3MnOiBpbXBscy5tYXAoKGltcGwpID0+IGRldkFzc2VydChpbXBsLmFkS2V5KSkuam9pbigpfTtcbn1cblxuLyoqXG4gKiBDb21iaW5lIGJsb2NrIHNpemVzIHZpYSBjb21tYSBzZXBhcmF0ZWQgdmFsdWVzLlxuICogQHBhcmFtIHshQXJyYXk8IS4vYW1wLWFkLW5ldHdvcmstZG91YmxlY2xpY2staW1wbC5BbXBBZE5ldHdvcmtEb3VibGVjbGlja0ltcGw+fSBpbXBsc1xuICogQHJldHVybiB7P09iamVjdDxzdHJpbmcsc3RyaW5nPn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2l6ZXMoaW1wbHMpIHtcbiAgcmV0dXJuIHtcbiAgICAncHJldl9pdV9zenMnOiBpbXBscy5tYXAoKGltcGwpID0+IGRldkFzc2VydChpbXBsLnBhcmFtZXRlclNpemUpKS5qb2luKCksXG4gIH07XG59XG5cbi8qKlxuICogSW5kaWNhdGUgU1JBIHJlcXVlc3QgaXMgdGFnRm9yQ2hpbGREaXJlY3RlZFRyZWF0bWVudCBpZiBhbnkgYmxvY2tzIGluY2x1ZGVzXG4gKiBpbiB0YXJnZXRpbmcuXG4gKiBAcGFyYW0geyFBcnJheTwhLi9hbXAtYWQtbmV0d29yay1kb3VibGVjbGljay1pbXBsLkFtcEFkTmV0d29ya0RvdWJsZWNsaWNrSW1wbD59IGltcGxzXG4gKiBAcmV0dXJuIHs/T2JqZWN0PHN0cmluZyxzdHJpbmc+fVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZmNkKGltcGxzKSB7XG4gIHJldHVybiBnZXRGaXJzdEluc3RhbmNlVmFsdWVfKGltcGxzLCAoaW1wbCkgPT5cbiAgICBpbXBsLmpzb25UYXJnZXRpbmcgJiYgaW1wbC5qc29uVGFyZ2V0aW5nW1RGQ0RdXG4gICAgICA/IHsndGZjZCc6IGltcGwuanNvblRhcmdldGluZ1tURkNEXX1cbiAgICAgIDogbnVsbFxuICApO1xufVxuXG4vKipcbiAqIEluZGljYXRlIFNSQSByZXF1ZXN0IHNob3VsZCBpbmNsdWRlIGFkdGVzdD1vbiBpZiBhbnkgYmxvY2sgaW5jbHVkZXMgdGhlXG4gKiBtYW51YWwgZXhwZXJpbWVudCBpZC5cbiAqIEBwYXJhbSB7IUFycmF5PCEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsPn0gaW1wbHNcbiAqIEByZXR1cm4gez9PYmplY3Q8c3RyaW5nLHN0cmluZz59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQWRUZXN0KGltcGxzKSB7XG4gIHJldHVybiBnZXRGaXJzdEluc3RhbmNlVmFsdWVfKGltcGxzLCAoaW1wbCkgPT5cbiAgICBpc0luTWFudWFsRXhwZXJpbWVudChpbXBsLmVsZW1lbnQpID8geydhZHRlc3QnOiAnb24nfSA6IG51bGxcbiAgKTtcbn1cblxuLyoqXG4gKiBKb2luIGJsb2NrIHRhcmdldGluZyB2YWx1ZXMgYnkgc2VwYXJhdGluZyBieSBwaXBlcyAoZWFjaCBrZXkvdmFsdWUgcGFpciBmb3JcbiAqIGEgZ2l2ZW4gYmxvY2sgaXMgc2VwYXJhdGVkIGJ5ID0pIGFuZCBleGNsdXNpb25zIGFyZSBnaXZlbiBzcGVjaWFsIGV4Y2xfY2F0XG4gKiBrZXkgKGxpc3Qgb2YgY2F0ZWdvcmllcyBhcmUgY29tbWEgc2VwYXJhdGVkKS5cbiAqIEBwYXJhbSB7IUFycmF5PCEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsPn0gaW1wbHNcbiAqIEByZXR1cm4gez9PYmplY3Q8c3RyaW5nLHN0cmluZz59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhcmdldGluZ0FuZEV4Y2x1c2lvbnMoaW1wbHMpIHtcbiAgbGV0IGNvbW1vbktWcyA9IG51bGw7XG4gIC8vIEZpbmQgY29tbW9uIGtleS92YWx1ZXMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW1wbHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBpbXBsID0gaW1wbHNbaV07XG4gICAgaWYgKCFpbXBsLmpzb25UYXJnZXRpbmcgfHwgIWltcGwuanNvblRhcmdldGluZ1sndGFyZ2V0aW5nJ10pIHtcbiAgICAgIGNvbW1vbktWcyA9IG51bGw7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGNvbW1vbktWcykge1xuICAgICAgT2JqZWN0LmtleXMoY29tbW9uS1ZzKS5tYXAoKGtleSkgPT4ge1xuICAgICAgICBpZiAoY29tbW9uS1ZzW2tleV0gIT0gaW1wbC5qc29uVGFyZ2V0aW5nWyd0YXJnZXRpbmcnXVtrZXldKSB7XG4gICAgICAgICAgZGVsZXRlIGNvbW1vbktWc1trZXldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTmVlZCB0byBjcmVhdGUgYSBjb3B5IG90aGVyd2lzZSBsYXRlciBkZWxldGUgb3BlcmF0aW9ucyB3aWxsIG1vZGlmeVxuICAgICAgLy8gZmlyc3Qgc2xvdCdzIHRhcmdldGluZy5cbiAgICAgIGNvbW1vbktWcyA9IHsuLi5pbXBsLmpzb25UYXJnZXRpbmdbJ3RhcmdldGluZyddfTtcbiAgICB9XG4gIH1cbiAgbGV0IGhhc1NjcCA9IGZhbHNlO1xuICBjb25zdCBzY3BzID0gW107XG4gIGNvbnN0IGhhc1RhcmdldGluZyA9IChpbXBsKSA9PlxuICAgIGltcGwuanNvblRhcmdldGluZyAmJlxuICAgIChpbXBsLmpzb25UYXJnZXRpbmdbJ3RhcmdldGluZyddIHx8XG4gICAgICBpbXBsLmpzb25UYXJnZXRpbmdbJ2NhdGVnb3J5RXhjbHVzaW9ucyddKTtcbiAgaW1wbHMuZm9yRWFjaCgoaW1wbCkgPT4ge1xuICAgIGlmIChoYXNUYXJnZXRpbmcoaW1wbCkpIHtcbiAgICAgIGhhc1NjcCA9IHRydWU7XG4gICAgICBzY3BzLnB1c2goXG4gICAgICAgIHNlcmlhbGl6ZVRhcmdldGluZyhcbiAgICAgICAgICBpbXBsLmpzb25UYXJnZXRpbmdbJ3RhcmdldGluZyddIHx8IG51bGwsXG4gICAgICAgICAgaW1wbC5qc29uVGFyZ2V0aW5nWydjYXRlZ29yeUV4Y2x1c2lvbnMnXSB8fCBudWxsLFxuICAgICAgICAgIGNvbW1vbktWc1xuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBzY3BzLnB1c2goJycpO1xuICAgIH1cbiAgfSk7XG4gIGlmICghY29tbW9uS1ZzICYmICFoYXNTY3ApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCByZXN1bHQgPSB7fTtcbiAgaWYgKGNvbW1vbktWcyAmJiBPYmplY3Qua2V5cyhjb21tb25LVnMpLmxlbmd0aCkge1xuICAgIHJlc3VsdFsnY3NwJ10gPSBzZXJpYWxpemVUYXJnZXRpbmcoY29tbW9uS1ZzLCBudWxsLCBudWxsKTtcbiAgfVxuICBpZiAoaGFzU2NwKSB7XG4gICAgcmVzdWx0WydwcmV2X3NjcCddID0gc2Nwcy5qb2luKCd8Jyk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHBlcmltZW50IGlkcyBhcmUgYXNzdW1lZCB0byBiZSBwYWdlIGxldmVsIGdpdmVuIHRoYXQgaXMgYWxsIHRoYXQgaXNcbiAqIHN1cHBvcnRlZCBmb3IgU1JBIHJlcXVlc3RzIHRoZXJlZm9yZSBibG9jayB2YWx1ZXMgYXJlIGNvbWJpbmVkIGJ5IGJ1aWxkaW5nXG4gKiB0aGUgdW5pcXVlIHNldCBvZiBleHBlcmltZW50IGlkcyB3aGljaCBhcmUgY29tbWEgc2VwYXJhdGVkIChvcmRlciBkb2VzIG5vdFxuICogbWF0dGVyKS5cbiAqIEBwYXJhbSB7IUFycmF5PCEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsPn0gaW1wbHNcbiAqIEByZXR1cm4gez9PYmplY3Q8c3RyaW5nLHN0cmluZz59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV4cGVyaW1lbnRJZHMoaW1wbHMpIHtcbiAgY29uc3QgZWlkcyA9IHt9O1xuICBjb25zdCBkZWlkID1cbiAgICAoaW1wbHMubGVuZ3RoICYmXG4gICAgICAvKD86I3wsKWRlaWQ9KFtcXGQsXSspL2kuZXhlYyhpbXBsc1swXS53aW4ubG9jYXRpb24uaGFzaCkpIHx8XG4gICAgW107XG4gIC8qKiBAdHlwZSB7IUFycmF5fSAqLyAoKGRlaWRbMV0gfHwgJycpLnNwbGl0KCcsJykpLmZvckVhY2goXG4gICAgKGVpZCkgPT4gZWlkICYmIChlaWRzW2VpZF0gPSAxKVxuICApO1xuICBpbXBscy5mb3JFYWNoKChpbXBsKSA9PiBpbXBsLmV4cGVyaW1lbnRJZHMuZm9yRWFjaCgoZWlkKSA9PiAoZWlkc1tlaWRdID0gMSkpKTtcbiAgY29uc3QgZWlkS2V5cyA9IE9iamVjdC5rZXlzKGVpZHMpLmpvaW4oKTtcbiAgcmV0dXJuIGVpZEtleXMgPyB7J2VpZCc6IGVpZEtleXN9IDogbnVsbDtcbn1cblxuLyoqXG4gKiBJZGVudGl0eSB0b2tlbiBpcyBwYWdlIGxldmVsIHRoZXJlZm9yZSBTUkEgdXNlcyB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0XG4gKiBibG9jay5cbiAqIEBwYXJhbSB7IUFycmF5PCEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsPn0gaW1wbHNcbiAqIEByZXR1cm4gez9PYmplY3Q8c3RyaW5nLHN0cmluZz59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldElkZW50aXR5KGltcGxzKSB7XG4gIHJldHVybiBnZXRGaXJzdEluc3RhbmNlVmFsdWVfKGltcGxzLCAoaW1wbCkgPT4gaW1wbC5idWlsZElkZW50aXR5UGFyYW1zKCkpO1xufVxuXG4vKipcbiAqIENvbWJpbmUgZm9yY2Ugc2FmZWZyYW1lIHZhbHVlcyBmb3IgZWFjaCBibG9jayB2aWEgY29tbWEgc2VwYXJhdGVkIG51bWVyaWNcbiAqIHZhbHVlcyBiYXNlZCBvbiBib29sZWFuIHZhbHVlIChlLmcuIGZhbHNlID0gMCwgdHJ1ZSA9IDEpLiAgSWYgbm9uZSBvZiB0aGVcbiAqIGJsb2NrcyBoYXMgZm9yY2Ugc2FmZWZyYW1lLCBwYXJhbWV0ZXIgaXMgbm90IGluY2x1ZGVkIGluIFNSQSByZXF1ZXN0LlxuICogQHBhcmFtIHshQXJyYXk8IS4vYW1wLWFkLW5ldHdvcmstZG91YmxlY2xpY2staW1wbC5BbXBBZE5ldHdvcmtEb3VibGVjbGlja0ltcGw+fSBpbXBsc1xuICogQHJldHVybiB7P09iamVjdDxzdHJpbmcsc3RyaW5nPn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Rm9yY2VTYWZlZnJhbWUoaW1wbHMpIHtcbiAgbGV0IHNhZmVmcmFtZUZvcmNlZCA9IGZhbHNlO1xuICBjb25zdCBmb3JjZVNhZmVmcmFtZXMgPSBbXTtcbiAgaW1wbHMuZm9yRWFjaCgoaW1wbCkgPT4ge1xuICAgIHNhZmVmcmFtZUZvcmNlZCA9IHNhZmVmcmFtZUZvcmNlZCB8fCBpbXBsLmZvcmNlU2FmZWZyYW1lO1xuICAgIGZvcmNlU2FmZWZyYW1lcy5wdXNoKE51bWJlcihpbXBsLmZvcmNlU2FmZWZyYW1lKSk7XG4gIH0pO1xuICByZXR1cm4gc2FmZWZyYW1lRm9yY2VkID8geydmc2ZzJzogZm9yY2VTYWZlZnJhbWVzLmpvaW4oKX0gOiBudWxsO1xufVxuXG4vKipcbiAqIENvbWJpbmUgcGFnZSBvZmZzZXQgaW5mbyBmb3IgZWFjaCBibG9jayBieSBjb25zdHJ1Y3Rpbmcgc2VwYXJhdGUgcGFyYW1ldGVyXG4gKiBmb3IgbGVmdCAoYWR4cykgYW5kIHRvcCAoYWR5eCkgdmlhIGNvbW1hIHNlcGFyYXRlZC5cbiAqIEBwYXJhbSB7IUFycmF5PCEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsPn0gaW1wbHNcbiAqIEByZXR1cm4gez9PYmplY3Q8c3RyaW5nLHN0cmluZz59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhZ2VPZmZzZXRzKGltcGxzKSB7XG4gIGNvbnN0IGFkeHMgPSBbXTtcbiAgY29uc3QgYWR5cyA9IFtdO1xuICBpbXBscy5mb3JFYWNoKChpbXBsKSA9PiB7XG4gICAgY29uc3QgbGF5b3V0Qm94ID0gZ2V0UGFnZUxheW91dEJveEJsb2NraW5nKGltcGwuZWxlbWVudCk7XG4gICAgYWR4cy5wdXNoKGxheW91dEJveC5sZWZ0KTtcbiAgICBhZHlzLnB1c2gobGF5b3V0Qm94LnRvcCk7XG4gIH0pO1xuICByZXR1cm4geydhZHhzJzogYWR4cy5qb2luKCksICdhZHlzJzogYWR5cy5qb2luKCl9O1xufVxuXG4vKipcbiAqIENvbWJpbmUgd2hpY2ggY29udGFpbmVycyBleGlzdCBmb3IgZWFjaCBibG9jayAoZS5nLiBzdGlja3kpIHZpYSBwaXBlXG4gKiBzZXBhcmF0b3IgKGFzIGJsb2NrIGNhbiBoYXZlIG11bHRpcGxlIHZhbHVlcyB0aGF0IGFyZSBjb21tYSBzZXBhcmF0ZWQpLiAgSWZcbiAqIG5vbmUgb2YgdGhlIGJsb2NrcyBoYXZlIGEgY29udGFpbmVyLCB0aGVuIHBhcmFtZXRlciBpcyBub3Qgc2VudC5cbiAqIEBwYXJhbSB7IUFycmF5PCEuL2FtcC1hZC1uZXR3b3JrLWRvdWJsZWNsaWNrLWltcGwuQW1wQWROZXR3b3JrRG91YmxlY2xpY2tJbXBsPn0gaW1wbHNcbiAqIEByZXR1cm4gez9PYmplY3Q8c3RyaW5nLHN0cmluZz59XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRhaW5lcnMoaW1wbHMpIHtcbiAgbGV0IGhhc0FtcENvbnRhaW5lciA9IGZhbHNlO1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgaW1wbHMuZm9yRWFjaCgoaW1wbCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lcnMgPSBnZXRFbmNsb3NpbmdDb250YWluZXJUeXBlcyhpbXBsLmVsZW1lbnQpO1xuICAgIHJlc3VsdC5wdXNoKGNvbnRhaW5lcnMuam9pbigpKTtcbiAgICBoYXNBbXBDb250YWluZXIgPSBoYXNBbXBDb250YWluZXIgfHwgISFjb250YWluZXJzLmxlbmd0aDtcbiAgfSk7XG4gIHJldHVybiBoYXNBbXBDb250YWluZXIgPyB7J2FjdHMnOiByZXN1bHQuam9pbignfCcpfSA6IG51bGw7XG59XG5cbi8qKlxuICogQ29tYmluZSBmbHVpZCBzZXR0aW5ncyBmb3IgZWFjaCBibG9jayB2aWEgY29tbWEgc2VwYXJhdG9yLlxuICogQHBhcmFtIHshQXJyYXk8IS4vYW1wLWFkLW5ldHdvcmstZG91YmxlY2xpY2staW1wbC5BbXBBZE5ldHdvcmtEb3VibGVjbGlja0ltcGw+fSBpbXBsc1xuICogQHJldHVybiB7P09iamVjdDxzdHJpbmcsc3RyaW5nPn1cbiAqIEB2aXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SXNGbHVpZChpbXBscykge1xuICBsZXQgaGFzRmx1aWQgPSBmYWxzZTtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGltcGxzLmZvckVhY2goKGltcGwpID0+IHtcbiAgICBpZiAoaW1wbC5pc0ZsdWlkUmVxdWVzdCgpKSB7XG4gICAgICBoYXNGbHVpZCA9IHRydWU7XG4gICAgICByZXN1bHQucHVzaCgnaGVpZ2h0Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wdXNoKCcwJyk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGhhc0ZsdWlkID8geydmbHVpZCc6IHJlc3VsdC5qb2luKCl9IDogbnVsbDtcbn1cblxuLyoqXG4gKiBAcGFyYW0gez9PYmplY3Q8c3RyaW5nLCAoIUFycmF5PHN0cmluZz58c3RyaW5nKT59IHRhcmdldGluZ1xuICogQHBhcmFtIHs/KCFBcnJheTxzdHJpbmc+fHN0cmluZyl9IGNhdGVnb3J5RXhjbHVzaW9uc1xuICogQHBhcmFtIHs/T2JqZWN0PHN0cmluZywgKCFBcnJheTxzdHJpbmc+fHN0cmluZyk+fSBjb21tb25UYXJnZXRpbmdcbiAqIEByZXR1cm4gez9zdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVUYXJnZXRpbmcoXG4gIHRhcmdldGluZyxcbiAgY2F0ZWdvcnlFeGNsdXNpb25zLFxuICBjb21tb25UYXJnZXRpbmdcbikge1xuICBjb25zdCBzZXJpYWxpemVkID0gdGFyZ2V0aW5nXG4gICAgPyBPYmplY3Qua2V5cyh0YXJnZXRpbmcpXG4gICAgICAgIC5maWx0ZXIoKGtleSkgPT4gIWNvbW1vblRhcmdldGluZyB8fCBjb21tb25UYXJnZXRpbmdba2V5XSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAubWFwKChrZXkpID0+IHNlcmlhbGl6ZUl0ZW1fKGtleSwgdGFyZ2V0aW5nW2tleV0pKVxuICAgIDogW107XG4gIGlmIChjYXRlZ29yeUV4Y2x1c2lvbnMpIHtcbiAgICBzZXJpYWxpemVkLnB1c2goc2VyaWFsaXplSXRlbV8oJ2V4Y2xfY2F0JywgY2F0ZWdvcnlFeGNsdXNpb25zKSk7XG4gIH1cbiAgcmV0dXJuIHNlcmlhbGl6ZWQubGVuZ3RoID8gc2VyaWFsaXplZC5qb2luKCcmJykgOiBudWxsO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7KCFBcnJheTxzdHJpbmc+fHN0cmluZyl9IHZhbHVlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVJdGVtXyhrZXksIHZhbHVlKSB7XG4gIGNvbnN0IHNlcmlhbGl6ZWRWYWx1ZSA9IChBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXSlcbiAgICAubWFwKGVuY29kZVVSSUNvbXBvbmVudClcbiAgICAuam9pbigpO1xuICByZXR1cm4gYCR7ZW5jb2RlVVJJQ29tcG9uZW50KGtleSl9PSR7c2VyaWFsaXplZFZhbHVlfWA7XG59XG5cbi8qKlxuICogQ2FsbGJhY2sgZm9yIHN0cmVhbWluZyBTUkEgcmVzcG9uc2UgZ2l2ZW4gY3JlYXRpdmUgYW5kIEpTT04gcGFyc2VkIE9iamVjdFxuICogY29udGFpbmluZyBoZWFkZXJzIChhcyBpZiByZXF1ZXN0IGhhZCBiZWVuIHNlbnQgdmlhIG5vbi1TUkEgZmxvdykuICBDcmVhdGl2ZVxuICogYW5kIGhlYWRlcnMgb2JqZWN0IGlzIGNvbnZlcnRlZCB0byBYSFIgRmV0Y2hSZXNwb25zZSBvYmplY3QgYW5kIHBhc3NlZCB0b1xuICogcmVzb2x2ZXIgcG9wcGVkIG9mZiBzdGFjayBvZiByZXNvbHZlcnMgKGluIG9yZGVyIG9mIGV4cGVjdGVkIGJsb2NrIHJlc3BvbnNlcylcbiAqIHN1Y2ggdGhhdCBzZW5kWGhyUmVxdWVzdCBpcyByZXNvbHZlZCBmcm9tIHN0YW5kYXJkIEE0QSBmbG93LiAgRG9uZSBib29sZWFuXG4gKiB1c2VkIHRvIHZlcmlmeSBhcnJheSBvZiByZXNvbHZlcnMgaXMgZW1wdHkgb25jZSBhbGwgcmVzdWx0cyBhcmUgcmV0dXJuZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gY3JlYXRpdmVcbiAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsc3RyaW5nPn0gaGVhZGVyc09ialxuICogQHBhcmFtIHtib29sZWFufSBkb25lXG4gKiBAcGFyYW0geyFBcnJheTxmdW5jdGlvbig/UmVzcG9uc2UpPn0gc3JhUmVxdWVzdEFkVXJsUmVzb2x2ZXJzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JhVXJsIHVybCBvZiBTUkEgcmVxdWVzdCBmb3IgZXJyb3IgcmVwb3J0aW5nXG4gKiBAcGFyYW0ge2Jvb2xlYW49fSBpc05vU2lnbmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3JhQmxvY2tDYWxsYmFja0hhbmRsZXIoXG4gIGNyZWF0aXZlLFxuICBoZWFkZXJzT2JqLFxuICBkb25lLFxuICBzcmFSZXF1ZXN0QWRVcmxSZXNvbHZlcnMsXG4gIHNyYVVybCxcbiAgaXNOb1NpZ25pbmdcbikge1xuICBjb25zdCBoZWFkZXJOYW1lcyA9IE9iamVjdC5rZXlzKGhlYWRlcnNPYmopO1xuICBpZiAoaGVhZGVyTmFtZXMubGVuZ3RoID09IDEgJiYgaXNPYmplY3QoaGVhZGVyc09ialtoZWFkZXJOYW1lc1swXV0pKSB7XG4gICAgLy8gVE9ETyhrZWl0aHdyaWdodGJvcykgLSBmaXggdXBzdHJlYW0gc28gcmVzcG9uc2UgZG9lc1xuICAgIC8vIG5vdCBpbXByb3Blcmx5IHBsYWNlIGhlYWRlcnMgdW5kZXIga2V5LlxuICAgIGhlYWRlcnNPYmogPSAvKiogQHR5cGUgeyFPYmplY3R9ICovIChoZWFkZXJzT2JqKVtoZWFkZXJOYW1lc1swXV07XG4gICAgaGVhZGVyc09iaiA9IE9iamVjdC5rZXlzKGhlYWRlcnNPYmopLnJlZHVjZSgobmV3T2JqLCBrZXkpID0+IHtcbiAgICAgIG5ld09ialtrZXkudG9Mb3dlckNhc2UoKV0gPSBoZWFkZXJzT2JqW2tleV07XG4gICAgICByZXR1cm4gbmV3T2JqO1xuICAgIH0sIHt9KTtcbiAgfVxuICAvLyBGb3JjZSBzYWZlZnJhbWUgcmVuZGVyaW5nIG1ldGhvZC5cbiAgaGVhZGVyc09ialtSRU5ERVJJTkdfVFlQRV9IRUFERVIudG9Mb3dlckNhc2UoKV0gPSBYT1JJR0lOX01PREUuU0FGRUZSQU1FO1xuICAvLyBDb25zdHJ1Y3QgcHNldWRvIGZldGNoIHJlc3BvbnNlIHRvIGJlIHBhc3NlZCBkb3duIHRoZSBBNEFcbiAgLy8gcHJvbWlzZSBjaGFpbiBmb3IgdGhpcyBibG9jay5cbiAgY29uc3QgaGVhZGVycyA9XG4gICAgLyoqIEB0eXBlIHs/SGVhZGVyc30gKi9cbiAgICAoe1xuICAgICAgZ2V0OiAobmFtZSkgPT4ge1xuICAgICAgICAvLyBUT0RPKGtlaXRod3JpZ2h0Ym9zKSAtIGZpeCB1cHN0cmVhbSBzbyByZXNwb25zZSB3cml0ZXNcbiAgICAgICAgLy8gYWxsIG1ldGFkYXRhIHZhbHVlcyBhcyBzdHJpbmdzLlxuICAgICAgICBsZXQgaGVhZGVyID0gaGVhZGVyc09ialtuYW1lLnRvTG93ZXJDYXNlKCldO1xuICAgICAgICBpZiAoaGVhZGVyICYmIHR5cGVvZiBoZWFkZXIgIT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBoZWFkZXIgPSBKU09OLnN0cmluZ2lmeShoZWFkZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoZWFkZXI7XG4gICAgICB9LFxuICAgICAgaGFzOiAobmFtZSkgPT4gISFoZWFkZXJzT2JqW25hbWUudG9Mb3dlckNhc2UoKV0sXG4gICAgfSk7XG5cbiAgbGV0IGZldGNoUmVzcG9uc2U7XG4gIGlmIChpc05vU2lnbmluZykge1xuICAgIGNvbnN0IHN0cmluZ2lmaWVkSGVhZGVycyA9IHN0cmluZ2lmeUhlYWRlclZhbHVlcyhoZWFkZXJzT2JqKTtcbiAgICBmZXRjaFJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGNyZWF0aXZlLCB7aGVhZGVyczogc3RyaW5naWZpZWRIZWFkZXJzfSk7XG4gIH0gZWxzZSB7XG4gICAgZmV0Y2hSZXNwb25zZSA9XG4gICAgICAvKiogQHR5cGUgez9SZXNwb25zZX0gKi9cbiAgICAgICh7XG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGFycmF5QnVmZmVyOiAoKSA9PiB0cnlSZXNvbHZlKCgpID0+IHV0ZjhFbmNvZGUoY3JlYXRpdmUpKSxcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gUG9wIGhlYWQgb2ZmIG9mIHRoZSBhcnJheSBvZiByZXNvbHZlcnMgYXMgdGhlIHJlc3BvbnNlXG4gIC8vIHNob3VsZCBtYXRjaCB0aGUgb3JkZXIgb2YgYmxvY2tzIGRlY2xhcmVkIGluIHRoZSBhZCB1cmwuXG4gIC8vIFRoaXMgYWxsb3dzIHRoZSBibG9jayB0byBzdGFydCByZW5kZXJpbmcgd2hpbGUgdGhlIFNSQVxuICAvLyByZXNwb25zZSBpcyBzdHJlYW1pbmcgYmFjayB0byB0aGUgY2xpZW50LlxuICBkZXZBc3NlcnQoc3JhUmVxdWVzdEFkVXJsUmVzb2x2ZXJzLnNoaWZ0KCkpKGZldGNoUmVzcG9uc2UpO1xuICAvLyBJZiBkb25lLCBleHBlY3QgYXJyYXkgdG8gYmUgZW1wdHkgKGVuc3VyZXMgYWQgcmVzcG9uc2VcbiAgLy8gaW5jbHVkZWQgZGF0YSBmb3IgYWxsIHNsb3RzKS5cbiAgaWYgKGRvbmUgJiYgc3JhUmVxdWVzdEFkVXJsUmVzb2x2ZXJzLmxlbmd0aCkge1xuICAgIGRldigpLndhcm4oXG4gICAgICBUQUcsXG4gICAgICAnUHJlbWF0dXJlIGVuZCBvZiBTUkEgcmVzcG9uc2UnLFxuICAgICAgc3JhUmVxdWVzdEFkVXJsUmVzb2x2ZXJzLmxlbmd0aCxcbiAgICAgIHNyYVVybFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBUYWtlcyBhbnkgcGFyc2VkIGhlYWRlciB2YWx1ZXMgZnJvbSB0aGUgb2JqZWN0IHRoYXQgYXJlIG5vdCBzdHJpbmdzIGFuZFxuICogY29udmVydHMgdGhlbSBiYWNrIHRvIHRoZSBvcmdpbmFsIHN0cmluZ2lmaWVkIHZlcnNpb24uXG4gKiBUT0RPIGFib3ZlIGluZGljYXRlcyB0aGlzIG1pZ2h0IGdldCBmaXhlZCB1cHN0cmVhbSBhdCBzb21lIHBvaW50LlxuICogQHBhcmFtIHshT2JqZWN0fSBoZWFkZXJzT2JqXG4gKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAqL1xuZnVuY3Rpb24gc3RyaW5naWZ5SGVhZGVyVmFsdWVzKGhlYWRlcnNPYmopIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGhlYWRlcnNPYmopLnJlZHVjZSgoc3RyaW5naWZpZWRIZWFkZXJzLCBoZWFkZXJOYW1lKSA9PiB7XG4gICAgbGV0IGhlYWRlclZhbHVlID0gaGVhZGVyc09ialtoZWFkZXJOYW1lXTtcbiAgICBpZiAoaGVhZGVyVmFsdWUgJiYgdHlwZW9mIGhlYWRlclZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgICBoZWFkZXJWYWx1ZSA9IEpTT04uc3RyaW5naWZ5KGhlYWRlclZhbHVlKTtcbiAgICB9XG4gICAgc3RyaW5naWZpZWRIZWFkZXJzW2hlYWRlck5hbWVdID0gaGVhZGVyVmFsdWU7XG4gICAgcmV0dXJuIHN0cmluZ2lmaWVkSGVhZGVycztcbiAgfSwge30pO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-ad-network-doubleclick-impl/0.1/sra-utils.js