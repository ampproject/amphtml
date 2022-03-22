import '../amp-timeago';
import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-timeago 1.0',
  {
    amp: {
      extensions: ['amp-timeago:1.0'],
    },
  },
  (env) => {
    let win;
    let element;

    const getTimeFromShadow = async () => {
      await element.buildInternal();
      const getTimeContent = () =>
        element.shadowRoot &&
        element.shadowRoot.querySelector('time') &&
        element.shadowRoot.querySelector('time').textContent;
      await waitFor(getTimeContent, 'Timeago rendered');
      return getTimeContent();
    };

    beforeEach(() => {
      win = env.win;
      toggleExperiment(win, 'bento-timeago', true);

      element = win.document.createElement('amp-timeago');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '160px');
      element.setAttribute('height', '20px');
    });

    afterEach(() => {
      toggleExperiment(win, 'bento-timeago', false);
    });

    it('should update after mutation of datetime attribute', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      element.setAttribute('datetime', date.toISOString());
      element.textContent = date.toString();
      win.document.body.appendChild(element);
      date.setDate(date.getDate() + 1);
      element.setAttribute('datetime', date.toString());
      element.mutatedAttributesCallback({
        'datetime': date.toString(),
      });
      const time = await getTimeFromShadow();
      expect(time).to.equal('1 day ago');
    });
  }
);
