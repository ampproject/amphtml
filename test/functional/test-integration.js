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

// Tests integration.js
// Most coverage through test-3p-frame

import {validateParentOrigin} from '../../3p/integration';
import {registrations} from '../../src/3p';

describe('3p integration.js', () => {
  it('should register integrations', () => {
    expect(registrations).to.include.key('a9');
    expect(registrations).to.include.key('adsense');
    expect(registrations).to.include.key('adtech');
    expect(registrations).to.include.key('adreactor');
    expect(registrations).to.include.key('doubleclick');
    expect(registrations).to.include.key('twitter');
    expect(registrations).to.include.key('_ping_');
  });

  it('should validateParentOrigin without ancestorOrigins', () => {
    let parent = {};
    validateParentOrigin({
      location: {}
    }, parent);
    expect(parent.originValidated).to.be.false;

    parent = {};
    validateParentOrigin({
      location: {
        ancestorOrigins: []
      }
    }, parent);
    expect(parent.originValidated).to.be.false;
  });

  it('should validateParentOrigin with correct ancestorOrigins', () => {
    const parent = {
      origin: 'abc'
    };
    validateParentOrigin({
      location: {
        ancestorOrigins: ['abc', 'xyz']
      }
    }, parent);

    expect(parent.originValidated).to.be.true;
  });

  it('should throw in validateParentOrigin with incorrect ancestorOrigins',
    () => {
      const parent = {
        origin: 'abc'
      };
      expect(() => {
        validateParentOrigin({
          location: {
            ancestorOrigins: ['xyz']
          }
        }, parent);
      }).to.throw(/Parent origin mismatch/);
    });
});
