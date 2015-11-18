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

import {validateParentOrigin, parseFragment} from '../../3p/integration';
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

  it('should parse JSON from fragment unencoded (most browsers)', () => {
    const unencoded = '#{"tweetid":"638793490521001985","width":390,' +
        '"height":50,"initialWindowWidth":1290,"initialWindowHeight":165,' +
        '"type":"twitter","_context":{"referrer":"http://localhost:8000/' +
        'examples.build/","canonicalUrl":"http://localhost:8000/' +
        'examples.build/amps.html","location":{"href":"http://' +
        'localhost:8000/examples.build/twitter.amp.max.html"},' +
        '"mode":{"localDev":true,"development":false,"minified":false}}}';
    const data = parseFragment(unencoded);
    expect(data).to.be.object;
    expect(data.tweetid).to.equal('638793490521001985');
    expect(data._context.location.href).to.equal(
        'http://localhost:8000/examples.build/twitter.amp.max.html');
  });

  it('should parse JSON from fragment encoded (Firefox)', () => {
    const encoded = '#{%22tweetid%22:%22638793490521001985%22,%22width' +
        '%22:390,%22height%22:50,%22initialWindowWidth%22:1290,%22initial' +
        'WindowHeight%22:165,%22type%22:%22twitter%22,%22_context%22:{%22' +
        'referrer%22:%22http://localhost:8000/examples.build/%22,%22canoni' +
        'calUrl%22:%22http://localhost:8000/examples.build/amps.html%22,%22' +
        'location%22:{%22href%22:%22http://localhost:8000/examples.build/t' +
        'witter.amp.max.html%22},%22mode%22:{%22localDev%22:true,%22develop' +
        'ment%22:false,%22minified%22:false}}}';
    const data = parseFragment(encoded);
    expect(data).to.be.object;
    expect(data.tweetid).to.equal('638793490521001985');
    expect(data._context.location.href).to.equal(
        'http://localhost:8000/examples.build/twitter.amp.max.html');
  });

  it('should be ok with empty fragment', () => {
    expect(parseFragment('')).to.be.empty;
    expect(parseFragment('#')).to.be.empty;
  });
});
