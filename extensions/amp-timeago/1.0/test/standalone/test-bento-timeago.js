import {CSS} from '#build/bento-timeago-1.0.css';

import {adoptStyles} from '#bento/util/unit-helpers';

import {setStyles} from '#core/dom/style';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

import {BaseElement as BentoTimeago} from '../../base-element';

describes.realWin(
  'bento-timeago 1.0',
  {
    amp: false,
  },
  (env) => {
    let win;
    let element;

    const getTimeFromShadow = async () => {
      await element.getApi();
      const getTimeContent = () =>
        element.shadowRoot &&
        element.shadowRoot.querySelector('time') &&
        element.shadowRoot.querySelector('time').textContent;
      await waitFor(getTimeContent, 'Timeago rendered');
      return getTimeContent();
    };

    const getTimeFromSlot = async () => {
      await element.getApi();
      const getTimeContent = () => {
        const slot =
          element.shadowRoot && element.shadowRoot.querySelector('slot');
        if (!slot) {
          return null;
        }
        return slot
          .assignedNodes()
          .map((n) => n.textContent)
          .join('')
          .trim();
      };
      await waitFor(getTimeContent, 'Timeago rendered as slot');
      return getTimeContent();
    };

    beforeEach(() => {
      win = env.win;

      element = win.document.createElement('bento-timeago');

      defineBentoElement('bento-timeago', BentoTimeago, win);
      adoptStyles(win, CSS);

      setStyles(element, {
        width: '160px',
        height: '20px',
      });
    });

    it('should render display 2 days ago when built', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      const time = await getTimeFromShadow();
      expect(time).to.equal('2 days ago');
    });

    it('should render display 2 days ago using "timestamp-ms"', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('timestamp-ms', date.getTime());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      const time = await getTimeFromShadow();
      expect(time).to.equal('2 days ago');
    });

    it('should display original date when older than cutoff', async () => {
      const date = new Date('2017-01-01');
      element.setAttribute('datetime', date.toISOString());
      element.textContent = 'Sunday 1 January 2017';
      element.setAttribute('cutoff', '8640000');
      win.document.body.appendChild(element);
      const time = await getTimeFromSlot();
      expect(time).to.equal('Sunday 1 January 2017');
    });

    it('should update after mutation of datetime attribute', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      date.setDate(date.getDate() + 1);
      element.setAttribute('datetime', date.toString());
      const time = await getTimeFromShadow();
      expect(time).to.equal('1 day ago');
    });
  }
);
