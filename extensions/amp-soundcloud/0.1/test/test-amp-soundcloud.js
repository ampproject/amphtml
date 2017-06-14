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
import '../amp-soundcloud';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-soundcloud', () => {

  const embedUrl = 'https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F243169232';

  function getIns(trackid, opt_attrs) {
    return createIframePromise().then(iframe => {
      doNotLoadExternalResourcesInTest(iframe.win);
      const ins = iframe.doc.createElement('amp-soundcloud');
      ins.setAttribute('data-trackid', trackid);
      ins.setAttribute('height', '237');

      if (opt_attrs) {
        for (const attr in opt_attrs) {
          ins.setAttribute(attr, opt_attrs[attr]);
        }
      }

      return iframe.addElement(ins);
    });
  }

  it('renders', () => {
    return getIns('243169232').then(ins => {
      const iframe = ins.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(embedUrl);
    });
  });

  it('renders secret token', () => {
    return getIns('243169232', {
      'data-visual': true,
      'data-secret-token': 'c-af',
    }).then(ins => {
      const iframe = ins.firstChild;
      expect(iframe.src).to.include(encodeURIComponent('?secret_token=c-af'));
    });
  });

  it('renders fixed-height', () => {
    return getIns('243169232', {layout: 'fixed-height'}).then(ins => {
      expect(ins.className).to.match(/i-amphtml-layout-fixed-height/);
    });
  });

  it('ignores color in visual mode', () => {
    return getIns('243169232', {
      'data-visual': true,
      'data-color': '00FF00',
    }).then(ins => {
      const iframe = ins.firstChild;
      expect(iframe.src).to.include('visual=true');
      expect(iframe.src).not.to.include('color=00FF00');
    });
  });

  it('renders without optional params', () => {
    return getIns('243169232').then(ins => {
      const iframe = ins.firstChild;
      expect(iframe.src).not.to.include('&visual=true');
      expect(iframe.src).not.to.include('&color=FF0000');
    });
  });

  it('renders data-trackid', () => {
    expect(getIns('')).to.be.rejectedWith(
        /The data-trackid attribute is required for/);
  });
});
