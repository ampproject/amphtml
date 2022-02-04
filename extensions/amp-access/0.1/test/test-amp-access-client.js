import * as fakeTimers from '@sinonjs/fake-timers';

import * as mode from '../../../../src/mode';
import {AccessClientAdapter} from '../amp-access-client';

describes.realWin(
  'AccessClientAdapter',
  {
    amp: true,
  },
  (env) => {
    let ampdoc;
    let clock;
    let validConfig;
    let context;
    let contextMock;

    beforeEach(() => {
      ampdoc = env.ampdoc;
      clock = fakeTimers.withGlobal(ampdoc.win).install();

      validConfig = {
        'authorization': 'https://acme.com/a?rid=READER_ID',
        'pingback': 'https://acme.com/p?rid=READER_ID',
      };

      context = {
        buildUrl: () => {},
      };
      contextMock = env.sandbox.mock(context);
    });

    afterEach(() => {
      contextMock.verify();
      clock.uninstall();
    });

    describe('config', () => {
      it('should load valid config', () => {
        const adapter = new AccessClientAdapter(ampdoc, validConfig, context);
        expect(adapter.authorizationUrl_).to.equal(
          'https://acme.com/a?rid=READER_ID'
        );
        expect(adapter.pingbackUrl_).to.equal(
          'https://acme.com/p?rid=READER_ID'
        );
        expect(adapter.authorizationTimeout_).to.equal(3000);
        expect(adapter.getConfig()).to.deep.equal({
          authorizationUrl: 'https://acme.com/a?rid=READER_ID',
          pingbackEnabled: true,
          pingbackUrl: 'https://acme.com/p?rid=READER_ID',
          authorizationTimeout: 3000,
        });
        expect(adapter.isAuthorizationEnabled()).to.be.true;
        expect(adapter.isPingbackEnabled()).to.be.true;
      });

      it('should set authorization timeout if provided', () => {
        validConfig['authorizationTimeout'] = 5000;
        const adapter = new AccessClientAdapter(ampdoc, validConfig, context);
        expect(adapter.authorizationTimeout_).to.equal(5000);
      });

      it('should allow only lower-than-default timeout in production', () => {
        env.sandbox.stub(mode, 'getMode').callsFake(() => {
          return {development: false, localDev: false};
        });

        let adapter;

        validConfig['authorizationTimeout'] = 1000;
        adapter = new AccessClientAdapter(ampdoc, validConfig, context);
        expect(adapter.authorizationTimeout_).to.equal(1000);

        validConfig['authorizationTimeout'] = 5000;
        adapter = new AccessClientAdapter(ampdoc, validConfig, context);
        expect(adapter.authorizationTimeout_).to.equal(3000);
      });

      it('should fail when authorization timeout is malformed', () => {
        validConfig['authorizationTimeout'] = 'someString';
        allowConsoleError(() => {
          expect(() => {
            new AccessClientAdapter(ampdoc, validConfig, context);
          }).to.throw(/"authorizationTimeout" must be a number/);
        });
      });

      it('should fail if config authorization is missing or malformed', () => {
        delete validConfig['authorization'];
        allowConsoleError(() => {
          expect(() => {
            new AccessClientAdapter(ampdoc, validConfig, context);
          }).to.throw(/"authorization" URL must be specified/);
        });

        validConfig['authorization'] = 'http://acme.com/a';
        allowConsoleError(() => {
          expect(() => {
            new AccessClientAdapter(ampdoc, validConfig, context);
          }).to.throw(/"authorization".*https\:/);
        });
      });

      it('should fail if config pingback is missing or malformed', () => {
        delete validConfig['pingback'];
        allowConsoleError(() => {
          expect(() => {
            new AccessClientAdapter(ampdoc, validConfig, context);
          }).to.throw(/"pingback" URL must be specified/);
        });

        validConfig['pingback'] = 'http://acme.com/p';
        allowConsoleError(() => {
          expect(() => {
            new AccessClientAdapter(ampdoc, validConfig, context);
          }).to.throw(/"pingback".*https\:/);
        });
      });

      it('should allow missing pingback when noPingback=true', () => {
        delete validConfig['pingback'];
        validConfig['noPingback'] = true;
        const adapter = new AccessClientAdapter(ampdoc, validConfig, context);
        expect(adapter.isPingbackEnabled()).to.be.false;
        expect(adapter.pingbackUrl_).to.not.exist;
      });
    });

    describe('runtime', () => {
      let adapter;
      let xhrMock;

      beforeEach(() => {
        adapter = new AccessClientAdapter(ampdoc, validConfig, context);
        xhrMock = env.sandbox.mock(adapter.xhr_);
      });

      afterEach(() => {
        xhrMock.verify();
      });

      describe('authorize', () => {
        it('should issue XHR fetch', () => {
          contextMock
            .expects('buildUrl')
            .withExactArgs(
              'https://acme.com/a?rid=READER_ID',
              /* useAuthData */ false
            )
            .returns(Promise.resolve('https://acme.com/a?rid=reader1'))
            .once();
          xhrMock
            .expects('fetchJson')
            .withExactArgs('https://acme.com/a?rid=reader1', {
              credentials: 'include',
            })
            .returns(
              Promise.resolve({
                json() {
                  return Promise.resolve({access: 'A'});
                },
              })
            )
            .once();
          return adapter.authorize().then((response) => {
            expect(response).to.exist;
            expect(response.access).to.equal('A');
          });
        });

        it('should fail when XHR fails', () => {
          contextMock
            .expects('buildUrl')
            .withExactArgs(
              'https://acme.com/a?rid=READER_ID',
              /* useAuthData */ false
            )
            .returns(Promise.resolve('https://acme.com/a?rid=reader1'))
            .once();
          xhrMock
            .expects('fetchJson')
            .withExactArgs('https://acme.com/a?rid=reader1', {
              credentials: 'include',
            })
            .returns(Promise.reject('intentional'))
            .once();
          return adapter.authorize().then(
            () => {
              throw new Error('must never happen');
            },
            (error) => {
              expect(error).to.match(/intentional/);
            }
          );
        });

        it('should time out XHR fetch', () => {
          contextMock
            .expects('buildUrl')
            .withExactArgs(
              'https://acme.com/a?rid=READER_ID',
              /* useAuthData */ false
            )
            .returns(Promise.resolve('https://acme.com/a?rid=reader1'))
            .once();
          xhrMock
            .expects('fetchJson')
            .withExactArgs('https://acme.com/a?rid=reader1', {
              credentials: 'include',
            })
            .returns(new Promise(() => {})) // Never resolved.
            .once();
          const promise = adapter.authorize();
          return Promise.resolve()
            .then(() => {
              clock.tick(3001);
              return promise;
            })
            .then(
              () => {
                throw new Error('must never happen');
              },
              (error) => {
                expect(error).to.match(/timeout/);
              }
            );
        });
      });

      describe('pingback', () => {
        it('should send POST pingback', () => {
          contextMock
            .expects('buildUrl')
            .withExactArgs(
              'https://acme.com/p?rid=READER_ID',
              /* useAuthData */ true
            )
            .returns(Promise.resolve('https://acme.com/p?rid=reader1'))
            .once();
          xhrMock
            .expects('sendSignal')
            .withExactArgs(
              'https://acme.com/p?rid=reader1',
              env.sandbox.match((init) => {
                return (
                  init.method == 'POST' &&
                  init.credentials == 'include' &&
                  init.body == '' &&
                  init.headers['Content-Type'] ==
                    'application/x-www-form-urlencoded'
                );
              })
            )
            .returns(Promise.resolve())
            .once();
          return adapter.pingback();
        });

        it('should fail when POST fails', () => {
          contextMock
            .expects('buildUrl')
            .withExactArgs(
              'https://acme.com/p?rid=READER_ID',
              /* useAuthData */ true
            )
            .returns(Promise.resolve('https://acme.com/p?rid=reader1'))
            .once();
          xhrMock
            .expects('sendSignal')
            .withExactArgs(
              'https://acme.com/p?rid=reader1',
              env.sandbox.match((init) => {
                return (
                  init.method == 'POST' &&
                  init.credentials == 'include' &&
                  init.body == '' &&
                  init.headers['Content-Type'] ==
                    'application/x-www-form-urlencoded'
                );
              })
            )
            .returns(Promise.reject('intentional'))
            .once();
          return adapter.pingback().then(
            () => {
              throw new Error('must never happen');
            },
            (error) => {
              expect(error).to.match(/intentional/);
            }
          );
        });
      });
    });
  }
);
