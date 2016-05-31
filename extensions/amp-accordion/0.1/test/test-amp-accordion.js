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
require('../amp-accordion');
import * as sinon from 'sinon';

adopt(window);

describe('amp-accordion', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getAmpAccordion() {
    return createIframePromise().then(iframe => {
      const ampAccordion = iframe.doc.createElement('amp-accordion');
      ampAccordion.implementation_.mutateElement = fn => fn();
      for (let i = 0; i < 3; i++) {
        const section = iframe.doc.createElement('section');
        section.innerHTML = '<h2>Section ' + i +
            '<span>nested stuff<span></h2><div>Loreum ipsum</div>';
        ampAccordion.appendChild(section);
        if (i == 1) {
          section.setAttribute('expanded', '');
        }
      }
      return iframe.addElement(ampAccordion).then(() => {
        return Promise.resolve({
          iframe: iframe,
          ampAccordion: ampAccordion,
        });
      });
    });
  }

  it('should expand when header of a collapsed section is clicked', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const clickEvent = {
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      obj.ampAccordion.implementation_.onHeaderClick_(clickEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(clickEvent.preventDefault.called).to.be.true;
    });
  });

  it('should expand section when header\'s child is clicked', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const clickEvent = {
        currentTarget: headerElements[0],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      obj.ampAccordion.implementation_.onHeaderClick_(clickEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(clickEvent.preventDefault.called).to.be.true;
    });
  });

  it('should collapse when header of an expanded section is clicked', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      const headerElements = iframe.doc.querySelectorAll(
          'section > *:first-child');
      const clickEvent = {
        currentTarget: headerElements[1],
        preventDefault: sandbox.spy(),
      };
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      obj.ampAccordion.implementation_.onHeaderClick_(clickEvent);
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(clickEvent.preventDefault.called).to.be.true;
    });
  });
});
