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

import * as experiments from '../../../../src/experiments';
import {LinkerManager, areFriendlyDomains} from '../linker-manager';
import {Priority} from '../../../../src/service/navigation';
import {Services} from '../../../../src/services';
import {installVariableService} from '../variables';
import {mockWindowInterface} from '../../../../testing/test-helper';

describes.realWin('Linker Manager', {amp: true}, env => {
  let sandbox;
  let ampdoc;
  let win;
  let doc;
  let windowInterface;
  let handler;

  beforeEach(() => {
    sandbox = env.sandbox;
    ampdoc = env.ampdoc;
    win = env.win;
    doc = win.document;
    windowInterface = mockWindowInterface(sandbox);
    sandbox.stub(Services, 'documentInfoForDoc')
        .returns({
          sourceUrl: 'https://amp.source.com/some/path?q=123',
          canonicalUrl: 'https://www.canonical.com/some/path?q=123',
        });

    handler = null;
    sandbox.stub(Services, 'navigationForDoc').returns({
      registerAnchorMutator: (callback, priority) => {
        if (priority === Priority.ANALYTICS_LINKER) {
          handler = callback;
        }
      },
    });
    windowInterface.getLocation.returns({
      origin: 'https://amp-source-com.cdn.ampproject.org',
    });
    installVariableService(win);
  });

  it('registers anchor mutator if given valid linkers config', () => {
    new LinkerManager(ampdoc, {
      linkers: {
        testLinker: {
          enabled: true,
          ids: {
            foo: 'bar',
          },
        },
      },
    }, null).init();

    expect(handler).to.be.ok;
  });

  it('does not register anchor mutator if no linkers config', () => {
    new LinkerManager(ampdoc, {}, null).init();
    expect(handler).to.not.be.ok;
  });

  it('does not register anchor mutator if empty linkers config', () => {
    new LinkerManager(ampdoc, {linkers: {}}, null).init();
    expect(handler).to.not.be.ok;
  });

  it('does not register anchor mutator if no linkers enabled', () => {
    new LinkerManager(ampdoc, {
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
    }, null).init();
    expect(handler).to.not.be.ok;
  });

  it('does not register anchor mutator if not on proxy', () => {
    windowInterface.getLocation.returns({
      origin: 'https://amp.source.com',
    });
    new LinkerManager(ampdoc, {
      linkers: {
        testLinker: {
          enabled: true,
          ids: {
            bar: 'foo',
          },
        },
      },
    }, null).init();
    expect(handler).to.not.be.ok;
  });

  it('registers anchor mutator if not on proxy but proxyOnly=false', () => {
    windowInterface.getLocation.returns({
      origin: 'https://amp.source.com',
    });
    new LinkerManager(ampdoc, {
      linkers: {
        testLinker: {
          enabled: true,
          proxyOnly: false,
          ids: {
            bar: 'foo',
          },
        },
      },
    }, null).init();
    expect(handler).to.be.ok;
  });

  it('should resolve vars and append to matching anchor', () => {
    windowInterface.getUserAgent.returns('Mozilla/5.0 (X11; Linux x86_64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 ' +
        'Safari/537.36');
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

    return new LinkerManager(ampdoc, config, null).init().then(() => {
      expect(handler).to.be.ok;
      expect(clickAnchor('https://www.source.com/dest?a=1')).to.equal(
          'https://www.source.com/dest' +
          '?a=1' +
          '&testLinker1=1*1pgvkob*_key*VEVTVCUyMFRJVExF*gclid*MjM0' +
          '&testLinker2=1*1u4ugj3*foo*YmFy');
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

    return new LinkerManager(ampdoc, config, null).init().then(() => {
      // testLinker1 should apply to both canonical and source
      // testLinker2 should not
      const canonicalDomainUrl = clickAnchor('https://www.canonical.com/path');
      expect(canonicalDomainUrl).to.contain('testLinker1=');
      expect(canonicalDomainUrl).to.not.contain('testLinker2=');

      const sourceDomainUrl = clickAnchor('https://amp.source.com/path');
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

    return new LinkerManager(ampdoc, config, null).init().then(() => {
      const fooDomainUrl = clickAnchor('https://foo.com/path');
      const barDomainUrl = clickAnchor('https://bar.com/path');

      expect(fooDomainUrl).to.contain('testLinker1=');
      expect(fooDomainUrl).to.not.contain('testLinker2=');
      expect(barDomainUrl).to.contain('testLinker2=');
      expect(barDomainUrl).to.not.contain('testLinker1=');
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

    return new LinkerManager(ampdoc, config, null).init().then(() => {
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

    return new LinkerManager(ampdoc, config, null).init().then(() => {
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

    return new LinkerManager(ampdoc, config).init().then(() => {
      const a = clickAnchor('https://www.source.com');
      expect(a).to.not.contain('testLinker1=');
      expect(a).to.contain('testLinker2=');
    });
  });

  describe('when CID API enabled', () => {

    beforeEach(() => {
      addCidApiMeta();
    });

    it('should add linker for Safari 12', () => {
      stubPlatform(true, 12);
      sandbox.stub(experiments, 'isExperimentOn').returns(true);
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

      return new LinkerManager(ampdoc, config, 'googleanalytics')
          .init().then(() => {
            const a = clickAnchor('https://www.source.com/path');
            expect(a).to.contain('testLinker1=');
          });
    });

    it('should not add linker for not google analytics vendor', () => {
      stubPlatform(true, 12);
      sandbox.stub(experiments, 'isExperimentOn').returns(true);
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

      new LinkerManager(ampdoc, config, 'somevendor');
      expect(handler).to.be.null;
    });

    it('should not add linker for Safari 11', () => {
      stubPlatform(true, 11);
      sandbox.stub(experiments, 'isExperimentOn').returns(true);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              foo: 'bar',
            },
          },
        },
      };

      new LinkerManager(ampdoc, config, 'googleanalytics');
      expect(handler).to.be.null;
    });

    it('should not add linker for Chrome', () => {
      stubPlatform(false, 66);
      sandbox.stub(experiments, 'isExperimentOn').returns(true);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              foo: 'bar',
            },
          },
        },
      };

      new LinkerManager(ampdoc, config, 'googleanalytics');
      expect(handler).to.be.null;
    });

    it('should not add linker if experiment is off', () => {
      stubPlatform(true, 12);
      sandbox.stub(experiments, 'isExperimentOn').returns(false);
      const config = {
        linkers: {
          testLinker1: {
            ids: {
              foo: 'bar',
            },
          },
        },
      };

      new LinkerManager(ampdoc, config, 'googleanalytics');
      expect(handler).to.be.null;
    });
  });

  function clickAnchor(url) {
    const a = doc.createElement('a');
    a.href = url;
    doc.body.appendChild(a);
    handler(a);
    return a.href;
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
});

describe('areFriendlyDomains', () => {
  it('should work', () => {
    expect(areFriendlyDomains('amp.source.com', 'www.source.com')).to.be.true;
    expect(areFriendlyDomains('m.source.com', 'www.source.com')).to.be.true;
    expect(areFriendlyDomains('amp.www.source.com', 'source.com')).to.be.true;
    expect(areFriendlyDomains('amp.source.com', 'm.www.source.com'))
        .to.be.true;

    expect(areFriendlyDomains('amp.source.com', 'amp.google.com')).to.be.false;
    expect(areFriendlyDomains('web.amp.source.com', 'web.m.source.com'))
        .to.be.false;
  });
});
