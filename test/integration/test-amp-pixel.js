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

import {
  depositRequestUrl,
  withdrawRequest,
} from '../../testing/test-helper';

describes.realWin('amp-pixel integration test', {
  amp: {
    runtimeOn: true,
    ampdoc: 'single',
  },
  allowExternalResources: true,
}, env => {

  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  it.skip('should keep referrer', () => {
    // TODO(@lannka): unskip this test
    const pixel = doc.createElement('amp-pixel');
    pixel.setAttribute('src', depositRequestUrl('has-referrer'));
    doc.body.appendChild(pixel);

    return withdrawRequest(win, 'has-referrer').then(request => {
      expect(request.headers.referer).to.be.ok;
    });
  });

  it.skip('should remove referrer', () => {
    // TODO(@lannka): unskip this test
    const pixel = doc.createElement('amp-pixel');
    pixel.setAttribute('src', depositRequestUrl('no-referrer'));
    pixel.setAttribute('referrerpolicy', 'no-referrer');
    doc.body.appendChild(pixel);

    return withdrawRequest(win, 'no-referrer').then(request => {
      expect(request.headers.referer).to.not.be.ok;
    });
  });
});
