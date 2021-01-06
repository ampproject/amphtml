/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {FakeWindow} from '../../testing/fake-dom';
import {
  getElementService,
  getElementServiceForDoc,
  getElementServiceIfAvailable,
  getElementServiceIfAvailableForDoc,
  getElementServiceIfAvailableForDocInEmbedScope,
  isExtensionScriptInNode,
} from '../../src/element-service';
import {
  installServiceInEmbedDoc,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
  setParentWindow,
} from '../../src/service';
import {
  markElementScheduledForTesting,
  resetScheduledElementForTesting,
} from '../../src/service/custom-element-registry';

describe('getElementServiceIfAvailable()', () => {
  let doc;
  let win;
  let setIntervalCallback;

  beforeEach(() => {
    doc = {
      head: {},
      body: {},
    };
    doc.documentElement = {ownerDocument: doc};
    doc.getHeadNode = () => doc.head;
    doc.head.querySelectorAll = () => [];

    win = {
      document: doc,
      setInterval: (callback) => {
        setIntervalCallback = callback;
      },
      clearInterval: () => {},
    };
    doc.defaultView = win;

    resetServiceForTesting(win, 'e1');
    resetScheduledElementForTesting(win, 'element-1');
  });

  afterEach(() => {
    setIntervalCallback = undefined;
  });

  it('should wait for doc ready when not available', () => {
    doc.body = null; // Body not available
    let resolvedService;
    const p1 = getElementServiceIfAvailable(win, 'e1', 'element-1').then(
      (service) => {
        resolvedService = service;
        return service;
      }
    );
    return Promise.resolve()
      .then(() => {
        expect(setIntervalCallback).to.exist;
        expect(resolvedService).to.be.undefined;

        // Resolve body.
        doc.body = {};
        setIntervalCallback();
        return p1;
      })
      .then((service) => {
        expect(resolvedService).to.be.null;
        expect(service).to.be.null;
      });
  });

  it('should resolve with body when not available', () => {
    doc.body = {}; // Body is available
    const p1 = getElementServiceIfAvailable(win, 'e1', 'element-1');
    return Promise.resolve()
      .then(() => {
        expect(setIntervalCallback).to.be.undefined;
        return p1;
      })
      .then((service) => {
        expect(service).to.be.null;
      });
  });

  it('should wait for body when available', () => {
    doc.body = null; // Body not available
    let resolvedService;
    const p1 = getElementServiceIfAvailable(win, 'e1', 'element-1').then(
      (service) => {
        resolvedService = service;
        return service;
      }
    );
    return Promise.resolve()
      .then(() => {
        expect(setIntervalCallback).to.exist;
        expect(resolvedService).to.be.undefined;

        // Resolve body.
        markElementScheduledForTesting(win, 'element-1');
        registerServiceBuilder(win, 'e1', function () {
          return {str: 'fake1'};
        });
        doc.body = {};
        setIntervalCallback();
        return p1;
      })
      .then((service) => {
        expect(resolvedService).to.deep.equal({str: 'fake1'});
        expect(service).to.deep.equal({str: 'fake1'});
      });
  });

  it('should resolve with body when available', () => {
    doc.body = {}; // Body is available
    markElementScheduledForTesting(win, 'element-1');
    const p1 = getElementServiceIfAvailable(win, 'e1', 'element-1');
    return Promise.resolve()
      .then(() => {
        expect(setIntervalCallback).to.be.undefined;
        registerServiceBuilder(win, 'e1', function () {
          return {str: 'fake1'};
        });
        return p1;
      })
      .then((service) => {
        expect(service).to.deep.equal({str: 'fake1'});
      });
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
    let ampdoc;

    beforeEach(() => {
      ampdoc = env.ampdoc;

      resetServiceForTesting(env.win, 'e1');
      resetScheduledElementForTesting(env.win, 'element-1');
      resetScheduledElementForTesting(env.win, 'element-foo');
    });

    describe('getElementService()', () => {
      it('should be provided by element', () => {
        markElementScheduledForTesting(env.win, 'element-1');
        const p1 = getElementService(env.win, 'e1', 'element-1');
        const p2 = getElementService(env.win, 'e1', 'element-1');

        registerServiceBuilder(env.win, 'e1', function () {
          return {str: 'from e1'};
        });

        return p1.then((s1) => {
          expect(s1).to.deep.equal({str: 'from e1'});
          return p2.then((s2) => {
            expect(s1).to.equal(s2);
          });
        });
      });

      it('should fail if element is not in page.', () => {
        expectAsyncConsoleError(
          /e1 was requested to be provided through element-bar/
        );
        markElementScheduledForTesting(env.win, 'element-foo');

        return getElementService(env.win, 'e1', 'element-bar')
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

    describe('getElementServiceIfAvailable()', () => {
      it('should be provided by element if available', () => {
        markElementScheduledForTesting(env.win, 'element-1');
        const p1 = getElementServiceIfAvailable(env.win, 'e1', 'element-1');
        const p2 = getElementServiceIfAvailable(env.win, 'e2', 'not-available');
        registerServiceBuilder(env.win, 'e1', function () {
          return {str: 'from e1'};
        });
        return p1.then((s1) => {
          expect(s1).to.deep.equal({str: 'from e1'});
          return p2.then((s2) => {
            expect(s2).to.be.null;
          });
        });
      });
    });

    describe('getElementServiceForDoc()', () => {
      it('should be provided by element', () => {
        markElementScheduledForTesting(env.win, 'element-1');
        const p1 = getElementServiceForDoc(ampdoc, 'e1', 'element-1');
        const p2 = getElementServiceForDoc(ampdoc, 'e1', 'element-1');

        registerServiceBuilder(env.win, 'e1', function () {
          return {str: 'from e1'};
        });

        return p1.then((s1) => {
          expect(s1).to.deep.equal({str: 'from e1'});
          return p2.then((s2) => {
            expect(s1).to.equal(s2);
          });
        });
      });

      it('should fail if element is not in page.', () => {
        expectAsyncConsoleError(
          /e1 was requested to be provided through element-bar/
        );
        markElementScheduledForTesting(env.win, 'element-foo');

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
      it('should be provided by element if available', () => {
        markElementScheduledForTesting(env.win, 'element-1');
        const p1 = getElementServiceIfAvailableForDoc(
          ampdoc,
          'e1',
          'element-1'
        );
        const p2 = getElementServiceIfAvailableForDoc(
          ampdoc,
          'e2',
          'not-available'
        );
        registerServiceBuilder(env.win, 'e1', function () {
          return {str: 'from e1'};
        });
        return p1.then((s1) => {
          expect(s1).to.deep.equal({str: 'from e1'});
          return p2.then((s2) => {
            expect(s2).to.be.null;
          });
        });
      });

      it('should wait for body when not available', () => {
        let bodyResolver;
        ampdoc.bodyPromise_ = new Promise((resolve) => {
          bodyResolver = resolve;
        });
        let resolvedService;
        const p1 = getElementServiceIfAvailableForDoc(
          ampdoc,
          'e1',
          'element-1'
        ).then((service) => {
          resolvedService = service;
          return service;
        });
        return Promise.resolve()
          .then(() => {
            expect(resolvedService).to.be.undefined;

            // Resolve body.
            bodyResolver();
            return p1;
          })
          .then((service) => {
            expect(resolvedService).to.be.null;
            expect(service).to.be.null;
          });
      });

      it('resolve w/ body when not available', () => {
        const p1 = getElementServiceIfAvailableForDoc(
          ampdoc,
          'e1',
          'element-1'
        );
        return Promise.resolve()
          .then(() => {
            return p1;
          })
          .then((service) => {
            expect(service).to.be.null;
          });
      });

      it('should wait for body when available', () => {
        let bodyResolver;
        ampdoc.bodyPromise_ = new Promise((resolve) => {
          bodyResolver = resolve;
        });
        let resolvedService;
        const p1 = getElementServiceIfAvailableForDoc(
          ampdoc,
          'e1',
          'element-1'
        ).then((service) => {
          resolvedService = service;
          return service;
        });
        return Promise.resolve()
          .then(() => {
            expect(resolvedService).to.be.undefined;

            // Resolve body.
            markElementScheduledForTesting(env.win, 'element-1');
            registerServiceBuilder(env.win, 'e1', function () {
              return {str: 'fake1'};
            });
            bodyResolver();
            return p1;
          })
          .then((service) => {
            expect(resolvedService).to.deep.equal({str: 'fake1'});
            expect(service).to.deep.equal({str: 'fake1'});
          });
      });

      it('should resolve with body when available', () => {
        markElementScheduledForTesting(env.win, 'element-1');
        const p1 = getElementServiceIfAvailableForDoc(
          ampdoc,
          'e1',
          'element-1'
        );
        return Promise.resolve()
          .then(() => {
            registerServiceBuilder(env.win, 'e1', function () {
              return {str: 'fake1'};
            });
            return p1;
          })
          .then((service) => {
            expect(service).to.deep.equal({str: 'fake1'});
          });
      });

      it('isExtensionScriptInNode', () => {
        const extension = document.createElement('script');
        extension.setAttribute('custom-element', 'amp-form');
        extension.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-form-0.1.js'
        );
        ampdoc.getHeadNode().appendChild(extension);
        return isExtensionScriptInNode(ampdoc, 'amp-form').then(
          (ampFormInstalled) => {
            expect(ampFormInstalled).to.equal(true);
          }
        );
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

  beforeEach(() => {
    win = env.win;

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

  it('should return service for scheduled element', () => {
    markElementScheduledForTesting(embedWin, 'amp-foo');
    const promise = getElementServiceIfAvailableForDocInEmbedScope(
      nodeInEmbedWin,
      'foo',
      'amp-foo'
    );
    installServiceInEmbedDoc(embedAmpDoc, 'foo', service);
    return promise.then((returned) => {
      expect(returned).to.equal(service);
    });
  });

  it('should return ampdoc-scope service if node in top window', () => {
    markElementScheduledForTesting(win, 'amp-foo');
    registerServiceBuilderForDoc(
      nodeInTopWin,
      'foo',
      function () {
        return service;
      },
      /* opt_instantiate */ true
    );
    return getElementServiceIfAvailableForDocInEmbedScope(
      nodeInTopWin,
      'foo',
      'amp-foo'
    ).then((returned) => {
      expect(returned).to.equal(service);
    });
  });

  it('should NOT return ampdoc-scope service if node in embed window', () => {
    markElementScheduledForTesting(win, 'amp-foo');
    registerServiceBuilderForDoc(
      nodeInTopWin,
      'foo',
      function () {
        return service;
      },
      /* opt_instantiate */ true
    );
    return getElementServiceIfAvailableForDocInEmbedScope(
      nodeInEmbedWin,
      'foo',
      'amp-foo'
    ).then((returned) => {
      expect(returned).to.be.null;
    });
  });
});
