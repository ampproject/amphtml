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
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
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
      });
      expect(adapter.isAuthorizationEnabled()).to.be.true;
      expect(adapter.isPingbackEnabled()).to.be.true;
    });
  });


  describe('runtime', () => {
    let adapter;

    beforeEach(() => {
      adapter = new AccessIframeAdapter(ampdoc, validConfig, context);
    });

    afterEach(() => {
    });

    describe('authorize', () => {
      it('should issue authorization', () => {
        return adapter.authorize().then(() => {
          throw new Error('must have failed');
        }, reason => {
          expect(() => {throw reason;}).to.throw(/not implemented/);
        });
      });
    });

    describe('pingback', () => {
      it('should send pingback', () => {
        return adapter.pingback().then(() => {
          throw new Error('must have failed');
        }, reason => {
          expect(() => {throw reason;}).to.throw(/not implemented/);
        });
      });
    });
  });
});
