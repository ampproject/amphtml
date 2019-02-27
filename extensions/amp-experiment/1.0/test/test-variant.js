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

describes.sandboxed('allocateVariant', {}, env => {
  let fakeHead;
  let fakeWin;
  let ampdoc;
  let getCidStub;
  let uniformStub;
  let getParamStub;
  let getNotificationStub;

  beforeEach(() => {
    const {sandbox} = env;

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

    getCidStub = sandbox.stub();
    sandbox.stub(Services, 'cidForDoc').withArgs(ampdoc)
        .returns(Promise.resolve({
          get: getCidStub,
        }));

    uniformStub = sandbox.stub();
    sandbox.stub(Services, 'cryptoFor').withArgs(fakeWin)
        .returns({
          uniform: uniformStub,
        });

    getNotificationStub = sandbox.stub();
    sandbox.stub(Services, 'userNotificationManagerForDoc').withArgs(fakeHead)
        .returns(Promise.resolve({
          getNotification: getNotificationStub,
        }));

    getParamStub = sandbox.stub();
    sandbox.stub(Services, 'viewerForDoc').withArgs(ampdoc)
        .returns({
          getParam: getParamStub,
        });

    sandbox.stub(ampdoc, 'getHeadNode').returns(fakeHead);
  });

  it('should throw for invalid config', () => {
    expect(() => {
      allocateVariant(ampdoc, 'name', null);
    }).to.throw();

    expect(() => {
      allocateVariant(ampdoc, 'name', undefined);
    }).to.throw();

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'name', {});
    }).to.throw(/Missing experiment variants config/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'name', {variants: {}});
    }).to.throw(/Missing experiment variants config/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'name', {
        variants: {
          'invalid_char_%_in_name': 1,
        },
      });
    }).to.throw(/Invalid name/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'name', {
        variants: {
          'variant_1': 50,
          'variant_2': 51,
        },
      });
    }).to.throw(/Total percentage is bigger than 100/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'name', {
        variants: {
          'negative_percentage': -1,
        },
      });
    }).to.throw(/Invalid percentage/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'name', {
        variants: {
          'too_big_percentage': 101,
        },
      });
    }).to.throw(/Invalid percentage/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'name', {
        variants: {
          'non_number_percentage': '50',
        },
      });
    }).to.throw(/Invalid percentage/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'invalid_name!', {
        variants: {
          'variant_1': 50,
        },
      });
    }).to.throw(/Invalid name/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, '', {
        variants: {
          'variant_1': 50,
        },
      });
    }).to.throw(/Invalid name/); });

    allowConsoleError(() => { expect(() => {
      allocateVariant(ampdoc, 'name', {
        group: 'invalid_group_name!',
        variants: {
          'variant_1': 50,
        },
      });
    }).to.throw(/Invalid name/); });
  });

  it('should work around float rounding error', () => {
    expect(() => {
      allocateVariant(ampdoc, 'name', {
        variants: {
          'a': 50.1,
          'b': 40.3,
          'c': 9.2,
          'd': 0.4,
          // They add up to 100.00000000000001​​​ in JS
        },
      });
    }).to.not.throw();
  });

  it('should work in non-sticky mode', () => {
    return expect(allocateVariant(ampdoc, 'name', {
      sticky: false,
      variants: {
        '-Variant_1': 56.1,
        '-Variant_2': 23.3,
      },
    })).to.eventually.equal('-Variant_2');
  });

  it('should allocate variant in name order', () => {
    return expect(allocateVariant(ampdoc, 'name', {
      sticky: false,
      variants: {
        '-Variant_2': 50,
        '-Variant_1': 50,
      },
    })).to.eventually.equal('-Variant_2');
  });

  it('can have no variant allocated if variants don\'t add up to 100', () => {
    return expect(allocateVariant(ampdoc, 'name', {
      sticky: false,
      variants: {
        '-Variant_1': 2.1,
        '-Variant_2': 23.3,
        '-Variant_3': 20.123,
      },
    })).to.eventually.equal(null);
  });

  it('allow variant override from URL fragment', () => {
    getParamStub.withArgs('amp-x-Name').returns('-Variant_1');
    return expect(allocateVariant(ampdoc, 'Name', {
      sticky: false,
      variants: {
        '-Variant_1': 50,
        '-Variant_2': 50,
      },
    })).to.eventually.equal('-Variant_1');
  });

  it('variant override should ignore non-existed variant name', () => {
    getParamStub.withArgs('amp-x-name').returns('-Variant_3');
    return expect(allocateVariant(ampdoc, 'name', {
      sticky: false,
      variants: {
        '-Variant_1': 50,
        '-Variant_2': 50,
      },
    })).to.eventually.equal('-Variant_2');
  });

  it('should work in sticky mode with default CID scope', () => {
    getCidStub.withArgs({
      scope: 'amp-experiment',
      createCookieIfNotPresent: true,
    }).returns(Promise.resolve('123abc'));
    uniformStub.withArgs('name:123abc').returns(Promise.resolve(0.4));
    return expect(allocateVariant(ampdoc, 'name', {
      variants: {
        '-Variant_1': 50,
        '-Variant_2': 50,
      },
    })).to.eventually.equal('-Variant_1');
  });

  it('should work in sticky mode with custom CID scope', () => {
    getCidStub.withArgs({
      scope: 'custom-scope',
      createCookieIfNotPresent: true,
    }).returns(Promise.resolve('123abc'));
    uniformStub.withArgs('name:123abc').returns(Promise.resolve(0.4));
    return expect(allocateVariant(ampdoc, 'name', {
      cidScope: 'custom-scope',
      variants: {
        '-Variant_1': 50,
        '-Variant_2': 50,
      },
    })).to.eventually.equal('-Variant_1');
  });

  it('should work in sticky mode with custom group', () => {
    getCidStub.withArgs({
      scope: 'amp-experiment',
      createCookieIfNotPresent: true,
    }).returns(Promise.resolve('123abc'));
    uniformStub.withArgs('custom-group:123abc').returns(Promise.resolve(0.4));
    return expect(allocateVariant(ampdoc, 'name', {
      group: 'custom-group',
      variants: {
        '-Variant_1': 50,
        '-Variant_2': 50,
      },
    })).to.eventually.equal('-Variant_1');
  });

  it('should have variant allocated if consent is given', () => {
    getNotificationStub.withArgs('notif-1')
        .returns(Promise.resolve({
          isDismissed: () => {
            return (Promise.resolve(true));
          },
        }));

    getCidStub.withArgs({
      scope: 'amp-experiment',
      createCookieIfNotPresent: true,
    }).returns(Promise.resolve('123abc'));
    uniformStub.withArgs('name:123abc').returns(Promise.resolve(0.4));
    return expect(allocateVariant(ampdoc, 'name', {
      consentNotificationId: 'notif-1',
      variants: {
        '-Variant_1': 50,
        '-Variant_2': 50,
      },
    })).to.eventually.equal('-Variant_1');
  });

  it('should have no variant allocated if notification not found', () => {
    getNotificationStub.withArgs('notif-1')
        .returns(Promise.resolve(null));

    return expect(allocateVariant(ampdoc, 'name', {
      consentNotificationId: 'notif-1',
      variants: {
        '-Variant_1': 50,
        '-Variant_2': 50,
      },
    })).to.eventually.be.rejectedWith('Notification not found: notif-1');
  });

  it('should have no variant allocated if consent is missing', () => {
    getNotificationStub.withArgs('notif-1')
        .returns(Promise.resolve({
          isDismissed: () => {
            return (Promise.resolve(false));
          },
        }));

    getCidStub.returns(Promise.resolve('123abc'));
    uniformStub.returns(Promise.resolve(0.4));
    return expect(allocateVariant(ampdoc, 'name', {
      consentNotificationId: 'notif-1',
      variants: {
        '-Variant_1': 50,
        '-Variant_2': 50,
      },
    })).to.eventually.equal(null);
  });
});
