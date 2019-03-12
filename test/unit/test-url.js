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
  addMissingParamsToUrl,
  addParamToUrl,
  addParamsToUrl,
  assertAbsoluteHttpOrHttpsUrl,
  assertHttpsUrl,
  getCorsUrl,
  getProxyServingType,
  getSourceOrigin,
  getSourceUrl,
  getWinOrigin,
  isLocalhostOrigin,
  isProtocolValid,
  isSecureUrlDeprecated,
  parseQueryString,
  removeAmpJsParamsFromUrl,
  removeFragment,
  removeParamsFromSearch,
  removeSearch,
  resolveRelativeUrl,
  resolveRelativeUrlFallback_,
  serializeQueryString,
} from '../../src/url';
import {parseUrlDeprecated} from '../../src/url-utils';

describe('getWinOrigin', () => {

  it('should return origin if available', () => {
    expect(getWinOrigin({
      'origin': 'https://foo.com',
      'location': {
        'href': 'https://foo1.com/abc?123#foo',
      },
    })).to.equal('https://foo.com');
  });


  it('should return origin from href when win.origin is not available', () => {
    expect(getWinOrigin({
      'location': {
        'href': 'https://foo1.com/abc?123#foo',
      },
    })).to.equal('https://foo1.com');
  });


  it('should return origin from href when win.origin is empty', () => {
    expect(getWinOrigin({
      'origin': '',
      'location': {
        'href': 'https://foo1.com/abc?123#foo',
      },
    })).to.equal('https://foo1.com');
  });

  it('should return origin from href when win.origin is null', () => {
    expect(getWinOrigin({
      'origin': null,
      'location': {
        'href': 'https://foo1.com/abc?123#foo',
      },
    })).to.equal('https://foo1.com');
  });

  it('should return \"null\" when win.origin is \"null\"', () => {
    expect(getWinOrigin({
      'origin': 'null',
      'location': {
        'href': 'https://foo1.com/abc?123#foo',
      },
    })).to.equal('null');
  });
});

describe('parseQueryString', () => {
  it('should return empty params when query string is empty or null', () => {
    expect(parseQueryString(null)).to.deep.equal({});
    expect(parseQueryString('')).to.deep.equal({});
  });
  it('should parse single key-value', () => {
    expect(parseQueryString('a=1')).to.deep.equal({
      'a': '1',
    });
  });
  it('should parse two key-values', () => {
    expect(parseQueryString('a=1&b=2')).to.deep.equal({
      'a': '1',
      'b': '2',
    });
  });
  it('should ignore leading ?', () => {
    expect(parseQueryString('?a=1&b=2')).to.deep.equal({
      'a': '1',
      'b': '2',
    });
  });
  it('should ignore leading #', () => {
    expect(parseQueryString('#a=1&b=2')).to.deep.equal({
      'a': '1',
      'b': '2',
    });
  });
  it('should parse empty value', () => {
    expect(parseQueryString('a=&b=2')).to.deep.equal({
      'a': '',
      'b': '2',
    });
    expect(parseQueryString('a&b=2')).to.deep.equal({
      'a': '',
      'b': '2',
    });
  });
  it('should decode names and values', () => {
    expect(parseQueryString('a%26=1%26&b=2')).to.deep.equal({
      'a&': '1&',
      'b': '2',
    });
  });
  it('should return last dupe', () => {
    expect(parseQueryString('a=1&b=2&a=3')).to.deep.equal({
      'a': '3',
      'b': '2',
    });
  });
});


describe('serializeQueryString', () => {
  it('should return empty string for empty params', () => {
    expect(serializeQueryString({})).to.equal('');
    expect(serializeQueryString({
      nullValue: null,
      undefValue: undefined,
    })).to.equal('');
  });
  it('should serialize a single value', () => {
    expect(serializeQueryString({a: 'A'})).to.equal('a=A');
  });
  it('should serialize multiple values', () => {
    expect(serializeQueryString({a: 'A', b: 'B'})).to.equal('a=A&b=B');
  });
  it('should coerce to string', () => {
    expect(serializeQueryString({a: 1, b: true})).to.equal('a=1&b=true');
  });
  it('should encode values and keys', () => {
    expect(serializeQueryString({'a+b': 'A+B'})).to.equal('a%2Bb=A%2BB');
  });
  it('should serialize multiple valued parameters', () => {
    expect(serializeQueryString({a: [1,2,3], b: true})).to.equal(
        'a=1&a=2&a=3&b=true');
  });
});


describe('assertHttpsUrl/isSecureUrl', () => {
  const referenceElement = document.createElement('div');
  it('should NOT allow null or undefined, but allow empty string', () => {
    allowConsoleError(() => {
      expect(() => {
        assertHttpsUrl(null, referenceElement);
      }).to.throw(/source must be available/);
      expect(() => {
        assertHttpsUrl(undefined, referenceElement);
      }).to.throw(/source must be available/);
    });
    assertHttpsUrl('', referenceElement);
  });
  it('should allow https', () => {
    assertHttpsUrl('https://twitter.com', referenceElement);
    expect(isSecureUrlDeprecated('https://twitter.com')).to.be.true;
  });
  it('should allow protocol relative', () => {
    assertHttpsUrl('//twitter.com', referenceElement);
    // `isSecureUrl` always resolves relative URLs.
    expect(isSecureUrlDeprecated('//twitter.com'))
        .to.be.equal(window.location.protocol == 'https:');
  });
  it('should allow localhost with http', () => {
    assertHttpsUrl('http://localhost:8000/sfasd', referenceElement);
    expect(isSecureUrlDeprecated('http://localhost:8000/sfasd')).to.be.true;
  });
  it('should allow localhost with http suffix', () => {
    assertHttpsUrl('http://iframe.localhost:8000/sfasd', referenceElement);
    expect(isSecureUrlDeprecated('http://iframe.localhost:8000/sfasd')).to.be.true;
  });

  it('should fail on http', () => {
    allowConsoleError(() => { expect(() => {
      assertHttpsUrl('http://twitter.com', referenceElement);
    }).to.throw(/source must start with/); });
    expect(isSecureUrlDeprecated('http://twitter.com')).to.be.false;
  });
  it('should fail on http with localhost in the name', () => {
    allowConsoleError(() => { expect(() => {
      assertHttpsUrl('http://foolocalhost', referenceElement);
    }).to.throw(/source must start with/); });
    expect(isSecureUrlDeprecated('http://foolocalhost')).to.be.false;
  });
});

describe('assertAbsoluteHttpOrHttpsUrl', () => {
  it('should allow http', () => {
    expect(assertAbsoluteHttpOrHttpsUrl('http://twitter.com/'))
        .to.equal('http://twitter.com/');
    expect(assertAbsoluteHttpOrHttpsUrl('HTTP://twitter.com/'))
        .to.equal('http://twitter.com/');
  });
  it('should allow https', () => {
    expect(assertAbsoluteHttpOrHttpsUrl('https://twitter.com/'))
        .to.equal('https://twitter.com/');
    expect(assertAbsoluteHttpOrHttpsUrl('HTTPS://twitter.com/'))
        .to.equal('https://twitter.com/');
  });
  it('should fail on relative protocol', () => {
    allowConsoleError(() => { expect(() => {
      assertAbsoluteHttpOrHttpsUrl('//twitter.com/');
    }).to.throw(/URL must start with/); });
  });
  it('should fail on relative url', () => {
    allowConsoleError(() => { expect(() => {
      assertAbsoluteHttpOrHttpsUrl('/path');
    }).to.throw(/URL must start with/); });
  });
  it('should fail on not allowed protocol', () => {
    allowConsoleError(() => { expect(() => {
      assertAbsoluteHttpOrHttpsUrl(
          /*eslint no-script-url: 0*/ 'javascript:alert');
    }).to.throw(/URL must start with/); });
  });
});

describe('removeFragment', () => {
  it('should remove fragment', () => {
    expect(removeFragment('https://twitter.com/path#abc')).to.equal(
        'https://twitter.com/path');
  });
  it('should remove empty fragment', () => {
    expect(removeFragment('https://twitter.com/path#')).to.equal(
        'https://twitter.com/path');
  });
  it('should ignore when no fragment', () => {
    expect(removeFragment('https://twitter.com/path')).to.equal(
        'https://twitter.com/path');
  });
});

describe('removeSearch', () => {
  it('should remove search', () => {
    expect(removeSearch('https://twitter.com/path?abc')).to.equal(
        'https://twitter.com/path');
  });
  it('should remove search with value', () => {
    expect(removeSearch('https://twitter.com/path?abc=123')).to.equal(
        'https://twitter.com/path');
  });
  it('should remove multiple params', () => {
    expect(removeSearch('https://twitter.com/path?abc=123&d&e=4')).to.equal(
        'https://twitter.com/path');
  });
  it('should remove empty search', () => {
    expect(removeSearch('https://twitter.com/path?')).to.equal(
        'https://twitter.com/path');
  });
  it('should ignore when no search', () => {
    expect(removeSearch('https://twitter.com/path')).to.equal(
        'https://twitter.com/path');
  });
  it('should preserve fragment', () => {
    expect(removeSearch('https://twitter.com/path?abc#f')).to.equal(
        'https://twitter.com/path#f');
  });
  it('should preserve fragment with multiple params', () => {
    expect(removeSearch('https://twitter.com/path?a&d=1&e=5#f=x')).to.equal(
        'https://twitter.com/path#f=x');
  });
  it('should preserve fragment when no search', () => {
    expect(removeSearch('https://twitter.com/path#f')).to.equal(
        'https://twitter.com/path#f');
  });
  it('should handle empty fragment', () => {
    expect(removeSearch('https://twitter.com/path#')).to.equal(
        'https://twitter.com/path#');
    expect(removeSearch('https://twitter.com/path?#')).to.equal(
        'https://twitter.com/path#');
  });
});

describe('addParamToUrl', () => {
  let url;

  beforeEach(() => {
    url = 'https://www.ampproject.org/get/here#hash-value';
  });

  it('should preserve hash value', () => {
    url = addParamToUrl(url, 'elementId', 'n1');
    expect(url).to.equal('https://www.ampproject.org/get/here?elementId=n1#hash-value');

    url = addParamToUrl(url, 'ampUserId', '12345');
    expect(url).to.equal('https://www.ampproject.org/get/here?elementId=n1&ampUserId=12345#hash-value');
  });

  it('should preserve query values', () => {
    url = 'https://www.ampproject.org/get/here?hello=world&foo=bar';

    url = addParamToUrl(url, 'elementId', 'n1');
    expect(url).to.equal('https://www.ampproject.org/get/here?hello=world&foo=bar&elementId=n1');
    url = addParamToUrl(url, 'ampUserId', '12345');
    expect(url).to.equal('https://www.ampproject.org/get/here?hello=world&foo=bar&elementId=n1&ampUserId=12345');
  });

  it('should optionally add params to the front', () => {
    let url = addParamToUrl('https://www.ampproject.org/get/here?hello=world&foo=bar',
        'elementId', 'n1', /* addToFront */ true);
    expect(url).to.equal('https://www.ampproject.org/get/here?elementId=n1&hello=world&foo=bar');

    url = addParamToUrl('https://www.ampproject.org/get/here',
        'elementId', 'n1', /* addToFront */ true);
    expect(url).to.equal('https://www.ampproject.org/get/here?elementId=n1');
  });

  it('should encode uri values', () => {
    url = addParamToUrl(url, 'foo', 'b ar');
    expect(url).to.equal('https://www.ampproject.org/get/here?foo=b%20ar#hash-value');
  });

  it('should keep host and path intact', () => {
    url = addParamToUrl('https://${host}/${path}', 'foo', 'bar');
    expect(url).to.equal('https://${host}/${path}?foo=bar');
  });
});

describe('addParamsToUrl', () => {
  let url;
  const params = {
    hello: 'world',
    foo: 'bar',
  };

  beforeEach(() => {
    url = 'https://www.ampproject.org/get/here#hash-value';
  });

  it('should loop over the keys and values correctly', () => {
    url = addParamsToUrl(url, params);

    expect(url).to.equal('https://www.ampproject.org/get/here?hello=world&foo=bar#hash-value');

    expect(addParamsToUrl('http://example.com', {
      firstname: 'Cool',
      lastname: 'Beans',
      interests: ['Basketball', 'Food', 'Running'],
    })).to.equal('http://example.com?firstname=Cool&lastname=Beans&' +
        'interests=Basketball&interests=Food&interests=Running');
  });

  it('should keep host and path intact', () => {
    url = addParamsToUrl('https://${host}/${path}#hash-value', params);

    expect(url).to.equal('https://${host}/${path}?hello=world&foo=bar#hash-value');
  });
});

describe('addMissingParamsToUrl', () => {
  let url;
  const params = {
    hello: 'world',
    foo: 'bar',
    replace: 'error',
    safe: 'error',
  };
  beforeEach(() => {
    url = 'https://www.ampproject.org/get/here?replace=1&safe#hash-value';
  });

  it('should not replace existing params', () => {
    expect(addMissingParamsToUrl(url, params)).to.equal(
        'https://www.ampproject.org/get/here?replace=1&safe&hello=world&foo=bar#hash-value');
  });
});

describe('isLocalhostOrigin', () => {
  function testLocalhostOrigin(href, bool) {
    it('should return that ' + href + (bool ? ' is' : ' is not') +
      ' a localhost origin', () => {
      expect(isLocalhostOrigin(parseUrlDeprecated(href))).to.equal(bool);
    });
  }

  testLocalhostOrigin(
      'http://localhost', true);
  testLocalhostOrigin(
      'https://localhost', true);
  testLocalhostOrigin(
      'http://localhost:123/foo.html', true);
  testLocalhostOrigin(
      'https://localhost:123/foo.html', true);
  testLocalhostOrigin(
      'http://localhost.example.com/foo.html', false);
  testLocalhostOrigin(
      'http://www.example.com/foo.html', false);
});

describe('isProtocolValid', () => {
  function testProtocolValid(href, bool) {
    it('should return that ' + href + (bool ? ' is' : ' is not') +
      ' a valid protocol', () => {
      expect(isProtocolValid(href)).to.equal(bool);
    });
  }

  testProtocolValid('http://foo.com', true);
  testProtocolValid('https://foo.com', true);
  testProtocolValid('bar://foo.com', true);
  testProtocolValid('', true);
  testProtocolValid('foo', true);
  testProtocolValid('./foo', true);
  testProtocolValid('/foo', true);
  testProtocolValid('//foo.com', true);
  testProtocolValid(undefined, true);
  testProtocolValid(null, true);
  testProtocolValid('javascript:alert("hello world!");', false);
  testProtocolValid('data:12345', false);
  testProtocolValid('vbscript:foo', false);
});

describe('getSourceOrigin/Url', () => {

  function testOrigin(href, sourceHref) {
    it('should return the source origin/url from ' + href, () => {
      expect(getSourceUrl(href)).to.equal(sourceHref);
      expect(getSourceOrigin(href)).to.equal(
          parseUrlDeprecated(sourceHref).origin);
    });
  }

  // CDN.
  testOrigin(
      'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0#h',
      'http://www.origin.com/foo/?f=0#h');
  testOrigin(
      'https://cdn.ampproject.org/v/s/www.origin.com/foo/?f=0#h',
      'https://www.origin.com/foo/?f=0#h');
  testOrigin(
      'https://cdn.ampproject.org/c/www.origin.com/foo/?f=0',
      'http://www.origin.com/foo/?f=0');
  testOrigin(
      'https://cdn.ampproject.org/c/s/www.origin.com/foo/?f=0',
      'https://www.origin.com/foo/?f=0');
  testOrigin(
      'https://cdn.ampproject.org/c/s/origin.com/foo/?f=0',
      'https://origin.com/foo/?f=0');
  testOrigin(
      'https://cdn.ampproject.org/c/s/origin.com%3A81/foo/?f=0',
      'https://origin.com:81/foo/?f=0');
  testOrigin(
      'https://cdn.ampproject.org/a/www.origin.com/foo/?f=0#h',
      'http://www.origin.com/foo/?f=0#h');
  testOrigin(
      'https://cdn.ampproject.org/ad/www.origin.com/foo/?f=0#h',
      'http://www.origin.com/foo/?f=0#h');
  testOrigin(
      'https://cdn.ampproject.org/action/www.origin.com/foo/?f=0#h',
      'http://www.origin.com/foo/?f=0#h');
  testOrigin(
      'https://cdn.ampproject.org/action/s/www.origin.com/foo/?f=0#h',
      'https://www.origin.com/foo/?f=0#h');


  // Prefixed CDN
  testOrigin(
      'https://xyz.cdn.ampproject.org/v/www.origin.com/foo/?f=0#h',
      'http://www.origin.com/foo/?f=0#h');
  testOrigin(
      'https://xyz.cdn.ampproject.org/v/s/www.origin.com/foo/?f=0#h',
      'https://www.origin.com/foo/?f=0#h');
  testOrigin(
      'https://xyz.cdn.ampproject.org/c/www.origin.com/foo/?f=0',
      'http://www.origin.com/foo/?f=0');
  testOrigin(
      'https://xyz.cdn.ampproject.org/c/s/www.origin.com/foo/?f=0',
      'https://www.origin.com/foo/?f=0');
  testOrigin(
      'https://xyz.cdn.ampproject.org/c/s/origin.com/foo/?f=0',
      'https://origin.com/foo/?f=0');
  testOrigin(
      'https://xyz.cdn.ampproject.org/c/s/origin.com%3A81/foo/?f=0',
      'https://origin.com:81/foo/?f=0');

  // Removes amp-related paramters.
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?amp_js_param=5',
      'http://o.com/foo/');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?f=0&amp_js_v=5#something',
      'http://o.com/foo/?f=0#something');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?amp_js_v=5&f=0#bar',
      'http://o.com/foo/?f=0#bar');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?f=0&amp_js_param=5&d=5#baz',
      'http://o.com/foo/?f=0&d=5#baz');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?f_amp_js_param=5&d=5',
      'http://o.com/foo/?f_amp_js_param=5&d=5');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?amp_js_param=5?d=5',
      'http://o.com/foo/'); // Treats amp_js_param=5?d=5 as one param.
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/&amp_js_param=5&d=5',
      'http://o.com/foo/&amp_js_param=5&d=5'); // Treats &... as part of path.
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?amp_r=test%3Dhello%20world',
      'http://o.com/foo/');

  // Removes google experimental queryString parameters.
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?usqp=mq331AQCCAE',
      'http://o.com/foo/');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?usqp=mq331AQCCAE&amp_js_param=5',
      'http://o.com/foo/');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?amp_js_param=5&usqp=mq331AQCCAE',
      'http://o.com/foo/');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?usqp=mq331AQCCAE&bar=1&amp_js_param=5',
      'http://o.com/foo/?bar=1');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?f=0&usqp=mq331AQCCAE#something',
      'http://o.com/foo/?f=0#something');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?usqp=mq331AQCCAE&f=0#bar',
      'http://o.com/foo/?f=0#bar');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?f=0&usqp=mq331AQCCAE&d=5#baz',
      'http://o.com/foo/?f=0&d=5#baz');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?f_usqp=mq331AQCCAE&d=5',
      'http://o.com/foo/?f_usqp=mq331AQCCAE&d=5');
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/?usqp=mq331AQCCAE?d=5',
      'http://o.com/foo/'); // Treats amp_js_param=5?d=5 as one param.
  testOrigin(
      'https://cdn.ampproject.org/c/o.com/foo/&usqp=mq331AQCCAE&d=5',
      'http://o.com/foo/&usqp=mq331AQCCAE&d=5'); // Treats &... as part of path.

  // Non-CDN.
  testOrigin(
      'https://origin.com/foo/?f=0',
      'https://origin.com/foo/?f=0');

  it('should fail on invalid source origin', () => {
    allowConsoleError(() => { expect(() => {
      getSourceOrigin(parseUrlDeprecated('https://cdn.ampproject.org/v/yyy/'));
    }).to.throw(/Expected a \. in origin http:\/\/yyy/); });
  });
});

describe('resolveRelativeUrl', () => {

  function testRelUrl(href, baseHref, resolvedHref) {
    it('should return the resolved rel url from ' + href +
          ' with base ' + baseHref, () => {
      expect(resolveRelativeUrl(href, baseHref))
          .to.equal(resolvedHref, 'native or fallback');
      expect(resolveRelativeUrlFallback_(href, baseHref))
          .to.equal(resolvedHref, 'fallback');
    });
  }

  // Absolute URL.
  testRelUrl(
      'https://acme.org/path/file?f=0#h',
      'https://base.org/bpath/bfile?bf=0#bh',
      'https://acme.org/path/file?f=0#h');
  testRelUrl(
      'data:12345',
      'https://base.org/bpath/bfile?bf=0#bh',
      'data:12345');

  // Protocol-relative URL.
  testRelUrl(
      '//acme.org/path/file?f=0#h',
      'https://base.org/bpath/bfile?bf=0#bh',
      'https://acme.org/path/file?f=0#h');
  testRelUrl(
      '//acme.org/path/file?f=0#h',
      'http://base.org/bpath/bfile?bf=0#bh',
      'http://acme.org/path/file?f=0#h');

  // TODO(camelburrito, #11827): This resolves to file:// on Sauce Labs.
  // testRelUrl(
  //     '\\\\acme.org/path/file?f=0#h',
  //     'http://base.org/bpath/bfile?bf=0#bh',
  //     'http://acme.org/path/file?f=0#h');

  // Absolute path.
  testRelUrl(
      '/path/file?f=0#h',
      'https://base.org/bpath/bfile?bf=0#bh',
      'https://base.org/path/file?f=0#h');
  testRelUrl(
      '/path/file?f=0#h',
      'http://base.org/bpath/bfile?bf=0#bh',
      'http://base.org/path/file?f=0#h');
  testRelUrl(
      '\\path/file?f=0#h',
      'http://base.org/bpath/bfile?bf=0#bh',
      'http://base.org/path/file?f=0#h');

  // Relative path.
  testRelUrl(
      'file?f=0#h',
      'https://base.org/bpath/bfile?bf=0#bh',
      'https://base.org/bpath/file?f=0#h');
  testRelUrl(
      'file?f=0#h',
      'http://base.org/bpath/bfile?bf=0#bh',
      'http://base.org/bpath/file?f=0#h');

  testRelUrl(
      'file?f=0#h',
      'https://base.org/bfile?bf=0#bh',
      'https://base.org/file?f=0#h');
  testRelUrl(
      'file?f=0#h',
      'http://base.org/bfile?bf=0#bh',
      'http://base.org/file?f=0#h');

  // Accepts parsed URLs.
  testRelUrl(
      'file?f=0#h',
      parseUrlDeprecated('http://base.org/bfile?bf=0#bh'),
      'http://base.org/file?f=0#h');
});


describe('getCorsUrl', () => {
  it('should error if __amp_source_origin is set', () => {
    allowConsoleError(() => { expect(() => getCorsUrl(window, 'http://example.com/?__amp_source_origin')).to.throw(/Source origin is not allowed in/); });
    expect(() => getCorsUrl(window, 'http://example.com/?name=hello'))
        .to.not.throw;
  });

  it('should set __amp_source_origin as a url param', () => {
    expect(getCorsUrl(window, 'http://example.com/?name=hello'))
        .to.equal('http://example.com/?name=hello&' +
            '__amp_source_origin=http%3A%2F%2Flocalhost%3A9876');
  });
});


describe('removeAmpJsParamsFromUrl', () => {
  it('should handle unaffected URLs', () => {
    expect(removeAmpJsParamsFromUrl('http://example.com'))
        .to.equal('http://example.com/');
    expect(removeAmpJsParamsFromUrl('http://example.com?x=123'))
        .to.equal('http://example.com/?x=123');
    expect(removeAmpJsParamsFromUrl('http://example.com#x=123'))
        .to.equal('http://example.com/#x=123');
    expect(removeAmpJsParamsFromUrl('http://example.com?y=abc#x=123'))
        .to.equal('http://example.com/?y=abc#x=123');
  });

  it('should remove all internal params', () => {
    expect(removeAmpJsParamsFromUrl('http://example.com?amp_js=1&amp_gsa=2&amp_r=3&amp_kit=4&usqp=4'))
        .to.equal('http://example.com/');
    expect(removeAmpJsParamsFromUrl('http://example.com?amp_js&amp_gsa&amp_r&amp_kit&usqp'))
        .to.equal('http://example.com/');
  });

  it('should remove all internal params, leaving others intact', () => {
    expect(removeAmpJsParamsFromUrl('http://example.com?a=a&amp_js=1&b=b&amp_gsa=2&c=c&amp_r=3&amp_kit=4&d=d&usqp=4&e=e'))
        .to.equal('http://example.com/?a=a&b=b&c=c&d=d&e=e');
  });

  it('should preserve the fragment', () => {
    expect(removeAmpJsParamsFromUrl('http://example.com?a=a&amp_js=1&b=b&amp_gsa=2&c=c&amp_r=3&amp_kit=4&d=d&usqp=4&e=e#frag=yes'))
        .to.equal('http://example.com/?a=a&b=b&c=c&d=d&e=e#frag=yes');
  });

  it('should preserve the path', () => {
    expect(
        removeAmpJsParamsFromUrl('http://example.com/toast?a=a&amp_js=1&b=b&amp_gsa=2&c=c&amp_r=3&amp_kit=4&d=d&usqp=4&e=e#frag=yes'))
        .to.equal('http://example.com/toast?a=a&b=b&c=c&d=d&e=e#frag=yes');
  });
});

describe('removeParamsFromSearch', () => {
  it('should remove the leading ? or &', () => {
    expect(removeParamsFromSearch('?a=1&', 'a')).to.equal('');
  });

  it('should remove the param from searchUrl', () => {
    expect(removeParamsFromSearch('?a=1&b=2&c', 'a')).to.equal('?b=2&c');
  });

  it('should remove all param with same name from searchUrl', () => {
    expect(removeParamsFromSearch('?a=1&b=2&a=2&a=3&c&ab=3', 'a')).to.equal(
        '?b=2&c&ab=3');
  });
});

describe('getProxyServingType', () => {
  it('should ignore non-proxy origins', () => {
    expect(getProxyServingType('http://www.example.com')).to.be.null;
    expect(getProxyServingType('http://cdn.ampproject.org/c/o.com/foo/')).to.be.null;
  });

  it('should correctly extract known types', () => {
    expect(getProxyServingType('https://cdn.ampproject.org/c/o.com/foo/')).to.equal('c');
    expect(getProxyServingType('https://cdn.ampproject.org/a/o.com/foo/')).to.equal('a');
    expect(getProxyServingType('https://cdn.ampproject.org/v/o.com/foo/')).to.equal('v');
  });

  it('should correctly extract unknown types', () => {
    expect(getProxyServingType('https://cdn.ampproject.org/test/o.com/foo/')).to.equal('test');
    expect(getProxyServingType('https://not.cdn.ampproject.org/test/o.com/foo/')).to.equal('test');
    expect(getProxyServingType('https://not.cdn.ampproject.org/test/blah.com/foo/')).to.equal('test');
  });
});
