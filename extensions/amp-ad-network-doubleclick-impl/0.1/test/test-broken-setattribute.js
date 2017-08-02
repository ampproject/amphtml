/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {AmpAd} from '../../../amp-ad/0.1/amp-ad';
import {AmpAd3PImpl} from '../../../amp-ad/0.1/amp-ad-3p-impl';
import {
  AmpA4A,
  RENDERING_TYPE_HEADER,
  XORIGIN_MODE,
} from '../../../amp-a4a/0.1/amp-a4a';
import {createIframePromise} from '../../../../testing/iframe';
import {Services} from '../../../../src/services';
import {
  AmpAdNetworkDoubleclickImpl,
  getNetworkId,
  constructSRABlockParameters,
  TFCD,
  resetSraStateForTesting,
} from '../amp-ad-network-doubleclick-impl';
import {
  MANUAL_EXPERIMENT_ID,
} from '../../../../ads/google/a4a/traffic-experiments';
import {
  EXPERIMENT_ATTRIBUTE,
} from '../../../../ads/google/a4a/utils';
import {utf8Encode} from '../../../../src/utils/bytes';
import {BaseElement} from '../../../../src/base-element';
import {createElementWithAttributes} from '../../../../src/dom';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {Xhr, FetchResponseHeaders} from '../../../../src/service/xhr-impl';
import {dev} from '../../../../src/log';
import * as sinon from 'sinon';

describes.realWin('realWin with', {amp: true}, env => {
  describe('setAttribute', () => {
    it ('should set attribute with setAttribute', () => {
      const iframe = env.win.document.createElement('iframe');
      const src = "http://google.com/";
      iframe.setAttribute('src', src);
      expect(iframe.src).to.equal(src);
    });
  });

});
