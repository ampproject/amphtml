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

import '../amp-nested-menu';
import * as lolex from 'lolex';
import {Keys} from '../../../../src/utils/key-codes';
import {htmlFor} from '../../../../src/static-template';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin(
  'amp-nested-menu component',
  {
    amp: {
      extensions: ['amp-nested-menu'],
    },
  },
  env => {
    let win, doc;
    let clock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      clock = lolex.install({target: win});

      // TODO(#25022): remove this toggle when cleaning up experiment post launch.
      toggleExperiment(win, 'amp-sidebar-v2', true);
    });

    async function getNestedMenu() {
      const element = doc.createElement('amp-nested-menu');
      element.setAttribute('layout', 'fill');
      const ul = doc.createElement('ul');

      [1, 2, 3].forEach(i => {
        const item = htmlFor(doc)`
          <li>
            <button amp-nested-submenu-open></button>
            <div amp-nested-submenu>
              <button amp-nested-submenu-close></button>
            </div>
          </li>
        `;
        item
          .querySelector('[amp-nested-submenu]')
          .setAttribute('id', `submenu-${i}`);
        item
          .querySelector('[amp-nested-submenu-open]')
          .setAttribute('id', `open-${i}`);
        item
          .querySelector('[amp-nested-submenu-close]')
          .setAttribute('id', `close-${i}`);
        ul.appendChild(item);
      });

      element.appendChild(ul);
      doc.body.appendChild(element);
      await element.build();
      await element.layoutCallback();
      return element;
    }

    it('should open corresponding submenu when open element is clicked', async () => {
      const menuEl = await getNestedMenu();
      const openEl = doc.getElementById('open-1');
      const submenuEl = doc.getElementById('submenu-1');
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl.hasAttribute('open')).to.be.false;
      const clickEvent = new Event('click');
      openEl.dispatchEvent(clickEvent);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl.hasAttribute('open')).to.be.true;
    });

    it('should close corresponding submenu when close element is clicked', async () => {
      const menuEl = await getNestedMenu();
      const closeEl = doc.getElementById('close-1');
      const submenuEl = doc.getElementById('submenu-1');
      menuEl.implementation_.open_(submenuEl);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl.hasAttribute('open')).to.be.true;
      const clickEvent = new Event('click');
      closeEl.dispatchEvent(clickEvent);
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl.hasAttribute('open')).to.be.false;
    });

    it('should return to parent menu when left arrow key is pressed', async () => {
      const menuEl = await getNestedMenu();
      const submenuEl = doc.getElementById('submenu-1');
      menuEl.implementation_.open_(submenuEl);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl.hasAttribute('open')).to.be.true;
      const keyEvent = new KeyboardEvent('keydown', {key: Keys.LEFT_ARROW});
      doc.documentElement.dispatchEvent(keyEvent);
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl.hasAttribute('open')).to.be.false;
    });

    it('should shift focus when submenu is opened and closed', async () => {
      const menuEl = await getNestedMenu();
      const openEl = doc.getElementById('open-1');
      const closeEl = doc.getElementById('close-1');
      const submenuEl = doc.getElementById('submenu-1');
      menuEl.implementation_.open_(submenuEl);
      clock.tick(600);
      expect(doc.activeElement).to.equal(closeEl);
      menuEl.implementation_.close_(submenuEl);
      clock.tick(600);
      expect(doc.activeElement).to.equal(openEl);
    });
  }
);
