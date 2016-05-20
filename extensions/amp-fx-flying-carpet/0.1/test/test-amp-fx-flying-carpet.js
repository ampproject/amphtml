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

import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import {installImg} from '../../../../builtins/amp-img';
import {viewportFor} from '../../../../src/viewport';
import {toggleExperiment} from '../../../../src/experiments';
require('../amp-fx-flying-carpet');

adopt(window);

describe('amp-fx-flying-carpet', () => {
  let iframe;

  function getAmpFlyingCarpet(opt_childrenCallback, opt_top) {
    let viewport;
    const top = opt_top || '200vh';
    return createIframePromise().then(i => {
      iframe = i;
      toggleExperiment(iframe.win, 'amp-fx-flying-carpet', true);

      iframe.doc.body.style.height = '400vh';
      iframe.doc.body.style.position = 'relative';
      viewport = viewportFor(iframe.win);
      viewport.resize_();

      const parent = iframe.doc.querySelector('#parent');
      parent.style.position = 'absolute';
      parent.style.top = top;

      const flyingCarpet = iframe.doc.createElement('amp-fx-flying-carpet');
      flyingCarpet.setAttribute('height', '10px');
      if (opt_childrenCallback) {
        const children = opt_childrenCallback(iframe);
        children.forEach(child => {
          flyingCarpet.appendChild(child);
        });
      }

      return iframe.addElement(flyingCarpet);
    }).then(flyingCarpet => {
      viewport.setScrollTop(parseInt(top, 10));
      return flyingCarpet;
    });
  }

  it('should move children into wrapping divs', () => {
    let img;
    return getAmpFlyingCarpet(iframe => {
      installImg(iframe.win);
      img = iframe.doc.createElement('amp-img');
      img.setAttribute('src', '/base/examples/img/sample.jpg');
      img.setAttribute('width', 300);
      img.setAttribute('height', 200);
      return [img];
    }).then(flyingCarpet => {
      const clip = flyingCarpet.firstChild;
      expect(clip.tagName).to.equal('DIV');
      expect(clip).to.have.class('-amp-fx-flying-carpet-clip');

      const container = clip.firstChild;
      expect(container.tagName).to.equal('DIV');
      expect(container).to.have.class('-amp-fx-flying-carpet-container');

      expect(container.firstChild).to.equal(img);
    });
  });

  it('should move text into wrapping divs', () => {
    let text;
    return getAmpFlyingCarpet(iframe => {
      text = iframe.doc.createTextNode('test');
      return [text];
    }).then(flyingCarpet => {
      const clip = flyingCarpet.firstChild;
      expect(clip.tagName).to.equal('DIV');
      expect(clip).to.have.class('-amp-fx-flying-carpet-clip');

      const container = clip.firstChild;
      expect(container.tagName).to.equal('DIV');
      expect(container).to.have.class('-amp-fx-flying-carpet-container');

      expect(container.firstChild).to.equal(text);
    });
  });

  it('should not render in the first viewport', () => {
    return getAmpFlyingCarpet(null, '99vh').then(() => {
      throw new Error('should never reach this');
    }, error => {
      expect(error.message).to.have.string(
        'elements must be positioned after the first viewport'
      );
    });
  });

  it('should not render in the last viewport', () => {
    return getAmpFlyingCarpet(null, '301vh').then(() => {
      throw new Error('should never reach this');
    }, error => {
      expect(error.message).to.have.string(
        'elements must be positioned before the last viewport'
      );
    });
  });
});
