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

import {AmpFresh} from '../amp-fresh';
import {
  ampFreshManagerForDoc,
  installAmpFreshManagerForDoc,
} from '../amp-fresh-manager';
import {toggleExperiment} from '../../../../src/experiments';


describes.realWin('amp-fresh', {
  amp: {
    extension: ['amp-fresh'],
  },
}, env => {
  let win, doc;
  let fresh;
  let elem;
  let manager;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    toggleExperiment(win, 'amp-fresh', true);
    elem = doc.createElement('div');
    elem.setAttribute('id', 'amp-fresh-1');
    doc.body.appendChild(elem);
    const span = doc.createElement('span');
    span.textContent = 'hello';
    elem.appendChild(span);
    installAmpFreshManagerForDoc(doc);
    manager = ampFreshManagerForDoc(doc);
    fresh = new AmpFresh(elem);
    fresh.mutateElement = function(cb) {
      cb();
    };
  });

  it('should register to manager', () => {
    const registerSpy = sandbox.spy(manager, 'register');
    expect(registerSpy).to.have.not.been.called;
    fresh.buildCallback();
    expect(registerSpy).to.be.calledOnce;
  });

  it('should replace its subtree', () => {
    fresh.buildCallback();
    expect(fresh.element.innerHTML).to.equal('<span>hello</span>');
    const otherDoc = {
      getElementById(id) {
        const el = doc.createElement('amp-fresh');
        el.innerHTML = '<span>hello</span><div>world</div>!';
        el.setAttribute('id', id);
        return el;
      },
    };
    manager.update_(otherDoc);
    expect(fresh.element.innerHTML).to.equal(
        '<span>hello</span><div>world</div>!');
  });

  it('should have aria-live=polite by default', () => {
    fresh.buildCallback();
    expect(fresh.element.getAttribute('aria-live')).to.equal('polite');
  });

  it('should use explicitly defined aria-live attribute value', () => {
    elem.setAttribute('aria-live', 'assertive');
    fresh.buildCallback();
    expect(fresh.element.getAttribute('aria-live')).to.equal('assertive');
  });
});
