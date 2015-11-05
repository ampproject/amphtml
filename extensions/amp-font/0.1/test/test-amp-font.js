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
import {AmpFont} from '../amp-font';
import {FontLoader} from '../fontloader';
import {adopt} from '../../../../src/runtime';
import * as sinon from 'sinon';
import {Timer} from '../../../../src/timer';

adopt(window);

const FONT_FACE_ = "\
    @font-face {\
      font-family: 'Comic AMP';\
      font-style: italic;\
      font-weight: 600;\
      src: url(/base/examples/fonts/ComicAMP.ttf) format('truetype');\
    }\
    ";

const CSS_RULES_ = "\
  .comic-amp-font-loaded {\
    font-family: 'Comic AMP', serif, sans-serif;\
    color: #0f0;\
  }\
  .comic-amp-font-loading {\
    color: #00f;\
  }\
  .comic-amp-font-missing {\
    color: #f00;\
  }\
  ";

describe.only('amp-font', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
    sandbox = null;
  });

  function getFont(timeout) {
    return createIframePromise().then(iframe => {
      var style = iframe.doc.createElement('style');
      style.textContent = FONT_FACE_ + CSS_RULES_;
      iframe.doc.head.appendChild(style);

      var textEl = iframe.doc.createElement('p');
      textEl.textContent =
          "Neque porro quisquam est qui dolorem ipsum quia dolor";
      textEl.setAttribute('id', 'my-paragraph');
      iframe.doc.body.appendChild(textEl);
      iframe.doc.body.classList.add('comic-amp-font-loading');

      var font = iframe.doc.createElement('amp-font');
      font.setAttribute('layout', 'nodisplay');
      font.setAttribute('font-family', 'Comic AMP');
      font.setAttribute('timeout', timeout);
      font.setAttribute('while-loading-class', '');
      font.setAttribute('on-error-add-class', 'comic-amp-font-missing');
      font.setAttribute('on-load-add-class', 'comic-amp-font-loaded');
      font.setAttribute('on-error-remove-class', 'comic-amp-font-loading');
      font.setAttribute('on-load-remove-class', 'comic-amp-font-loading');
      return iframe.addElement(font).then(f => {
        return new Timer(window).promise(Math.max(timeout,200)).then(() => {
          return iframe.doc;
        });
      });
    });
  }

  it('should load custom-font via polyfill', () => {
    let setupCanUseNativeApisSpy =
        sinon.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
    return getFont(400).then(doc => {
      expect(setupCanUseNativeApisSpy.callCount).to.equal(1);
      expect(doc.documentElement)
          .to.have.class('comic-amp-font-loaded');
      expect(doc.body)
          .to.not.have.class('comic-amp-font-loading');
      setupCanUseNativeApisSpy.restore();
      setupCanUseNativeApisSpy = null;
    });
  });

  it('should load custom-font from cache via polyfill', () => {
    let setupCanUseNativeApisSpy =
        sinon.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
    return getFont(0).then(doc => {
      expect(setupCanUseNativeApisSpy.callCount).to.equal(1);
      expect(doc.documentElement)
          .to.have.class('comic-amp-font-loaded');
      expect(doc.body)
          .to.not.have.class('comic-amp-font-loading');
      setupCanUseNativeApisSpy.restore();
      setupCanUseNativeApisSpy = null;
    });
  });

  it('should load custom font via native api', () => {
    return getFont(500).then(doc => {
      expect(doc.documentElement)
          .to.have.class('comic-amp-font-loaded');
      expect(doc.body)
          .to.not.have.class('comic-amp-font-loading');
    });
  });

  it('should load custom font from cache via native api', () => {
    return getFont(0).then(doc => {
      expect(doc.documentElement)
          .to.have.class('comic-amp-font-loaded');
      expect(doc.body)
          .to.not.have.class('comic-amp-font-loading');
    });
  });

  it('should timeout while loading custom font', () => {
    let setupTimerPromiseSpy = sinon.stub(
        Timer.prototype, 'timeoutPromise').returns(Promise.reject());
    return getFont(300).then(doc => {
      expect(doc.documentElement)
          .to.have.class('comic-amp-font-missing');
      expect(doc.body)
          .to.not.have.class('comic-amp-font-loading');
    });
    setupTimerPromiseSpy.restore();
    setupTimerPromiseSpy = null;
  });
});
