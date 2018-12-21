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

import {RENDERING_TYPE_HEADER, XORIGIN_MODE} from '../../amp-a4a/0.1/amp-a4a';
import {dev, devAssert} from '../../../src/log';
import {getEnclosingContainerTypes} from '../../../ads/google/a4a/utils';
import {
  isInManualExperiment,
} from '../../../ads/google/a4a/traffic-experiments';
import {isObject} from '../../../src/types';
import {tryResolve} from '../../../src/utils/promise';
import {utf8Encode} from '../../../src/utils/bytes';

/** @type {string} */
const TAG = 'amp-ad-network-doubleclick-impl';

/**
 * @const {string}
 * @visibleForTesting
 */
export const TFCD = 'tagForChildDirectedTreatment';

/** @private {!Array<function(!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>):?Object<string,string>>} */
const SRA_JOINERS = [
  combineInventoryUnits, getCookieOptOut, getAdks, getSizes, getTfcd, isAdTest,
  getTargetingAndExclusions, getExperimentIds, getIdentity, getForceSafeframe,
  getPageOffsets, getContainers, getIsFluid];

/**
  * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
  * @return {!Object<string, *>}
  */
export function constructSRABlockParameters(impls) {
  const parameters = {'output': 'ldjh', 'impl': 'fifs'};
  SRA_JOINERS.forEach(joiner => Object.assign(parameters, joiner(impls)));
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
  for (let i = 0; i < impls.length; i++) {
    const val = extractFn(impls[i]);
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
  const uniqueIuNames = {};
  const iuNamesOutput = [];
  let uniqueIuNamesCount = 0;
  const prevIusEncoded = [];
  impls.forEach(instance => {
    const iu = devAssert(instance.element.getAttribute('data-slot'));
    const componentNames = iu.split('/');
    const encodedNames = [];
    for (let i = 0; i < componentNames.length; i++) {
      if (componentNames[i] == '') {
        continue;
      }
      let index = uniqueIuNames[componentNames[i]];
      if (index == undefined) {
        iuNamesOutput.push(componentNames[i]);
        uniqueIuNames[componentNames[i]] = (index = uniqueIuNamesCount++);
      }
      encodedNames.push(index);
    }
    prevIusEncoded.push(encodedNames.join('/'));
  });
  return {
    'iu_parts': iuNamesOutput.join(),
    'enc_prev_ius': prevIusEncoded.join(),
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
  return getFirstInstanceValue_(impls, impl =>
    impl.jsonTargeting &&
         impl.jsonTargeting['cookieOptOut'] ? {'co': '1'} : null);
}

/**
 * Combine ad unit key of each block via comma separated values.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getAdks(impls) {
  return ({'adks': impls.map(impl => devAssert(impl.adKey)).join()});
}

/**
 * Combine block sizes via comma separated values.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getSizes(impls) {
  return ({'prev_iu_szs': impls.map(impl =>
    devAssert(impl.parameterSize)).join()});
}

/**
 * Indicate SRA request is tagForChildDirectedTreatment if any blocks includes
 * in targeting.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getTfcd(impls) {
  return getFirstInstanceValue_(impls, impl =>
    impl.jsonTargeting && impl.jsonTargeting[TFCD] ?
      {'tfcd': impl.jsonTargeting[TFCD]} : null);
}

/**
 * Indicate SRA request should include adtest=on if any block includes the
 * manual experiment id.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function isAdTest(impls) {
  return getFirstInstanceValue_(impls, impl =>
    isInManualExperiment(impl.element) ? {'adtest': 'on'} : null);
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
  let hasScp = false;
  const scps = [];
  impls.forEach(impl => {
    if (impl.jsonTargeting && (impl.jsonTargeting['targeting'] ||
       impl.jsonTargeting['categoryExclusions'])) {
      hasScp = true;
      scps.push(serializeTargeting(
          impl.jsonTargeting['targeting'] || null,
          impl.jsonTargeting['categoryExclusions'] || null));
    } else {
      scps.push('');
    }
  });
  return hasScp ? {'prev_scp': scps.join('|')} : null;
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
  const eids = {};
  const deid = (impls.length &&
     /(?:#|,)deid=([\d,]+)/i.exec(impls[0].win.location.hash)) || [];
  (deid[1] || '').split(',').forEach(eid => eid && (eids[eid] = 1));
  impls.forEach(impl => impl.experimentIds.forEach(eid => eids[eid] = 1));
  const eidKeys = Object.keys(eids).join();
  return eidKeys ? {'eid': eidKeys} : null;
}

/**
 * Identity token is page level therefore SRA uses the value of the first
 * block.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getIdentity(impls) {
  return getFirstInstanceValue_(impls, impl => impl.buildIdentityParams());
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
  let safeframeForced = false;
  const forceSafeframes = [];
  impls.forEach(impl => {
    safeframeForced = safeframeForced || impl.forceSafeframe;
    forceSafeframes.push(Number(impl.forceSafeframe));
  });
  return safeframeForced ? {'fsfs': forceSafeframes.join()} : null;
}

/**
 * Combine page offset info for each block by constructing separate parameter
 * for left (adxs) and top (adyx) via comma separated.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getPageOffsets(impls) {
  const adxs = [];
  const adys = [];
  impls.forEach(impl => {
    const layoutBox = impl.getPageLayoutBox();
    adxs.push(layoutBox.left);
    adys.push(layoutBox.top);
  });
  return {'adxs': adxs.join(), 'adys': adys.join()};
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
  let hasAmpContainer = false;
  const result = [];
  impls.forEach(impl => {
    const containers = getEnclosingContainerTypes(impl.element);
    result.push(containers.join());
    hasAmpContainer = hasAmpContainer || !!containers.length;
  });
  return hasAmpContainer ? {'acts': result.join('|')} : null;
}

/**
 * Combine fluid settings for each block via comma separator.
 * @param {!Array<!./amp-ad-network-doubleclick-impl.AmpAdNetworkDoubleclickImpl>} impls
 * @return {?Object<string,string>}
 * @visibleForTesting
 */
export function getIsFluid(impls) {
  let hasFluid = false;
  const result = [];
  impls.forEach(impl => {
    if (impl.isFluidRequest()) {
      hasFluid = true;
      result.push('height');
    } else {
      result.push('0');
    }
  });
  return hasFluid ? {'fluid': result.join()} : null;
}

/**
 * @param {?Object<string, (!Array<string>|string)>} targeting
 * @param {?(!Array<string>|string)} categoryExclusions
 * @return {?string}
 */
export function serializeTargeting(targeting, categoryExclusions) {
  const serialized = targeting ?
    Object.keys(targeting).map(key => serializeItem_(key, targeting[key])) :
    [];
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
  const serializedValue =
    (Array.isArray(value) ? value : [value]).map(encodeURIComponent).join();
  return `${encodeURIComponent(key)}=${serializedValue}`;
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
 */
export function sraBlockCallbackHandler(
  creative, headersObj, done, sraRequestAdUrlResolvers, sraUrl) {
  const headerNames = Object.keys(headersObj);
  if (headerNames.length == 1 &&
      isObject(headersObj[headerNames[0]])) {
    // TODO(keithwrightbos) - fix upstream so response does
    // not improperly place headers under key.
    headersObj =
      /** @type {!Object} */(headersObj)[headerNames[0]];
    headersObj = Object.keys(headersObj).reduce(
        (newObj, key) => {
          newObj[key.toLowerCase()] = headersObj[key];
          return newObj;
        }, {});
  }
  // Force safeframe rendering method.
  headersObj[RENDERING_TYPE_HEADER.toLowerCase()] =
      XORIGIN_MODE.SAFEFRAME;
  // Construct pseudo fetch response to be passed down the A4A
  // promise chain for this block.
  const headers =
/** @type {?Headers} */
({
  get: name => {
    // TODO(keithwrightbos) - fix upstream so response writes
    // all metadata values as strings.
    let header = headersObj[name.toLowerCase()];
    if (header && typeof header != 'string') {
      header = JSON.stringify(header);
    }
    return header;
  },
  has: name => !!headersObj[name.toLowerCase()],
});
  const fetchResponse =
/** @type {?Response} */
({
  headers,
  arrayBuffer: () => tryResolve(() => utf8Encode(creative)),
});
  // Pop head off of the array of resolvers as the response
  // should match the order of blocks declared in the ad url.
  // This allows the block to start rendering while the SRA
  // response is streaming back to the client.
  devAssert(sraRequestAdUrlResolvers.shift())(fetchResponse);
  // If done, expect array to be empty (ensures ad response
  // included data for all slots).
  if (done && sraRequestAdUrlResolvers.length) {
    dev().warn(TAG, 'Premature end of SRA response',
        sraRequestAdUrlResolvers.length, sraUrl);
  }
}
