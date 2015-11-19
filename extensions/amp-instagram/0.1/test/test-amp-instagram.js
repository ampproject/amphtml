/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {createIframePromise} from '../../../../testing/iframe';
require('../amp-instagram');
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-instagram', () => {

  function getIns(shortcode, opt_responsive) {
    return createIframePromise().then(() => {
      const ins = iframe.doc.createElement('amp-instagram');
      ins.setAttribute('data-shortcode', shortcode);
      ins.setAttribute('width', '111');
      ins.setAttribute('height', '222');
      if (opt_responsive) {
        ins.setAttribute('layout', 'responsive');
      }
      return iframe.addElement(ins);
    });
  }

  it('renders', () => {
    getIns('fBwFP').then(ins => {
      const iframe = ins.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal('https://instagram.com/p/fBwFP/embed/?v=4');
      expect(iframe.getAttribute('width')).to.equal('111');
      expect(iframe.getAttribute('height')).to.equal('222');
    });
  });

  it('renders responsively', () => {
    const ins = getIns('fBwFP', true).then(ins => {
      const iframe = ins.firstChild;
      expect(iframe.className).to.match(/amp-responsive-item/);
    });
  });

  it('requires data-shortcode', () => {
    expect(getIns('')).to.be.rejectedWith(
        /The data-shortcode attribute is required for/);
  });
});
