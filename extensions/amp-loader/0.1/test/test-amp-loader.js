import {LoaderService} from '../amp-loader';

describes.fakeWin('amp-loader', {amp: true}, function (env) {
  let doc = env.win.document;
  let loaderService;
  let el;
  beforeEach(() => {
    el = doc.createElement();
    loaderService = new LoaderService();
  });

  describe('initializeLoader', () => {
    it('sets loader-delay-offset', () => {});
    it('loader-delay-offset can never be more than 600ms', () => {});
  });
});
