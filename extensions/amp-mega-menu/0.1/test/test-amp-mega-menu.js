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

import '../amp-mega-menu';
import {Keys} from '../../../../src/utils/key-codes';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin(
  'amp-mega-menu',
  {
    amp: {
      extensions: ['amp-mega-menu'],
    },
  },
  env => {
    let win, doc, element;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      element = getAmpMegaMenu();
      doc.body.appendChild(element);

      toggleExperiment(win, 'amp-mega-menu', true);
    });

    function getAmpMegaMenu() {
      const element = doc.createElement('amp-mega-menu');
      element.setAttribute('layout', 'fixed-height');
      element.setAttribute('height', '10');
      const nav = doc.createElement('nav');
      const ul = doc.createElement('ul');
      element.appendChild(nav);
      nav.appendChild(ul);

      const items = [1, 2, 3].map(i => {
        return (
          `<button id="heading${i}">Menu Item ${i}</button>` +
          `<div id="content${i}" role="group">Loreum ipsum</div>`
        );
      });

      for (let i = 0; i < items.length; i++) {
        const li = doc.createElement('li');
        li.innerHTML = items[i];
        ul.appendChild(li);
      }
      return element;
    }

    it('should create a single mask element in DOM', () => {
      element.build();
      const maskClass = '.i-amphtml-mega-menu-mask';
      expect(doc.querySelectorAll(maskClass).length).to.equal(1);
    });

    it('should add correct classes for each menu item, heading and content', () => {
      element.build();
      const itemClass = '.i-amphtml-mega-menu-item';
      expect(element.querySelectorAll(itemClass).length).to.equal(3);
      const headingClass = '.i-amphtml-mega-menu-heading';
      expect(element.querySelectorAll(headingClass).length).to.equal(3);
      const contentClass = '.i-amphtml-mega-menu-content';
      expect(element.querySelectorAll(contentClass).length).to.equal(3);
    });

    it('should expand when heading of a collapsed menu item is clicked', () => {
      element.build();
      const heading = element.querySelector('#heading1');
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
      const clickEvent = new Event('click');
      heading.dispatchEvent(clickEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
    });

    it('should collapse when heading of a expanded menu item is clicked', () => {
      element.build();
      const heading = element.querySelector('#heading1');
      element.implementation_.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      const clickEvent = new Event('click');
      heading.dispatchEvent(clickEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
    });

    it('should collapse an expanded menu item when another heading is clicked', () => {
      element.build();
      const heading1 = element.querySelector('#heading1');
      const heading2 = element.querySelector('#heading2');
      element.implementation_.expand_(heading1.parentNode);
      expect(heading1.parentNode.hasAttribute('open')).to.be.true;
      expect(heading1.getAttribute('aria-expanded')).to.equal('true');
      const clickEvent = new Event('click');
      heading2.dispatchEvent(clickEvent);
      expect(heading1.parentNode.hasAttribute('open')).to.be.false;
      expect(heading1.getAttribute('aria-expanded')).to.equal('false');
      expect(heading2.parentNode.hasAttribute('open')).to.be.true;
      expect(heading2.getAttribute('aria-expanded')).to.equal('true');
    });

    it('should collapse any expanded item after clicking outside the component', () => {
      element.build();
      const heading = element.querySelector('#heading1');
      element.implementation_.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      const clickEvent = new Event('click');
      doc.documentElement.dispatchEvent(clickEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
    });

    it('should not collapse when click is inside the expanded content', () => {
      element.build();
      const heading = element.querySelector('#heading1');
      const content = element.querySelector('#content1');
      element.implementation_.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      const clickEvent = new Event('click');
      content.dispatchEvent(clickEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
    });

    it('should collapse when ESC key is pressed', () => {
      element.build();
      const heading = element.querySelector('#heading1');
      element.implementation_.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      const escEvent = new KeyboardEvent('keydown', {key: Keys.ESCAPE});
      doc.documentElement.dispatchEvent(escEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
    });
  }
);
