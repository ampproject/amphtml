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
import {LinkerManager} from '../linker-manager';
import {Priority} from '../../../../src/service/navigation';
import {Services} from '../../../../src/services';

const DELIMITER = '*';
const BASE64_REGEX = /^[a-zA-Z0-9\-_.]+$/;

describe('Linker Manager', () => {
  let sandbox;
  let ampdoc;
  let registerSpy;
  let isProxyStub;
  let findMetaTagStub;
  let docInfoStub;

  beforeEach(() => {
    // Linker uses a timestamp value to generate checksum.
    sandbox = sinon.sandbox;

    findMetaTagStub = sandbox.stub();
    ampdoc = {
      win: {
        document: {
          head: {
            querySelector: findMetaTagStub,
          },
        },
      },
    };

    docInfoStub = sandbox.stub(Services, 'documentInfoForDoc')
        .returns({
          sourceUrl: 'https://www.example.com/some/path?q=123',
          canonicalUrl: 'https://www.example.com',
        });

    registerSpy = sandbox.spy();
    sandbox.stub(Services, 'navigationForDoc').returns({
      registerAnchorMutator: registerSpy,
    });

    isProxyStub = sandbox.stub().returns(true);
    sandbox.stub(Services, 'urlForDoc').returns({
      isProxyOrigin: isProxyStub,
      parse: url => new URL(url),
    });
  });

  afterEach(() => {
    sandbox.restore();
  });


  it('registers the callback if given valid linkers config', () => {

    const config = {
      linkers: {
        testLinker: {
          enabled: true,
          ids: {
            gclid: '123',
          },
        },
      },
    };

    const manager = new LinkerManager(ampdoc, config);
    sandbox.stub(manager, 'isLegacyOptIn_').returns(false);
    sandbox.stub(manager, 'expandTemplateWithUrlParams_');
    manager.init();

    expect(registerSpy.calledOnce).to.be.true;
    expect(registerSpy).calledWith(
        sinon.match.func,
        Priority.ANALYTICS_LINKER);
  });

  it('does not register the callback if no linkers config', () => {
    const config = {};

    const manager = new LinkerManager(ampdoc, config);
    manager.init();

    expect(registerSpy.notCalled).to.be.true;
  });

  it('starts resolving macros and adds them to the a tag', () => {
    const config = {
      linkers: {
        testLinker1: {
          enabled: true,
          ids: {
            _key: 'CLIENT_ID(_ga)',
            gclid: '234',
          },
        },
        testLinker2: {
          enabled: true,
          ids: {
            foo: 'bar',
          },
        },
      },
    };

    const manager = new LinkerManager(ampdoc, config);
    sandbox.stub(manager, 'isLegacyOptIn_').returns(false);
    const expandStub = sandbox.stub(manager, 'expandTemplateWithUrlParams_');
    expandStub.withArgs('CLIENT_ID(_ga)')
        .returns('amp-12345');
    expandStub.returnsArg(0);
    manager.init();

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.handleAnchorMutation(a);
      const parsedUrl = new URL(a.href);
      const param1 = parsedUrl.searchParams.get('testLinker1').split(DELIMITER);
      const param2 = parsedUrl.searchParams.get('testLinker2').split(DELIMITER);

      expect(param1[2]).to.equal('_key');
      expect(param1[3]).to.match(BASE64_REGEX);
      expect(param1[4]).to.equal('gclid');
      expect(param1[5]).to.equal('MjM0');

      expect(param2[2]).to.equal('foo');
      expect(param2[3]).to.equal('YmFy');
    });
  });

  it('should add linker with valid config.', () => {
    const config = {
      linkers: {
        testLinker1: {
          enabled: true,
          ids: {
            _key: 'CLIENT_ID(_ga)',
            gclid: '234',
          },
        },
      },
    };

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(ampdoc, config);
    sandbox.stub(manager, 'isLegacyOptIn_').returns(false);
    const expandStub = sandbox.stub(manager, 'expandTemplateWithUrlParams_');
    expandStub.withArgs('CLIENT_ID(_ga)')
        .returns('amp-12345');
    expandStub.returnsArg(0);
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.handleAnchorMutation(a);
      expect(a.href.indexOf(
          'https:\/\/www\.example\.com\?testLinker1=1*')).to.equal(0);
    });
  });

  it('should add linker with default destinationDomains and matching hostname',
      () => {
        const config = {
          linkers: {
            testLinker1: {
              enabled: true,
              ids: {
                _key: 'CLIENT_ID(_ga)',
                gclid: '234',
              },
            },
          },
        };

        const a = {
          href: 'https://www.example.com',
          hostname: 'www.example.com',
        };

        const manager = new LinkerManager(ampdoc, config);
        sandbox.stub(manager, 'isLegacyOptIn_').returns(false);
        const expandStub = sandbox.stub(manager,
            'expandTemplateWithUrlParams_');
        expandStub.withArgs('CLIENT_ID(_ga)')
            .returns('amp-12345');
        expandStub.returnsArg(0);
        docInfoStub.returns({
          sourceUrl: 'https://www.example.com/foo/bar',
          canonicalUrl: 'https://www.example.com/foo/bar',
        });

        manager.init();

        return Promise.all(manager.allLinkerPromises_).then(() => {
          manager.handleAnchorMutation(a);
          expect(a.href.indexOf(
              'https:\/\/www\.example\.com\?testLinker1=1*')).to.equal(0);
        });
      });

  it('should add linker if not proxy && proxyOnly == false', () => {
    const config = {
      linkers: {
        testLinker1: {
          enabled: true,
          proxyOnly: false,
          ids: {
            _key: 'CLIENT_ID(_ga)',
            gclid: '234',
          },
        },
      },
    };

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(ampdoc, config);
    sandbox.stub(manager, 'isLegacyOptIn_').returns(false);
    const expandStub = sandbox.stub(manager, 'expandTemplateWithUrlParams_');
    expandStub.withArgs('CLIENT_ID(_ga)')
        .returns('amp-12345');
    expandStub.returnsArg(0);
    isProxyStub.returns(false);
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.handleAnchorMutation(a);
      expect(a.href.indexOf(
          'https:\/\/www\.example\.com\?testLinker1=1*')).to.equal(0);
      const parsedUrl = new URL(a.href);
      const param1 = parsedUrl.searchParams.get('testLinker1').split(DELIMITER);
      expect(param1[2]).to.equal('_key');
      expect(param1[3]).to.match(BASE64_REGEX);
      expect(param1[4]).to.equal('gclid');
      expect(param1[5]).to.equal('MjM0');
    });
  });

  it('should not add linker if not proxy && proxyOnly != false', () => {

    const config = {
      linkers: {
        testLinker1: {
          enabled: true,
          ids: {
            _key: 'CLIENT_ID(_ga)',
            gclid: '234',
          },
        },
      },
    };

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(ampdoc, config);

    sandbox.stub(manager, 'isLegacyOptIn_').returns(false);
    const expandStub = sandbox.stub(manager, 'expandTemplateWithUrlParams_');
    expandStub.withArgs('CLIENT_ID(_ga)')
        .returns('amp-12345');
    isProxyStub.returns(false);
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.handleAnchorMutation(a);
      expect(a.href).to.equal('https://www.example.com');
    });
  });

  it('should not add linker destination domains do not match', () => {
    const config = {
      linkers: {
        testLinker1: {
          enabled: true,
          ids: {
            _key: 'CLIENT_ID(_ga)',
          },
          destinationDomains: ['www.foo.com'],
        },
      },
    };

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(ampdoc, config);
    sandbox.stub(manager, 'isLegacyOptIn_').returns(false);
    sandbox.stub(manager, 'expandTemplateWithUrlParams_');
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.handleAnchorMutation(a);
      expect(a.href).to.equal('https://www.example.com');
    });
  });

  it('should not add linker if not explicitly enabled', () => {
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

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(ampdoc, config);
    sandbox.stub(manager, 'isLegacyOptIn_').returns(false);
    sandbox.stub(manager, 'expandTemplateWithUrlParams_');
    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.handleAnchorMutation(a);
      expect(a.href).to.equal('https://www.example.com');
    });
  });

  it('should add linker if meta tag is present and experiment on', () => {
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

    const a = {
      href: 'https://www.example.com',
      hostname: 'www.example.com',
    };

    const manager = new LinkerManager(ampdoc, config);
    sandbox.stub(experiments, 'isExperimentOn').returns(true);
    manager.type_ = 'googleanalytics';
    findMetaTagStub.returns({});
    const expandStub = sandbox.stub(manager, 'expandTemplateWithUrlParams_');
    expandStub.withArgs('CLIENT_ID(_ga)')
        .returns('amp-12345');
    expandStub.returnsArg(0);

    manager.init();

    return Promise.all(manager.allLinkerPromises_).then(() => {
      manager.handleAnchorMutation(a);
      expect(a.href).not.to.equal('https://www.example.com');
    });
  });

  it('should not add linker if meta tag is present but experiment is not on',
      () => {
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

        const a = {
          href: 'https://www.example.com',
          hostname: 'www.example.com',
        };

        const manager = new LinkerManager(ampdoc, config);
        sandbox.stub(experiments, 'isExperimentOn').returns(false);
        manager.type_ = 'googleanalytics';
        findMetaTagStub.returns({});
        const expandStub = sandbox.stub(manager,
            'expandTemplateWithUrlParams_');
        expandStub.withArgs('CLIENT_ID(_ga)')
            .returns('amp-12345');
        expandStub.returnsArg(0);

        manager.init();

        return Promise.all(manager.allLinkerPromises_).then(() => {
          manager.handleAnchorMutation(a);
          expect(a.href).to.equal('https://www.example.com');
        });
      });
});
