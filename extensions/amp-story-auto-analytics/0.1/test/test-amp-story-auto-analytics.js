import '../amp-story-auto-analytics';
import {createElementWithAttributes} from '#core/dom';

describes.realWin(
  'amp-story-auto-analytics',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-auto-analytics'],
    },
  },
  (env) => {
    let win;
    let autoAnalyticsEl;

    beforeEach(() => {
      win = env.win;
      autoAnalyticsEl = createElementWithAttributes(
        win.document,
        'amp-story-auto-analytics',
        {
          'gtag-id': 'ANALYTICS-ID',
        }
      );
      win.document.body.appendChild(autoAnalyticsEl);
    });

    it('should contain the analytics ID in the script when built', async () => {
      await autoAnalyticsEl.whenBuilt();
      expect(autoAnalyticsEl.querySelector('script').textContent).to.contain(
        'ANALYTICS-ID'
      );
    });

    it('should set the type to gtag', async () => {
      await autoAnalyticsEl.whenBuilt();
      expect(autoAnalyticsEl.querySelector('amp-analytics[type="gtag"]')).to
        .exist;
    });
  }
);
