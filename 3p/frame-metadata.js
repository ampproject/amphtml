/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {dev} from '../src/log';
import {dict} from '../src/utils/object.js';
import {getMode} from '../src/mode';
import {once} from '../src/utils/function.js';
import {parseJson} from '../src/json';
import {parseUrl} from '../src/url';


/**
 * @typedef {{
 *  ampcontextFilepath: ?string,
 *  ampcontextVersion: ?string,
 *  canary: ?boolean,
 *  canonicalUrl: ?string,
 *  clientId: ?string,
 *  container: ?string,
 *  domFingerprint: ?string,
 *  hidden: ?boolean,
 *  initialIntersection: ?IntersectionObserverEntry,
 *  initialLayoutRect:
 *      ?{left: number, top: number, width: number, height: number},
 *  mode: ?../src/mode.ModeDef,
 *  pageViewId: ?string,
 *  referrer: ?string,
 *  sentinel: ?string,
 *  sourceUrl: ?string,
 *  startTime: ?number,
 *  tagName: ?string,
 * }}
 */
export let ContextStateDef;


/** @const {!JsonObject} */
const FALLBACK = dict({
  'attributes': dict({
    '_context': dict(),
  }),
});


/**
 * Gets metadata encoded in iframe name attribute.
 * @return {!JsonObject}
 */
const allMetadata = once(() => {
  const iframeName = window.name;

  try {
    // TODO(bradfrizzell@): Change the data structure of the attributes
    //    to make it less terrible.
    return parseJson(iframeName);
  } catch (err) {
    if (!getMode().test) {
      dev().info(
          'INTEGRATION', 'Could not parse context from:', iframeName);
    }
    return FALLBACK;
  }
});


/**
 * @return {{mode: !Object, experimentToggles: !Object}}
 */
export function getAmpConfig() {
  const metadata = allMetadata();

  return {
    mode: metadata['attributes']['_context'].mode,
    experimentToggles: metadata['attributes']['_context'].experimentToggles,
  };
}


/**
 * @return {!JsonObject}
 */
const getAttributeDataImpl_ = once(() => {
  const data = Object.assign(dict({}), allMetadata()['attributes']);

  // TODO(alanorozco): don't delete _context. refactor data object structure.
  if ('_context' in data) {
    delete data['_context'];
  }

  return data;
});


/**
 * @return {!JsonObject}
 */
export function getAttributeData() {
  // using indirect invocation to prevent no-export-side-effect issue
  return getAttributeDataImpl_();
}


/**
 * @return {!Location}
 */
const getLocationImpl_ = once(() => {
  return parseUrl(allMetadata()['attributes']['_context']['location']['href']);
});


/**
 * @return {!Location}
 */
export function getLocation() {
  // using indirect invocation to prevent no-export-side-effect issue
  return getLocationImpl_();
}


/**
 * @return {!ContextStateDef}
 */
export function getContextState() {
  const rawContext = allMetadata()['attributes']['_context'];

  return {
    ampcontextFilepath: rawContext['ampcontextFilepath'],
    ampcontextVersion: rawContext['ampcontextVersion'],
    canary: rawContext['canary'],
    canonicalUrl: rawContext['canonicalUrl'],
    clientId: rawContext['clientId'],
    container: rawContext['container'],
    domFingerprint: rawContext['domFingerprint'],
    hidden: rawContext['hidden'],
    initialIntersection: rawContext['initialIntersection'],
    initialLayoutRect: rawContext['initialLayoutRect'],
    mode: rawContext['mode'],
    pageViewId: rawContext['pageViewId'],
    referrer: rawContext['referrer'],
    sentinel: rawContext['sentinel'],
    sourceUrl: rawContext['sourceUrl'],
    startTime: rawContext['startTime'],
    tagName: rawContext['tagName'],
  };
}


/**
 * @return {string}
 */
export function getEmbedType() {
  return getAttributeData()['type'];
}
