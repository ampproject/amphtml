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

import {
  draw3p,
  ensureFramed,
  validateParentOrigin,
  validateAllowedEmbeddingOrigins,
  validateAllowedTypes,
  parseFragment,
} from '../../3p/integration';
import {registrations, register} from '../../3p/3p';

describe('3p integration.js', () => {

  afterEach(() => {
    delete registrations.testAction;
  });

  it('should register integrations', () => {
    expect(registrations).to.include.key('a9');
    expect(registrations).to.include.key('adblade');
    expect(registrations).to.include.key('adition');
    expect(registrations).to.include.key('adform');
    expect(registrations).to.include.key('adsense');
    expect(registrations).to.include.key('adtech');
    expect(registrations).to.include.key('adreactor');
    expect(registrations).to.include.key('criteo');
    expect(registrations).to.include.key('doubleclick');
    expect(registrations).to.include.key('flite');
    expect(registrations).to.include.key('mantis-display');
    expect(registrations).to.include.key('mantis-recommend');
    expect(registrations).to.include.key('industrybrains');
    expect(registrations).to.include.key('openx');
    expect(registrations).to.include.key('twitter');
    expect(registrations).to.include.key('widespace');
    expect(registrations).to.include.key('yieldmo');
    expect(registrations).to.include.key('sortable');
    expect(registrations).to.include.key('triplelift');
    expect(registrations).to.include.key('_ping_');
    expect(registrations).to.include.key('imobile');
    expect(registrations).to.include.key('gmossp');
    expect(registrations).to.include.key('weborama-display');
    expect(registrations).to.include.key('yieldbot');
    expect(registrations).to.include.key('adstir');
    expect(registrations).to.include.key('colombia');
    expect(registrations).to.include.key('microad');
    expect(registrations).to.include.key('yahoojp');
    expect(registrations).to.include.key('chargeads');
    expect(registrations).to.include.key('nend');
    expect(registrations).to.include.key('adgeneration');
    expect(registrations).to.include.key('genieessp');
    expect(registrations).to.include.key('kargo');
  });

  it('should validateParentOrigin without ancestorOrigins', () => {
    let parent = {};
    validateParentOrigin({
      location: {},
    }, parent);
    expect(parent.originValidated).to.be.false;

    parent = {};
    validateParentOrigin({
      location: {
        ancestorOrigins: [],
      },
    }, parent);
    expect(parent.originValidated).to.be.false;
  });

  it('should validateParentOrigin with correct ancestorOrigins', () => {
    const parent = {
      origin: 'abc',
    };
    validateParentOrigin({
      location: {
        ancestorOrigins: ['abc', 'xyz'],
      },
    }, parent);

    expect(parent.originValidated).to.be.true;
  });

  it('should throw in validateParentOrigin with incorrect ancestorOrigins',
    () => {
      const parent = {
        origin: 'abc',
      };
      expect(() => {
        validateParentOrigin({
          location: {
            ancestorOrigins: ['xyz'],
          },
        }, parent);
      }).to.throw(/Parent origin mismatch/);
    });

  it('should parse JSON from fragment unencoded (most browsers)', () => {
    const unencoded = '#{"tweetid":"638793490521001985","width":390,' +
        '"height":50,' +
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

  it('should call the right action based on type', () => {
    const data = {
      type: 'testAction',
    };
    const win = {
      context: {
        location: {
          originValidated: true,
        },
        data,
      },
    };
    let called = false;
    register('testAction', function(myWin, myData) {
      called = true;
      expect(myWin).to.equal(win);
      expect(myData).to.equal(myData);
    });
    expect(called).to.be.false;
    draw3p(win, data);
    expect(called).to.be.true;
  });

  it('should support config processing in draw3p', () => {
    const data = {
      type: 'testAction2',
    };
    const win = {
      context: {
        location: {
          originValidated: true,
        },
        data,
      },
    };
    let called = false;
    register('testAction2', function(myWin, myData) {
      expect(called).to.be.false;
      called = true;
      expect(myWin).to.equal(win);
      expect(myData).to.not.equal(data);
      expect(myData).to.have.property('custom');
    });
    expect(called).to.be.false;
    let finish;
    draw3p(win, data, (_config, done) => {
      finish = () => {
        done({
          custom: true,
        });
      };
    });
    expect(called).to.be.false;
    finish();
    expect(called).to.be.true;
  });

  it('should throw if origin was never validated', () => {
    const data = {
      type: 'testAction',
    };
    const win = {
      context: {
        location: {},
        data,
      },
    };
    expect(() => {
      draw3p(win, data);
    }).to.throw(/Origin should have been validated/);
  });

  it('should throw if origin was never validated', () => {
    const data = {
      type: 'testAction',
    };
    const win = {
      context: {
        location: {
          originValidated: true,
        },
        data,
        tagName: 'AMP-EMBED',
      },
    };
    expect(() => {
      draw3p(win, data);
    }).to.throw(/Embed type testAction not allowed with tag AMP-EMBED/);
  });

  it('should allow all types on localhost', () => {
    const localhost = {
      location: {
        hostname: 'ads.localhost',
      },
    };
    validateAllowedTypes(localhost, 'twitter');
    validateAllowedTypes(localhost, 'facebook');
    validateAllowedTypes(localhost, 'a9');
    validateAllowedTypes(localhost, 'not present');
  });

  it('should allow all types on default host', () => {
    const defaultHost = {
      location: {
        hostname: '3p.ampproject.net',
      },
    };
    validateAllowedTypes(defaultHost, 'twitter');
    validateAllowedTypes(defaultHost, 'facebook');
    validateAllowedTypes(defaultHost, 'a9');
    validateAllowedTypes(defaultHost, 'not present');
  });

  it('should allow all types on unique default host', () => {
    function get(domain) {
      return {
        location: {
          hostname: domain,
        },
      };
    }
    validateAllowedTypes(get('d-123.ampproject.net'), 'twitter');
    validateAllowedTypes(get('d-46851196780996873.ampproject.net'), 'adtech');
    validateAllowedTypes(get('d-46851196780996873.ampproject.net'), 'a9');
    expect(() => {
      validateAllowedTypes(get('d-124.ampproject.net.com'), 'not present');
    }).to.throw(/Non-whitelisted 3p type for custom iframe/);
  });

  it('should validate types on custom host', () => {
    const defaultHost = {
      location: {
        hostname: 'other.com',
      },
    };
    validateAllowedTypes(defaultHost, 'twitter');
    validateAllowedTypes(defaultHost, 'facebook');
    validateAllowedTypes(defaultHost, 'doubleclick');
    expect(() => {
      validateAllowedTypes(defaultHost, 'not present');
    }).to.throw(/Non-whitelisted 3p type for custom iframe/);
    expect(() => {
      validateAllowedTypes(defaultHost, 'adtech');
    }).to.throw(/Non-whitelisted 3p type for custom iframe/);
    validateAllowedTypes(defaultHost, 'adtech', ['adtech']);
  });

  it('should ensure the 3p frame is actually framed', () => {
    ensureFramed(window); // Test window is always framed.
    ensureFramed({
      parent: 'other',
    });
    const win = {
      location: {
        href: 'sentinel',
      },
    };
    win.parent = win;
    expect(() => {
      ensureFramed(win);
    }).to.throw(/Must be framed: sentinel/);
  });

  it('should validateAllowedEmbeddingOrigins: non-cache', () => {
    const win = {
      document: {
        referrer: 'https://should-be-ignored',
      },
      location: {
        ancestorOrigins: ['https://www.foo.com'],
      },
    };
    function invalid(fn) {
      expect(fn).to.throw(/Invalid embedding hostname/);
    }
    validateAllowedEmbeddingOrigins(win, ['foo.com']);
    validateAllowedEmbeddingOrigins(win, ['foo.net', 'foo.com']);
    validateAllowedEmbeddingOrigins(win, ['www.foo.com']);
    invalid(() => validateAllowedEmbeddingOrigins(win, ['bar.com']));
    invalid(() => validateAllowedEmbeddingOrigins(win, ['amp.www.foo.com']));
    invalid(() => validateAllowedEmbeddingOrigins(win, ['ampwww.foo.com']));
  });

  it('should validateAllowedEmbeddingOrigins: cache', () => {
    const win = {
      location: {
        ancestorOrigins: ['https://cdn.ampproject.org'],
      },
      document: {
        referrer: 'https://cdn.ampproject.org/c/www.foo.com/test',
      },
    };
    function invalid(fn) {
      expect(fn).to.throw(/Invalid embedding hostname/);
    }
    validateAllowedEmbeddingOrigins(win, ['foo.com']);
    validateAllowedEmbeddingOrigins(win, ['www.foo.com']);
    invalid(() => validateAllowedEmbeddingOrigins(win, ['bar.com']));
    invalid(() => validateAllowedEmbeddingOrigins(win, ['amp.www.foo.com']));
    invalid(() => validateAllowedEmbeddingOrigins(win, ['ampwww.foo.com']));
    win.document.referrer = 'https://cdn.ampproject.net/c/www.foo.com/test';
    invalid(() => validateAllowedEmbeddingOrigins(win, ['foo.com']));
  });

  it('should validateAllowedEmbeddingOrigins: referrer non-cache', () => {
    const win = {
      location: {
      },
      document: {
        referrer: 'https://www.foo.com/test',
      },
    };
    function invalid(fn) {
      expect(fn).to.throw(/Invalid embedding hostname/);
    }
    validateAllowedEmbeddingOrigins(win, ['foo.com']);
    validateAllowedEmbeddingOrigins(win, ['www.foo.com']);
    invalid(() => validateAllowedEmbeddingOrigins(win, ['bar.com']));
    invalid(() => validateAllowedEmbeddingOrigins(win, ['amp.www.foo.com']));
    invalid(() => validateAllowedEmbeddingOrigins(win, ['ampwww.foo.com']));
  });

  it('should validateAllowedEmbeddingOrigins: referrer cache', () => {
    const win = {
      location: {
      },
      document: {
        referrer: 'https://cdn.ampproject.org/c/www.foo.com/test',
      },
    };
    function invalid(fn) {
      expect(fn).to.throw(/Invalid embedding hostname/);
    }
    validateAllowedEmbeddingOrigins(win, ['foo.com']);
    validateAllowedEmbeddingOrigins(win, ['www.foo.com']);
    invalid(() => validateAllowedEmbeddingOrigins(win, ['bar.com']));
    invalid(() => validateAllowedEmbeddingOrigins(win, ['amp.www.foo.com']));
    invalid(() => validateAllowedEmbeddingOrigins(win, ['ampwww.foo.com']));
    win.document.referrer = 'https://cdn.ampproject.net/c/www.foo.com/test';
    invalid(() => validateAllowedEmbeddingOrigins(win, ['foo.com']));
  });
});
