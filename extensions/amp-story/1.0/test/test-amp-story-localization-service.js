import {getSupportedLanguageCode} from '../amp-story-localization-service';

describes.fakeWin('amp-story-localization-service', {amp: true}, () => {
  describe('getSupportedLanguageCode', () => {
    it('returns the first language code when it is supported', () => {
      expect(
        getSupportedLanguageCode(['es-419', 'es', 'en', 'default'])
      ).to.equal('es-419');
    });

    it('returns the fallback language code when the first is not supported', () => {
      expect(
        getSupportedLanguageCode(['es-519', 'es', 'en', 'default'])
      ).to.equal('es');
    });

    it('returns the properly cased value', () => {
      expect(getSupportedLanguageCode(['en-gb', 'en', 'default'])).to.equal(
        'en-GB'
      );
    });

    it('returns en when nothing is supported', () => {
      expect(getSupportedLanguageCode(['AlfredoOoOoOoOooooo'])).to.equal('en');
      expect(getSupportedLanguageCode([])).to.equal('en');
      expect(getSupportedLanguageCode(['en'])).to.equal('en');
      expect(getSupportedLanguageCode(['default'])).to.equal('en');
    });
  });
});
