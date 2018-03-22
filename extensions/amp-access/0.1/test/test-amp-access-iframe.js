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

import * as lolex from 'lolex';
import {AccessIframeAdapter} from '../amp-access-iframe';


describes.realWin('AccessIframeAdapter', {
  amp: true,
}, env => {
  let ampdoc;
  let clock;
  let validConfig;
  let context;
  let contextMock;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    clock = lolex.install({target: ampdoc.win});

    validConfig = {
      'iframeSrc': 'https://acme.com/iframe',
    };

    context = {
      buildUrl: () => {},
    };
    contextMock = sandbox.mock(context);
  });

  afterEach(() => {
    contextMock.verify();
    clock.uninstall();
  });


  describe('config', () => {
    it('should load valid config', () => {
      const adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
      expect(adapter.getConfig()).to.deep.equal({
        'iframeSrc': 'https://acme.com/iframe',
      });
      expect(adapter.isAuthorizationEnabled()).to.be.true;
      expect(adapter.isPingbackEnabled()).to.be.true;
    });

    it('should require "iframeSrc"', () => {
      delete validConfig['iframeSrc'];
      expect(() => {
        new AccessIframeAdapter(ampdoc, validConfig, context);
      }).to.throw(/iframeSrc/);
    });

    it('should require "iframeSrc" to be secure', () => {
      validConfig['iframeSrc'] = 'http://acme.com/iframe';
      expect(() => {
        new AccessIframeAdapter(ampdoc, validConfig, context);
      }).to.throw(/https/);
    });
  });


  describe('runtime', () => {
    let adapter;
    let messengerMock;

    beforeEach(() => {
      adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
      messengerMock = sandbox.mock(adapter.messenger_);
      messengerMock.expects('sendCommandRsvp')
          .withExactArgs('start', {
            'protocol': 'amp-access',
            'config': validConfig,
          })
          .returns(Promise.resolve())
          .once();
      adapter.handleCommand_('connect');
    });

    afterEach(() => {
      messengerMock.verify();
    });

    it('should connect', () => {
      return adapter.connectedPromise_;
    });

    describe('authorize', () => {
      it('should issue authorization', () => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            .returns(Promise.resolve({granted: true}))
            .once();
        return adapter.authorize().then(result => {
          expect(result).to.deep.equal({granted: true});
        });
      });
    });

    describe('pingback', () => {
      it('should send pingback', () => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('pingback', {})
            .returns(Promise.resolve())
            .once();
        return adapter.pingback();
      });
    });
  });
});
