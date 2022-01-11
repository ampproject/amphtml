import {AmpCacheUrlService} from '../amp-cache-url';

describes.fakeWin(
  'amp-cache-url',
  {amp: {extensions: ['amp-cache-url']}},
  () => {
    it('should return a cached url', async () => {
      const cacheUrlService = new AmpCacheUrlService();
      const result = await cacheUrlService.createCacheUrl(
        'https://amp.dev/stories'
      );
      expect(result).to.equal(
        'https://amp-dev.cdn.ampproject.org/c/s/amp.dev/stories'
      );
    });

    it('should not throw with empty url', async () => {
      const cacheUrlService = new AmpCacheUrlService();
      expect(cacheUrlService.createCacheUrl('')).to.not.be.rejected;
    });

    it('should not throw with invalid url', async () => {
      const cacheUrlService = new AmpCacheUrlService();
      expect(cacheUrlService.createCacheUrl('invalid url')).to.not.be.rejected;
    });
  }
);
