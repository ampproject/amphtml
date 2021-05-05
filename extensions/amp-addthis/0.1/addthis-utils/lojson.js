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
import {API_SERVER} from '../constants';
import {callPixelEndpoint} from './pixel';

import {
  classifyPage,
  classifyReferrer,
  getKeywordsString,
  isProductPage,
} from './classify';
import {
  clearOurFragment,
  getFragmentId,
  getServiceFromUrlFragment,
} from './fragment';
import {dict} from '../../../../src/core/types/object';
import {getMetaElements} from './meta';
import {getSessionId} from './session';
import {parseUrlDeprecated} from '../../../../src/url';
import {toArray} from '../../../../src/core/types/array';

const VIEW_EVENT_CHANNEL = 100;
const nonTrackedDomainMatcher = /\.gov|\.mil/;
/**
 * @typedef {{
 * loc:*,
 * title:string,
 * pubId:string,
 * atConfig: JsonObject<AtConfigDef>,
 * referrer: string,
 * ampDoc: !../../../../src/service/ampdoc-impl.AmpDoc
 * }}
 */
let LojsonDataDef;

/**
 * @typedef {{
 *   services_exclude:string,
 *   services_compact:string,
 *   services_expanded:string,
 *   services_custom: Array,
 *   ui_click: boolean,
 *   ui_disable: boolean,
 *   ui_delay: number,
 *   ui_hover_direction: number,
 *   ui_language: string,
 *   ui_offset_top: number,
 *   ui_offset_left: number,
 *   ui_508_compliant: boolean,
 *   ui_tabindex: number,
 *   use_cookies: boolean,
 *   track_addressbar: boolean,
 *   track_clickback: boolean,
 *   track_linkback: boolean,
 *   track_textcopy: boolean
 * }}
 */
let AtConfigDef;

/**
 * @param {!LojsonDataDef} jsonData
 * @return {!JsonObject}
 */
export function getLojsonData(jsonData) {
  const {loc, title, pubId, atConfig, referrer, ampDoc} = jsonData;
  const {href, hostname, host, search, pathname, hash, protocol, port} = loc;
  const pageInfo = {
    du: href.split('#').shift(),
    hostname,
    href,
    referrer,
    search,
    pathname,
    title,
    hash,
    protocol,
    port,
  };
  const parsedReferrer = referrer ? parseUrlDeprecated(referrer) : {};
  const langParts = atConfig['ui_language'].split('-');
  const langWithoutLocale = langParts[0];
  const locale = langParts.slice(1);
  const service = getServiceFromUrlFragment(pageInfo.du);
  const {win} = ampDoc;
  const metaElements = toArray(getMetaElements(win.document));
  const isDNTEnabled =
    win.navigator.doNotTrack &&
    win.navigator.doNotTrack !== 'unspecified' &&
    win.navigator.doNotTrack !== 'no' &&
    win.navigator.doNotTrack !== '0';

  return dict({
    'amp': 1,
    'bl':
      0 |
      (atConfig['use_cookies'] !== false ? 1 : 0) |
      (atConfig['track_textcopy'] === true ? 2 : 0) |
      (atConfig['track_addressbar'] === true ? 4 : 0),
    'cb': classifyPage(pageInfo, metaElements),
    'colc': Date.now(),
    'ct':
      atConfig['track_clickback'] !== false &&
      atConfig['track_linkback'] !== false
        ? 1
        : 0,
    'dc': 1,
    'dp': host,
    'dr': host === parsedReferrer.host ? undefined : parsedReferrer.host,
    'fcu': service ? '' : getFragmentId(pageInfo.du),
    'fp': parseUrlDeprecated(clearOurFragment(pageInfo.du)).pathname,
    'fr': parsedReferrer.pathname || '',
    'gen': VIEW_EVENT_CHANNEL,
    'ln': langWithoutLocale,
    'lnlc': locale,
    'mk': getKeywordsString(metaElements),
    'of': isDNTEnabled ? 4 : nonTrackedDomainMatcher.test(hostname) ? 1 : 0,
    'pd': isProductPage(win.document, metaElements) ? 1 : 0,
    'pub': pubId,
    'rb': classifyReferrer(
      referrer,
      parsedReferrer,
      parseUrlDeprecated(pageInfo.du)
    ),
    'sid': getSessionId(),
    'skipb': 1,
    'sr': service,
  });
}

/**
 * @param {!LojsonDataDef} props
 */
export function callLojson(props) {
  const data = getLojsonData(props);
  const endpoint = `${API_SERVER}/live/red_lojson/300lo.json`;

  callPixelEndpoint({
    ampDoc: props.ampDoc,
    endpoint,
    data,
  });
}
