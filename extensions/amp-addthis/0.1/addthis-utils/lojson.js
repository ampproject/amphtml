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
import {parseUrl} from '../../../../src/url';
import {toArray} from '../../../../src/types';

import {API_SERVER} from '../constants';
import {
  classifyPage,
  classifyReferrer,
  getKeywordsString,
  isProductPage,
} from './classify';
import {
  clearOurFragment,
  getServiceFromUrlFragment,
  getFragmentId,
} from './fragment';
import {getMetaElements} from './meta';
import {getSessionId} from './session';
import {callPixelEndpoint} from './pixel';

const VIEW_EVENT_CHANNEL = 100;
const nonTrackedDomainMatcher = /\.gov|\.mil/;

const getLojsonData = ({
    loc,
    title,
    pubId,
    atConfig,
    referrer,
    ampDoc,
}) => {
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
  const parsedReferrer = referrer ? parseUrl(referrer) : {};
  const langParts = atConfig.ui_language.split('-');
  const langWithoutLocale = langParts[0];
  const locale = langParts.slice(1);
  const service = getServiceFromUrlFragment(pageInfo.du);
  const {win} = ampDoc;
  const metaElements = toArray(getMetaElements(win.document));
  const isDNTEnabled = win.navigator.doNotTrack &&
      win.navigator.doNotTrack !== 'unspecified' &&
      win.navigator.doNotTrack !== 'no' &&
      win.navigator.doNotTrack !== '0';

  return {
    amp: 1,
    bl: 0 |
        (atConfig.use_cookies !== false ? 1 : 0) |
        (atConfig.track_textcopy === true ? 2 : 0) |
        (atConfig.track_addressbar === true ? 4 : 0),
    cb: classifyPage(pageInfo, metaElements),
    colc: Date.now(),
    ct: atConfig.track_clickback !== false &&
        atConfig.track_linkback !== false ? 1 : 0,
    dc: 1,
    dp: host,
    dr: host === parsedReferrer.host ? undefined : parsedReferrer.host,
    fcu: service ? '' : getFragmentId(pageInfo.du),
    fp: parseUrl(clearOurFragment(pageInfo.du)).pathname,
    fr: parsedReferrer.pathname || '',
    gen: VIEW_EVENT_CHANNEL,
    ln: langWithoutLocale,
    lnlc: locale,
    mk: getKeywordsString(metaElements),
    of: isDNTEnabled ? 4 :
        nonTrackedDomainMatcher.test(hostname) ? 1 :
        0,
    pd: isProductPage(win.document, metaElements) ? 1 : 0,
    pub: pubId,
    rb: classifyReferrer(referrer, parsedReferrer, parseUrl(pageInfo.du)),
    sid: getSessionId(),
    skipb: 1,
    sr: service,
  };
};

export const callLojson = props => {
  const data = getLojsonData(props);
  const endpoint = `${API_SERVER}/live/red_lojson/300lo.json`;

  callPixelEndpoint({
    ampDoc: props.ampDoc,
    endpoint,
    data,
  });
};
