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

import {poll} from '../../../../../testing/iframe';

describe.configure().run('amp-bodymovin-animation', function() {
  const extensions = ['amp-bodymovin-animation'];
  const bodymovinBody = `
    <amp-bodymovin-animation id="anim"
      layout="fixed" width="200" height="200"
      src="https://nainar.github.io/loader.json">
    </amp-bodymovin-animation>`;
  describes.integration('amp-bodymovin-animation iframe renders', {
    body: bodymovinBody,
    extensions,
  }, () => {

    it('iframe renders', () => {
      const loadPromise = waitForAnimationLoad();
      return loadPromise.then(iframeExists => {
        expect(iframeExists).to.be.true;
      });
    });
  });
});

function waitForAnimationLoad() {
  return poll('wait for iframe to load', () => {
    const iframe = document.getElementsByTagName('iframe')[0];
    return iframe !== null;
  });
}
