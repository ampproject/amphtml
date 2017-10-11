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
import {addParamsToUrl} from '../../../../src/url';

import {COOKIELESS_API_SERVER} from '../constants';
import {pixelDrop} from './pixel';

export const callPRender = ({data, ampDoc}) => {
  const url = addParamsToUrl(`${COOKIELESS_API_SERVER}/live/prender`, data);

  if (ampDoc.win.navigator.sendBeacon) {
    ampDoc.win.navigator.sendBeacon(url, '{}');
  }
  else {
    pixelDrop(url, ampDoc);
  }
};
