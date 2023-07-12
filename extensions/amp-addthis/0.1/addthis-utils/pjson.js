import {toArray} from '#core/types/array';

import {classifyPage, classifyReferrer, getKeywordsString} from './classify';
import {getMetaElements} from './meta';
import {callPixelEndpoint} from './pixel';
import {getSessionId} from './session';

import {parseUrlDeprecated} from '../../../../src/url';
import {API_SERVER} from '../constants';

// "gen" value for shares
const SHARE = 300;

/**
 * @param {{
 *   loc:Location,
 *   referrer:string,
 *   title:string,
 *   ampDoc: *,
 *   pubId:string,
 *   data: {url: string, service: string}
 * }} pjson
 * @return {{amp: number, cb: number, dc: number, dest: *, gen: number, mk: string, pub: *, rb: number, sid, url}}
 */
const getPjsonData = (pjson) => {
  const {ampDoc, data, loc, pubId, referrer, title} = pjson;
  const {hash, hostname, href, pathname, port, protocol, search} = loc;
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
    rb: classifyReferrer(
      referrer,
      parsedReferrer,
      parseUrlDeprecated(pageInfo.du)
    ),
    sid: getSessionId(),
    url: data.url,
  };
};

export const callPjson = (props) => {
  const data = getPjsonData(props);
  const endpoint = `${API_SERVER}/live/red_pjson`;

  callPixelEndpoint({
    ampDoc: props.ampDoc,
    endpoint,
    data,
  });
};
