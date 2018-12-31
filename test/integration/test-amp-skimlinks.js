import {BrowserController, RequestBank} from '../../testing/test-helper';

const pageTrackingUrl = `${RequestBank.getUrl('pageTrackingUrl')}/track.php?data=\${data}`;

describe('amp-skimlinks', function() {
  const setup = {
    extensions: ['amp-skimlinks'],
    body: `
            <amp-skimlinks
                layout="nodisplay"
                publisher-code="68019X1584676"
                tracking="true"
            >
              <script type="application/json">
                {
                    "pageTrackingUrl": "${pageTrackingUrl}"
                }
              </script>
            </amp-skimlinks>
            <div>
                <a id="merchant-link" href="https://nordstrom.com> Test Merchant </a>
            </div>
        `,
  };

  describes.integration('test', setup, env => {
    let browser = null;

    beforeEach(() => {
      browser = new BrowserController(env.win);
      return browser.waitForElementBuild('amp-skimlinks');
    });

    it('should test', () => {
      return RequestBank.withdraw('pageTrackingUrl').then(req => {
        const regex = /^\/track\.php\?data=([^&]*)&?.*$/;
        const match = regex.exec(req.url);

        expect(match.length).to.equal(2);
        const data = JSON.parse(decodeURIComponent(match[1]));
        expect(data.jv).to.equal('amp@1.0.0');
        expect(data.pub).to.equal('68019X1584676');
        // nonblocking.io is the default canonical url
        expect(data.pag).to.equal('http://nonblocking.io/');
        expect(data.uuid.length).to.equal(32);
      });
    });
  });
});
