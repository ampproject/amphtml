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

import {LinkerManager} from '../linker-manager';
import {Priority} from '../../../../src/service/navigation';
import {Services} from '../../../../src/services';

describe('Linker Manager', () => {
  let sandbox;
  let ampdoc;
  let registerSpy;
  let isProxySpy;

  beforeEach(() => {
    // Linker uses a timestamp value to generate checksum.
    sandbox = sinon.sandbox;

    ampdoc = {};

    sandbox.stub(Services, 'documentInfoForDoc')
        .returns({
          sourceUrl: 'www.example.com ',
          canonicalUrl: 'www.example.com',
        });

    registerSpy = sandbox.spy();
    sandbox.stub(Services, 'navigationForDoc').returns({
      registerAnchorMutator: registerSpy,
    });

    isProxySpy = sandbox.spy();
    sandbox.stub(Services, 'urlForDoc').returns({
      isProxyOrigin: isProxySpy,
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
        Priority.ANALYTICS_LINKER,
    );
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
      const param1 = parsedUrl.searchParams.get('testLinker1').split('~');
      const param2 = parsedUrl.searchParams.get('testLinker2').split('~');

      expect(param1[2]).to.equal('_key');
      expect(param1[3]).to.match(/^amp-([a-zA-Z0-9_-]+)/);
      expect(param1[4]).to.equal('gclid');
      expect(param1[5]).to.equal('234');

      expect(param2[2]).to.equal('foo');
      return expect(param2[3]).to.equal('bar');
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
      return expect(a.href).to.not.equal('https://www.example.com');
    });
  });

  it('should not add linker if not proxy && proxyOnly == true', () => {

    const config = {
      linkers: {
        testLinker1: {
          enabled: true,
          proxyOnly: true,
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
      return expect(a.href).to.equal('https://www.example.com');
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
      return expect(a.href).to.equal('https://www.example.com');
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
      return expect(a.href).to.equal('https://www.example.com');
    });
  });
});
