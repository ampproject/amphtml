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

import {AmpDocShadow} from '../../src/service/ampdoc-impl';
import {getStyle} from '../../src/style';
import * as sinon from 'sinon';
import * as styles from '../../src/styles';


describe('Styles', () => {
  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('makeBodyVisible', () => {
    styles.makeBodyVisible(document);
    clock.tick(1000);
    expect(document.body).to.exist;
    expect(getStyle(document.body, 'opacity')).to.equal('1');
    expect(getStyle(document.body, 'visibility')).to.equal('visible');
    expect(getStyle(document.body, 'animation')).to.equal('none');
  });

  it('should install runtime styles', () => {
    const cssText = '/*amp-runtime*/';
    return new Promise(resolve => {
      styles.installStyles(document, cssText, () => {
        resolve();
      }, true);
    }).then(() => {
      const styleEl = document.head.querySelector('style');
      expect(styleEl.hasAttribute('amp-runtime')).to.be.true;
      expect(styleEl.textContent).to.equal(cssText);
      document.head.removeChild(styleEl);
    });
  });

  it('should install extension styles after runtime', () => {
    const runtimeCssText = '/*amp-runtime*/';
    const extCssText = '/*amp-ext1*/';
    styles.installStyles(document, runtimeCssText, () => {}, true);
    return new Promise(resolve => {
      styles.installStyles(document, extCssText, () => {
        resolve();
      }, false, 'amp-ext1');
    }).then(() => {
      const styleEls = document.head.querySelectorAll('style');
      expect(styleEls[0].hasAttribute('amp-runtime')).to.be.true;
      expect(styleEls[1].getAttribute('amp-extension')).to.equal('amp-ext1');
      expect(styleEls[1].textContent).to.equal(extCssText);
      document.head.removeChild(styleEls[0]);
      document.head.removeChild(styleEls[1]);
    });
  });

  it('should copy runtime styles from ampdoc', () => {
    const parentRoot = document.createElement('div');
    const style = document.createElement('style');
    style.setAttribute('amp-runtime', '');
    style.textContent = '/*runtime*/';
    parentRoot.appendChild(style);
    const ampdoc = new AmpDocShadow(window, parentRoot);
    const shadowRoot = document.createElement('div');
    styles.copyRuntimeStylesToShadowRoot(ampdoc, shadowRoot);

    const copy = shadowRoot.querySelector('style[amp-runtime]');
    expect(copy).to.exist;
    expect(copy.textContent).to.equal('/*runtime*/');
    expect(copy).to.not.equal(style);
  });
});
