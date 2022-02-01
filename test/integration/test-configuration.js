import {AmpEvents_Enum} from '#core/constants/amp-events';

import {createFixtureIframe} from '#testing/iframe';

describes.sandboxed('Configuration', {}, function () {
  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/configuration.html', 500).then(
      (f) => {
        fixture = f;
      }
    );
  });

  it('urls should be configurable', () => {
    expect(fixture.win.AMP_CONFIG).to.equal(undefined);

    const config = (fixture.win.AMP_CONFIG = {});
    config.cdnUrl = 'http://foo.bar.com';
    config.thirdPartyUrl = 'http://bar.baz.com';
    config.thirdPartyFrameRegex = /a-website\.com/;
    config.errorReportingUrl = 'http://error.foo.com';
    config.geoApiUrl = 'http://geo.bar.com';

    return fixture.awaitEvent(AmpEvents_Enum.LOAD_START, 1).then(() => {
      expect(fixture.win.AMP.config.urls.cdn).to.equal(config.cdnUrl);
      expect(fixture.win.AMP.config.urls.thirdParty).to.equal(
        config.thirdPartyUrl
      );
      expect(fixture.win.AMP.config.urls.thirdPartyFrameRegex).to.equal(
        config.thirdPartyFrameRegex
      );
      expect(fixture.win.AMP.config.urls.errorReporting).to.equal(
        config.errorReportingUrl
      );
      expect(fixture.win.AMP.config.urls.geoApi).to.equal(config.geoApiUrl);
    });
  });
});
