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
import {API_SERVER} from '../constants';
import {Services} from '../../../../src/services';

import {addParamsToUrl} from '../../../../src/url';
import {getSessionId} from './session';
import {pixelDrop} from './pixel';

const getEngData = ({monitors, loc, ampDoc, pubId}) => {
  const {
    dwellMonitor,
    scrollMonitor,
    clickMonitor,
    activeToolsMonitor,
  } = monitors;
  const {host, pathname, hash} = loc;
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

export const callEng = props => {
  const data = getEngData(props);
  const url = addParamsToUrl(`${API_SERVER}/live/red_lojson/100eng.json`, data);
  const {ampDoc} = props;

  if (ampDoc.win.navigator.sendBeacon) {
    ampDoc.win.navigator.sendBeacon(url, '{}');
  } else {
    pixelDrop(url, ampDoc);
  }
};
