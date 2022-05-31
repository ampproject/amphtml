import {adConfig} from '#ads/_config';

import {hasOwn} from '#core/types/object';

describes.sandboxed('test-ads-config', {}, () => {
  it('should have all ad networks configured', () => {
    window.ampTestRuntimeConfig.adTypes.forEach((adType) => {
      expect(adConfig, `Missing config for [${adType}]`).to.contain.key(adType);
    });
  });

  // TODO(jeffkaufman, #13422): this test was silently failing
  it.skip('should sort adConfig in alphabetic order', () => {
    delete adConfig.fakead3p;
    const keys = Object.keys(adConfig);
    for (let i = 0; i < keys.length - 1; i++) {
      assert(
        keys[i] <= keys[i + 1],
        'Keys not sorted: ' + keys[i] + ' should sort before ' + keys[i + 1]
      );
    }
  });

  it('preconnect should have no duplicates with prefetch', () => {
    for (const adNetwork in adConfig) {
      if (!hasOwn(adConfig, adNetwork)) {
        continue;
      }

      const config = adConfig[adNetwork];

      if (config.prefetch) {
        checkDuplicates(config.preconnect, config.prefetch, adNetwork);
      }
    }
  });

  it('should use HTTPS URLs', () => {
    for (const adNetwork in adConfig) {
      if (!hasOwn(adConfig, adNetwork)) {
        continue;
      }

      const config = adConfig[adNetwork];
      let urls = [];
      if (config.preconnect) {
        urls = urls.concat(config.preconnect);
      }
      if (config.prefetch) {
        urls = urls.concat(config.prefetch);
      }
      for (let i = 0; i < urls.length; i++) {
        expect(urls[i].substr(0, 8), `${urls[i]} is not HTTPS`).to.equal(
          'https://'
        );
      }
    }
  });
});

function checkDuplicates(preconnects, prefetches, adNetwork) {
  if (!Array.isArray(preconnects)) {
    preconnects = [preconnects];
  }

  if (!Array.isArray(prefetches)) {
    prefetches = [prefetches];
  }

  const errorMsg = `[${adNetwork}] no need to preconnect if the URL is in prefetch`;
  for (let i = 0; i < preconnects.length; i++) {
    for (let j = 0; j < prefetches.length; j++) {
      expect(prefetches[j], errorMsg).to.not.contain(preconnects[i]);
    }
  }
}
