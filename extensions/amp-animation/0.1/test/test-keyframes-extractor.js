/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {extractKeyframes} from '../keyframes-extractor';
import {poll} from '../../../../testing/iframe';


describes.realWin('extractKeyframes', {amp: 1}, env => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function createStyle(attrs, css) {
    const style = doc.createElement('style');
    for (const k in attrs) {
      style.setAttribute(k, attrs[k]);
    }
    style.textContent = css;
    doc.head.appendChild(style);
    return poll('wait for style', () => {
      for (let i = 0; i < doc.styleSheets.length; i++) {
        if (doc.styleSheets[i].ownerNode == style) {
          return true;
        }
      }
      return false;
    });
  }

  function keyframesCss(name, css) {
    return keyframesCssWithVendor(name, css, '') +
        keyframesCssWithVendor(name, css, '-webkit-') +
        keyframesCssWithVendor(name, css, '-moz-') +
        keyframesCssWithVendor(name, css, '-ms-');
  }

  function keyframesCssWithVendor(name, css, prefix) {
    return `@${prefix}keyframes ${name} {${css}}`;
  }

  describe('discovery', () => {
    it('should tolerate documents w/o stylesheets', () => {
      expect(extractKeyframes({}, 'other')).to.be.null;
    });

    it('should ignore keyframes in amp-boilerplate', () => {
      expect(extractKeyframes(doc, '-amp-start')).to.be.null;
    });

    it('should ignore keyframes in amp-runtime and amp-extension', () => {
      const css = 'from{opacity: 0} to{opacity: 1}';
      return Promise.all([
        createStyle({'amp-runtime': ''}, keyframesCss('anim1', css)),
        createStyle({'amp-extension': 'a'}, keyframesCss('anim1', css)),
      ]).then(() => {
        expect(extractKeyframes(doc, 'anim1')).to.be.null;
      });
    });

    it('should find simplest keyframes', () => {
      const kf1 = keyframesCss('anim1',
          'from{opacity: 0; visibility: hidden}' +
          ' to{opacity: 1; visibility: visible}');
      const kf2 = keyframesCss('anim2',
          'from{opacity: 0} to{opacity: 0.5}');
      return createStyle({}, kf1 + kf2).then(() => {
        expect(extractKeyframes(doc, 'anim1')).to.jsonEqual([
          {offset: 0, opacity: '0', visibility: 'hidden'},
          {offset: 1, opacity: '1', visibility: 'visible'},
        ]);
        expect(extractKeyframes(doc, 'anim2')).to.jsonEqual([
          {offset: 0, opacity: '0'},
          {offset: 1, opacity: '0.5'},
        ]);
      });
    });

    it('should replace easing property', () => {
      const css = 'from{opacity: 0; animation-timing-function: ease}' +
          ' to{opacity: 1}';
      return createStyle({}, keyframesCss('anim1', css)).then(() => {
        const keyframes = extractKeyframes(doc, 'anim1');
        expect(keyframes).to.jsonEqual([
          {offset: 0, opacity: '0', easing: 'ease'},
          {offset: 1, opacity: '1'},
        ]);
      });
    });

    it('should support different offsets', () => {
      const css = '0%{opacity: 0}' +
          ' 25%{opacity: 0.5}' +
          ' 100%{opacity: 1}';
      return createStyle({}, keyframesCss('anim1', css)).then(() => {
        const keyframes = extractKeyframes(doc, 'anim1');
        expect(keyframes).to.jsonEqual([
          {offset: 0, opacity: '0'},
          {offset: 0.25, opacity: '0.5'},
          {offset: 1, opacity: '1'},
        ]);
      });
    });

    it('should select the latest keyframes', () => {
      const css1 = 'from{opacity: 0} to{opacity: 0.1}';
      const css2 = 'from{opacity: 0} to{opacity: 0.2}';
      const css3 = 'from{opacity: 0} to{opacity: 0.3}';
      const css4 = 'from{opacity: 0} to{opacity: 0.4}';
      return Promise.all([
        createStyle({},
            keyframesCss('anim1', css1) +
            keyframesCss('anim1', css2)),
        createStyle({},
            keyframesCss('anim1', css3) +
            keyframesCss('anim1', css4)),
      ]).then(() => {
        const keyframes = extractKeyframes(doc, 'anim1');
        expect(keyframes).to.jsonEqual([
          {offset: 0, opacity: '0'},
          {offset: 1, opacity: '0.4'},
        ]);
      });
    });

    it('should scan in media CSS', () => {
      const kf1 = keyframesCss('anim1', 'from{opacity: 0} to{opacity: 0.1}');
      const kf2 = keyframesCss('anim1', 'from{opacity: 0} to{opacity: 0.2}');
      const media = `@media (min-width: 10px) {${kf2}}`;
      return createStyle({}, kf1 + media).then(() => {
        const keyframes = extractKeyframes(doc, 'anim1');
        expect(keyframes).to.jsonEqual([
          {offset: 0, opacity: '0'},
          {offset: 1, opacity: '0.2'},
        ]);
      });
    });

    it('should check media in CSS', () => {
      const kf1 = keyframesCss('anim1', 'from{opacity: 0} to{opacity: 0.1}');
      const kf2 = keyframesCss('anim1', 'from{opacity: 0} to{opacity: 0.2}');
      const media = `@media (max-width: 10px) {${kf2}}`;  // Disabled.
      return createStyle({}, kf1 + media).then(() => {
        const keyframes = extractKeyframes(doc, 'anim1');
        expect(keyframes).to.jsonEqual([
          {offset: 0, opacity: '0'},
          {offset: 1, opacity: '0.1'},
        ]);
      });
    });

    it('should check media in style tag', () => {
      const kf1 = keyframesCss('anim1', 'from{opacity: 0} to{opacity: 0.1}');
      const kf2 = keyframesCss('anim1', 'from{opacity: 0} to{opacity: 0.2}');
      return Promise.all([
        createStyle({}, kf1),
        createStyle({media: '(max-width: 10px)'}, kf2),
      ]).then(() => {
        const keyframes = extractKeyframes(doc, 'anim1');
        expect(keyframes).to.jsonEqual([
          {offset: 0, opacity: '0'},
          {offset: 1, opacity: '0.1'},
        ]);
      });
    });
  });
});
