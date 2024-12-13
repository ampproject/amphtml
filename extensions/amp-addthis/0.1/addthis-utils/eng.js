import {Services} from '#service';

import {pixelDrop} from './pixel';
import {getSessionId} from './session';

import {addParamsToUrl} from '../../../../src/url';
import {API_SERVER} from '../constants';

/**
 * Gets data to be passed along in request via params
 * @param {{monitors: *, loc: Location, ampDoc: !../../../../src/service/ampdoc-impl.AmpDoc, pubId: string}} params
 * @return {{al: (string|undefined), amp: number, dc: number, dp: string, dt: string, fp: string, ict: string, ivh: number, pct: number, pfm: number, ph: number, pub: string, sh: number, sid: string}}
 */
const getEngData = (params) => {
  const {ampDoc, loc, monitors, pubId} = params;
  const {activeToolsMonitor, clickMonitor, dwellMonitor, scrollMonitor} =
    monitors;
  const {hash, host, pathname} = loc;
  const viewport = Services.viewportForDoc(ampDoc);

  return {
    al: activeToolsMonitor.getActivePcos().join(',') || undefined,
    amp: 1,
    dc: 1,
    dp: host,
    dt: dwellMonitor.getDwellTime(),
    fp: pathname.replace(hash, ''),
    ict: clickMonitor.getIframeClickString(),
    ivh: scrollMonitor.getInitialViewHeight(),
    pct: clickMonitor.getPageClicks(),
    pfm: ampDoc.win.navigator.sendBeacon ? 0 : 1,
    ph: viewport.getHeight(),
    pub: pubId,
    sh: scrollMonitor.getScrollHeight(),
    sid: getSessionId(),
  };
};

/**
 * Makes an ajax request to eng endpoint with params
 * @param {{monitors: *, loc: Location, ampDoc: !../../../../src/service/ampdoc-impl.AmpDoc, pubId: string}} props
 */
export const callEng = (props) => {
  const object = getEngData(props);
  const data = {
    'al': object.al,
    'amp': object.amp,
    'dc': object.dc,
    'dp': object.dp,
    'dt': object.dt,
    'fp': object.fp,
    'ict': object.ict,
    'ivh': object.ivh,
    'pct': object.pct,
    'pfm': object.pfm,
    'ph': object.ph,
    'pub': object.pub,
    'sh': object.sh,
    'sid': object.sid,
  };
  const url = addParamsToUrl(`${API_SERVER}/live/red_lojson/100eng.json`, data);
  const {ampDoc} = props;

  if (ampDoc.win.navigator.sendBeacon) {
    ampDoc.win.navigator.sendBeacon(url, '{}');
  } else {
    pixelDrop(url, ampDoc);
  }
};
