
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
import '../amp-gfycat';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-gfycat', () => {
  function getGfycat(gfyId, opt_params) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const gfycat = iframe.doc.createElement('amp-gfycat');
      gfycat.setAttribute('data-gfyid', gfyId);
      gfycat.setAttribute('width', 640);
      gfycat.setAttribute('height', 640);
      if (opt_params && opt_params.responsive) {
        gfycat.setAttribute('layout', 'responsive');
      }
      if (opt_params && opt_params.noautoplay) {
        gfycat.setAttribute('noautoplay', '');
      }
      return iframe.addElement(gfycat);
    });
  }

  it('renders', () => {
    return getGfycat('LeanMediocreBeardeddragon').then(gfycat => {
      const iframe = gfycat.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal('https://gfycat.com/ifr/LeanMediocreBeardeddragon');
    });
  });

  it('renders responsively', () => {
    return getGfycat('LeanMediocreBeardeddragon', {
      responsive: true,
    }).then(gfycat => {
      const iframe = gfycat.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });
  });

  it('noautoplay', () => {
    return getGfycat('LeanMediocreBeardeddragon', {
      noautoplay: true,
    }).then(gfycat => {
      const iframe = gfycat.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src)
          .to.equal('https://gfycat.com/ifr/LeanMediocreBeardeddragon?autoplay=0');
    });
  });

  it('requires data-gfyid', () => {
    return getGfycat('').should.eventually.be.rejectedWith(
        /The data-gfyid attribute is required for/);
  });
});
