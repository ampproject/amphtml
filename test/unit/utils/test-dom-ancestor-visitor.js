/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {DomAncestorVisitor} from '../../../src/utils/dom-ancestor-visitor';

describes.realWin('#DomAncestorVisitor', {amp: true}, (env) => {
  let doc, win;
  let domAncestorVisitor;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
    domAncestorVisitor = new DomAncestorVisitor(win);
  });

  it('should respect maxAncestorsToVisit', () => {
    const parent = doc.createElement('div');
    const child = doc.createElement('div');
    parent.appendChild(child);
    parent.id = 'parent';

    let result = false;
    const callback = (el) => {
      if (el.id == 'parent') {
        result = true;
        return true;
      }
    };

    domAncestorVisitor
      .addVisitor(callback, 1)
      .visitAncestorsStartingFrom(child);
    expect(result).to.be.false;
    domAncestorVisitor
      .addVisitor(callback, 2)
      .visitAncestorsStartingFrom(child);
    expect(result).to.be.true;
  });

  it('should not re-run completed visitors', () => {
    const parent = doc.createElement('div');
    const child = doc.createElement('div');
    parent.appendChild(child);

    let result1 = false;
    const callback1 = (el) => {
      if (el.id == 'parent') {
        result1 = true;
        return true;
      }
    };
    let result2 = false;
    const callback2 = (el) => {
      if (el.id == 'parent') {
        result2 = true;
        return true;
      }
    };

    domAncestorVisitor.addVisitor(callback1).visitAncestorsStartingFrom(child);
    expect(result1).to.be.false;

    parent.id = 'parent';

    domAncestorVisitor.addVisitor(callback2).visitAncestorsStartingFrom(child);
    expect(result1).to.be.false;
    expect(result2).to.be.true;
  });

  it('should cease visiting once visitor returns', () => {
    const elements = [doc.createElement('div')];
    elements[0].id = '0';
    for (let i = 1; i < 100; i++) {
      const el = doc.createElement('div');
      el.id = String(i);
      elements[i - 1].appendChild(el);
      elements.push(el);
    }
    domAncestorVisitor
      .addVisitor((el) => {
        el.classList.add('visited');
        if (el.id == '50') {
          return true;
        }
      })
      .visitAncestorsStartingFrom(elements[elements.length - 1]);
    elements.forEach((element, index) => {
      if (index >= 50) {
        expect(element.classList.contains('visited')).to.be.true;
      } else {
        expect(element.classList.contains('visited')).to.be.false;
      }
    });
  });
});
