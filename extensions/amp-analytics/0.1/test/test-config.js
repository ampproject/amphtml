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

import {ANALYTICS_CONFIG} from '../vendors';
import {AnalyticsConfig, expandConfigRequest, mergeObjects} from '../config';
import {Services} from '../../../../src/services';
import {installDocService} from '../../../../src/service/ampdoc-impl';
import {map} from '../../../../src/utils/object';
import {stubService} from '../../../../testing/test-helper';

describes.realWin('AnalyticsConfig', {amp: false}, env => {
  let win;
  let doc;
  let sandbox;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    sandbox = env.sandbox;
  });

  afterEach(() => {
    delete ANALYTICS_CONFIG['-test-venfor'];
  });

  describe('merges requests correctly', () => {
    it('inline and vendor both string', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '/bar', 'bar': 'foobar'},
      };

      const element = getAnalyticsTag(
        {
          'requests': {'foo': 'https://example.com/${bar}'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {'type': '-test-venfor'}
      );

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(config['requests']).to.deep.equal({
          'foo': {
            baseUrl: 'https://example.com/${bar}',
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
      ANALYTICS_CONFIG['-test-venfor'] = {
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
              'baseUrl': 'https://example.com/${bar}',
              'batchInterval': 0,
            },
            'bar': 'bar-i',
          },
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {'type': '-test-venfor'}
      );

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(config['requests']).to.deep.equal({
          'foo': {
            'baseUrl': 'https://example.com/${bar}',
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
      ANALYTICS_CONFIG['-test-venfor'] = {
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
              'baseUrl': 'https://example.com/${bar}',
              'batchInterval': 0,
            },
            'bar': {
              'batchInterval': 3,
            },
          },
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {'type': '-test-venfor'}
      );

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(config['requests']).to.deep.equal({
          'foo': {
            'baseUrl': 'https://example.com/${bar}',
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
      const element = getAnalyticsTag(
        {
          'vars': {'title': 'local'},
          'requests': {'foo': 'https://example.com/${title}'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {
          'config': '//config-rv2',
        }
      );

      stubXhr().returns(
        Promise.resolve({
          json() {
            return Promise.resolve({
              requests: {
                foo: 'https://example.com/remote',
              },
            });
          },
        })
      );

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(config['requests']).to.deep.equal({
          'foo': {
            'baseUrl': 'https://example.com/remote',
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
    it('merges objects correctly', function() {
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
      ANALYTICS_CONFIG['-test-venfor'] = {
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
      const element = getAnalyticsTag({}, {'type': '-test-venfor'});
      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(config['optout']).to.be.true;
      });
    });

    it('fails for inline optout config', () => {
      const element = getAnalyticsTag({
        'requests': {'foo': 'https://example.com/bar'},
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
      ANALYTICS_CONFIG['-test-venfor'] = {
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
      const element = getAnalyticsTag({}, {'type': '-test-venfor'});
      return new AnalyticsConfig(element).loadConfig().then(config => {
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
        'element': {'foo': 'https://example.com/bar'},
        'triggers': [{'on': 'visible', 'iframePing': true}],
      });
      return expect(
        new AnalyticsConfig(element).loadConfig()
      ).to.be.rejectedWith(
        /iframePing config is only available to vendor config/
      );
    });

    it('succeeds for vendor iframe transport config', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
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
      const element = getAnalyticsTag({}, {'type': '-test-venfor'});
      return new AnalyticsConfig(element).loadConfig().then(config => {
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
      ANALYTICS_CONFIG['-test-venfor'] = {
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
          'requests': {'foo': 'https://example.com/bar'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          transport: {
            image: false,
            xhrpost: false,
            beacon: false,
            iframe: '//fake-url2',
          },
        },
        {'type': '-test-venfor'}
      );
      return new AnalyticsConfig(element).loadConfig();
    });
  });

  describe('remote config', () => {
    it('fetches and merges remote config', () => {
      expectAsyncConsoleError(
        /Remote configs are not allowed to specify transport iframe/
      );

      const element = getAnalyticsTag(
        {
          'vars': {'title': 'local'},
          'requests': {'foo': 'https://example.com/${title}'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {
          'config': '//config1',
        }
      );

      const xhrStub = stubXhr();
      xhrStub.returns(
        Promise.resolve({
          json: () => {
            return {
              vars: {'title': 'remote'},
              transport: {
                iframe: '//fake-url',
              },
            };
          },
        })
      );

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(xhrStub).to.be.calledWith('//config1', {
          requireAmpResponseSourceOrigin: false,
        });
        expect(config['vars']['title']).to.equal('remote');
        // iframe transport from remote config is ignored
        expect(config['transport']['iframe']).to.be.undefined;
      });
    });

    it('should not fetch remote config if sandboxed', () => {
      const element = getAnalyticsTag(
        {
          'vars': {'title': 'local'},
          'requests': {'foo': 'https://example.com/${title}'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {
          'config': '//config1',
          'sandbox': 'true',
        }
      );

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(config['vars']['title']).to.equal('local');
      });
    });

    it('fetches and merges remote config with credentials', () => {
      const element = getAnalyticsTag(
        {
          'vars': {'title': 'local'},
          'requests': {'foo': 'https://example.com/${title}'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {
          'config': '//config1',
          'data-credentials': 'include',
        }
      );

      const xhrStub = stubXhr();
      xhrStub.returns(
        Promise.resolve({
          json: () => {
            return {
              vars: {'title': 'remote'},
            };
          },
        })
      );
      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(xhrStub).to.be.calledWith('//config1', {
          credentials: 'include',
          requireAmpResponseSourceOrigin: false,
        });
        expect(config['vars']['title']).to.equal('remote');
      });
    });
  });

  describe('should re-write configuration if configured', () => {
    it('should fully rewrite a configuration', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '//vendor'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
        'configRewriter': {
          'url': '//rewriter',
        },
      };
      const element = getAnalyticsTag(
        {
          'requests': {'foo': '//inlined'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {'type': '-test-venfor'}
      );

      const xhrStub = stubXhr();
      xhrStub.callsFake(url => {
        const result = {
          'requests': {'foo': url},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        };
        return Promise.resolve({
          json: () => result,
        });
      });

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(xhrStub).to.be.calledWith('//rewriter', {
          body: {
            requests: {foo: '//inlined'},
            triggers: [{on: 'visible', request: 'foo'}],
          },
          method: 'POST',
          requireAmpResponseSourceOrigin: false,
        });

        expect(config['requests']['foo']).to.deep.equal({
          baseUrl: '//rewriter',
        });
      });
    });

    it('should resolve and send publisher enabled varGroups', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '//vendor'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
        'configRewriter': {
          'url': '//rewriter',
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
        {'type': '-test-venfor'}
      );

      const xhrStub = stubXhr();

      return new AnalyticsConfig(element).loadConfig().then(() => {
        expect(xhrStub).to.be.calledWith('//rewriter', {
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
          requireAmpResponseSourceOrigin: false,
        });
      });
    });

    it('should resolve and send vendor enabled varGroups', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '//vendor'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
        'configRewriter': {
          'url': '//rewriter',
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
        {'type': '-test-venfor'}
      );

      const xhrStub = stubXhr();

      return new AnalyticsConfig(element).loadConfig().then(() => {
        expect(xhrStub).to.be.calledWith('//rewriter', {
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
          requireAmpResponseSourceOrigin: false,
        });
      });
    });

    it('should not send configRewriter object if no vars are enabled', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '//vendor'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
        'configRewriter': {
          'url': '//rewriter',
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
        {'type': '-test-venfor'}
      );

      const xhrStub = stubXhr();

      return new AnalyticsConfig(element).loadConfig().then(() => {
        expect(xhrStub).to.be.calledWith('//rewriter', {
          body: {
            requests: {foo: '//inlined'},
            triggers: [{on: 'visible', request: 'foo'}],
          },
          method: 'POST',
          requireAmpResponseSourceOrigin: false,
        });
      });
    });

    it('should support amp-analytics-variables macros in varGroups', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '//vendor'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
        'configRewriter': {
          'url': '//rewriter',
          'varGroups': {
            'feature1': {
              'hasValue': '$NOT(foo)',
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
        {'type': '-test-venfor'}
      );

      const xhrStub = stubXhr();

      return new AnalyticsConfig(element).loadConfig().then(() => {
        expect(xhrStub).to.be.calledWith('//rewriter', {
          body: {
            requests: {foo: '//inlined'},
            triggers: [{on: 'visible', request: 'foo'}],
            configRewriter: {
              vars: {
                hasValue: 'false',
              },
            },
          },
          method: 'POST',
          requireAmpResponseSourceOrigin: false,
        });
      });
    });

    it('should merge rewritten configuration and use vendor', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '//vendor'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
        'configRewriter': {
          'url': '//rewriter',
        },
      };
      const element = getAnalyticsTag(
        {
          'requests': {'foo': '//inlined'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {'type': '-test-venfor', 'config': '//remote'}
      );

      const xhrStub = stubXhr();
      xhrStub.callsFake(url => {
        const result = {
          'requests': {'foo': url},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        };
        return Promise.resolve({
          json: () => result,
        });
      });

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(xhrStub).to.be.calledWith('//rewriter', {
          body: {
            requests: {foo: '//remote'},
            triggers: [{on: 'visible', request: 'foo'}],
          },
          method: 'POST',
          requireAmpResponseSourceOrigin: false,
        });

        expect(config['requests']['foo']).to.deep.equal({
          baseUrl: '//rewriter',
        });
      });
    });

    it('should ignore config rewriter if no url provided', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '//vendor'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
        'configRewriter': {},
      };
      const element = getAnalyticsTag(
        {
          'requests': {'foo': '//inlined'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
        },
        {'type': '-test-venfor'}
      );

      return new AnalyticsConfig(element).loadConfig().then(config => {
        expect(config['requests']['foo']).to.deep.equal({
          baseUrl: '//inlined',
        });
      });
    });

    it('should ignore inlined config rewriter', () => {
      ANALYTICS_CONFIG['-test-venfor'] = {
        'requests': {'foo': '//vendor'},
        'triggers': [{'on': 'visible', 'request': 'foo'}],
      };
      const element = getAnalyticsTag(
        {
          'requests': {'foo': '//inlined'},
          'triggers': [{'on': 'visible', 'request': 'foo'}],
          'configRewriter': {
            'url': '//rewriter',
          },
        },
        {'type': '-test-venfor'}
      );

      return new AnalyticsConfig(element).loadConfig().then(config => {
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

    const expandStringStub = sandbox.stub();
    expandStringStub.withArgs('CLIENT_ID(foo)').resolves('amp12345');
    expandStringStub.resolvesArg(0);

    const macros = {
      a: 'b',
    };
    expandStringStub.withArgs('$NOT(foo)', macros).resolves('false');
    stubService(sandbox, win, 'amp-analytics-variables', 'getMacros').returns(
      macros
    );

    sandbox.stub(Services, 'urlReplacementsForDoc').returns({
      'expandUrlAsync': url => Promise.resolve(url),
      'expandStringAsync': expandStringStub,
    });

    return stubService(sandbox, win, 'xhr', 'fetchJson');
  }
});
