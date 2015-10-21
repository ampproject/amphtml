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

import {FontLoader} from '../fontloader';
import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

adopt(window);

/** @private @const {string} */
const FONT_FACE_ = "\
  @font-face {\
    font-family: 'Comic AMP';\
    src: url(/base/examples/fonts/ComicAMP.ttf) format('truetype');\
  }\
";

const CSS_RULES_ = "\
  .comic-amp-font-loaded {\
    font-family: 'Comic AMP', serif, sans-serif;\
    color: #0f0;\
  }\
";

/** @private @const {!FontConfig} */
const FONT_CONFIG = {
  style: 'normal',
  variant: 'normal',
  weight: '400',
  size: 'medium',
  family: 'Comic AMP'
};


/** @private @const {!FontConfig} */
const FAILURE_FONT_CONFIG = {
  style: 'normal',
  variant: 'normal',
  weight: '400',
  size: 'medium',
  family: 'Comic BLAH'
};

describe('FontLoader', () => {

  let sandbox;
  let clock;
  let fontloader;
  let setupFontCheckSpy;
  let setupFontLoadSpy;
  let setupCanUseNativeApisSpy;
  let setupLoadWithPolyfillSpy;
  let setupDisposeSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sinon.useFakeTimers();
    setupLoadWithPolyfillSpy =
        sinon.spy(FontLoader.prototype, 'loadWithPolyfill_');
    setupCreateElementsSpy =
        sinon.spy(FontLoader.prototype, 'createElements_');
    setupDisposeSpy = sinon.spy(FontLoader.prototype, 'dispose_');
  });

  afterEach(() => {
    restoreSpy(setupDisposeSpy);
    restoreSpy(setupCreateElementsSpy);
    restoreSpy(setupLoadWithPolyfillSpy);
    restoreSpy(setupCanUseNativeApisSpy);
    restoreSpy(setupFontCheckSpy);
    restoreSpy(setupFontLoadSpy);
    restoreSpy(clock);
    restoreSpy(sandbox);
    fontloader = null;
  });

  function restoreSpy(spy) {
    if (spy) {
      spy.restore();
    }
  }

  function getIframe() {
    return createIframePromise().then(iframe => {
      const style = iframe.doc.createElement('style');
      style.textContent = FONT_FACE_ + CSS_RULES_;
      iframe.doc.head.appendChild(style);
      const textEl = iframe.doc.createElement('p');
      textEl.textContent =
          "Neque porro quisquam est qui dolorem ipsum quia dolor";
      iframe.doc.body.appendChild(textEl);
      setupFontCheckSpy = sinon.spy(iframe.doc.fonts, 'check');
      setupFontLoadSpy = sinon.spy(iframe.doc.fonts, 'load');
      fontloader = new FontLoader(iframe.win);
      return Promise.resolve(iframe);
    });
  }

  it('should check and load font via native api', () => {
    return getIframe().then(iframe => {
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        expect(setupFontCheckSpy.callCount).to.equal(1);
        expect(setupFontLoadSpy.callCount).to.equal(1);
        expect(setupDisposeSpy.callCount).to.equal(1);
      }).catch(() => {
        assert.fail('Font load failed');
      });
    });
  });

  it('should check and load font via polyfill', () => {
    return getIframe().then(iframe => {
      setupCanUseNativeApisSpy =
          sinon.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        expect(setupFontCheckSpy.callCount).to.equal(0);
        expect(setupFontLoadSpy.callCount).to.equal(0);
        expect(setupLoadWithPolyfillSpy.callCount).to.equal(1);
        expect(setupCreateElementsSpy.callCount).to.equal(1);
        expect(setupDisposeSpy.callCount).to.equal(1);
      }).catch(() => {
        assert.fail('Font load failed');
      });
    });
  });

  it('should error when font is not available', () => {
    return getIframe().then(iframe => {
      fontloader.load(FAILURE_FONT_CONFIG, 3000).then(() => {
        assert.fail('Font loaded when it should have failed.');
      }).catch(() => {
        expect(setupFontCheckSpy.callCount).to.equal(1);
        expect(setupFontLoadSpy.callCount).to.equal(1);
        expect(setupDisposeSpy.callCount).to.equal(1);
      });
    });
  });

  it('should error when font is not available via polyfill', () => {
    return getIframe().then(iframe => {
      setupCanUseNativeApisSpy =
          sinon.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        assert.fail('Font loaded when it should have failed.');
      }).catch(() => {
        expect(setupFontCheckSpy.callCount).to.equal(0);
        expect(setupFontLoadSpy.callCount).to.equal(0);
        expect(setupLoadWithPolyfillSpy.callCount).to.equal(1);
        expect(setupCreateElementsSpy.callCount).to.equal(1);
        expect(setupDisposeSpy.callCount).to.equal(1);
      });
    });
  });

  it('should check if elements are being created when using polyfill', () => {
    return getIframe().then(iframe => {
      setupCanUseNativeApisSpy =
          sinon.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
      setupDisposeSpy.restore();
      setupDisposeSpy =
          sinon.stub(FontLoader.prototype, 'dispose_').returns(undefined);
      const initialElementsCount = iframe.doc.getElementsByTagName('*').length;
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        const finalElementsCount = iframe.doc.getElementsByTagName('*').length;
        expect(initialElementsCount).to.be.below(finalElementsCount);
      }).catch(() => {
        assert.fail('Font load failed');
      });
    });
  });

  it('should check if elements created using the polyfill are disposed', () => {
    return getIframe().then(iframe => {
      setupCanUseNativeApisSpy =
          sinon.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
      const initialElementsCount = iframe.doc.getElementsByTagName('*').length;
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        const finalElementsCount = iframe.doc.getElementsByTagName('*').length;
        expect(initialElementsCount).to.equal(finalElementsCount);
      }).catch(() => {
        assert.fail('Font load failed');
      });
    });
  });

  it('should check compare elements', () => {
    return getIframe().then(iframe => {
      const defaultDiv = iframe.doc.createElement('div');
      defaultDiv.style.fontFamily = 'serif';
      defaultDiv.style.position = 'absolute';
      defaultDiv.textContent = "HelloWSSIENd2939Qq";
      const fontDiv = iframe.doc.createElement('div');
      fontDiv.style.fontFamily = 'Comic AMP';
      fontDiv.style.position = 'absolute';
      fontDiv.textContent = "HelloWSSIENd2939Qq";
      iframe.doc.body.appendChild(defaultDiv);
      iframe.doc.body.appendChild(fontDiv);
      fontloader.defaultFontElements_ = [defaultDiv];
      fontloader.customFontElement_ = fontDiv;
      expect(fontloader.compareMeasurements_()).to.be.true;
    });
  });
});
