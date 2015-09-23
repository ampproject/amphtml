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

import {addDataAndJsonAttributes_, getIframe} from '../../src/3p-frame';
import {loadPromise} from '../../src/event-helper';

describe('3p-frame', () => {
  it('add attributes', () => {
    var div = document.createElement('div');
    div.setAttribute('data-foo', 'foo');
    div.setAttribute('data-bar', 'bar');
    div.setAttribute('foo', 'nope');
    var obj = {};
    addDataAndJsonAttributes_(div, obj)
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar'
    });

    div.setAttribute('json', '{"abc": [1,2,3]}');

    obj = {};
    addDataAndJsonAttributes_(div, obj)
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar',
      'abc': [1, 2, 3]
    });
  });

  it('should create an iframe', () => {

    var link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', 'https://foo.bar/baz');
    document.head.appendChild(link);

    var div = document.createElement('div');
    div.setAttribute('data-test-attr', 'value');
    div.setAttribute('data-ping', 'pong');
    div.setAttribute('width', '50');
    div.setAttribute('height', '100');

    div.getLayoutBox = function() {
      return {
        width: 100,
        height: 200
      };
    };

    var iframe = getIframe(window, div, '_ping_');
    var src = iframe.src;
    var fragment =
        '#{"testAttr":"value","ping":"pong","width":50,"height":100,"initialWindowWidth' +
        '":100,"initialWindowHeight":200,"type":"_ping_","_context":' +
        '{"location":{"href":"https://foo.bar/baz"},"mode":{"localDev"' +
        ':true,"development":false,"minified":false}}}'
    expect(src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html' +
        fragment);

    // Switch to same origin for inner tests.
    iframe.src = '/base/dist.3p/current/frame.max.html' + fragment;

    document.body.appendChild(iframe);
    return loadPromise(iframe).then(() => {
      var win = iframe.contentWindow;
      expect(win.context.location.href).to.equal('https://foo.bar/baz');
      expect(win.context.data.testAttr).to.equal('value');
      var c = win.document.getElementById('c');
      expect(c).to.not.be.null;
      expect(c.textContent).to.contain('pong');
    });
  });
});
