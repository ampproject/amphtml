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

import {AmpHorizontalScroller} from '../amp-horizontal-scroller';
import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

adopt(window);

describe('amp-horizontal-scroller', () => {
  let iframe;
  let ampHS;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    return createIframePromise(/* runtimeOff */ true).then(i => {
      iframe = i;
    });
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(iframe.iframe);
  });

  function getAmpHorizontalScroller(children) {
    ampHS = iframe.doc.createElement('amp-horizontal-scroller');
    (children || []).forEach(child => {
      const adopted = iframe.doc.adoptNode(child);
      ampHS.appendChild(adopted);
    });
    return ampHS;
  }

  function attachAndRun(children) {
    const ampAudio = getAmpHorizontalScroller(children);
    return iframe.addElement(ampAudio);
  }

  it('should wrap its content', () => {
    const table = iframe.doc.createElement('table');
    for (let i = 0; i < 100; i++) {
      const tr = iframe.doc.createElement('tr');
      for (let j = 0; j < 100; j++) {
        const td = iframe.doc.createElement('td');
        td.textContent = `${i}/${j}`;
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    return attachAndRun([table]).then(hs => {
      const child = hs.querySelector('table');
      expect(child.tagName).to.equal('TABLE');
      // it is scrolling
      expect(hs.clientWidth).to.be.lessThan(child.clientWidth);
    });
  });
});
