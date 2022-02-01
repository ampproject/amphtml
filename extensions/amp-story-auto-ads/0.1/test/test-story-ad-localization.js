import {CtaTypes, StoryAdLocalization} from '../story-ad-localization';

describes.realWin('amp-story-auto-ads:localization', {amp: true}, (env) => {
  describe('story ad localization', () => {
    it('registers and returns localized string [es]', () => {
      const {win} = env;
      win.document.documentElement.setAttribute('lang', 'es');
      const localization = new StoryAdLocalization(win.document.body);
      const localized = localization.getLocalizedString(CtaTypes['INSTALL']);
      expect(localized).to.equal('Instalar ahora');
    });

    it('registers and returns localized string [zh-CN]', () => {
      const {win} = env;
      win.document.documentElement.setAttribute('lang', 'zh-CN');
      const localization = new StoryAdLocalization(win.document.body);
      const localized = localization.getLocalizedString(CtaTypes['SHOP']);
      expect(localized).to.equal('选购');
    });
  });
});
