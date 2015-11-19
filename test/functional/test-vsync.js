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

import {Vsync} from '../../src/vsync';
import {viewerFor} from '../../src/viewer';
import * as sinon from 'sinon';


describe('vsync', () => {
  let vsync;

  beforeEach(() => {
    vsync = new Vsync(window);
  });

  it('should generate a frame and run callbacks', () => {
    let result = '';
    return new Promise(resolve => {
      vsync.run({
        measure: () => {
          result += 'me1';
        },
        mutate: () => {
          result += 'mu1';
        }
      });
      vsync.run({
        measure: () => {
          result += 'me2';
        },
        mutate: () => {
          result += 'mu2';
        }
      });
      vsync.run({
        measure: () => {
          result += 'me3';
        }
      });
      vsync.run({
        mutate: () => {
          result += 'mu3';
        }
      });
      vsync.mutate(() => {
        result += 'mu4';
        resolve();
      });
      vsync.measure(() => {
        result += 'me4';
        resolve();
      });
    }).then(() => {
      expect(result).to.equal('me1me2me3me4mu1mu2mu3mu4');
    });
  });

  it('should schedule nested vsyncs', () => {
    let result = '';
    return new Promise(resolve => {
      vsync.run({
        measure: () => {
          result += 'me1';
          vsync.run({
            measure: () => {
              result += 'me2';
            },
            mutate: () => {
              result += 'mu2';
              vsync.run({
                measure: () => {
                  result += 'me3';
                }
              });
              vsync.run({
                mutate: () => {
                  result += 'mu3';
                  resolve();
                }
              });
            }
          });
        },
        mutate: () => {
          result += 'mu1';
        }
      });
    }).then(() => {
      expect(result).to.equal('me1mu1me2mu2me3mu3');
    });
  });
});

describe('raf polyfill', () => {
  let sandbox;
  let clock;
  let visible;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    visible = true;
  });

  afterEach(() => {
    clock.restore();
    sandbox.restore();
  });

  const vsync = new Vsync({
    setTimeout: (fn, t) => {
      window.setTimeout(fn, t);
    },
    services: {
      viewer: {
        isVisible: () => {
          return visible;
        }
      }
    }
  });

  it('should schedule frames using the polyfill', () => {
    let calls = 0;
    vsync.mutate(() => {
      calls++;
    });
    clock.tick(15);
    vsync.mutate(() => {
      calls++;
    });
    expect(calls).to.equal(0);
    clock.tick(1);
    expect(calls).to.equal(2);
    clock.tick(10);
    vsync.mutate(() => {
      calls++;
    });
    expect(calls).to.equal(2);
    clock.tick(6);
    expect(calls).to.equal(3);
  });

  it('should not schedule for invisible docs', () => {
    visible = false;
    let calls = 0;
    vsync.mutate(() => {
      calls++;
    });
    clock.tick(1000);
    expect(calls).to.equal(0);
    visible = true;
    clock.tick(1000);
    expect(calls).to.equal(0);
    vsync.mutate(() => {
      calls++;
    });
    clock.tick(16);
    expect(calls).to.equal(1);
  });
});
