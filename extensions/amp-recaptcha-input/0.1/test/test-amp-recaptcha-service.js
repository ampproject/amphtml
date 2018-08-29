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

import '../amp-recaptcha-input'
import '../../../amp-gist/0.1/amp-gist';
import {AmpRecaptcha} from '../amp-recaptcha-service';

describes.realWin('amp-recaptcha-service', {
  amp: { /* amp spec */
    extensions: ['amp-recaptcha-input'],
  }
}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    
    // Dispose of any old artifacts of tests
    AmpRecaptcha.dispose_();
  });

  function getElement() {
    const element = doc.createElement('amp-recaptcha-input');
    doc.body.appendChild(element);
    return element.build().then(() => element.layoutCallback()).then(() => element);
  }

  it('should create an iframe on initialize', done => {
    getElement().then(element => {
      expect(element).to.be.ok;
      AmpRecaptcha.initialize_(win, element).then(() => {
        expect(AmpRecaptcha.iframe_).to.be.ok;
        done();
      });
    });
  });
});

