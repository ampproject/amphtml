import {BrowserController, RequestBank} from '#testing/helpers/service';

describes.sandboxed('user-error', {}, function () {
  describes.integration(
    'user-error integration test',
    {
      extensions: ['amp-analytics'],
      hash: 'log=0',
      body: `
    <amp-analytics>
      <script type="application/json">
        {
          "requests": {
            "error": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "userError": {
              "on": "user-error",
              "request": "error"
            }
          }
        }
      </script>
    </amp-analytics>

    <amp-pixel src="https://foo.com/tracker/foo"
            referrerpolicy="fail-referrer">
            `,
    },
    (env) => {
      beforeEach(() => {
        const browser = new BrowserController(env.win);
        return browser.waitForElementLayout('amp-analytics');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should ping correct host with amp-pixel user().assert err', () => {
        return RequestBank.withdraw();
      });
    }
  );

  describes.integration(
    'user-error integration test',
    {
      extensions: ['amp-analytics'],
      hash: 'log=0',
      body: `
    <amp-img
      src="../../examples/img/sea@1x.jpg"
      width="360" height="216" layout="responsive"
      role='img'>
    </amp-img>

    <amp-analytics>
      <script type="application/json">
        {
          "requests": {
            "error": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "userError": {
              "on": "user-error",
              "request": "error"
            }
          }
        }
      </script>
    </amp-analytics>`,
    },
    (env) => {
      beforeEach(() => {
        const browser = new BrowserController(env.win);
        return browser.waitForElementLayout('amp-analytics, amp-img');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should ping correct host with amp-img user().error err', () => {
        return RequestBank.withdraw();
      });
    }
  );

  describes.integration(
    '3p user-error integration test',
    {
      extensions: ['amp-analytics', 'amp-ad'],
      hash: 'log=0',
      body: `
    <amp-ad width=300 height=250
        type="_ping_"
        data-url='not-exist'
        data-valid='false'
        data-error='true'>
    </amp-ad>

    <amp-analytics>
      <script type="application/json">
        {
          "requests": {
            "error": "${RequestBank.getUrl()}"
          },
          "triggers": {
            "userError": {
              "on": "user-error",
              "request": "error"
            }
          }
        }
      </script>
    </amp-analytics>`,
    },
    (env) => {
      beforeEach(() => {
        const browser = new BrowserController(env.win);
        return browser.waitForElementLayout('amp-analytics, amp-ad');
      });

      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should ping correct host with 3p error message', () => {
        return RequestBank.withdraw();
      });
    }
  );
});
