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

import {AccessService} from '../../../../build/all/v0/amp-access-0.1.max';
import * as sinon from 'sinon';


describe('AccessService', () => {

  let sandbox;
  let element;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    element = document.createElement('script');
    element.setAttribute('id', 'amp-access');
    element.setAttribute('type', 'application/json');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element.parentElement) {
      document.body.removeChild(element);
    }
    sandbox.restore();
    sandbox = null;
  });

  it('should disable service when no config', () => {
    document.body.removeChild(element);
    const service = new AccessService(window);
    expect(service.isEnabled()).to.be.false;
    expect(service.accessElement_).to.be.undefined;
    expect(service.config_).to.be.undefined;
  });

  it('should fail if config is malformed', () => {
    expect(() => {
      new AccessService(window);
    }).to.throw(Error);
  });

  it('should fail if config authorization is missing or malformed', () => {
    const config = {};
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/"authorization" URL must be specified/);

    config['authorization'] = 'http://acme.com/a';
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/https\:/);
  });

  it('should fail if config pingback is missing or malformed', () => {
    const config = {
      'authorization': 'https://acme.com/a'
    };
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/"pingback" URL must be specified/);

    config['pingback'] = 'http://acme.com/p';
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/https\:/);
  });

  it('should fail if config login is missing or malformed', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p'
    };
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/"login" URL must be specified/);

    config['login'] = 'http://acme.com/l';
    element.textContent = JSON.stringify(config);
    expect(() => {
      new AccessService(window);
    }).to.throw(/https\:/);
  });

  it('should parse the complete config', () => {
    const config = {
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l'
    };
    element.textContent = JSON.stringify(config);
    const service = new AccessService(window);
    expect(service.isEnabled()).to.be.true;
    expect(service.accessElement_).to.equal(element);
    expect(service.config_.authorization).to.equal('https://acme.com/a');
    expect(service.config_.pingback).to.equal('https://acme.com/p');
    expect(service.config_.login).to.equal('https://acme.com/l');
  });

  it('should NOT start when experiment is off or disabled', () => {
    document.body.removeChild(element);
    const service = new AccessService(window);
    service.startInternal_ = sandbox.spy();
    expect(service.isEnabled()).to.be.false;
    expect(service.isExperimentOn_).to.be.false;

    service.start_();
    expect(service.startInternal_.callCount).to.equal(0);

    service.isExperimentOn_ = true;
    service.start_();
    expect(service.startInternal_.callCount).to.equal(0);
  });

  it('should start when experiment is on and enabled', () => {
    element.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a',
      'pingback': 'https://acme.com/p',
      'login': 'https://acme.com/l'
    });
    const service = new AccessService(window);
    service.isExperimentOn_ = true;
    service.startInternal_ = sandbox.spy();
    service.start_();
    expect(service.startInternal_.callCount).to.equal(1);
  });
});


describe('AccessService authorization', () => {

  let sandbox;
  let configElement, elementOn, elementOff;
  let vsyncMutates;
  let urlReplacementsMock;
  let xhrMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    configElement = document.createElement('script');
    configElement.setAttribute('id', 'amp-access');
    configElement.setAttribute('type', 'application/json');
    configElement.textContent = JSON.stringify({
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'login': 'https://acme.com/l?rid=READER_ID'
    });
    document.body.appendChild(configElement);

    elementOn = document.createElement('div');
    elementOn.setAttribute('amp-access', 'access');
    document.body.appendChild(elementOn);

    elementOff = document.createElement('div');
    elementOff.setAttribute('amp-access', 'NOT access');
    document.body.appendChild(elementOff);

    service = new AccessService(window);
    service.isExperimentOn_ = true;

    vsyncMutates = [];
    service.vsync_ = {mutate: callback => vsyncMutates.push(callback)};
    urlReplacementsMock = sandbox.mock(service.urlReplacements_);
    xhrMock = sandbox.mock(service.xhr_);
  });

  afterEach(() => {
    if (configElement.parentElement) {
      configElement.parentElement.removeChild(configElement);
    }
    if (elementOn.parentElement) {
      elementOn.parentElement.removeChild(elementOn);
    }
    if (elementOff.parentElement) {
      elementOff.parentElement.removeChild(elementOff);
    }
    sandbox.restore();
    sandbox = null;
  });

  it('should run authorization flow', () => {
    urlReplacementsMock.expects('expand')
        .withExactArgs('https://acme.com/a?rid=READER_ID')
        .returns(Promise.resolve('https://acme.com/a?rid=reader1'))
        .once();
    xhrMock.expects('fetchJson')
        .withExactArgs('https://acme.com/a?rid=reader1',
            {credentials: 'include'})
        .returns(Promise.resolve({access: true}))
        .once();
    return service.runAuthorization_().then(() => {
      expect(vsyncMutates).to.have.length.greaterThan(2);
      vsyncMutates.shift()();
      expect(document.documentElement).to.have.class('amp-access-loading');

      while (vsyncMutates.length > 0) {
        vsyncMutates.shift()();
      }
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(elementOn).not.to.have.attribute('amp-access-off');
      expect(elementOff).to.have.attribute('amp-access-off');
    });
  });

  it('should recover from authorization failure', () => {
    urlReplacementsMock.expects('expand')
        .withExactArgs('https://acme.com/a?rid=READER_ID')
        .returns(Promise.resolve('https://acme.com/a?rid=reader1'))
        .once();
    xhrMock.expects('fetchJson')
        .withExactArgs('https://acme.com/a?rid=reader1',
            {credentials: 'include'})
        .returns(Promise.reject())
        .once();
    return service.runAuthorization_().then(() => {
      expect(vsyncMutates).to.have.length.greaterThan(1);
      vsyncMutates.shift()();
      expect(document.documentElement).to.have.class('amp-access-loading');

      while (vsyncMutates.length > 0) {
        vsyncMutates.shift()();
      }
      expect(document.documentElement).not.to.have.class('amp-access-loading');
      expect(elementOn).not.to.have.attribute('amp-access-off');
      expect(elementOff).not.to.have.attribute('amp-access-off');
    });
  });
});
