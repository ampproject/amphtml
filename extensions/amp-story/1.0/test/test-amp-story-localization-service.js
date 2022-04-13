import {getSupportedLanguageCode} from '../amp-story-localization-service';

describes.fakeWin('amp-story-localization-service', {amp: true}, () => {
  describe('getSupportedLanguageCode', () => {
    it('returns the first language code when it is supported', () => {
      expect(
        getSupportedLanguageCode(
          ['es-419', 'es', 'en', 'default'],
          ['en', 'es', 'es-419']
        )
      ).to.equal('es-419');
    });

    it('returns the fallback language code when the first is not supported', () => {
      expect(
        getSupportedLanguageCode(
          ['es-419', 'es', 'en', 'default'],
          ['en', 'es']
        )
      ).to.equal('es');
    });

    it('returns en when nothing is supported', () => {
      expect(
        getSupportedLanguageCode(['es-419', 'es', 'en', 'default'], [])
      ).to.equal('en');
      expect(
        getSupportedLanguageCode(['es-419', 'es', 'default'], [])
      ).to.equal('en');
    });
  });
});
