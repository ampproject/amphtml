/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {Services} from '../../../../src/services';
import {allocateVariant} from '../variant';

describes.sandboxed('allocateVariant', {}, (env) => {
  let fakeHead;
  let fakeWin;
  let ampdoc;
  let getCidStub;
  let uniformStub;
  let fakeViewer;
  let getParamStub;
  let getNotificationStub;

  beforeEach(() => {
    fakeWin = {
      Math: {
        random: () => {
          return 0.567;
        },
      },
      document: {
        nodeType: /* DOCUMENT */ 9,
        body: {},
      },
    };
    fakeWin.document.defaultView = fakeWin;
    ampdoc = new AmpDocSingle(fakeWin);

    fakeHead = {};

    getCidStub = env.sandbox.stub();
    env.sandbox
      .stub(Services, 'cidForDoc')
      .withArgs(ampdoc)
      .returns(
        Promise.resolve({
          get: getCidStub,
        })
      );

    uniformStub = env.sandbox.stub();
    env.sandbox.stub(Services, 'cryptoFor').withArgs(fakeWin).returns({
      uniform: uniformStub,
    });

    getNotificationStub = env.sandbox.stub();
    env.sandbox
      .stub(Services, 'userNotificationManagerForDoc')
      .withArgs(fakeHead)
      .returns(
        Promise.resolve({
          getNotification: getNotificationStub,
        })
      );

    fakeViewer = {};

    env.sandbox.stub(ampdoc, 'getHeadNode').returns(fakeHead);
    getParamStub = env.sandbox.stub(ampdoc, 'getParam').returns('true');
  });

  it('should throw for invalid config', () => {
    expect(() => {
      allocateVariant(ampdoc, fakeViewer, 'name', null);
    }).to.throw();

    expect(() => {
      allocateVariant(ampdoc, fakeViewer, 'name', undefined);
    }).to.throw();

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {});
      }).to.throw(/Missing variants/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {variants: 52});
      }).to.throw(/Missing variants/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {variants: {}});
      }).to.throw(/Missing variants/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {
          variants: {
            'invalid_char_%_in_name': 1,
          },
        });
      }).to.throw(/Invalid name/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {
          variants: {
            'variant_1': {
              weight: 51,
              mutations: [{}],
            },
            'variant_2': {
              weight: 51,
              mutations: [{}],
            },
          },
        });
      }).to.throw(/Total percentage is bigger than 100/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {
          variants: {
            'negative_percentage': {
              weight: -1,
              mutations: [{}],
            },
          },
        });
      }).to.throw(/Invalid weight percentage/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {
          variants: {
            'too_big_percentage': {
              weight: 101,
              mutations: [{}],
            },
          },
        });
      }).to.throw(/Invalid weight percentage/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {
          variants: {
            'non_number_percentage': {
              weight: '50',
              mutations: [{}],
            },
          },
        });
      }).to.throw(/must have a number weight/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'invalid_name!', {
          variants: {
            'variant_1': {
              weight: 50,
              mutations: [{}],
            },
          },
        });
      }).to.throw(/Invalid name/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, '', {
          variants: {
            'variant_1': {
              weight: 50,
              mutations: [{}],
            },
          },
        });
      }).to.throw(/Invalid name/);
    });

    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {
          group: 'invalid_group_name!',
          variants: {
            'variant_1': {
              weight: 50,
              mutations: [{}],
            },
          },
        });
      }).to.throw(/Invalid name/);
    });
  });

  it('should check that mutations exist', () => {
    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {
          variants: {
            'variant_1': {
              weight: 50,
            },
          },
        });
      }).to.throw(/mutations array/);
    });
  });

  it('should allow variants with no mutations', () => {
    allowConsoleError(() => {
      expect(() => {
        allocateVariant(ampdoc, fakeViewer, 'name', {
          variants: {
            'variant_1': {
              weight: 50,
              mutations: [],
            },
          },
        });
      }).to.not.throw();
    });
  });

  it('should work around float rounding error', () => {
    expect(() => {
      allocateVariant(ampdoc, fakeViewer, 'name', {
        variants: {
          'a': {
            weight: 50.1,
            mutations: [{}],
          },
          'b': {
            weight: 40.3,
            mutations: [{}],
          },
          'c': {
            weight: 9.2,
            mutations: [{}],
          },
          'd': {
            weight: 0.4,
            mutations: [{}],
          },
          // They add up to 100.00000000000001​​​ in JS
        },
      });
    }).to.not.throw();
  });

  it('should work in non-sticky mode', () => {
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        sticky: false,
        variants: {
          '-Variant_1': {
            weight: 56.1,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 23.3,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal('-Variant_2');
  });

  it('should allocate variant in name order', () => {
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        sticky: false,
        variants: {
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal('-Variant_2');
  });

  it("can have no variant allocated if variants don't add up to 100", () => {
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        sticky: false,
        variants: {
          '-Variant_1': {
            weight: 2.1,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 23.3,
            mutations: [{}],
          },
          '-Variant_3': {
            weight: 20.123,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal(null);
  });

  it('allow variant override from URL fragment', () => {
    getParamStub.withArgs('amp-x-Name').returns('-Variant_1');
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'Name', {
        sticky: false,
        variants: {
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal('-Variant_1');
  });

  it('variant override should ignore non-existed variant name', () => {
    getParamStub.withArgs('amp-x-name').returns('-Variant_3');
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        sticky: false,
        variants: {
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal('-Variant_2');
  });

  it('should work in sticky mode with default CID scope', () => {
    getCidStub
      .withArgs({
        scope: 'amp-experiment',
        createCookieIfNotPresent: true,
      })
      .returns(Promise.resolve('123abc'));
    uniformStub.withArgs('name:123abc').returns(Promise.resolve(0.4));
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        variants: {
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal('-Variant_1');
  });

  it('should work in sticky mode with custom CID scope', () => {
    getCidStub
      .withArgs({
        scope: 'custom-scope',
        createCookieIfNotPresent: true,
      })
      .returns(Promise.resolve('123abc'));
    uniformStub.withArgs('name:123abc').returns(Promise.resolve(0.4));
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        cidScope: 'custom-scope',
        variants: {
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal('-Variant_1');
  });

  it('should work in sticky mode with custom group', () => {
    getCidStub
      .withArgs({
        scope: 'amp-experiment',
        createCookieIfNotPresent: true,
      })
      .returns(Promise.resolve('123abc'));
    uniformStub.withArgs('custom-group:123abc').returns(Promise.resolve(0.4));
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        group: 'custom-group',
        variants: {
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal('-Variant_1');
  });

  it('should have variant allocated if consent is given', () => {
    getNotificationStub.withArgs('notif-1').returns(
      Promise.resolve({
        isDismissed: () => {
          return Promise.resolve(true);
        },
      })
    );

    getCidStub
      .withArgs({
        scope: 'amp-experiment',
        createCookieIfNotPresent: true,
      })
      .returns(Promise.resolve('123abc'));
    uniformStub.withArgs('name:123abc').returns(Promise.resolve(0.4));
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        consentNotificationId: 'notif-1',
        variants: {
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal('-Variant_1');
  });

  it('should have no variant allocated if notification not found', () => {
    getNotificationStub.withArgs('notif-1').returns(Promise.resolve(null));

    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        consentNotificationId: 'notif-1',
        variants: {
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.be.rejectedWith('Notification not found: notif-1');
  });

  it('should have no variant allocated if consent is missing', () => {
    getNotificationStub.withArgs('notif-1').returns(
      Promise.resolve({
        isDismissed: () => {
          return Promise.resolve(false);
        },
      })
    );

    getCidStub.returns(Promise.resolve('123abc'));
    uniformStub.returns(Promise.resolve(0.4));
    return expect(
      allocateVariant(ampdoc, fakeViewer, 'name', {
        consentNotificationId: 'notif-1',
        variants: {
          '-Variant_1': {
            weight: 50,
            mutations: [{}],
          },
          '-Variant_2': {
            weight: 50,
            mutations: [{}],
          },
        },
      })
    ).to.eventually.equal(null);
  });
});
