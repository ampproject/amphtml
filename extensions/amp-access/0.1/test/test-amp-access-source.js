/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {AccessClientAdapter} from '../amp-access-client';
import {AccessIframeAdapter} from '../amp-access-iframe';
import {AccessOtherAdapter} from '../amp-access-other';
import {AccessServerAdapter} from '../amp-access-server';
import {AccessServerJwtAdapter} from '../amp-access-server-jwt';
import {AccessSource} from '../amp-access-source';
import {AccessVendorAdapter} from '../amp-access-vendor';
import {cidServiceForDocForTesting} from
  '../../../../src/service/cid-impl';
import {installPerformanceService} from
  '../../../../src/service/performance-impl';
import {toggleExperiment} from '../../../../src/experiments';


describes.fakeWin('AccessSource', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document;
  let ampdoc;
  let element;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    element = document.createElement('script');
    element.setAttribute('id', 'amp-access');
    element.setAttribute('type', 'application/json');
    document.body.appendChild(element);
    document.documentElement.classList.remove('amp-access-error');
  });

  afterEach(() => {
    toggleExperiment(win, 'amp-access-server', false);
    toggleExperiment(win, 'amp-access-iframe', false);
  });

  function expectSourceType(ampdoc, config, type, adapter) {
    const source = new AccessSource(ampdoc, config, null);
    expect(source.type_).to.equal(type);
    expect(source.adapter_).to.be.instanceOf(adapter);
  }

  it('should parse multiple login URLs', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': {
        'login1': 'https://acme.com/l1',
        'login2': 'https://acme.com/l2',
      },
    };

    const service = new AccessSource(ampdoc, config);
    expect(service.loginConfig_).to.deep.equal({
      'login1': 'https://acme.com/l1',
      'login2': 'https://acme.com/l2',
    });
  });

  it('should parse type', () => {
    let config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
      'iframeSrc': 'https://acme.com/i',
      'defaultResponse': {},
    };
    expectSourceType(ampdoc, config, 'client', AccessClientAdapter);

    config['type'] = 'client';
    expectSourceType(ampdoc, config, 'client', AccessClientAdapter);

    config['type'] = 'iframe';
    expectSourceType(ampdoc, config, 'client', AccessClientAdapter);
    toggleExperiment(win, 'amp-access-iframe', true);
    expectSourceType(ampdoc, config, 'iframe', AccessIframeAdapter);

    config['type'] = 'server';
    expectSourceType(ampdoc, config, 'client', AccessClientAdapter);

    config['type'] = 'server';
    toggleExperiment(win, 'amp-access-server', true);
    expectSourceType(ampdoc, config, 'server', AccessServerAdapter);

    // When the 'amp-access-server' experiment is enabled, documents with
    // access type 'client' are also treated as 'server'.
    config['type'] = 'client';
    toggleExperiment(win, 'amp-access-server', true);
    expectSourceType(ampdoc, config, 'server', AccessServerAdapter);

    config['type'] = 'other';
    expectSourceType(ampdoc, config, 'other', AccessOtherAdapter);

    config = {};
    config['type'] = 'vendor';
    config['vendor'] = 'vendor1';
    expectSourceType(ampdoc, config, 'vendor', AccessVendorAdapter);

    delete config['type'];
    config['vendor'] = 'vendor1';
    expectSourceType(ampdoc, config, 'vendor', AccessVendorAdapter);
  });

  it('should return adapter config', () => {
    const config = {
      type: 'vendor',
      vendor: 'vendor1',
    };
    const source = new AccessSource(ampdoc, config);
    sandbox.stub(source.adapter_, 'getConfig');
    source.getAdapterConfig();
    expect(source.adapter_.getConfig.called).to.be.true;
  });

  it('should parse type for JWT w/o experiment', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
      'jwt': true,
    };
    toggleExperiment(win, 'amp-access-jwt', false);

    expectSourceType(ampdoc, config, 'client', AccessClientAdapter);

    config['type'] = 'client';
    expectSourceType(ampdoc, config, 'client', AccessClientAdapter);

    config['type'] = 'server';
    toggleExperiment(win, 'amp-access-server', true);
    expectSourceType(ampdoc, config, 'server', AccessServerAdapter);
  });

  it('should parse type for JWT with experiment', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
      'jwt': true,
      'publicKeyUrl': 'https://acme.com/pk',
    };
    toggleExperiment(win, 'amp-access-jwt', true);

    expectSourceType(ampdoc, config, 'client', AccessServerJwtAdapter);

    config['type'] = 'client';
    expectSourceType(ampdoc, config, 'client', AccessServerJwtAdapter);

    config['type'] = 'server';
    toggleExperiment(win, 'amp-access-server', true);
    expectSourceType(ampdoc, config, 'server', AccessServerJwtAdapter);
  });

  it('should initialize authorization fallback response', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l',
      'authorizationFallbackResponse': {'error': true},
    };
    const service = new AccessSource(ampdoc, config);
    expect(service.authorizationFallbackResponse_).to.deep.equal(
        {'error': true});
  });

  it('should login with url only', () => {
    const config = {
      type: 'vendor',
      vendor: 'vendor1',
    };
    const source = new AccessSource(ampdoc, config);
    const sourceMock = sandbox.mock(source);
    sourceMock.expects('login_')
        .withExactArgs('https://url', '')
        .once();
    source.loginWithUrl('https://url');
  });
});


describes.fakeWin('AccessSource adapter context', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let clock;
  let configElement;
  let source;
  let context;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;
    clock = sandbox.useFakeTimers();
    clock.tick(0);

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    const config = {
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
    };

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify(config);
    document.body.appendChild(configElement);

    source = new AccessSource(ampdoc, config,
        () => Promise.resolve('reader1'));
    context = source.adapter_.context_;
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
  });

  it('should resolve URL without auth response and no authdata vars', () => {
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ false).then(url => {
      expect(url).to.equal('?rid=reader1&type=');
    });
  });

  it('should resolve URL without auth response and with authdata vars', () => {
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ true).then(url => {
      expect(url).to.equal('?rid=reader1&type=');
    });
  });

  it('should resolve URL with auth response and no authdata vars', () => {
    source.setAuthResponse_({child: {type: 'premium'}});
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ false).then(url => {
      expect(url).to.equal('?rid=reader1&type=');
    });
  });

  it('should resolve URL with auth response and with authdata vars', () => {
    source.setAuthResponse_({child: {type: 'premium'}});
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type)',
        /* useAuthData */ true).then(url => {
      expect(url).to.equal('?rid=reader1&type=premium');
    });
  });

  it('should resolve URL with unknown authdata var', () => {
    source.setAuthResponse_({child: {type: 'premium'}});
    return context.buildUrl('?rid=READER_ID&type=AUTHDATA(child.type2)',
        /* useAuthData */ true).then(url => {
      expect(url).to.equal('?rid=reader1&type=');
    });
  });

  it('should resolve URL with ACCESS_TOKEN, but not enabled', () => {
    return context.buildUrl('?at=ACCESS_TOKEN').then(url => {
      expect(url).to.equal('?at=');
    });
  });

  it('should resolve URL with ACCESS_TOKEN, enabled, but null', () => {
    sandbox.stub(source.signIn_, 'getAccessTokenPassive').callsFake(() => null);
    return context.buildUrl('?at=ACCESS_TOKEN').then(url => {
      expect(url).to.equal('?at=');
    });
  });

  it('should resolve URL with ACCESS_TOKEN, enabled, but null promise', () => {
    sandbox.stub(source.signIn_, 'getAccessTokenPassive').callsFake(
        () => Promise.resolve(null));
    return context.buildUrl('?at=ACCESS_TOKEN').then(url => {
      expect(url).to.equal('?at=');
    });
  });

  it('should resolve URL with ACCESS_TOKEN, enabled, not null', () => {
    sandbox.stub(source.signIn_, 'getAccessTokenPassive').callsFake(
        () => Promise.resolve('access_token'));
    return context.buildUrl('?at=ACCESS_TOKEN').then(url => {
      expect(url).to.equal('?at=access_token');
    });
  });

  it('should return adapter config', () => {
    sandbox.stub(source.adapter_, 'getConfig');
    source.getAdapterConfig();
    expect(source.adapter_.getConfig.called).to.be.true;
  });
});


describes.fakeWin('AccessSource authorization', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, ampdoc;
  let clock;
  let adapterMock;
  let source;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    clock = sandbox.useFakeTimers();
    clock.tick(0);

    cidServiceForDocForTesting(ampdoc);
    installPerformanceService(win);

    const config = {
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID',
    };
    source = new AccessSource(ampdoc, config, () => Promise.resolve('reader1'));
    const adapter = {
      getConfig: () => {
      },
      isAuthorizationEnabled: () => true,
      isPingbackEnabled: () => true,
      authorize: () => {
      },
    };
    source.adapter_ = adapter;
    adapterMock = sandbox.mock(adapter);
  });

  afterEach(() => {
    adapterMock.verify();
  });

  it('should resolve first-authorization promise after response', () => {
    adapterMock.expects('authorize')
        .withExactArgs()
        .returns(Promise.resolve({access: true}))
        .once();
    return source.runAuthorization().then(() => {
      return source.whenFirstAuthorized();
    });
  });
});
