import {sleep} from '#testing/helpers';
import '../amp-timeago';

describes.realWin(
  'amp-timeago',
  {
    amp: {
      extensions: ['amp-timeago'],
    },
  },
  (env) => {
    let win;
    let element;

    beforeEach(() => {
      win = env.win;
      element = win.document.createElement('amp-timeago');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '160px');
      element.setAttribute('height', '20px');
      win.document.body.appendChild(element);
    });

    it('should display 2 days ago when built', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      await element.buildInternal();
      const timeElement = element.querySelector('time');
      expect(timeElement.textContent).to.equal('2 days ago');
    });

    it('should display original date when older than cutoff', async () => {
      const date = new Date('2017-01-01');
      element.setAttribute('datetime', date.toISOString());
      element.textContent = 'Sunday 1 January 2017';
      element.setAttribute('cutoff', '8640000');
      await element.buildInternal();
      const timeElement = element.querySelector('time');
      expect(timeElement.textContent).to.equal('Sunday 1 January 2017');
    });

    it('should update fuzzy timestamp on viewportCallback', async function () {
      const date = new Date();
      date.setSeconds(date.getSeconds() - 10);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      await element.buildInternal();
      await sleep(1000);
      (await element.getImpl(true)).viewportCallback_(true);
      const timeElement = element.querySelector('time');
      expect(timeElement.textContent).to.equal('11 seconds ago');
    });

    it('should update after mutation of datetime attribute', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      await element.buildInternal();
      date.setDate(date.getDate() + 1);
      element.setAttribute('datetime', date.toString());
      element.mutatedAttributesCallback({
        'datetime': date.toString(),
      });
      const timeElement = element.querySelector('time');
      expect(timeElement.textContent).to.equal('1 day ago');
    });

    it('should have a role of text on the custom element by default', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      await element.buildInternal();
      await sleep(1000);
      expect(element.getAttribute('role')).to.equal('text');
    });

    it('should not override the role attribute if set', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      element.setAttribute('role', 'button');
      await element.buildInternal();
      await sleep(1000);
      expect(element.getAttribute('role')).to.equal('button');
    });

    it('should not have a title attribute', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      await element.buildInternal();
      await sleep(1000);
      expect(element.hasAttribute('title')).to.be.false;
    });
  }
);
