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
import * as sinon from 'sinon';

adopt(window);

describe('amp-instagram', () => {
  let sandbox;
  let inViewport;

  beforeEach(() => {
    inViewport = true;
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getIns(shortcode, opt_responsive) {
    return createIframePromise().then(iframe => {
      const ins = iframe.doc.createElement('amp-instagram');
      ins.setAttribute('data-shortcode', shortcode);
      ins.setAttribute('width', '111');
      ins.setAttribute('height', '222');
      if (opt_responsive) {
        ins.setAttribute('layout', 'responsive');
      }
      sandbox.stub(ins.implementation_, 'isInViewport', () => {
        return inViewport;
      });
      return iframe.addElement(ins);
    });
  }

  function testImage(image) {
    expect(image).to.not.be.null;
    expect(image.src).to.equal('https://www.instagram.com/p/fBwFP/media/?size=l');
    expect(image.getAttribute('width')).to.equal('111');
    expect(image.getAttribute('height')).to.equal('222');
  }

  function testIframe(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.src).to.equal('https://www.instagram.com/p/fBwFP/embed/?v=4');
    expect(iframe.getAttribute('width')).to.equal('111');
    expect(iframe.getAttribute('height')).to.equal('222');
  }

  it('renders in viewport', () => {
    return getIns('fBwFP').then(ins => {
      testIframe(ins.querySelector('iframe'));
      testImage(ins.querySelector('img'));
    });
  });

  it('renders outside viewport', () => {
    inViewport = false;
    return getIns('fBwFP').then(ins => {
      const wrapper = ins.querySelector('wrapper');
      let iframe = ins.querySelector('iframe');
      expect(iframe).to.be.null;

      ins.getVsync = () => {
        return {
          mutate: fn => fn(),
        };
      };

      // Still not in viewport
      ins.implementation_.viewportCallback(false);
      iframe = ins.querySelector('iframe');
      expect(iframe).to.be.null;
      expect(wrapper.style.display).to.be.equal('');

      // In viewport
      ins.implementation_.viewportCallback(true);
      iframe = ins.querySelector('iframe');
      testIframe(iframe);
      testImage(ins.querySelector('img'));
      ins.implementation_.iframePromise_.then(() => {
        expect(wrapper.style.display).to.be.equal('none');
      });
    });
  });

  it('removes iframe after unlayoutCallback', () => {
    return getIns('fBwFP').then(ins => {
      const wrapper = ins.querySelector('wrapper');
      testIframe(ins.querySelector('iframe'));
      const obj = ins.implementation_;
      obj.unlayoutCallback();
      expect(ins.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.iframePromise_).to.be.null;
      expect(wrapper.style.display).to.be.equal('');
    });
  });

  it('renders responsively', () => {
    return getIns('fBwFP', true).then(ins => {
      expect(ins.className).to.match(/amp-layout-responsive/);
    });
  });

  it('requires data-shortcode', () => {
    expect(getIns('')).to.be.rejectedWith(
        /The data-shortcode attribute is required for/);
  });
});
