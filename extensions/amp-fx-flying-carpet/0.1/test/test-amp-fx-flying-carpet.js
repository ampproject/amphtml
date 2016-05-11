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
require('../amp-fx-flying-carpet');

adopt(window);

describe('amp-fx-flying-carpet', () => {
  let iframe;

  function getAmpFlyingCarpet(childrenCallback) {
    return createIframePromise().then(i => {
      iframe = i;
      const children = childrenCallback(iframe);

      const flyingCarpet = iframe.doc.createElement('amp-fx-flying-carpet');
      children.forEach(child => {
        flyingCarpet.appendChild(child);
      });

      return iframe.addElement(flyingCarpet);
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
      expect(clip.tagName).to.equal('div');
      expect(clip).to.have.class('-amp-fx-flying-carpet-clip');

      const container = clip.firstChild;
      expect(container.tagName).to.equal('div');
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
      expect(clip.tagName).to.equal('div');
      expect(clip).to.have.class('-amp-fx-flying-carpet-clip');

      const container = clip.firstChild;
      expect(container.tagName).to.equal('div');
      expect(container).to.have.class('-amp-fx-flying-carpet-container');

      expect(container.firstChild).to.equal(text);
    });
  });
});
