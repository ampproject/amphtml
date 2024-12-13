import {Deferred} from '#core/data-structures/promise';
import {createElementWithAttributes} from '#core/dom';

import {getA4AId, registerIniLoadListener} from '#inabox/utils';

import {Services} from '#service';

import {sleep} from '#testing/helpers';

import * as IniLoad from '../../../src/ini-load';

describes.realWin('inabox-utils', {}, (env) => {
  let dispatchEventStub;
  let parentPostMessageStub;
  let initCustomEventStub;
  let ampdoc;
  let a4aIdMetaElement;
  let iniLoadDeferred;

  function addA4AMetaTagToDocument() {
    a4aIdMetaElement = createElementWithAttributes(env.win.document, 'meta', {
      name: 'amp4ads-id',
      content: 'vendor=doubleclick,type=impression-id,value=12345',
    });
    env.win.document.head.appendChild(a4aIdMetaElement);
  }

  beforeEach(() => {
    ampdoc = {win: env.win, getRootNode: () => ({})};
    iniLoadDeferred = new Deferred();

    env.sandbox
      .stub(IniLoad, 'whenContentIniLoadMeasure')
      .returns(iniLoadDeferred.promise);
    env.sandbox
      .stub(Services, 'viewportForDoc')
      .withArgs(ampdoc)
      .returns({getLayoutRect: () => ({})});
    parentPostMessageStub = env.sandbox.stub();
    dispatchEventStub = env.sandbox.stub();
    initCustomEventStub = env.sandbox.stub();
    env.win.parent = {postMessage: parentPostMessageStub};
    env.win.CustomEvent = (type, eventInit) => {
      initCustomEventStub(type, eventInit);
    };
    env.win.document.createEvent = () => ({
      initCustomEvent: initCustomEventStub,
    });
    env.win.dispatchEvent = dispatchEventStub;
  });

  it('should fire custom event and postMessage', async () => {
    registerIniLoadListener(ampdoc);
    expect(dispatchEventStub).to.not.be.called;
    expect(parentPostMessageStub).to.not.be.called;
    iniLoadDeferred.resolve([]);
    await sleep(10);
    expect(dispatchEventStub).to.be.calledOnce;
    expect(initCustomEventStub).to.be.calledWith('amp-ini-load');
    expect(parentPostMessageStub).to.be.calledWith('amp-ini-load', '*');
  });

  it('Should not return an a4aId if no a4a meta tag in head', () => {
    expect(getA4AId(env.win)).to.be.not.ok;
  });

  it('Should be able to get the a4aId if on the document', () => {
    addA4AMetaTagToDocument();
    expect(getA4AId(env.win)).to.be.ok;
  });
});
