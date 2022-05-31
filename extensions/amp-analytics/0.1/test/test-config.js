import {map} from '#core/types/object';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';

import {user} from '#utils/log';

import {stubService} from '#testing/helpers/service';

import {AnalyticsConfig, expandConfigRequest, mergeObjects} from '../config';

describes.realWin(
  'AnalyticsConfig',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-analytics'],
    },
  },
  (env) => {
    let win;
    let doc;
    const vendorName = 'test-vendor';
    let expandedUrl = null;
    let fakeVendorJson;
    let fakeRemoteJson;
    let fakeRewriterJson;
    let xhrStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      xhrStub = stubXhr();
      stubAnalyticsVariableService();
      xhrStub.callsFake((url) => {
        if (url.indexOf(`${vendorName}.json`) >= 0) {
          return Promise.resolve({
            json: () => fakeVendorJson,
          });
        }
        if (url.indexOf('/remote') >= 0) {
          expandedUrl = url;
          return Promise.resolve({
            json: () => fakeRemoteJson,
          });
        }
        if (url.indexOf('/rewriter') >= 0) {
          return Promise.resolve({
            json: () => fakeRewriterJson,
          });
        }
      });
    });

    describe('handles top level fields correctly', () => {
      it('propogates requestOrigin into each request object', () => {
        fakeVendorJson = {
          'requestOrigin': 'https://example.test',
          'requests': {'test1': '/test1', 'test2': '/test1/test2'},
        };

        const element = getAnalyticsTag({}, {'type': vendorName});

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']).to.deep.equal({
            'test1': {
              origin: 'https://example.test',
              baseUrl: '/test1',
            },
            'test2': {
              origin: 'https://example.test',
              baseUrl: '/test1/test2',
            },
          });
        });
      });

      it('does not overwrite existing origin in request object', () => {
        fakeVendorJson = {
          'requestOrigin': 'https://toplevel.com',
          'requests': {
            'test1': {
              origin: 'https://nested.com',
              baseUrl: '/test1',
            },
          },
        };

        const element = getAnalyticsTag({}, {'type': vendorName});

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']).to.deep.equal({
            'test1': {
              origin: 'https://nested.com',
              baseUrl: '/test1',
            },
          });
        });
      });

      it('handles empty string request origin', () => {
        fakeVendorJson = {
          'requestOrigin': '',
          'requests': {
            'test1': {
              baseUrl: '/test1',
            },
          },
        };

        const element = getAnalyticsTag({}, {'type': vendorName});

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']).to.deep.equal({
            'test1': {
              origin: '',
              baseUrl: '/test1',
            },
          });
        });
      });

      it('handles undefined request origin', () => {
        fakeVendorJson = {
          'requestOrigin': undefined,
          'requests': {
            'test1': {
              baseUrl: '/test1',
            },
          },
        };

        const element = getAnalyticsTag({}, {'type': vendorName});

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']).to.deep.equal({
            'test1': {
              origin: undefined,
              baseUrl: '/test1',
            },
          });
        });
      });
    });

    describe('merges requests correctly', () => {
      it('inline and vendor both string', () => {
        fakeVendorJson = {
          'requests': {'foo': '/bar', 'bar': 'foobar'},
        };

        const element = getAnalyticsTag(
          {
            'requests': {'foo': 'https://example.test/${bar}'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']).to.deep.equal({
            'foo': {
              baseUrl: 'https://example.test/${bar}',
            },
            'bar': {
              baseUrl: 'foobar',
            },
          });
          expect(config['triggers']).to.deep.equal([
            {
              'on': 'visible',
              'request': 'foo',
            },
          ]);
        });
      });

      it('inline and vendor string and object', () => {
        fakeVendorJson = {
          'requests': {
            'foo': 'foo',
            'bar': {
              'baseUrl': 'bar-v',
              'batchInterval': 2,
            },
          },
        };
        const element = getAnalyticsTag(
          {
            'requests': {
              'foo': {
                'baseUrl': 'https://example.test/${bar}',
                'batchInterval': 0,
              },
              'bar': 'bar-i',
            },
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']).to.deep.equal({
            'foo': {
              'baseUrl': 'https://example.test/${bar}',
              'batchInterval': 0,
            },
            'bar': {
              'baseUrl': 'bar-i',
              'batchInterval': 2,
            },
          });
          expect(config['triggers']).to.deep.equal([
            {
              'on': 'visible',
              'request': 'foo',
            },
          ]);
        });
      });

      it('inline and vendor both object', () => {
        fakeVendorJson = {
          'requests': {
            'foo': {
              'baseUrl': 'foo',
              'batchInterval': 5,
            },
            'bar': {
              'baseUrl': 'bar-v',
            },
          },
        };
        const element = getAnalyticsTag(
          {
            'requests': {
              'foo': {
                'baseUrl': 'https://example.test/${bar}',
                'batchInterval': 0,
              },
              'bar': {
                'batchInterval': 3,
              },
            },
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']).to.deep.equal({
            'foo': {
              'baseUrl': 'https://example.test/${bar}',
              'batchInterval': 0,
            },
            'bar': {
              'baseUrl': 'bar-v',
              'batchInterval': 3,
            },
          });
          expect(config['triggers']).to.deep.equal([
            {
              'on': 'visible',
              'request': 'foo',
            },
          ]);
        });
      });

      it('inline and remote both string', () => {
        fakeRemoteJson = {
          requests: {
            foo: 'https://example.test/remote',
          },
        };

        const element = getAnalyticsTag(
          {
            'vars': {'title': 'local'},
            'requests': {'foo': 'https://example.test/${title}'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'config': '/remote',
          }
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']).to.deep.equal({
            'foo': {
              'baseUrl': 'https://example.test/remote',
            },
          });
          expect(config['triggers']).to.deep.equal([
            {
              'on': 'visible',
              'request': 'foo',
            },
          ]);
        });
      });
    });

    describe('mergeObjects', () => {
      it('merges objects correctly', function () {
        expect(mergeObjects({}, {})).to.deep.equal({});
        expect(mergeObjects(map({'a': 0}), map({'b': 1}))).to.deep.equal(
          map({'a': 0, 'b': 1})
        );
        expect(mergeObjects({'foo': 1}, {'1': 1})).to.deep.equal({
          'foo': 1,
          '1': 1,
        });
        expect(mergeObjects({'1': 1}, {'bar': 'bar'})).to.deep.equal({
          '1': 1,
          'bar': 'bar',
        });
        expect(
          mergeObjects({'foo': [1, 2, 3, 4]}, {'bar': [4, 5, 6, 7]})
        ).to.deep.equal({'foo': [1, 2, 3, 4], 'bar': [4, 5, 6, 7]});
        expect(
          mergeObjects(null, {'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}})
        ).to.deep.equal({'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}});
        expect(
          mergeObjects(undefined, {
            'foo': 'bar',
            'baz': {'foobar': ['abc', 'def']},
          })
        ).to.deep.equal({'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}});
        expect(
          mergeObjects(
            {'baz': 'bar', 'foobar': {'foobar': ['abc', 'def']}},
            {'foo': 'bar', 'baz': {'foobar': ['abc', 'def']}}
          )
        ).to.deep.equal({
          'foo': 'bar',
          'baz': 'bar',
          'foobar': {'foobar': ['abc', 'def']},
        });
      });
    });

    describe('vendor only configs', () => {
      it('succeeds for vendor optout config', () => {
        fakeVendorJson = {
          'requests': {
            'pageview': '//fake-url',
          },
          'triggers': {
            'pageview': {
              'on': 'visible',
              'request': 'pageview',
            },
          },
          optout: true,
        };
        const element = getAnalyticsTag({}, {'type': vendorName});
        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['optout']).to.be.true;
        });
      });

      it('fails for inline optout config', () => {
        const element = getAnalyticsTag({
          'requests': {'foo': 'https://example.test/bar'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'optout': 'foo.bar',
        });
        return expect(
          new AnalyticsConfig(element).loadConfig()
        ).to.be.rejectedWith(
          /optout property is only available to vendor config/
        );
      });

      it('succeeds for vendor iframePing config', () => {
        fakeVendorJson = {
          'requests': {
            'pageview': '//fake-url',
          },
          'triggers': {
            'pageview': {
              'on': 'visible',
              'request': 'pageview',
              'iframePing': true,
            },
          },
        };
        const element = getAnalyticsTag({}, {'type': vendorName});
        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['triggers']).to.deep.equal({
            'pageview': {
              'on': 'visible',
              'request': 'pageview',
              'iframePing': true,
            },
          });
        });
      });

      it('fails for inlined iframePing config', () => {
        const element = getAnalyticsTag({
          'element': {'foo': 'https://example.test/bar'},
          'triggers': [{'on': 'visible', 'iframePing': true}],
        });
        return expect(
          new AnalyticsConfig(element).loadConfig()
        ).to.be.rejectedWith(
          /iframePing config is only available to vendor config/
        );
      });

      it('succeeds for vendor iframe transport config', () => {
        fakeVendorJson = {
          'requests': {
            'pageview': '//fake-url',
          },
          'triggers': {
            'pageview': {
              'on': 'visible',
              'request': 'pageview',
            },
          },
          transport: {
            image: false,
            xhrpost: false,
            beacon: false,
            iframe: '//fake-url',
          },
        };
        const element = getAnalyticsTag({}, {'type': vendorName});
        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['transport']).to.deep.equal({
            image: false,
            xhrpost: false,
            beacon: false,
            iframe: '//fake-url',
          });
        });
      });

      it('fails for inlined iframe transport config', () => {
        expectAsyncConsoleError(
          /Inline configs are not allowed to specify transport iframe/
        );
        expectAsyncConsoleError(
          '[AmpAnalytics <unknown id>] Inline or remote config ' +
            'should not overwrite vendor transport settings'
        );
        fakeVendorJson = {
          'requests': {
            'pageview': '//fake-url',
          },
          'triggers': {
            'pageview': {
              'on': 'visible',
              'request': 'pageview',
            },
          },
          transport: {
            image: false,
            xhrpost: false,
            beacon: false,
            iframe: '//fake-url',
          },
        };
        const element = getAnalyticsTag(
          {
            'requests': {'foo': 'https://example.test/bar'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
            transport: {
              image: false,
              xhrpost: false,
              beacon: false,
              iframe: '//fake-url2',
            },
          },
          {'type': vendorName}
        );
        return new AnalyticsConfig(element).loadConfig();
      });
    });

    describe('remote config', () => {
      it('expands the remote config url', () => {
        doc.title = 'test-title';
        fakeRemoteJson = {
          vars: {'title': 'remote'},
        };
        const element = getAnalyticsTag(
          {
            'vars': {'title': 'local'},
            'requests': {'foo': 'https://example.test/${title}'},
            'triggers': {'on': 'visible', 'request': 'foo'},
          },
          {
            'config': '/remote?var=TEST_VAR&title=TITLE',
          }
        );

        return new AnalyticsConfig(element).loadConfig().then(() => {
          expect(expandedUrl).to.equal('/remote?var=test-var&title=test-title');
        });
      });

      it('fetches and merges remote config', () => {
        expectAsyncConsoleError(
          /Remote configs are not allowed to specify transport iframe/
        );

        fakeRemoteJson = {
          vars: {'title': 'remote'},
          transport: {
            iframe: '//fake-url',
          },
        };

        const element = getAnalyticsTag(
          {
            'vars': {'title': 'local'},
            'requests': {'foo': 'https://example.test/${title}'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'config': '/remote',
          }
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['vars']['title']).to.equal('remote');
          // iframe transport from remote config is ignored
          expect(config['transport']['iframe']).to.be.undefined;
        });
      });

      it('should not fetch remote config if sandboxed', () => {
        fakeRemoteJson = {
          vars: {'title': 'remote'},
        };
        const element = getAnalyticsTag(
          {
            'vars': {'title': 'local'},
            'requests': {'foo': 'https://example.test/${title}'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'config': '/remote',
            'sandbox': 'true',
          }
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['vars']['title']).to.equal('local');
        });
      });

      it('fetches and merges remote config with credentials', () => {
        fakeRemoteJson = {
          vars: {'title': 'remote'},
        };

        const element = getAnalyticsTag(
          {
            'vars': {'title': 'local'},
            'requests': {'foo': 'https://example.test/${title}'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {
            'config': '/remote',
            'data-credentials': 'include',
          }
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(xhrStub).to.be.calledWith('/remote', {
            credentials: 'include',
          });
          expect(config['vars']['title']).to.equal('remote');
        });
      });
    });

    describe('should re-write configuration if configured', () => {
      beforeEach(() => {
        fakeRewriterJson = {
          'requests': {'foo': '/rewriter'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        };
      });
      it('should fully rewrite a configuration', () => {
        fakeVendorJson = {
          'requests': {'foo': '//vendor'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {
            'url': '/rewriter',
          },
        };
        fakeRewriterJson = {
          'requests': {'foo': '/rewriter'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        };
        const element = getAnalyticsTag(
          {
            'requests': {'foo': '//inlined'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']['foo']).to.deep.equal({
            baseUrl: '/rewriter',
          });
        });
      });

      it('should resolve and send publisher enabled varGroups', () => {
        stubUrlReplacementService();
        fakeVendorJson = {
          'requests': {'foo': '//vendor'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {
            'url': '/rewriter',
            'varGroups': {
              'feature1': {
                'key': 'cats',
                'cid': 'CLIENT_ID(foo)',
              },
              'feature2': {
                'bad': 'dontsendme',
              },
            },
          },
        };

        const element = getAnalyticsTag(
          {
            'requests': {'foo': '//inlined'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
            'configRewriter': {
              'varGroups': {
                'feature1': {'enabled': true},
              },
            },
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then(() => {
          expect(xhrStub).to.be.calledWith('/rewriter', {
            body: {
              requests: {foo: '//inlined'},
              triggers: [{on: 'visible', request: 'foo'}],
              configRewriter: {
                vars: {
                  cid: 'amp12345',
                  key: 'cats',
                },
              },
            },
            method: 'POST',
          });
        });
      });

      it('should resolve and send vendor enabled varGroups', () => {
        stubUrlReplacementService();
        fakeVendorJson = {
          'requests': {'foo': '//vendor'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {
            'url': '/rewriter',
            'varGroups': {
              'feature1': {
                'key': 'cats',
                'cid': 'CLIENT_ID(foo)',
                'enabled': true,
              },
            },
          },
        };
        const element = getAnalyticsTag(
          {
            'requests': {'foo': '//inlined'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then(() => {
          expect(xhrStub).to.be.calledWith('/rewriter', {
            body: {
              requests: {foo: '//inlined'},
              triggers: [{on: 'visible', request: 'foo'}],
              configRewriter: {
                vars: {
                  cid: 'amp12345',
                  key: 'cats',
                },
              },
            },
            method: 'POST',
          });
        });
      });

      it('should not send configRewriter object if no vars are enabled', () => {
        fakeVendorJson = {
          'requests': {'foo': '//vendor'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {
            'url': '/rewriter',
            'varGroups': {
              'feature1': {
                'key': 'cats',
                'cid': 'CLIENT_ID(foo)',
              },
            },
          },
        };
        const element = getAnalyticsTag(
          {
            'requests': {'foo': '//inlined'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then(() => {
          expect(xhrStub).to.be.calledWith('/rewriter', {
            body: {
              requests: {foo: '//inlined'},
              triggers: [{on: 'visible', request: 'foo'}],
            },
            method: 'POST',
          });
        });
      });

      it('should support amp-analytics-variables macros in varGroups', () => {
        fakeVendorJson = {
          'requests': {'foo': '//vendor'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {
            'url': '/rewriter',
            'varGroups': {
              'feature1': {
                'var': 'TEST_VAR',
                'enabled': true,
              },
            },
          },
        };
        const element = getAnalyticsTag(
          {
            'requests': {'foo': '//inlined'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then(() => {
          expect(xhrStub).to.be.calledWith('/rewriter', {
            body: {
              requests: {foo: '//inlined'},
              triggers: [{on: 'visible', request: 'foo'}],
              configRewriter: {
                vars: {
                  var: 'test-var',
                },
              },
            },
            method: 'POST',
          });
        });
      });

      it('should merge rewritten configuration and use vendor', () => {
        fakeVendorJson = {
          'requests': {'foo': '//vendor'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {
            'url': '/rewriter',
          },
        };
        fakeRemoteJson = {
          'requests': {'foo': '//remote'},
        };

        fakeRewriterJson = {
          'requests': {'foo': '//rewriter'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        };
        const element = getAnalyticsTag(
          {
            'requests': {'foo': '//inlined'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName, 'config': '//remote'}
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(xhrStub).to.be.calledWith('/rewriter', {
            body: {
              requests: {foo: '//remote'},
              triggers: [{on: 'visible', request: 'foo'}],
            },
            method: 'POST',
          });

          expect(config['requests']['foo']).to.deep.equal({
            baseUrl: '//rewriter',
          });
        });
      });

      it('should ignore config rewriter if no url provided', () => {
        fakeVendorJson = {
          'requests': {'foo': '//vendor'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {},
        };
        const element = getAnalyticsTag(
          {
            'requests': {'foo': '//inlined'},
            'triggers': [{'on': 'visible', 'request': 'foo'}],
          },
          {'type': vendorName}
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']['foo']).to.deep.equal({
            baseUrl: '//inlined',
          });
        });
      });

      it('should ignore inlined config rewriter', () => {
        fakeRewriterJson = {
          'requests': {'foo': '//rewriter'},
        };
        const element = getAnalyticsTag({
          'requests': {'foo': '//inlined'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {
            'url': '//rewriter',
          },
        });

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(config['requests']['foo']).to.deep.equal({
            baseUrl: '//inlined',
          });
        });
      });
    });

    describe('expandConfigRequest', () => {
      it('expandConfigRequest function', () => {
        let config = {
          'requests': {
            'foo': 'test',
            'bar': {
              'baseUrl': 'test1',
            },
            'foobar': {},
          },
        };
        config = expandConfigRequest(config);
        expect(config).to.jsonEqual({
          'requests': {
            'foo': {
              'baseUrl': 'test',
            },
            'bar': {
              'baseUrl': 'test1',
            },
            'foobar': {},
          },
        });
      });
    });

    describe('warning message', () => {
      it('shows the warning', () => {
        fakeVendorJson = {
          'requests': {'test1': '/test1', 'test2': '/test1/test2'},
          'warningMessage': 'I am a warning',
        };

        const element = getAnalyticsTag(
          {},
          {'type': vendorName, 'id': 'analyticsId'}
        );
        const usrObj = user();
        const spy = env.sandbox.spy(usrObj, 'warn');

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(spy).callCount(1);
          expect(spy).to.have.been.calledWith(
            'AmpAnalytics analyticsId',
            'Warning from analytics vendor%s%s: %s',
            ' test-vendor',
            '',
            'I am a warning'
          );
          expect(config['warningMessage']).to.be.undefined;
        });
      });

      it('handles incorrect inputs', () => {
        fakeVendorJson = {
          'requests': {'test1': '/test1', 'test2': '/test2'},
          'warningMessage': {
            'message': 'I am deprecated',
            'configVersion': '0.1',
          },
        };

        const element = getAnalyticsTag(
          {},
          {'type': vendorName, 'id': 'analyticsId'}
        );
        const usrObj = user();
        const spy = env.sandbox.spy(usrObj, 'warn');

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(spy).callCount(1);
          expect(spy).to.have.been.calledWith(
            'AmpAnalytics analyticsId',
            'Warning from analytics vendor%s%s: %s',
            ' test-vendor',
            '',
            '[object Object]'
          );
          expect(config['warningMessage']).to.be.undefined;
        });
      });

      it('handles remote config', () => {
        const element = getAnalyticsTag(
          {},
          {'config': 'www.vendorConfigLocation.com', 'id': 'analyticsId'}
        );

        const usrObj = user();
        const spy = env.sandbox.spy(usrObj, 'warn');
        xhrStub.returns(
          Promise.resolve({
            json: () => {
              return {
                'warningMessage':
                  'The config you are working with has been deprecated',
              };
            },
          })
        );

        return new AnalyticsConfig(element).loadConfig().then((config) => {
          expect(spy).callCount(1);
          expect(spy).to.have.been.calledWith(
            'AmpAnalytics analyticsId',
            'Warning from analytics vendor%s%s: %s',
            '',
            ' with remote config url www.vendorConfigLocation.com',
            'The config you are working with has been deprecated'
          );
          expect(config['warningMessage']).to.be.undefined;
        });
      });
    });

    function getAnalyticsTag(config, attrs) {
      config = JSON.stringify(config);
      const el = doc.createElement('amp-analytics');
      const script = doc.createElement('script');
      script.textContent = config;
      script.setAttribute('type', 'application/json');
      el.appendChild(script);
      for (const k in attrs) {
        el.setAttribute(k, attrs[k]);
      }
      doc.body.appendChild(el);
      return el;
    }

    function stubXhr() {
      installDocService(win, true);
      return stubService(env.sandbox, win, 'xhr', 'fetchJson');
    }

    function stubUrlReplacementService() {
      const expandStringStub = env.sandbox.stub();
      expandStringStub.withArgs('CLIENT_ID(foo)').resolves('amp12345');
      expandStringStub.resolvesArg(0);

      env.sandbox.stub(Services, 'urlReplacementsForDoc').returns({
        'expandUrlAsync': (url) => Promise.resolve(url),
        'expandStringAsync': expandStringStub,
      });
    }

    function stubAnalyticsVariableService() {
      const macros = {
        'TEST_VAR': 'test-var',
      };
      stubService(
        env.sandbox,
        win,
        'amp-analytics-variables',
        'getMacros'
      ).returns(macros);
    }
  }
);
