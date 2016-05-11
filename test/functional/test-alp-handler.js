/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {handleClick, warmupDynamic, warmupStatic} from '../../ads/alp/handler';
import {parseUrl} from '../../src/url';
import * as sinon from 'sinon';

describe('alp-handler', () => {

  let sandbox;
  let event;
  let anchor;
  let open;
  let win;
  let image;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    open = sandbox.spy();
    image = undefined;
    win = {
      location: {},
      open: open,
      Image: function() {
        image = this;
      },
    };
    const doc = {
      defaultView: win,
      head: {
        appendChild: sandbox.spy(),
      },
    };
    win.document = doc;
    anchor = {
      tagName: 'A',
      href: 'https://test.com?adurl=' +
        encodeURIComponent(
            'https://cdn.ampproject.org/c/www.example.com/amp.html'),
      ownerDocument: doc,
      getAttribute: sandbox.stub(),
      get search() {
        return parseUrl(this.href).search;
      },
    };
    event = {
      buttons: 0,
      target: anchor,
      preventDefault: sandbox.spy(),
      defaultPrevented: false,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  function simpleSuccess() {
    handleClick(event);
    expect(open.callCount).to.equal(1);
    expect(open.lastCall.args).to.jsonEqual([
      'https://cdn.ampproject.org/c/www.example.com/amp.html#click=' +
          'https%3A%2F%2Ftest.com%3Famp%3D1%26adurl%3Dhttps%253A%252F%252F' +
          'cdn.ampproject.org%252Fc%252Fwww.example.com%252Famp.html',
      '_top',
    ]);
    expect(event.preventDefault.callCount).to.equal(1);
  }

  function noNavigation() {
    handleClick(event);
    expect(open.callCount).to.equal(0);
    expect(event.preventDefault.callCount).to.equal(0);
  }

  it('should navigate to correct destination', () => {
    simpleSuccess();
  });

  it('should navigate to correct destination (left mouse button)', () => {
    event.button = 1;
    simpleSuccess();
  });

  it('should support custom arg name', () => {
    anchor.getAttribute.withArgs('data-url-param-name').returns('TEST');
    anchor.href = 'https://test.com?TEST=' +
        encodeURIComponent(
            'https://cdn.ampproject.org/c/www.example.com/amp.html');
    handleClick(event);
    expect(open.lastCall.args).to.jsonEqual([
      'https://cdn.ampproject.org/c/www.example.com/amp.html#click=' +
          'https%3A%2F%2Ftest.com%3Famp%3D1%26TEST%3Dhttps%253A%252F%252F' +
          'cdn.ampproject.org%252Fc%252Fwww.example.com%252Famp.html',
      '_top',
    ]);
  });

  it('should support existing fragments', () => {
    anchor.href = 'https://test.com?adurl=' +
        encodeURIComponent(
            'https://cdn.ampproject.org/c/www.example.com/amp.html#test=1');
    handleClick(event);
    expect(open.lastCall.args).to.jsonEqual([
      'https://cdn.ampproject.org/c/www.example.com/amp.html#test=1&click=' +
          'https%3A%2F%2Ftest.com%3Famp%3D1%26adurl%3Dhttps%253A%252F%252F' +
          'cdn.ampproject.org%252Fc%252Fwww.example.com%252Famp.html' +
          '%2523test%253D1',
      '_top',
    ]);
  });

  it('should support other targets', () => {
    anchor.target = '_blank';
    handleClick(event);
    expect(open.lastCall.args[1]).to.equal('_blank');
  });

  it('should find the closest a tag', () => {
    const a = anchor;
    event.target = {
      parentElement: {
        parentElement: a,
      },
    };
    simpleSuccess();
  });

  it('should require an a tag', () => {
    event.target = {};
    noNavigation();
  });

  it('should ignore other mouse buttons', () => {
    event.buttons = 2;
    noNavigation();
  });

  it('should ignore special keys', () => {
    event.ctrlKey = true;
    noNavigation();
  });

  it('should only navigate to AMP', () => {
    anchor.href = 'https://test.com?adurl=' +
        encodeURIComponent(
            'https://notamp.com/c/www.example.com/amp.html');
    noNavigation();
  });

  it('should require a destination', () => {
    anchor.href = 'https://test.com?adurl=';
    noNavigation();
  });

  it('should warmup statically', () => {
    warmupStatic(win);
    expect(image).to.be.defined;
    expect(image.src).to.equal('https://cdn.ampproject.org/preconnect.gif');
    expect(win.document.head.appendChild.callCount).to.equal(1);
    const link = win.document.head.appendChild.lastCall.args[0];
    expect(link.rel).to.equal('preload');
    expect(link.href).to.equal(
        'https://cdn.ampproject.org/rtv/01$internalRuntimeVersion$/v0.js');
  });

  it('should warmup dynamically', () => {
    warmupDynamic(event);
    expect(win.document.head.appendChild.callCount).to.equal(1);
    const link = win.document.head.appendChild.lastCall.args[0];
    expect(link.rel).to.equal('preload');
    expect(link.href).to.equal(
        'https://cdn.ampproject.org/c/www.example.com/amp.html');
  });

  it('should ignore irrelevant events for warmup (bad target)', () => {
    event.target = {};
    warmupDynamic(event);
    expect(win.document.head.appendChild.callCount).to.equal(0);
  });

  it('should ignore irrelevant events for warmup (bad href)', () => {
    anchor.href = 'https://www.example.com';
    warmupDynamic(event);
    expect(win.document.head.appendChild.callCount).to.equal(0);
  });
});
