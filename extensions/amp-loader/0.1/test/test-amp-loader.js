import {getStyle} from '#core/dom/style';

import {LoaderService} from '../amp-loader';

describes.fakeWin('amp-loader', {}, () => {
  let loaderService;
  let el;
  let loaderRoot;
  const width = 400;
  const height = 400;

  beforeEach(() => {
    el = document.createElement('div');
    el.getPlaceholder = () => {};
    el.createLoaderLogo = () => ({color: ''});
    loaderRoot = document.createElement('div');
    loaderService = new LoaderService();
  });

  describe('initializeLoader', () => {
    it('sets loader-delay-offset', () => {
      loaderService.initializeLoader(
        el,
        loaderRoot,
        /* initDelay */ 150,
        width,
        height
      );
      const offset = getStyle(el, '--loader-delay-offset');
      expect(offset).equal('150ms');
    });

    it('loader-delay-offset maxes out at 600ms', () => {
      loaderService.initializeLoader(
        el,
        loaderRoot,
        /* initDelay */ 650,
        width,
        height
      );
      const offset = getStyle(el, '--loader-delay-offset');
      expect(offset).equal('600ms');
    });
  });
});
