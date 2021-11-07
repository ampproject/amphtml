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

    it('should add linker config', async () => {
      await autoAnalyticsEl.whenBuilt();
      const config = {
        'linkers': {
          'ampStoryAutoAnalyticsLinker': {
            'ids': {
              'cid': '${clientId}',
            },
            'enabled': true,
            'proxyOnly': false,
          },
        },
      };

      const strConfig = JSON.stringify(config);
      const configContents = strConfig.substr(1, strConfig.length - 2);

      expect(autoAnalyticsEl.querySelector('script').textContent).to.contain(
        configContents
      );
    });

    it('should add cookieWriter config', async () => {
      await autoAnalyticsEl.whenBuilt();
      const config = {
        'cookies': {
          'ampStoryAutoAnalyticsCookies': {
            'value': 'LINKER_PARAM(ampStoryAutoAnalyticsLinker, cid)',
          },
        },
      };

      const strConfig = JSON.stringify(config);
      const configContents = strConfig.substr(1, strConfig.length - 2);

      expect(autoAnalyticsEl.querySelector('script').textContent).to.contain(
        configContents
      );
    });
  }
);
