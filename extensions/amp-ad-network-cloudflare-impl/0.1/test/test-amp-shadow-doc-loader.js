import * as sinon from 'sinon';
import {installXhrService} from '../../../../src/service/xhr-impl';
import {ampdocServiceFor} from '../../../../src/ampdoc';
import AmpShadowDocLoader from '../amp-shadow-doc-loader';
import {xhrFor} from '../../../../src/services';


describe('amp-shadow-doc-loader', () => {
  let sandbox;
  let xhr;
  let xhrMock;
  let element;
  let ampShadowDocLoader;
  let ampShadowDocLoaderMock;

  const verify = () => {
    xhrMock.verify();
    ampShadowDocLoaderMock.verify();
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    installXhrService(window);
    xhr = xhrFor(window);
    xhrMock = sandbox.mock(xhr);

    const ampDoc = ampdocServiceFor(window).getAmpDoc();

    element = document.createElement('div');
    element.setAttribute('doc-url', 'http://localhost');
    element.setAttribute('retry-label', 'Try again');
    element.getAmpDoc = () => ampDoc;
    ampShadowDocLoader = new AmpShadowDocLoader(element);
    ampShadowDocLoader.buildCallback();
    ampShadowDocLoaderMock = sandbox.mock(ampShadowDocLoader);

  });

  afterEach(() => {
    sandbox.restore();
  });

  it('validates if doc-url is present', () => {
    element.removeAttribute('doc-url');
    assert.throws(() => {
      ampShadowDocLoader.buildCallback();
    }, 'Attribute "doc-url" is required');
  });

  it('validates if retry-label is present', () => {
    element.removeAttribute('retry-label');
    assert.throws(() => {
      ampShadowDocLoader.buildCallback();
    }, 'Attribute "retry-label" is required');
  });

  it('fetchs document from doc-url attribute', () => {
    const xhrPromise = Promise.resolve();

    ampShadowDocLoaderMock
      .expects('createLoader_')
      .returns(Promise.resolve())
      .once();
    ampShadowDocLoaderMock
      .expects('attachAMPDocument_')
      .returns(Promise.resolve())
      .once();
    xhrMock
      .expects('fetchDocument')
      .withExactArgs('http://localhost', {ampCors: false})
      .returns(xhrPromise);

    return ampShadowDocLoader.layoutCallback().then(verify);
  });

  it('shows try again button in case of the error', () => {
    const errorObject = {error: 'error'};
    const xhrPromise = Promise.reject(errorObject);

    ampShadowDocLoaderMock
      .expects('createLoader_')
      .returns(Promise.resolve())
      .once();
    ampShadowDocLoaderMock
      .expects('createRetryButton_')
      .returns(Promise.resolve())
      .once();
    ampShadowDocLoaderMock
      .expects('dispatchEvent_')
      .withExactArgs('error', errorObject)
      .once();
    xhrMock
      .expects('fetchDocument')
        .withExactArgs('http://localhost', {ampCors: false})
      .returns(xhrPromise);

    return ampShadowDocLoader.layoutCallback().then(verify);
  });

  it('by default sets element to visible on viewportCallback', () => {
    const setVisibilityState = sinon.stub();

    ampShadowDocLoader.ampDoc_ = { setVisibilityState };
    ampShadowDocLoader.viewportCallback();

    assert.ok(setVisibilityState.called);
  });

  it('skips visibility if visibility-managment is set to manual', () => {
    const setVisibilityState = sinon.stub();

    element.setAttribute('visibility-managment', 'manual');

    ampShadowDocLoader.ampDoc_ = { setVisibilityState };
    ampShadowDocLoader.buildCallback();
    ampShadowDocLoader.viewportCallback();

    assert.notOk(setVisibilityState.called);
  });

  it('generates unique id if was not provided', () => {
    const createElement = () => {
      const element = document.createElement('DIV');
      element.setAttribute('retry-label', '');
      element.setAttribute('doc-url', '');

      return element;
    };

    let testElement = createElement();
    let ampShadowDocLoader;

    assert.notOk(testElement.id);
    ampShadowDocLoader = new AmpShadowDocLoader(testElement).buildCallback();
    assert.ok(testElement.id);
    testElement = createElement();
    testElement.setAttribute('id', 'myId');
    ampShadowDocLoader = new AmpShadowDocLoader(testElement).buildCallback();
    assert.equal(testElement.id, 'myId');
  });
});
