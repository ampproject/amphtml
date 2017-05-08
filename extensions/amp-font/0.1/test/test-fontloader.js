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
import {createIframePromise} from '../../../../testing/iframe';

/** @private @const {string} */
const FONT_FACE_ = `
  @font-face {
    font-family: 'Comic AMP';
    src: url(/examples/fonts/ComicAMP.ttf) format('truetype');
  }
`;

const CSS_RULES_ = `
  .comic-amp-font-loaded {
    font-family: 'Comic AMP', serif, sans-serif;
    color: #0f0;
  }
`;

/** @private @const {!FontConfig} */
const FONT_CONFIG = {
  style: 'normal',
  variant: 'normal',
  weight: '400',
  size: 'medium',
  family: 'Comic AMP',
};


/** @private @const {!FontConfig} */
const FAILURE_FONT_CONFIG = {
  style: 'normal',
  variant: 'normal',
  weight: '400',
  size: 'medium',
  family: 'Comic BLAH',
};

describes.sandboxed('FontLoader', {}, env => {

  let sandbox;
  let fontloader;
  let setupFontCheckSpy;
  let setupFontLoadSpy;
  let setupLoadWithPolyfillSpy;
  let setupDisposeSpy;
  let setupCreateFontComparatorsSpy;

  beforeEach(() => {
    sandbox = env.sandbox;
    setupLoadWithPolyfillSpy =
        sandbox.spy(FontLoader.prototype, 'loadWithPolyfill_');
    setupCreateFontComparatorsSpy =
        sandbox.spy(FontLoader.prototype, 'createFontComparators_');
    setupDisposeSpy = sandbox.spy(FontLoader.prototype, 'dispose_');
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getIframe() {
    return createIframePromise().then(iframe => {
      const style = iframe.doc.createElement('style');
      style.textContent = FONT_FACE_ + CSS_RULES_;
      iframe.doc.head.appendChild(style);
      const textEl = iframe.doc.createElement('p');
      textEl.textContent =
          'Neque porro quisquam est qui dolorem ipsum quia dolor';
      iframe.doc.body.appendChild(textEl);
      setupFontCheckSpy = sandbox./*OK*/spy(iframe.doc.fonts, 'check');
      setupFontLoadSpy = sandbox./*OK*/spy(iframe.doc.fonts, 'load');
      fontloader = new FontLoader(iframe.win);
      return Promise.resolve(iframe);
    });
  }

  it('should check and load font via native api', () => {
    return getIframe().then(iframe => {
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        expect(setupFontCheckSpy).to.be.calledOnce;
        expect(setupFontLoadSpy).to.be.calledOnce;
        expect(setupDisposeSpy).to.be.calledOnce;
      }).catch(() => {
        assert.fail('Font load failed');
      });
    });
  });

  it('should check and load font via polyfill', () => {
    return getIframe().then(iframe => {
      sandbox.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        expect(setupFontCheckSpy).to.have.not.been.called;
        expect(setupFontLoadSpy).to.have.not.been.called;
        expect(setupLoadWithPolyfillSpy).to.be.calledOnce;
        expect(setupCreateFontComparatorsSpy).to.be.calledOnce;
        expect(setupDisposeSpy).to.be.calledOnce;
      }).catch(() => {
        assert.fail('Font load failed');
      });
    });
  });

  it('should error when font is not available', () => {
    return getIframe().then(unusedIframe => {
      fontloader.load(FAILURE_FONT_CONFIG, 3000).then(() => {
        assert.fail('Font loaded when it should have failed.');
      }).catch(() => {
        expect(setupFontCheckSpy).to.be.calledOnce;
        expect(setupFontLoadSpy).to.be.calledOnce;
        expect(setupDisposeSpy).to.be.calledOnce;
      });
    });
  });

  it('should error when font is not available via polyfill', () => {
    return getIframe().then(iframe => {
      sandbox.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        assert.fail('Font loaded when it should have failed.');
      }).catch(() => {
        expect(setupFontCheckSpy).to.have.not.been.called;
        expect(setupFontLoadSpy).to.have.not.been.called;
        expect(setupLoadWithPolyfillSpy).to.be.calledOnce;
        expect(setupCreateFontComparatorsSpy).to.be.calledOnce;
        expect(setupDisposeSpy).to.be.calledOnce;
      });
    });
  });

  it('should check if elements are being created when using polyfill', () => {
    return getIframe().then(iframe => {
      sandbox.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
      setupDisposeSpy/*OK*/.restore();
      setupDisposeSpy =
          sandbox.stub(FontLoader.prototype, 'dispose_').returns(undefined);
      const initialElementsCount = iframe.doc.getElementsByTagName('*').length;
      fontloader.load(FONT_CONFIG, 3000).then(() => {
        iframe.doc.documentElement.classList.add('comic-amp-font-loaded');
        const finalElementsCount = iframe.doc.getElementsByTagName('*').length;
        expect(initialElementsCount).to.be.below(finalElementsCount);
        const createdContainer = iframe.doc.querySelectorAll('body > div')[1];
        expect(createdContainer.fontStyle).to.equal('normal');
        expect(createdContainer.fontWeight).to.equal('400');
        expect(createdContainer.fontVariant).to.equal('normal');
      }).catch(() => {
        assert.fail('Font load failed');
      });
    });
  });

  it('should check if elements created using the polyfill are disposed', () => {
    return getIframe().then(iframe => {
      sandbox.stub(FontLoader.prototype, 'canUseNativeApis_').returns(false);
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
    return getIframe().then(() => {
      return fontloader.load(FONT_CONFIG, 3000).then(() => {
        const comparators = fontloader.createFontComparators_();
        expect(comparators.some(c => c.compare())).to.be.true;
      }).catch(() => {
        assert.fail('Font load failed');
      });
    });
  });
});
