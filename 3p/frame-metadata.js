import {once} from '#core/types/function';
import {parseJson} from '#core/types/object/json';

import {dev} from '#utils/log';

import {getMode} from '../src/mode';
import {parseUrlDeprecated} from '../src/url';

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
const FALLBACK = {
  'attributes': {
    '_context': {},
  },
};

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
      dev().info('INTEGRATION', 'Could not parse context from:', iframeName);
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
const getAttributeData = once(() => {
  const data = Object.assign(Object.create(null), allMetadata()['attributes']);

  // TODO(alanorozco): don't delete _context. refactor data object structure.
  if ('_context' in data) {
    delete data['_context'];
  }

  return data;
});

export {getAttributeData};

/**
 * @return {!Location}
 */
const getLocationImpl_ = once(() => {
  const href = allMetadata()['attributes']['_context']['location']['href'];
  return parseUrlDeprecated(href);
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
