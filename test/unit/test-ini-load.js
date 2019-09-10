import {Services} from '../../src/services';
import {setSrcdocSupportedForTesting} from '../../src/friendly-iframe-embed';
import {toggleExperiment} from '../../src/experiments';
import {whenContentIniLoad} from '../../src/ini-load';

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

describes.realWin('friendly-iframe-embed', {amp: true}, env => {
  let window, document;
  let iframe;
  let extensionsMock;
  let resourcesMock;
  let ampdocServiceMock;

  beforeEach(() => {
    window = env.win;
    document = window.document;

    const extensions = Services.extensionsFor(window);
    const resources = Services.resourcesForDoc(window.document);
    const ampdocService = {
      installFieDoc: () => {},
    };

    extensionsMock = sandbox.mock(extensions);
    resourcesMock = sandbox.mock(resources);
    ampdocServiceMock = sandbox.mock(ampdocService);
    sandbox.stub(Services, 'ampdocServiceFor').callsFake(() => ampdocService);

    iframe = document.createElement('iframe');
  });

  afterEach(() => {
    if (iframe.parentElement) {
      iframe.parentElement.removeChild(iframe);
    }
    extensionsMock.verify();
    resourcesMock.verify();
    ampdocServiceMock.verify();
    setSrcdocSupportedForTesting(undefined);
    toggleExperiment(window, 'ampdoc-fie', false);
    sandbox.restore();
  });

  it('should find and await all content elements', () => {
    function resource(tagName) {
      const res = {
        element: {
          tagName: tagName.toUpperCase(),
        },
        loadedComplete: false,
      };
      res.loadedOnce = () =>
        Promise.resolve().then(() => {
          res.loadedComplete = true;
        });
      return res;
    }

    let content1;
    let content2;
    let blacklistedAd;
    let blacklistedAnalytics;
    let blacklistedPixel;
    let blacklistedAmpAdExit;

    const context = document.createElement('div');
    document.body.appendChild(context);
    resourcesMock
      .expects('getResourcesInRect')
      .withArgs(sinon.match(arg => arg == window))
      .returns(
        Promise.resolve([
          (content1 = resource('amp-img', 0)),
          (content2 = resource('amp-video', 0)),
          (blacklistedAd = resource('amp-ad', 0)),
          (blacklistedAnalytics = resource('amp-analytics', 0)),
          (blacklistedPixel = resource('amp-pixel', 0)),
          (blacklistedAmpAdExit = resource('amp-ad-exit', 0)),
        ])
      )
      .once();

    return whenContentIniLoad(context, window).then(() => {
      expect(content1.loadedComplete).to.be.true;
      expect(content2.loadedComplete).to.be.true;
      expect(blacklistedAd.loadedComplete).to.be.false;
      expect(blacklistedAnalytics.loadedComplete).to.be.false;
      expect(blacklistedPixel.loadedComplete).to.be.false;
      expect(blacklistedAmpAdExit.loadedComplete).to.be.false;
    });
  });
});
