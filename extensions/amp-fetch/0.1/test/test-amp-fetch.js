import * as sinon from 'sinon';

import {installXhrService} from '../../../../src/service/xhr-impl';
import {xhrFor} from '../../../../src/services';
import AmpFetch from '../amp-fetch';

let sandbox;
let xhr;
let xhrMock;
let element;

function setup() {
  sandbox = sinon.sandbox.create();
  installXhrService(window);
  xhr = xhrFor(window);
  xhrMock = sandbox.mock(xhr);
  element = document.createElement('div');

  element.setAttribute('url', 'document-url');
}

function teardown() {
  sandbox.restore();
}

describe('amp-fetch', () => {
  beforeEach(setup);
  afterEach(teardown);

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
