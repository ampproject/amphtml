/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {
  LinkerManager,
  areFriendlyDomains,
  isWildCardMatch,
} from '../linker-manager';
import {Priority} from '../../../../src/service/navigation';
import {Services} from '../../../../src/services';
import {
  installLinkerReaderService,
  linkerReaderServiceFor,
} from '../linker-reader';
import {installVariableServiceForTesting} from '../variables';
import {mockWindowInterface} from '../../../../testing/test-helper';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('Linker Manager', {amp: true}, env => {
  let sandbox;
  let ampdoc;
  let win;
  let doc;
  let windowInterface;
  let anchorClickHandlers;
  let navigateToHandlers;
  let element;
  let beforeSubmitStub;

  beforeEach(() => {
    sandbox = env.sandbox;
    ampdoc = env.ampdoc;
    win = env.win;
    doc = win.document;
    windowInterface = mockWindowInterface(sandbox);

    beforeSubmitStub = sandbox.stub();
    sandbox.stub(Services, 'formSubmitPromiseForDoc').resolves({
      beforeSubmit: beforeSubmitStub,
    });

    sandbox.stub(Services, 'documentInfoForDoc').returns({
      sourceUrl: 'https://amp.source.com/some/path?q=123',
      canonicalUrl: 'https://www.canonical.com/some/path?q=123',
    });

    element = doc.createElement('div');
    doc.body.appendChild(element);

    anchorClickHandlers = [];
    navigateToHandlers = [];
    sandbox.stub(Services, 'navigationForDoc').returns({
      registerAnchorMutator: (callback, priority) => {
        if (priority === Priority.ANALYTICS_LINKER) {
          anchorClickHandlers.push(callback);
        }
      },
      registerNavigateToMutator: (callback, priority) => {
        if (priority === Priority.ANALYTICS_LINKER) {
          navigateToHandlers.push(callback);
        }
      },
    });
    windowInterface.getLocation.returns({
      origin: 'https://amp-source-com.cdn.ampproject.org',
    });
    windowInterface.getHostname.returns('amp-source-com.cdn.ampproject.org');
    installVariableServiceForTesting(env.ampdoc);
    installLinkerReaderService(win);
  });

  it('registers anchor mutator if given valid linkers config', () => {
    new LinkerManager(
      ampdoc,
      {
        linkers: {
          testLinker: {
            enabled: true,
            ids: {
              foo: 'bar',
            },
          },
        },
      },
      /* type */ null,
      element
    ).init();

    expect(anchorClickHandlers).to.have.length(1);
  });

  it('does not register anchor mutator if no linkers config', () => {
    new LinkerManager(ampdoc, {}, /* type */ null, element).init();
    expect(anchorClickHandlers).to.have.length(0);
  });

  it('does not register anchor mutator if empty linkers config', () => {
    new LinkerManager(ampdoc, {linkers: {}}, /* type */ null, element).init();
    expect(anchorClickHandlers).to.have.length(0);
  });

  it('does not register anchor mutator if no linkers enabled', () => {
    new LinkerManager(
      ampdoc,
      {
        linkers: {
          testLinker1: {
            ids: {
              bar: 'foo',
            },
          },
          testLinker2: {
            ids: {
              foo: 'bar',
            },
          },
        },
      },
      /* type */ null,
      element
    ).init();
    expect(anchorClickHandlers).to.have.length(0);
  });

  it('does not register anchor mutator if not on proxy', () => {
    windowInterface.getLocation.returns({
      origin: 'https://amp.source.com',
    });
    new LinkerManager(
      ampdoc,
      {
        linkers: {
          testLinker: {
            enabled: true,
            ids: {
              bar: 'foo',
            },
          },
        },
      },
      /* type */ null,
      element
    ).init();
    expect(anchorClickHandlers).to.have.length(0);
  });

  it('registers anchor mutator if not on proxy but proxyOnly=false', () => {
    windowInterface.getLocation.returns({
      origin: 'https://amp.source.com',
    });
    new LinkerManager(
      ampdoc,
      {
        linkers: {
          testLinker: {
            enabled: true,
            proxyOnly: false,
            ids: {
              bar: 'foo',
            },
          },
        },
      },
      /* type */ null,
      element
    ).init();
    expect(anchorClickHandlers).to.have.length(1);
  });

  it('should resolve vars and append to matching anchor', () => {
    windowInterface.getUserAgent.returns(
      'Mozilla/5.0 (X11; Linux x86_64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 ' +
        'Safari/537.36'
    );
    windowInterface.getUserLanguage.returns('en-US');
    sandbox.useFakeTimers(1533329483292);
    sandbox.stub(Date.prototype, 'getTimezoneOffset').returns(420);
    doc.title = 'TEST TITLE';
    const config = {
      linkers: {
        enabled: true,
        testLinker1: {
          ids: {
            _key: '${title}',
            gclid: '234',
          },
        },
        testLinker2: {
          ids: {
            foo: 'bar',
          },
        },
      },
      vars: {
        'title': 'TITLE',
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      expect(anchorClickHandlers).to.have.length(1);
      expect(navigateToHandlers).to.have.length(1);
      const origUrl = 'https://www.source.com/dest?a=1';
      const finalUrl =
        'https://www.source.com/dest' +
        '?a=1' +
        '&testLinker1=1*1pgvkob*_key*VEVTVCUyMFRJVExF*gclid*MjM0' +
        '&testLinker2=1*1u4ugj3*foo*YmFy';
      expect(clickAnchor(origUrl)).to.equal(finalUrl);
      expect(navigateTo(origUrl)).to.equal(finalUrl);
    });
  });

  it('should not add params where linker value is empty', () => {
    const config = {
      linkers: {
        enabled: true,
        proxyOnly: false,
        testLinker1: {
          ids: {
            gclid: '',
          },
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      expect(anchorClickHandlers).to.have.length(1);
      expect(clickAnchor('https://www.source.com/dest?a=1')).to.equal(
        'https://www.source.com/dest?a=1'
      );
    });
  });

  it('should generate a param valid for ingestion 5 min later', () => {
    const clock = sandbox.useFakeTimers(1533329483292);
    sandbox.stub(Date.prototype, 'getTimezoneOffset').returns(420);
    const config = {
      linkers: {
        enabled: true,
        testLinker: {
          ids: {
            cid: '12345',
          },
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      clock.tick(1000 * 60 * 5); // 5 minutes.
      const linkerUrl = clickAnchor('https://www.source.com/dest?a=1');

      windowInterface.history = {replaceState: () => {}};
      windowInterface.location = {href: linkerUrl};

      installLinkerReaderService(windowInterface);
      const linkerReader = linkerReaderServiceFor(windowInterface);
      return expect(linkerReader.get('testLinker', 'cid')).to.equal('12345');
    });
  });

  it('should respect destinationDomains config', () => {
    const config = {
      linkers: {
        enabled: true,
        testLinker1: {
          ids: {
            id: '111',
          },
        },
        testLinker2: {
          ids: {
            id: '222',
          },
          destinationDomains: ['foo.com', 'bar.com'],
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      // testLinker1 should apply to both canonical and source
      // testLinker2 should not
      const canonicalDomainUrl = clickAnchor('https://www.canonical.com/path');
      expect(canonicalDomainUrl).to.contain('testLinker1=');
      expect(canonicalDomainUrl).to.not.contain('testLinker2=');

      const sourceDomainUrl = clickAnchor('https://www.source.com/path');
      expect(sourceDomainUrl).to.contain('testLinker1=');
      expect(sourceDomainUrl).to.not.contain('testLinker2=');

      // testLinker2 should apply to both foo and bar
      // testLinker1 should not
      const fooUrl = clickAnchor('https://foo.com/path');
      expect(fooUrl).to.not.contain('testLinker1=');
      expect(fooUrl).to.contain('testLinker2=');

      const barDomainUrl = clickAnchor('https://bar.com/path');
      expect(barDomainUrl).to.not.contain('testLinker1=');
      expect(barDomainUrl).to.contain('testLinker2=');
    });
  });

  it('should respect default destinationDomains config', () => {
    const config = {
      linkers: {
        enabled: true,
        destinationDomains: ['foo.com'],
        testLinker1: {
          ids: {
            id: '111',
          },
        },
        testLinker2: {
          ids: {
            id: '222',
          },
          destinationDomains: ['bar.com'],
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      const fooDomainUrl = clickAnchor('https://foo.com/path');
      const barDomainUrl = clickAnchor('https://bar.com/path');

      expect(fooDomainUrl).to.contain('testLinker1=');
      expect(fooDomainUrl).to.not.contain('testLinker2=');
      expect(barDomainUrl).to.contain('testLinker2=');
      expect(barDomainUrl).to.not.contain('testLinker1=');
    });
  });

  it('should accept wildcard domains', () => {
    const config = {
      linkers: {
        enabled: true,
        destinationDomains: ['*.foo.com'],
        testLinker1: {
          ids: {
            id: '111',
          },
        },
        testLinker2: {
          ids: {
            id: '222',
          },
          destinationDomains: ['*.bar.com*'],
        },
        testLinker3: {
          ids: {
            id: '333',
          },
          destinationDomains: ['*.baz.co*'],
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      const subdomain = clickAnchor('https://amp.foo.com/path');
      expect(subdomain).to.contain('testLinker1=');
      expect(subdomain).to.not.contain('testLinker2=');
      expect(subdomain).to.not.contain('testLinker3=');

      const noDot = clickAnchor('https://foo.com/path');
      expect(noDot).to.not.contain('testLinker1=');
      expect(noDot).to.not.contain('testLinker2=');
      expect(noDot).to.not.contain('testLinker3=');

      const thirdLevel = clickAnchor('https://a.b.foo.com/path');
      expect(thirdLevel).to.contain('testLinker1=');
      expect(thirdLevel).to.not.contain('testLinker2=');
      expect(thirdLevel).to.not.contain('testLinker3=');

      const multiTLDDomainEnabled = clickAnchor('https://foo.bar.com.uk/path');
      expect(multiTLDDomainEnabled).to.contain('testLinker2=');
      expect(multiTLDDomainEnabled).to.not.contain('testLinker1=');
      expect(multiTLDDomainEnabled).to.not.contain('testLinker3=');

      const multiTLDDomainDisabled = clickAnchor('https://amp.foo.com.uk/path');
      expect(multiTLDDomainDisabled).to.not.contain('testLinker1=');
      expect(multiTLDDomainDisabled).to.not.contain('testLinker2=');
      expect(multiTLDDomainDisabled).to.not.contain('testLinker3=');

      const co = clickAnchor('https://www.baz.com/path');
      expect(co).to.contain('testLinker3=');
      expect(co).not.to.contain('testLinker1=');
      expect(co).not.to.contain('testLinker2=');
    });
  });

  it('should match friendly domain if destinationDomains unspecified', () => {
    const config = {
      linkers: {
        enabled: true,
        testLinker1: {
          ids: {
            id: '111',
          },
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      const url1 = clickAnchor('https://www.source.com/path');
      const url2 = clickAnchor('https://amp.www.source.com/path');
      const url3 = clickAnchor('https://canonical.com/path');
      const url4 = clickAnchor('https://amp.www.canonical.com/path');
      const url5 = clickAnchor('https://amp.google.com/path');

      expect(url1).to.contain('testLinker1=');
      expect(url2).to.contain('testLinker1=');
      expect(url3).to.contain('testLinker1=');
      expect(url4).to.contain('testLinker1=');
      expect(url5).to.not.contain('testLinker1=');
    });
  });

  it('should respect proxyOnly config', () => {
    windowInterface.getLocation.returns({
      origin: 'https://amp.source.com',
    });
    const config = {
      linkers: {
        enabled: true,
        testLinker1: {
          proxyOnly: false,
          ids: {
            id: '111',
          },
        },
        testLinker2: {
          proxyOnly: true,
          ids: {
            id: '222',
          },
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      const a = clickAnchor('https://www.source.com/path');
      expect(a).to.contain('testLinker1=');
      expect(a).to.not.contain('testLinker2=');
    });
  });

  it('proxyOnly should default to true', () => {
    windowInterface.getLocation.returns({
      origin: 'https://amp.source.com',
    });
    const config = {
      linkers: {
        enabled: true,
        testLinker1: {
          ids: {
            id: '111',
          },
        },
        testLinker2: {
          ids: {
            id: '222',
          },
          proxyOnly: false,
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      const a = clickAnchor('https://www.source.com');
      expect(a).to.not.contain('testLinker1=');
      expect(a).to.contain('testLinker2=');
    });
  });

  it('should only add the linker param once', () => {
    const config = {
      linkers: {
        enabled: true,
        destinationDomains: ['foo.com'],
        testLinker1: {
          ids: {
            id: '111',
          },
        },
      },
    };

    const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
    return lm.init().then(() => {
      const fooDomainUrl = clickAnchor('https://foo.com/path');
      expect(fooDomainUrl).to.contain('testLinker1=');

      const fooDomainUrlSecondClick = clickAnchor('https://foo.com/path');
      const splitResult = fooDomainUrlSecondClick.split('testLinker1');
      expect(splitResult.length).to.be.equal(2);
    });
  });

  describe('same domain matching', () => {
    let config;

    beforeEach(() => {
      windowInterface.getLocation.returns({
        origin: 'https://amp.source.com',
      });
      windowInterface.getHostname.returns('amp.source.com');
      config = {
        linkers: {
          testLinker: {
            enabled: true,
            proxyOnly: false,
            ids: {
              foo: 'bar',
            },
          },
        },
      };
    });

    it('should not add linker if same domain', () => {
      const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
      return lm.init().then(() => {
        const url = clickAnchor('https://amp.source.com/');
        expect(url).to.not.contain('testLinker');
      });
    });

    it('should add linker if subdomain is different but friendly', () => {
      const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
      return lm.init().then(() => {
        const url = clickAnchor('https://m.source.com/');
        expect(url).to.contain('testLinker');
      });
    });

    it('should add linker if same domain is in destination domains', () => {
      const config = {
        linkers: {
          testLinker: {
            enabled: true,
            proxyOnly: false,
            ids: {
              foo: 'bar',
            },
            destinationDomains: ['amp.source.com'],
          },
        },
      };
      const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
      return lm.init().then(() => {
        const url = clickAnchor('https://amp.source.com/');
        expect(url).to.contain('testLinker');
      });
    });

    it('should not add linker if href is fragment', () => {
      const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
      return lm.init().then(() => {
        const a = {
          href: '#hello',
          hostname: 'amp.source.com',
        };
        anchorClickHandlers.forEach(handler => handler(a, {type: 'click'}));
        expect(a.href).to.not.contain('testLinker');
      });
    });

    it('should not add linker if href is relative', () => {
      const lm = new LinkerManager(ampdoc, config, /* type */ null, element);
      return lm.init().then(() => {
        const a = {
          href: '/foo',
          hostname: 'amp.source.com',
        };
        anchorClickHandlers.forEach(handler => handler(a, {type: 'click'}));
        expect(a.href).to.not.contain('testLinker');
      });
    });
  });

  describe('when CID API enabled', () => {
    beforeEach(() => {
      addCidApiMeta();
    });

    it('should add linker for Safari 12', () => {
      stubPlatform(true, 12);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              _key: 'CLIENT_ID(_ga)',
              gclid: '234',
            },
          },
        },
      };
      const lm = new LinkerManager(ampdoc, config, 'googleanalytics', element);
      return lm.init().then(() => {
        const a = clickAnchor('https://www.source.com/path');
        expect(a).to.contain('testLinker1=');
      });
    });

    it('should only add one linker for auto opt-in', () => {
      stubPlatform(true, 12);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              _key: 'CLIENT_ID(_ga)',
              gclid: '234',
            },
          },
        },
      };
      const p1 = new LinkerManager(
        ampdoc,
        config,
        'googleanalytics',
        element
      ).init();
      const p2 = new LinkerManager(
        ampdoc,
        config,
        'googleanalytics',
        element
      ).init();
      return Promise.all([p1, p2]).then(() => {
        const a = clickAnchor('https://www.source.com/path');
        expect(a).to.not.match(/(testLinker1=.*){2}/);
      });
    });

    it('should not add linker for not google analytics vendor', () => {
      stubPlatform(true, 12);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              _key: 'CLIENT_ID(_ga)',
              gclid: '234',
            },
          },
        },
      };

      new LinkerManager(ampdoc, config, 'somevendor', element);
      expect(anchorClickHandlers).to.have.length(0);
    });

    it('should not add linker for Safari 11', () => {
      stubPlatform(true, 11);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              foo: 'bar',
            },
          },
        },
      };

      new LinkerManager(ampdoc, config, 'googleanalytics', element);
      expect(anchorClickHandlers).to.have.length(0);
    });

    it('should not add linker for Chrome', () => {
      stubPlatform(false, 66);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              foo: 'bar',
            },
          },
        },
      };

      new LinkerManager(ampdoc, config, 'googleanalytics', element);
      expect(anchorClickHandlers).to.have.length(0);
    });

    it('should not add linker if experiment is off', () => {
      stubPlatform(true, 12);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              foo: 'bar',
            },
          },
        },
      };

      new LinkerManager(ampdoc, config, 'googleanalytics', element);
      expect(anchorClickHandlers).to.have.length(0);
    });
  });

  function clickAnchor(url) {
    const a = doc.createElement('a');
    const event = {
      type: 'click',
    };
    a.href = url;
    doc.body.appendChild(a);
    anchorClickHandlers.forEach(handler => handler(a, event));
    return a.href;
  }

  function navigateTo(url) {
    navigateToHandlers.forEach(handler => {
      url = handler(url);
    });
    return url;
  }

  function addCidApiMeta() {
    const meta = doc.createElement('meta');
    meta.setAttribute('name', 'amp-google-client-id-api');
    meta.setAttribute('content', 'googleanalytics');
    doc.head.appendChild(meta);
  }

  function stubPlatform(isSafari, version) {
    const platform = Services.platformFor(ampdoc.win);
    sandbox.stub(platform, 'isSafari').returns(isSafari);
    sandbox.stub(platform, 'getMajorVersion').returns(version);
  }

  describe('form support', () => {
    it('should register the `beforeSubmit` callback', () => {
      toggleExperiment(win, 'linker-form', true);
      const linkerManager = new LinkerManager(
        ampdoc,
        {
          linkers: {
            testLinker: {
              enabled: true,
              ids: {
                foo: 'bar',
              },
            },
          },
        },
        /* type */ null,
        element
      );

      return linkerManager.init().then(() => {
        expect(beforeSubmitStub.calledOnce).to.be.true;
        toggleExperiment(win, 'linker-form', false);
        expect(beforeSubmitStub).to.be.calledWith(sinon.match.func);
      });
    });

    it('should add hidden elements to form if not action-xhr', () => {
      const linkerManager = new LinkerManager(
        ampdoc,
        {
          linkers: {
            testLinker: {
              enabled: true,
              ids: {
                foo: 'bar',
              },
            },
            destinationDomains: ['www.ampproject.com'],
          },
        },
        /* type */ null,
        element
      );

      return linkerManager.init().then(() => {
        const form = createForm();
        form.setAttribute('action', 'https://www.ampproject.com');
        const setterSpy = sandbox.spy();
        linkerManager.handleFormSubmit_({form, actionXhrMutator: setterSpy});

        expect(setterSpy.notCalled).to.be.true;
        const el = form.firstChild;
        expect(el).to.be.ok;
        expect(el.tagName).to.equal('INPUT');
        expect(el.getAttribute('name')).to.equal('testLinker');
        expect(el.getAttribute('value')).to.contain('foo');
        const prefixRegex = new RegExp('1\\*\\w{5,7}\\*.+');
        expect(el.getAttribute('value')).to.match(prefixRegex);
      });
    });

    it('if action-xhr and method=GET it should add linker-xhr attr', () => {
      const linkerManager = new LinkerManager(
        ampdoc,
        {
          linkers: {
            testLinker: {
              enabled: true,
              ids: {
                foo: 'bar',
              },
            },
            destinationDomains: ['www.ampproject.com'],
          },
        },
        /* type */ null,
        element
      );

      return linkerManager.init().then(() => {
        const form = createForm();
        form.setAttribute('action-xhr', 'https://www.ampproject.com');
        form.setAttribute('method', 'get');

        const setterSpy = sandbox.spy();
        linkerManager.handleFormSubmit_({form, actionXhrMutator: setterSpy});
        expect(setterSpy).to.be.calledOnce;
        expect(setterSpy).to.be.calledWith(
          sinon.match(/testLinker=1\*\w{5,7}\*foo*\w+/)
        );
      });
    });

    it('if action-xhr and method=POST it should add linker-xhr attr', () => {
      const linkerManager = new LinkerManager(
        ampdoc,
        {
          linkers: {
            testLinker: {
              enabled: true,
              ids: {
                foo: 'bar',
              },
            },
            destinationDomains: ['www.ampproject.com'],
          },
        },
        /* type */ null,
        element
      );

      return linkerManager.init().then(() => {
        const form = createForm();
        form.setAttribute('action-xhr', 'https://www.ampproject.com');
        form.setAttribute('method', 'post');

        const setterSpy = sandbox.spy();
        linkerManager.handleFormSubmit_({form, actionXhrMutator: setterSpy});

        expect(setterSpy).to.be.calledOnce;
        expect(setterSpy).to.be.calledWith(
          sinon.match(/testLinker=1\*\w{5,7}\*foo*\w+/)
        );
      });
    });

    it('should not add linker if no domain match', () => {
      const linkerManager = new LinkerManager(
        ampdoc,
        {
          linkers: {
            testLinker: {
              enabled: true,
              ids: {
                foo: 'bar',
              },
            },
            destinationDomains: ['www.ampproject.com'],
          },
        },
        /* type */ null,
        element
      );

      return linkerManager.init().then(() => {
        const form = createForm();
        form.setAttribute('action-xhr', 'https://www.wrongdomain.com');
        const setterSpy = sandbox.spy();
        linkerManager.handleFormSubmit_({form, actionXhrMutator: setterSpy});
        expect(setterSpy).to.not.be.called;
        expect(form.children).to.have.length(0);
      });
    });

    it('should add multiple linker data to one form if not action-xhr', () => {
      windowInterface.getLocation.returns({
        origin: 'https://www.ampbyexample.com',
      });

      const manager1 = new LinkerManager(
        ampdoc,
        {
          linkers: {
            proxyOnly: false,
            testLinker: {
              enabled: true,
              ids: {
                foo: 'bar',
              },
            },
          },
        },
        /* type */ null,
        element
      );

      const manager2 = new LinkerManager(
        ampdoc,
        {
          linkers: {
            proxyOnly: false,
            testLinker2: {
              enabled: true,
              ids: {
                hello: 'world',
              },
            },
          },
        },
        /* type */ null,
        element
      );

      const p1 = manager1.init();
      const p2 = manager2.init();

      return Promise.all([p1, p2]).then(() => {
        const form = createForm();
        form.setAttribute('action', 'https://www.source.com');
        const setterSpy = sandbox.spy();
        manager1.handleFormSubmit_({form, actionXhrMutator: setterSpy});
        manager2.handleFormSubmit_({form, actionXhrMutator: setterSpy});

        expect(setterSpy.notCalled).to.be.true;
        const prefixRegex = new RegExp('1\\*\\w{5,7}\\*.+');

        const firstChild = form.children[0];
        expect(firstChild).to.be.ok;
        expect(firstChild.tagName).to.equal('INPUT');
        expect(firstChild.getAttribute('name')).to.equal('testLinker');
        expect(firstChild.getAttribute('value')).to.contain('foo');
        expect(firstChild.getAttribute('value')).to.match(prefixRegex);

        const secondChild = form.children[1];
        expect(secondChild).to.be.ok;
        expect(secondChild.tagName).to.equal('INPUT');
        expect(secondChild.getAttribute('name')).to.equal('testLinker2');
        expect(secondChild.getAttribute('value')).to.contain('hello');
        expect(secondChild.getAttribute('value')).to.match(prefixRegex);
      });
    });

    function createForm() {
      const form = doc.createElement('form');
      doc.body.appendChild(form);
      return form;
    }
  });
});

describe('areFriendlyDomains', () => {
  it('should work', () => {
    expect(areFriendlyDomains('amp.source.com', 'www.source.com')).to.be.true;
    expect(areFriendlyDomains('m.source.com', 'www.source.com')).to.be.true;
    expect(areFriendlyDomains('amp.www.source.com', 'source.com')).to.be.true;
    expect(areFriendlyDomains('amp.source.com', 'm.www.source.com')).to.be.true;

    expect(areFriendlyDomains('amp.source.com', 'amp.google.com')).to.be.false;
    expect(areFriendlyDomains('web.amp.source.com', 'web.m.source.com')).to.be
      .false;
  });
});

describe('wildcard matching', () => {
  const testCases = [
    {
      hostname: 'amp.foo.com',
      domain: '*.foo.com',
      result: true,
    },
    {
      hostname: 'amp.foo.com.uk',
      domain: '*.foo.com',
      result: false,
    },
    {
      hostname: 'amp.foo.com.uk',
      domain: '*.foo.com*',
      result: true,
    },
    {
      hostname: 'foo.com',
      domain: '*.foo.com',
      result: false,
    },
    {
      hostname: 'amp.foo.com',
      domain: '*.foo.co*',
      result: true,
    },
    {
      hostname: 'me.foo.co.uk',
      domain: '*.foo.co*',
      result: true,
    },
    {
      hostname: 'a.b.foo.com',
      domain: '*.foo.co*',
      result: true,
    },
  ];
  testCases.forEach(test => {
    const {hostname, domain, result} = test;
    it(`wildcard test: ${hostname}, ${domain}, ${result}`, () => {
      expect(isWildCardMatch(hostname, domain)).to.equal(result);
    });
  });
});
