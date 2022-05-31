import {doesOriginDomainMatchIframeSrc, initRecaptcha} from '#3p/recaptcha';

import * as urls from '../../../src/config/urls';
import {parseUrlDeprecated} from '../../../src/url';

describes.sandboxed('3p recaptcha.js', {}, () => {
  it('should require a window.name', () => {
    window.name = undefined;
    expect(initRecaptcha).to.throw('window');
  });

  it('should require a sitekey in the window.name dataObject', () => {
    allowConsoleError(() => {
      window.name = '{}';
      expect(initRecaptcha).to.throw('sitekey');
      window.name = undefined;
    });
  });

  it('should require a global property in the window.name dataObject', () => {
    allowConsoleError(() => {
      window.name = '{"sitekey":"sitekey"}';
      expect(initRecaptcha).to.throw('global');
      window.name = undefined;
    });
  });

  describe('doesOriginDomainMatchIframeSrc()', () => {
    const getMockIframeWindowWithLocation = (url) => {
      // NOTE: The thirdPartyUrl returned by the config
      // Will return localhost for testing.
      // Therefore, passed URLS should do the same
      return {
        location: parseUrlDeprecated(url),
      };
    };

    it('should require the origin', () => {
      return doesOriginDomainMatchIframeSrc({}, {}).catch((err) => {
        expect(err.message.includes('origin')).to.be.ok;
      });
    });

    it('should allow cache domains', () => {
      return doesOriginDomainMatchIframeSrc(
        getMockIframeWindowWithLocation(
          'https://example-com.recaptcha.' + urls.thirdPartyFrameHost
        ),
        {origin: 'https://example-com.cdn.ampproject.org'}
      ).then(() => {
        expect(true).to.be.ok;
      });
    });

    it('should allow canonical domains', () => {
      return doesOriginDomainMatchIframeSrc(
        getMockIframeWindowWithLocation(
          'https://example-com.recaptcha.' + urls.thirdPartyFrameHost
        ),
        {origin: 'https://example.com'}
      ).then(() => {
        expect(true).to.be.ok;
      });
    });

    it('should allow punycode curls encoded domains', () => {
      return doesOriginDomainMatchIframeSrc(
        getMockIframeWindowWithLocation(
          'https://xn--bcher-ch-65a.recaptcha.' + urls.thirdPartyFrameHost
        ),
        {origin: 'https://xn--bcher-kva.ch'}
      ).then(() => {
        expect(true).to.be.ok;
      });
    });

    it('should allow sha256 curls encoded domains', () => {
      return doesOriginDomainMatchIframeSrc(
        getMockIframeWindowWithLocation(
          'https://a6h5moukddengbsjm77rvbosevwuduec2blkjva4223o4bgafgla.recaptcha.' +
            urls.thirdPartyFrameHost
        ),
        {
          origin:
            'https://hello.xn--4gbrim.xn----rmckbbajlc6dj7bxne2c.xn--wgbh1c',
        }
      ).then(() => {
        expect(true).to.be.ok;
      });
    });
  });
});
