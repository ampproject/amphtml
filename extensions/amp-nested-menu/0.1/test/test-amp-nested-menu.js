import '../amp-nested-menu';
import * as fakeTimers from '@sinonjs/fake-timers';

import {Keys_Enum} from '#core/constants/key-codes';
import {tryFocus} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

const ANIMATION_TIMEOUT = 600;

describes.realWin(
  'amp-nested-menu component',
  {
    amp: {
      extensions: ['amp-nested-menu'],
    },
  },
  (env) => {
    let win, doc;
    let clock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      clock = fakeTimers.withGlobal(win).install();
    });

    async function getNestedMenu(options) {
      options = options || {};
      const element = doc.createElement('amp-nested-menu');
      element.setAttribute('layout', 'fill');
      if (options.side) {
        element.setAttribute('side', options.side);
      }
      const ul = doc.createElement('ul');
      element.appendChild(ul);
      doc.body.appendChild(element);

      [1, 2, 3, 4].forEach((i) => {
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

        if (i == 3) {
          // nest submenu 3 inside submenu 1
          const subUl = doc.createElement('ul');
          doc.getElementById('submenu-1').appendChild(subUl);
          subUl.appendChild(item);
        } else {
          ul.appendChild(item);
        }
      });

      await element.buildInternal();
      await element.layoutCallback();
      return element;
    }

    it('should set side attribute to right by default, but left for RTL', async () => {
      const menuEl1 = await getNestedMenu();
      expect(menuEl1.getAttribute('side')).to.equal('right');
      doc.documentElement.setAttribute('dir', 'rtl');
      const menuEl2 = await getNestedMenu();
      expect(menuEl2.getAttribute('side')).to.equal('left');
    });

    it('should open corresponding submenu when open element is clicked', async () => {
      const menuEl = await getNestedMenu();
      const openEl1 = doc.getElementById('open-1');
      const submenuEl1 = doc.getElementById('submenu-1');
      const openEl3 = doc.getElementById('open-3');
      const submenuEl3 = doc.getElementById('submenu-3');
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl1.hasAttribute('open')).to.be.false;
      expect(openEl1.getAttribute('aria-expanded')).to.be.equal('false');
      const clickEvent = new Event('click', {bubbles: true});
      openEl1.dispatchEvent(clickEvent);
      clock.tick(ANIMATION_TIMEOUT);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl1.hasAttribute('open')).to.be.true;
      expect(submenuEl1.hasAttribute('child-open')).to.be.false;
      expect(submenuEl3.hasAttribute('open')).to.be.false;
      expect(openEl1.getAttribute('aria-expanded')).to.be.equal('true');
      expect(openEl3.getAttribute('aria-expanded')).to.be.equal('false');
      openEl3.dispatchEvent(clickEvent);
      clock.tick(ANIMATION_TIMEOUT);
      expect(openEl3.getAttribute('aria-expanded')).to.be.equal('true');
      expect(submenuEl1.hasAttribute('child-open')).to.be.true;
      expect(submenuEl3.hasAttribute('open')).to.be.true;
    });

    it('should close corresponding submenu when close element is clicked', async () => {
      const menuEl = await getNestedMenu();
      const impl = await menuEl.getImpl(false);
      const closeEl1 = doc.getElementById('close-1');
      const submenuEl1 = doc.getElementById('submenu-1');
      const closeEl3 = doc.getElementById('close-3');
      const submenuEl3 = doc.getElementById('submenu-3');
      const openEl3 = doc.getElementById('open-3');
      const openEl1 = doc.getElementById('open-1');
      impl.open_(submenuEl1);
      clock.tick(ANIMATION_TIMEOUT);
      impl.open_(submenuEl3);
      clock.tick(ANIMATION_TIMEOUT);
      expect(openEl1.getAttribute('aria-expanded')).to.be.equal('true');
      expect(openEl3.getAttribute('aria-expanded')).to.be.equal('true');
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl1.hasAttribute('open')).to.be.true;
      const clickEvent = new Event('click', {bubbles: true});
      closeEl3.dispatchEvent(clickEvent);
      clock.tick(ANIMATION_TIMEOUT);
      expect(openEl3.getAttribute('aria-expanded')).to.be.equal('false');
      expect(submenuEl1.hasAttribute('child-open')).to.be.false;
      expect(submenuEl3.hasAttribute('open')).to.be.false;
      closeEl1.dispatchEvent(clickEvent);
      clock.tick(ANIMATION_TIMEOUT);
      expect(openEl1.getAttribute('aria-expanded')).to.be.equal('false');
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl1.hasAttribute('open')).to.be.false;
    });

    it('should return to root menu on reset', async () => {
      const menuEl = await getNestedMenu();
      const impl = await menuEl.getImpl(false);
      const submenuEl1 = doc.getElementById('submenu-1');
      const submenuEl3 = doc.getElementById('submenu-3');
      impl.open_(submenuEl1);
      impl.open_(submenuEl3);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl1.hasAttribute('child-open')).to.be.true;
      expect(submenuEl1.hasAttribute('open')).to.be.true;
      expect(submenuEl3.hasAttribute('open')).to.be.true;
      impl.reset();
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl1.hasAttribute('child-open')).to.be.false;
      expect(submenuEl1.hasAttribute('open')).to.be.false;
      expect(submenuEl3.hasAttribute('open')).to.be.false;
    });

    it('should return to parent menu when left arrow key is pressed and side=right', async () => {
      const menuEl = await getNestedMenu({'side': 'right'});
      const impl = await menuEl.getImpl(false);
      const submenuEl = doc.getElementById('submenu-1');
      impl.open_(submenuEl);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl.hasAttribute('open')).to.be.true;
      const keyEvent = new KeyboardEvent('keydown', {
        key: Keys_Enum.LEFT_ARROW,
      });
      menuEl.dispatchEvent(keyEvent);
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl.hasAttribute('open')).to.be.false;
    });

    it('should return to parent menu when right arrow key is pressed and side=left', async () => {
      const menuEl = await getNestedMenu({'side': 'left'});
      const impl = await menuEl.getImpl(false);
      const submenuEl = doc.getElementById('submenu-1');
      impl.open_(submenuEl);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl.hasAttribute('open')).to.be.true;
      const keyEvent = new KeyboardEvent('keydown', {
        key: Keys_Enum.RIGHT_ARROW,
      });
      menuEl.dispatchEvent(keyEvent);
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl.hasAttribute('open')).to.be.false;
    });

    it('should open submenu when right arrow key is pressed, side=right and open button has focus', async () => {
      const menuEl = await getNestedMenu({'side': 'right'});
      const openEl = doc.getElementById('open-1');
      const submenuEl = doc.getElementById('submenu-1');
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl.hasAttribute('open')).to.be.false;
      tryFocus(openEl);
      expect(doc.activeElement).to.equal(openEl);
      const keyEvent = new KeyboardEvent('keydown', {
        key: Keys_Enum.RIGHT_ARROW,
        bubbles: true,
      });
      openEl.dispatchEvent(keyEvent);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl.hasAttribute('open')).to.be.true;
    });

    it('should open submenu when left arrow key is pressed, side=left and open button has focus', async () => {
      const menuEl = await getNestedMenu({'side': 'left'});
      const openEl = doc.getElementById('open-1');
      const submenuEl = doc.getElementById('submenu-1');
      expect(menuEl.hasAttribute('child-open')).to.be.false;
      expect(submenuEl.hasAttribute('open')).to.be.false;
      tryFocus(openEl);
      expect(doc.activeElement).to.equal(openEl);
      const keyEvent = new KeyboardEvent('keydown', {
        key: Keys_Enum.LEFT_ARROW,
        bubbles: true,
      });
      openEl.dispatchEvent(keyEvent);
      expect(menuEl.hasAttribute('child-open')).to.be.true;
      expect(submenuEl.hasAttribute('open')).to.be.true;
    });

    it('should shift focus between list items when up/down arrow key is pressed', async () => {
      await getNestedMenu();
      const openEl1 = doc.getElementById('open-1');
      const openEl2 = doc.getElementById('open-2');
      tryFocus(openEl1);
      expect(doc.activeElement).to.equal(openEl1);
      const downKeyEvent = new KeyboardEvent('keydown', {
        key: Keys_Enum.DOWN_ARROW,
        bubbles: true,
      });
      openEl1.dispatchEvent(downKeyEvent);
      expect(doc.activeElement).to.equal(openEl2);
      const upKeyEvent = new KeyboardEvent('keydown', {
        key: Keys_Enum.UP_ARROW,
        bubbles: true,
      });
      openEl2.dispatchEvent(upKeyEvent);
      expect(doc.activeElement).to.equal(openEl1);
    });

    it('should focus on first/last items when home/end key is pressed', async () => {
      await getNestedMenu();
      const openEl1 = doc.getElementById('open-1');
      const openEl4 = doc.getElementById('open-4');
      tryFocus(openEl1);
      expect(doc.activeElement).to.equal(openEl1);
      const endKeyEvent = new KeyboardEvent('keydown', {
        key: Keys_Enum.END,
        bubbles: true,
      });
      openEl1.dispatchEvent(endKeyEvent);
      expect(doc.activeElement).to.equal(openEl4);
      const homeKeyEvent = new KeyboardEvent('keydown', {
        key: Keys_Enum.HOME,
        bubbles: true,
      });
      openEl4.dispatchEvent(homeKeyEvent);
      expect(doc.activeElement).to.equal(openEl1);
    });

    it('should shift focus to close/open button when submenu is opened/closed, respectively', async () => {
      const menuEl = await getNestedMenu();
      const impl = await menuEl.getImpl(false);
      const openEl = doc.getElementById('open-1');
      const closeEl = doc.getElementById('close-1');
      const submenuEl = doc.getElementById('submenu-1');
      impl.open_(submenuEl);
      clock.tick(ANIMATION_TIMEOUT);
      expect(doc.activeElement).to.equal(closeEl);
      impl.close_(submenuEl);
      clock.tick(ANIMATION_TIMEOUT);
      expect(doc.activeElement).to.equal(openEl);
    });
  }
);
