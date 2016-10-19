import {AmpAdUIHandler} from '../amp-ad-ui';
import {BaseElement} from '../../../../src/base-element';
import {setStyles} from '../../../../src/style';
import * as sinon from 'sinon';

describe('amp-ad-ui handler', () => {
  let sandbox;
  let adImpl;
  let uiHandler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const adElement = document.createElement('amp-ad');
    adImpl = new BaseElement(adElement);
    uiHandler = new AmpAdUIHandler(adImpl);
  });

  afterEach(() => {
    sandbox.restore();
    uiHandler = null;
  });

  it('should try to collapse element', () => {
    sandbox.stub(adImpl, 'attemptChangeHeight', height => {
      expect(height).to.equal(0);
      return Promise.resolve();
    });
    const collapseSpy = sandbox.stub(adImpl, 'collapse', () => {});
    uiHandler.init();
    uiHandler.displayNoContentUI();
    return Promise.resolve().then(() => {
      expect(collapseSpy).to.be.calledOnce;
      console.log('aaaaa');
      expect(uiHandler.state).to.equal(3);
    });
  });

  it('should NOT continue with display state UN_LAID_OUT', () => {
    sandbox.stub(adImpl, 'getFallback', () => {
      return true;
    });
    const spy = sandbox.stub(adImpl, 'deferMutate', callback => {
      uiHandler.state = 4;
      callback();
    });
    const placeHolderSpy = sandbox.stub(adImpl, 'togglePlaceholder');
    uiHandler.init();
    uiHandler.displayNoContentUI();
    expect(spy).to.be.called;
    expect(placeHolderSpy).to.not.be.called;
    expect(uiHandler.state).to.equal(4);
  });
});
