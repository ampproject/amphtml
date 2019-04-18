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

import {FakeWindow} from '../../../../../testing/fake-dom';
import {SanitizerImpl} from '../../amp-script';

describe('SanitizerImpl', () => {
  let el;
  let s;
  let win;

  beforeEach(() => {
    win = new FakeWindow();
    s = new SanitizerImpl(win);
    el = win.document.createElement('div');
  });

  describe('mutateAttribute', () => {
    it('should remove attributes when value is null', () => {
      el.setAttribute('class', 'foo');
      s.mutateAttribute(el, 'class', null);
      expect(el.hasAttribute('class')).to.be.false;
    });

    it('should set attributes when value is non-null', () => {
      s.mutateAttribute(el, 'class', 'foo');
      expect(el.getAttribute('class')).to.equal('foo');
    });

    it('should be case-insensitive to attribute name', () => {
      s.mutateAttribute(el, 'CLASS', 'foo');
      expect(el.getAttribute('class')).to.equal('foo');
    });

    it('should set a[target] if [href] exists', () => {
      const a = win.document.createElement('a');
      s.mutateAttribute(a, 'href', '/foo.html');
      expect(a.getAttribute('target')).to.equal('_top');
    });
  });
});
