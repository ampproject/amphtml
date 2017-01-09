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
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../../../testing/iframe';
import '../amp-google-vrview-image';
import {adopt} from '../../../../src/runtime';
import {toggleExperiment} from '../../../../src/experiments';
import * as sinon from 'sinon';

adopt(window);

describe('amp-google-vrview-image', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    toggleExperiment(window, 'amp-google-vrview-image', true);
  });

  afterEach(() => {
    toggleExperiment(window, 'amp-google-vrview-image', false);
    sandbox.restore();
  });

  function getVrImage(attributes, opt_responsive, opt_beforeLayoutCallback) {
    return createIframePromise(
        true, opt_beforeLayoutCallback).then(iframe => {
          doNotLoadExternalResourcesInTest(iframe.win);
          const vr = iframe.doc.createElement('amp-google-vrview-image');

          for (const key in attributes) {
            vr.setAttribute(key, attributes[key]);
          }
          vr.setAttribute('width', '111');
          vr.setAttribute('height', '222');
          if (opt_responsive) {
            vr.setAttribute('layout', 'responsive');
          }
          return iframe.addElement(vr);
        });
  }

  it('renders', () => {
    return getVrImage({'src': 'https://example.com/image1'}).then(vr => {
      const iframe = vr.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('src')).to.equal(
          'https://storage.googleapis.com/vrview/index.html' +
          '?image=' + encodeURIComponent('https://example.com/image1'));
    });
  });

  it('renders as stereo', () => {
    return getVrImage({
      'src': 'https://example.com/image1',
      'stereo': '',
    }).then(vr => {
      const iframe = vr.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.getAttribute('src')).to.equal(
          'https://storage.googleapis.com/vrview/index.html' +
          '?image=' + encodeURIComponent('https://example.com/image1') +
          '&is_stereo=true');
    });
  });

  it('renders responsively', () => {
    return getVrImage({'src': 'https://example.com/image1'}).then(vr => {
      const iframe = vr.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('requires src', () => {
    return getVrImage({}).should.eventually.be.rejectedWith(
        /must be available/);
  });

  it('requires https src', () => {
    return getVrImage({'src': 'http://example.com/image1'}).should
        .eventually.be.rejectedWith(/https/);
  });
});
