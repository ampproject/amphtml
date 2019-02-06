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
} from './classify';
import {getMetaElements} from './meta';
import {getSessionId} from './session';
import {parseUrlDeprecated} from '../../../../src/url';
import {toArray} from '../../../../src/types';

// "gen" value for shares
const SHARE = 300;

/**
  * @param {{
  * loc:Location,
  * referrer:string,
  * title:string,
  * ampDoc: *,
  * pubId:string,
  * data: {
  *   url: string,
  *   service: string
  * }
  * }} pjson
  * @return {{amp: number, cb: number, dc: number, dest: *, gen: number, mk: string, pub: *, rb: number, sid, url}}
  */
const getPjsonData = ({loc, referrer, title, ampDoc, pubId, data}) => {
  const {href, hostname, search, pathname, hash, protocol, port} = loc;
  /** @typedef {{
  * du: string,
  * hostname: string,
  * href: string,
  * referrer: string,
  * search: string,
  * pathname: string,
  * title: string,
  * hash: string,
  * protocol: string,
  * port: string
  * }} */
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
  const {win} = ampDoc;
  const metaElements = toArray(getMetaElements(win.document));

  return {
    amp: 1,
    cb: classifyPage(pageInfo, metaElements),
    dc: 1,
    dest: data.service,
    gen: SHARE,
    mk: getKeywordsString(metaElements),
    pub: pubId,
    rb: classifyReferrer(referrer, parsedReferrer,
        parseUrlDeprecated(pageInfo.du)),
    sid: getSessionId(),
    url: data.url,
  };
};

export const callPjson = props => {
  const data = getPjsonData(props);
  const endpoint = `${API_SERVER}/live/red_pjson`;

  callPixelEndpoint({
    ampDoc: props.ampDoc,
    endpoint,
    data,
  });
};
