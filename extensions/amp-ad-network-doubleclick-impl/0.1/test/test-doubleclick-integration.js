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

import {createElementWithAttributes} from '../../../../src/dom';

// Still under construction.
describes.skip.sandboxed('A4A integration', {}, () => {
  describes.realWin('doubleclick', {allowExternalResources: false}, env => {
    // Note: May need a separate realWin test for checking cross-domain
    // rendering, including SafeFrame and NameFrame.
    let fixture;
    let win;
    let doc;
    let element;
    beforeEach(() => {
      fixture = env;
      win = fixture.win;
      doc = win.document;
      element = createElementWithAttributes(doc, 'amp-ad', {
        width: 320,
        height: 20,
        type: 'doubleclick',
      });
    });

    it('should send ping beacons for all lifecycle stages', () => {
    });
  });
});
