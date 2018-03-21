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

import {FriendlyFrameRenderer} from '../friendly-frame-renderer';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('amp-ad-render', realWinConfig, env => {

  const minifiedCreative = '<p>Hello, World!</p>';

  let context;
  let creativeData;

  beforeEach(() => {
    context = {
      size: {width: '320', height: '50'},
      requestUrl: 'http://www.google.com',
      ampDoc: env.ampdoc,
      applyFillContent: () => {},
      isInViewport: () => true,
    };
    creativeData = {
      creativeMetaData: {
        minifiedCreative,
        customElementExtensions: [],
        extensions: [],
      },
    };
  });

  describe('FriendlyFrameRenderer', () => {

    let renderer;
    let containerElement;

    beforeEach(() => {
      renderer = new FriendlyFrameRenderer();
      containerElement = document.createElement('div');
      containerElement.signals = () => ({
        whenSignal: () => Promise.resolve(),
      });
      containerElement.renderStarted = () => {};
      containerElement.getLayoutBox = () => ({
        left: 0, top: 0, width: 0, height: 0,
      });
      document.body.appendChild(containerElement);
    });

    afterEach(() => {
      document.body.removeChild(containerElement);
    });

    it('should append iframe child', () => {
      return renderer.render(context, containerElement, creativeData).then(
          () => {
            const iframe = containerElement.querySelector('iframe');
            expect(iframe).to.be.ok;
            expect(iframe.contentWindow.document.body.innerHTML)
                .to.equal(minifiedCreative);
          });
    });
    it('should contain the appended iframe child', () => {
      return renderer.render(context, containerElement, creativeData).then(
          () => {
            expect(renderer.getIframe()).to.be.ok;
            expect(renderer.getIframe()).to.equal(
                containerElement.querySelector('iframe'));
          });
    });
  });
});
