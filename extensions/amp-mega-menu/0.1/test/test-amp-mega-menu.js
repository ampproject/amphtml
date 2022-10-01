import '../amp-mega-menu';
import {Keys_Enum} from '#core/constants/key-codes';
import {tryFocus} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

describes.realWin(
  'amp-mega-menu',
  {
    amp: {
      extensions: ['amp-mega-menu'],
    },
  },
  (env) => {
    let win, doc, element;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      element = getAmpMegaMenu();
      doc.body.appendChild(element);
    });

    function getAmpMegaMenu() {
      const element = doc.createElement('amp-mega-menu');
      element.setAttribute('layout', 'fixed-height');
      element.setAttribute('height', '10');
      const nav = htmlFor(doc)`
        <nav>
          <ul>
            <li>
              <button id="heading1">Menu Item 1</button>
              <div id="content1" role="dialog">Loreum ipsum</div>
            </li>
            <li>
              <div id="heading2" role="button">Menu Item 2</div>
              <div id="content2" role="dialog">Loreum ipsum</div>
            </li>
            <li>
              <a id="heading3">Menu Item 3</a>
            </li>
          </ul>
        </nav>
      `;
      element.appendChild(nav);
      return element;
    }

    it('should create a single mask element in DOM', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const maskClass = '.i-amphtml-mega-menu-mask';
      expect(doc.querySelectorAll(maskClass).length).to.equal(1);
    });

    it('should add correct classes for each menu item, heading and content', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const itemClass = '.i-amphtml-mega-menu-item';
      expect(element.querySelectorAll(itemClass).length).to.equal(3);
      const headingClass = '.i-amphtml-mega-menu-heading';
      expect(element.querySelectorAll(headingClass).length).to.equal(3);
      const contentClass = '.i-amphtml-mega-menu-content';
      expect(element.querySelectorAll(contentClass).length).to.equal(2);
    });

    it('should expand when heading of a collapsed menu item is clicked', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const heading = doc.getElementById('heading1');
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
      const clickEvent = new Event('click');
      heading.dispatchEvent(clickEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
    });

    it('should collapse when heading of a expanded menu item is clicked', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const impl = await element.getImpl(false);
      const heading = doc.getElementById('heading1');
      impl.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      const clickEvent = new Event('click');
      heading.dispatchEvent(clickEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
    });

    it('should collapse an expanded menu item when another heading is clicked', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const impl = await element.getImpl(false);
      const heading1 = doc.getElementById('heading1');
      const heading2 = doc.getElementById('heading2');
      impl.expand_(heading1.parentNode);
      expect(heading1.parentNode.hasAttribute('open')).to.be.true;
      expect(heading1.getAttribute('aria-expanded')).to.equal('true');
      const clickEvent = new Event('click');
      heading2.dispatchEvent(clickEvent);
      expect(heading1.parentNode.hasAttribute('open')).to.be.false;
      expect(heading1.getAttribute('aria-expanded')).to.equal('false');
      expect(heading2.parentNode.hasAttribute('open')).to.be.true;
      expect(heading2.getAttribute('aria-expanded')).to.equal('true');
    });

    it('should collapse any expanded item after clicking outside the component', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const impl = await element.getImpl(false);
      const heading = doc.getElementById('heading1');
      impl.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      const clickEvent = new Event('click');
      doc.documentElement.dispatchEvent(clickEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
    });

    it('should not collapse when click is inside the expanded content', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const impl = await element.getImpl(false);
      const heading = doc.getElementById('heading1');
      const content = doc.getElementById('content1');
      impl.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      const clickEvent = new Event('click');
      content.dispatchEvent(clickEvent);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
    });

    it('should collapse any expanded item on component unlayout', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const impl = await element.getImpl(false);
      const heading = doc.getElementById('heading1');
      impl.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      await element.unlayoutCallback();
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
    });

    it('should collapse when ESC key is pressed', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const impl = await element.getImpl(false);
      const heading = doc.getElementById('heading1');
      impl.expand_(heading.parentNode);
      expect(heading.parentNode.hasAttribute('open')).to.be.true;
      expect(heading.getAttribute('aria-expanded')).to.equal('true');
      const escKey = new KeyboardEvent('keydown', {key: Keys_Enum.ESCAPE});
      doc.documentElement.dispatchEvent(escKey);
      expect(heading.parentNode.hasAttribute('open')).to.be.false;
      expect(heading.getAttribute('aria-expanded')).to.equal('false');
    });

    it('should be navigable by left/right arrow keys when a heading has focus', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      const heading1 = doc.getElementById('heading1');
      const heading2 = doc.getElementById('heading2');
      const heading3 = doc.getElementById('heading3');
      const leftKey = new KeyboardEvent('keydown', {key: Keys_Enum.LEFT_ARROW});
      const rightKey = new KeyboardEvent('keydown', {
        key: Keys_Enum.RIGHT_ARROW,
      });
      tryFocus(heading1);
      expect(doc.activeElement).to.equal(heading1);
      heading1.dispatchEvent(leftKey);
      expect(doc.activeElement).to.equal(heading3);
      heading3.dispatchEvent(leftKey);
      expect(doc.activeElement).to.equal(heading2);
      heading2.dispatchEvent(rightKey);
      expect(doc.activeElement).to.equal(heading3);
      heading3.dispatchEvent(rightKey);
      expect(doc.activeElement).to.equal(heading1);
    });

    it('should remove event listeners on root element when menu is closed', async () => {
      await element.buildInternal();
      await element.layoutCallback();
      await element.unlayoutCallback();
      const impl = await element.getImpl(false);
      const clickEvent = new Event('click');
      const rootClickSpy = env.sandbox.spy(impl, 'handleRootClick_');
      doc.documentElement.dispatchEvent(clickEvent);
      expect(rootClickSpy).to.not.be.called;
      const keydownEvent = new KeyboardEvent('keydown');
      const rootKeyDownSpy = env.sandbox.spy(impl, 'handleRootKeyDown_');
      doc.documentElement.dispatchEvent(keydownEvent);
      expect(rootKeyDownSpy).to.not.be.called;
    });
  }
);
