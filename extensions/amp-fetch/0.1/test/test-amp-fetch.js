import * as sinon from 'sinon';

import {installXhrService} from '../../../../src/service/xhr-impl';
import {Services} from '../../../../src/services';
import AmpFetch from '../amp-fetch';

describes.realWin('amp-fetch extension', {
  amp: {
    extensions: ['amp-fetch'],
  },
}, env => {
  let win, doc, ampdoc;

  let sandbox;
  let xhr;
  let xhrMock;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;

    sandbox = sinon.sandbox.create();
    installXhrService(win);
    xhr = Services.xhrFor(win);
    xhrMock = sandbox.mock(xhr);
    element = doc.createElement('div');

    element.setAttribute('url', 'document-url');
  });

  afterEach(() => {
      sandbox.restore();
  });

  it('should store document url', function() {
    const ampFetch = new AmpFetch(element);

    ampFetch.buildCallback();
    assert(ampFetch.url === 'document-url');
  });

  it('should prefetch url when element is visible', function() {
    const ampFetch = new AmpFetch(element);

    xhrMock
      .expects('fetchDocument')
      .once()
      .withExactArgs('document-url', { ampCors: false })
      .returns(Promise.resolve());

    ampFetch.buildCallback();
    ampFetch.viewportCallback(false);
    ampFetch.viewportCallback(true);

    xhrMock.verify();

  });

  it('should avoid multiple calls to the same url', function() {
    element.setAttribute('url', 'document-url-fresh');

    const ampFetch = new AmpFetch(element);

    xhrMock
      .expects('fetchDocument')
      .returns(Promise.resolve())
      .withExactArgs('document-url-fresh', { ampCors: false })
      .once();

    ampFetch.buildCallback();
    ampFetch.viewportCallback(true);
    ampFetch.viewportCallback(true);
    ampFetch.viewportCallback(true);
    ampFetch.viewportCallback(true);

    xhrMock.verify();
  });

});




