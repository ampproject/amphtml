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

import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
} from '../../testing/iframe';

describe('multiple variants extension loading', () => {
  let fixture;
  it('one extension, extension loads first, all scripts in header', () => {
    return createFixtureIframe(
        'test/fixtures/script-load-extension-head-v0-head.html').then(f => {
          fixture = f;
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText).to.have.length(1);
          return expectBodyToBecomeVisible(fixture.win);
        }).then(() => {
          // check amp-fit-text get upgraded
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText[0]).to.have.class('-amp-element');
          expect(ampFitText[0]).to.have.class('-amp-layout-responsive');
          expect(ampFitText[0]).to.have.class('-amp-layout-size-defined');
          expect(ampFitText[0]).to.have.class('-amp-layout');
          expect(fixture.doc.getElementsByClassName('-amp-fit-text-content'))
              .to.have.length(1);
        });
  });

  it('one extension, v0 loads first, all scripts in header', () => {
    return createFixtureIframe(
        'test/fixtures/script-load-v0-head-extension-head.html').then(f => {
          fixture = f;
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText).to.have.length(1);
          expect(ampFitText[0]).to.not.have.class('-amp-element');
          return expectBodyToBecomeVisible(fixture.win);
        }).then(() => {
          // check amp-fit-text get upgraded
          const ampFitText = fixture.doc.querySelectorAll('amp-fit-text');
          expect(ampFitText[0]).to.have.class('-amp-element');
          expect(ampFitText[0]).to.have.class('-amp-layout-responsive');
          expect(ampFitText[0]).to.have.class('-amp-layout-size-defined');
          expect(ampFitText[0]).to.have.class('-amp-layout');
          expect(fixture.doc.getElementsByClassName('-amp-fit-text-content'))
              .to.have.length(1);
        });
  });
});