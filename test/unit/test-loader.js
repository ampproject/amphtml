import * as lolex from 'lolex';
import {createLoaderElement} from '../../src/loader';
import {LoaderService} from '../../extensions/amp-loader'
import {Services} from '../../../../src/services';

describes.fakeWin('Loader', {amp: true}, (env) => {
    let clock;
    let ampdoc;
    let loaderService;
    let el;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    el = document.createElement('div');
    clock = lolex.install({now: 50});
    env.sandbox
      .stub(Services, 'loader')
      .returns(new Promise((res) => {
          loaderService = new LoaderService();
          setTimeout(() => res(loaderService), 100)
      })); 
  });

  it('By default, the delay in retrieving LoaderService should be the initDelay', () => {
      env.sandbox.spy(loaderService, 'initializeLoader')
      createLoaderElement(ampdoc, el, 400, 400); 
      clock.tick(100);

      expect(loaderService).calledOnceWithMatch(el, env.sandbox.match.any(), 100, 400, 400)
  });
  
  it('If specified, startTime should contribute to the initDelay', () => {
      env.sandbox.spy(loaderService, 'initializeLoader')
      createLoaderElement(ampdoc, el, 400, 400, 0); 
      clock.tick(100); 

      expect(loaderService).calledOnceWithMatch(el, env.sandbox.match.any(), 150, 400, 400)
  });
});
