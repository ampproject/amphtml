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

import {
  computeInMasterFrame,
  loadScript,
  nextTick,
  validateData,
  validateSrcContains,
  validateSrcPrefix,
} from '../../3p/3p';

describe('3p', () => {
  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    clock.tick(1000);
    sandbox.restore();
  });

  describe('validateSrcPrefix()', () => {
    it('should throw when a string prefix does not match', () => {
      expect(() => {
        validateSrcPrefix('https:', 'http://example.org');
      }).to.throw(/Invalid src/);
    });

    it('should throw when array prefixes do not match', () => {
      expect(() => {
        validateSrcPrefix(['https:', 'ftp:'], 'http://example.org');
      }).to.throw(/Invalid src/);
    });

    it('should not throw when a string prefix matches', () => {
      validateSrcPrefix('http:', 'http://example.org');
    });

    it('should not throw when any of the array prefixes match', () => {
      validateSrcPrefix(['https:', 'http:'], 'http://example.org');
      validateSrcPrefix(['http:', 'https:'], 'http://example.org');
    });
  });

  it('should throw an error if src does not contain addyn', () => {
    expect(() => {
      validateSrcContains('/addyn/', 'http://adserver.adtechus.com/');
    }).to.throw(/Invalid src/);
  });

  it('should not throw if source contains /addyn/', () => {
    validateSrcContains('/addyn/', 'http://adserver.adtechus.com/addyn/');
  });

  describe('validateData', () => {
    it('should check mandatory fields', () => {
      validateData(
        {
          width: '',
          height: false,
          type: 'taboola',
          referrer: true,
          canonicalUrl: true,
          pageViewId: true,
          location: true,
          mode: true,
        },
        []
      );
      clock.tick(1);

      validateData(
        {
          width: '',
          type: 'taboola',
          foo: true,
          bar: true,
        },
        ['foo', 'bar']
      );
      clock.tick(1);

      allowConsoleError(() => {
        expect(() => {
          validateData(
            {
              width: '',
              type: 'xxxxxx',
              foo: true,
              bar: true,
            },
            ['foo', 'bar', 'persika']
          );
        }).to.throw(/Missing attribute for xxxxxx: persika./);
      });

      allowConsoleError(() => {
        expect(() => {
          validateData(
            {
              width: '',
              type: 'xxxxxx',
              foo: true,
              bar: true,
            },
            [['red', 'green', 'blue']]
          );
        }).to.throw(
          /xxxxxx must contain exactly one of attributes: red, green, blue./
        );
      });
    });

    it('should check mandatory fields with alternative options', () => {
      validateData(
        {
          width: '',
          type: 'taboola',
          foo: true,
          bar: true,
        },
        [['foo', 'day', 'night']]
      );
      clock.tick(1);
    });

    it('should check optional fields', () => {
      validateData(
        {
          width: '',
          height: false,
          type: true,
          referrer: true,
          canonicalUrl: true,
          pageViewId: true,
          location: true,
          mode: true,
        },
        /* mandatory */ [],
        /* optional */ []
      );

      validateData(
        {
          width: '',
          foo: true,
          bar: true,
        },
        /* mandatory */ [],
        ['foo', 'bar']
      );

      allowConsoleError(() => {
        expect(() => {
          validateData(
            {
              type: 'TEST',
              foo: true,
              'not-whitelisted': true,
            },
            [],
            ['foo']
          );
        }).to.throw(/Unknown attribute for TEST: not-whitelisted./);
      });
    });

    it('should check mandatory and optional fields', () => {
      validateData(
        {
          width: '',
          foo: true,
          bar: true,
          halo: 'world',
        },
        [['foo', 'fo'], 'bar'],
        ['halo']
      );
    });
  });

  it('should run in next tick', () => {
    let called = 0;
    nextTick(window, () => {
      called++;
    });
    return Promise.resolve(() => {
      expect(called).to.equal(1);
    });
  });

  it('should run in next tick (setTimeout)', () => {
    let called = 0;
    nextTick(
      {
        setTimeout: fn => {
          fn();
        },
      },
      () => {
        called++;
      }
    );
    expect(called).to.equal(1);
  });

  it('should do work only in master', () => {
    const taskId = 'exampleId';
    const master = {
      context: {
        isMaster: true,
      },
    };
    master.context.master = master;
    const slave0 = {
      context: {
        isMaster: false,
        master,
      },
    };
    const slave1 = {
      context: {
        isMaster: false,
        master,
      },
    };
    const slave2 = {
      context: {
        isMaster: false,
        master,
      },
    };
    let done;
    let workCalls = 0;
    const work = d => {
      workCalls++;
      done = d;
    };
    let progress = '';
    const frame = id => {
      return result => {
        progress += result + id;
      };
    };
    computeInMasterFrame(slave0, taskId, work, frame('slave0'));
    expect(workCalls).to.equal(0);
    computeInMasterFrame(master, taskId, work, frame('master'));
    expect(workCalls).to.equal(1);
    computeInMasterFrame(slave1, taskId, work, frame('slave1'));
    expect(progress).to.equal('');
    done(';');
    expect(progress).to.equal(';slave0;master;slave1');
    computeInMasterFrame(slave2, taskId, work, frame('slave2'));
    expect(progress).to.equal(';slave0;master;slave1;slave2');
    expect(workCalls).to.equal(1);
  });

  describe('loadScript', () => {
    it('should add <script /> with url to the body', () => {
      const url = 'http://test.com/example.js';
      let s = window.document.body.querySelector(`script[src="${url}"]`);
      expect(s).to.equal(null);
      loadScript(window, url);
      s = window.document.body.querySelector(`script[src="${url}"]`);
      expect(s.src).to.equal(url);
    });

    it('should handle onSuccess callback', done => {
      loadScript(
        window,
        'http://localhost:9876/test/unit/test-3p.js',
        () => {
          done();
        },
        () => {
          done('onError should not be called!');
        }
      );
    });

    it('should handle onFailure callback', done => {
      loadScript(
        window,
        'http://localhost:9876/404',
        () => {
          done('onSuccess should not be called');
        },
        () => {
          done();
        }
      );
    });
  });
});
