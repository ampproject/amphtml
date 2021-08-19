import * as fakeTimers from '@sinonjs/fake-timers';

import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {FakeWindow} from '#testing/fake-dom';

import {
  getElementServiceForDoc,
  getElementServiceIfAvailable,
  getElementServiceIfAvailableForDoc,
  getElementServiceIfAvailableForDocInEmbedScope,
} from '../../src/element-service';
import {
  installServiceInEmbedDoc,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  setParentWindow,
} from '../../src/service-helpers';

describes.realWin('getElementServiceIfAvailable()', {amp: true}, (env) => {
  let win, doc;
  let extensionsMock;
  let clock;

  beforeEach(() => {
    win = env.win;
    doc = env.win.document;
    clock = fakeTimers.withGlobal(win).install();

    extensionsMock = env.sandbox.mock(Services.extensionsFor(win));
  });

  afterEach(() => {
    clock.uninstall();
    extensionsMock.verify();
  });

  it('should wait for body', async () => {
    const {body} = doc;
    doc.documentElement.removeChild(body);
    let resolvedService;
    const p1 = getElementServiceIfAvailable(win, 'e1', 'element1', '0.1').then(
      (service) => {
        resolvedService = service;
        return service;
      }
    );

    await Promise.resolve();
    expect(resolvedService).to.be.undefined;

    // Resolve body.
    doc.documentElement.appendChild(body);
    expect(doc.body).to.exist;
    clock.tick(1000);

    const service = await p1;
    expect(resolvedService).to.be.null;
    expect(service).to.be.null;
  });

  it('should resolve with body when not available', async () => {
    const service = await getElementServiceIfAvailable(
      win,
      'e1',
      'element1',
      '0.1'
    );
    expect(service).to.be.null;
  });

  it('should resolve when available', async () => {
    const script = createElementWithAttributes(doc, 'script', {
      'custom-element': 'element1',
    });
    env.sandbox
      .stub(script, 'src')
      .value('https://cdn.ampproject.org/v0/element1-0.1.js');
    doc.head.appendChild(script);

    extensionsMock
      .expects('waitForExtension')
      .withExactArgs('element1', '0.1')
      .returns(Promise.resolve({}))
      .once();

    const promise = getElementServiceIfAvailable(win, 'e1', 'element1', '0.1');

    registerServiceBuilder(win, 'e1', function () {
      return {str: 'fake1'};
    });

    const service = await promise;
    expect(service).to.deep.equal({str: 'fake1'});
  });

  it('should not wait for the element-service', async () => {
    const script = createElementWithAttributes(doc, 'script', {
      'custom-element': 'element1',
    });
    env.sandbox
      .stub(script, 'src')
      .value('https://cdn.ampproject.org/v0/element1-0.1.js');
    doc.head.appendChild(script);

    extensionsMock
      .expects('waitForExtension')
      .withExactArgs('element1', '0.1')
      .returns(Promise.resolve({}))
      .once();

    const promise = getElementServiceIfAvailable(
      win,
      'e1',
      'element1',
      '0.1',
      true
    );

    const service = await promise;
    expect(service).to.deep.be.null;
  });
});

describes.realWin(
  'in single ampdoc',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let win, doc, ampdoc;
    let extensionsMock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      extensionsMock = env.sandbox.mock(Services.extensionsFor(win));
    });

    afterEach(() => {
      extensionsMock.verify();
    });

    describe('getElementServiceIfAvailable()', () => {
      it('should be provided by element if available', async () => {
        const script = createElementWithAttributes(doc, 'script', {
          'custom-element': 'element1',
        });
        env.sandbox
          .stub(script, 'src')
          .value('https://cdn.ampproject.org/v0/element1-0.1.js');
        doc.head.appendChild(script);

        extensionsMock
          .expects('waitForExtension')
          .withExactArgs('element1', '0.1')
          .returns(Promise.resolve({}))
          .once();

        const p1 = getElementServiceIfAvailable(
          env.win,
          'e1',
          'element1',
          '0.1'
        );
        const p2 = getElementServiceIfAvailable(
          env.win,
          'e2',
          'not-available',
          '0.1'
        );
        registerServiceBuilder(env.win, 'e1', function () {
          return {str: 'from e1'};
        });

        const s1 = await p1;
        expect(s1).to.deep.equal({str: 'from e1'});

        const s2 = await p2;
        expect(s2).to.be.null;
      });
    });

    describe('getElementServiceForDoc()', () => {
      it('should be provided by element', async () => {
        // Make sure that `whenExtensionsKnown` is observerd.
        ampdoc.signals().reset('-ampdoc-ext-known');
        extensionsMock
          .expects('waitForExtension')
          .withExactArgs('element1', '0.2')
          .returns(Promise.resolve({}))
          .twice();

        const p1 = getElementServiceForDoc(ampdoc, 'e1', 'element1');
        const p2 = getElementServiceForDoc(ampdoc, 'e1', 'element1');

        ampdoc.declareExtension('element1', '0.2');
        ampdoc.setExtensionsKnown();

        registerServiceBuilder(env.win, 'e1', function () {
          return {str: 'from e1'};
        });

        const s1 = await p1;
        expect(s1).to.deep.equal({str: 'from e1'});

        const s2 = await p2;
        expect(s2).to.equal(s1);
      });

      it('should fail if element is not in page.', () => {
        expectAsyncConsoleError(
          /e1 was requested to be provided through element-bar/
        );

        return getElementServiceForDoc(ampdoc, 'e1', 'element-bar')
          .then(
            () => {
              return 'SUCCESS';
            },
            (error) => {
              return 'ERROR ' + error;
            }
          )
          .then((result) => {
            expect(result).to.match(
              /Service e1 was requested to be provided through element-bar/
            );
          });
      });
    });

    describe('getElementServiceIfAvailableForDoc()', () => {
      it('should be provided by element if available', async () => {
        // Make sure that `whenExtensionsKnown` is observerd.
        ampdoc.signals().reset('-ampdoc-ext-known');
        extensionsMock
          .expects('waitForExtension')
          .withExactArgs('element1', '0.2')
          .returns(Promise.resolve({}))
          .once();

        const p1 = getElementServiceIfAvailableForDoc(ampdoc, 'e1', 'element1');
        const p2 = getElementServiceIfAvailableForDoc(
          ampdoc,
          'e2',
          'not-available'
        );

        ampdoc.declareExtension('element1', '0.2');
        ampdoc.setExtensionsKnown();

        registerServiceBuilder(env.win, 'e1', function () {
          return {str: 'from e1'};
        });

        const s1 = await p1;
        expect(s1).to.deep.equal({str: 'from e1'});

        const s2 = await p2;
        expect(s2).to.be.null;
      });

      it('resolve w/ body when not available', async () => {
        const service = await getElementServiceIfAvailableForDoc(
          ampdoc,
          'e1',
          'element1'
        );
        expect(service).to.be.null;
      });

      it('should resolve with body when available', async () => {
        // Make sure that `whenExtensionsKnown` is observerd.
        ampdoc.signals().reset('-ampdoc-ext-known');
        extensionsMock
          .expects('waitForExtension')
          .withExactArgs('element1', '0.2')
          .returns(Promise.resolve({}))
          .once();

        const p1 = getElementServiceIfAvailableForDoc(ampdoc, 'e1', 'element1');

        ampdoc.declareExtension('element1', '0.2');
        ampdoc.setExtensionsKnown();

        registerServiceBuilder(env.win, 'e1', function () {
          return {str: 'fake1'};
        });

        const service = await p1;
        expect(service).to.deep.equal({str: 'fake1'});
      });
    });
  }
);

describes.fakeWin('in embed scope', {amp: true}, (env) => {
  let win;
  let embedWin;
  let nodeInEmbedWin;
  let nodeInTopWin;
  let frameElement;
  let service;
  let embedAmpDoc;
  let extensionsMock;

  beforeEach(() => {
    win = env.win;
    extensionsMock = env.sandbox.mock(Services.extensionsFor(win));

    frameElement = win.document.createElement('div');
    win.document.body.appendChild(frameElement);

    embedWin = new FakeWindow();
    embedWin.frameElement = frameElement;
    setParentWindow(embedWin, win);

    embedAmpDoc = env.ampdocService.installFieDoc(
      'https://example.org',
      embedWin
    );

    nodeInEmbedWin = {
      nodeType: Node.ELEMENT_NODE,
      ownerDocument: embedWin.document,
      getRootNode: () => embedWin.document,
    };
    nodeInTopWin = {
      nodeType: Node.ELEMENT_NODE,
      ownerDocument: win.document,
      getRootNode: () => win.document,
    };

    service = {name: 'fake-service-object'};
  });

  afterEach(() => {
    extensionsMock.verify();
  });

  it('should return existing service', () => {
    installServiceInEmbedDoc(embedAmpDoc, 'foo', service);
    return getElementServiceIfAvailableForDocInEmbedScope(
      nodeInEmbedWin,
      'foo',
      'amp-foo'
    ).then((returned) => {
      expect(returned).to.equal(service);
    });
  });

  it('should return service for scheduled element', async () => {
    // Make sure that `whenExtensionsKnown` is observerd.
    embedAmpDoc.signals().reset('-ampdoc-ext-known');
    extensionsMock
      .expects('waitForExtension')
      .withExactArgs('amp-foo', '0.2')
      .returns(Promise.resolve({}))
      .once();

    const promise = getElementServiceIfAvailableForDocInEmbedScope(
      nodeInEmbedWin,
      'foo',
      'amp-foo'
    );

    embedAmpDoc.declareExtension('amp-foo', '0.2');
    embedAmpDoc.setExtensionsKnown();

    installServiceInEmbedDoc(embedAmpDoc, 'foo', service);

    const returned = await promise;
    expect(returned).to.equal(service);
  });

  it('should return ampdoc-scope service if node in top window', async () => {
    registerServiceBuilderForDoc(
      nodeInTopWin,
      'foo',
      function () {
        return service;
      },
      /* opt_instantiate */ true
    );

    const returned = await getElementServiceIfAvailableForDocInEmbedScope(
      nodeInTopWin,
      'foo',
      'amp-foo'
    );
    expect(returned).to.equal(service);
  });

  it('should NOT return ampdoc-scope service if node in embed window', async () => {
    registerServiceBuilderForDoc(
      nodeInTopWin,
      'foo',
      function () {
        return service;
      },
      /* opt_instantiate */ true
    );

    embedAmpDoc.setExtensionsKnown();

    const returned = await getElementServiceIfAvailableForDocInEmbedScope(
      nodeInEmbedWin,
      'foo',
      'amp-foo'
    );
    expect(returned).to.be.null;
  });
});
