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

import * as sinon from 'sinon';
import {handleClick, warmupDynamic, warmupStatic} from '../../ads/alp/handler';
import {parseUrl} from '../../src/url';

describe('alp-handler', () => {

  let sandbox;
  let event;
  let anchor;
  let open;
  let win;
  let image;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    image = undefined;
    win = {
      location: {},
      open: () => null,
      Image() {
        image = this;
      },
      postMessage: sandbox.stub(),
      _id: 'base-win',
    };
    win.parent = {
      postMessage: sandbox.stub(),
      _id: 'p0',
    };
    win.parent.parent = {
      postMessage: sandbox.stub(),
      _id: 'p1',
    };
    win.parent.parent.parent = {
      postMessage: sandbox.stub(),
      _id: 'p2',
    };
    win.parent.parent.parent.parent = {
      postMessage: sandbox.stub(),
      _id: 'p3',
    };
    open = sandbox.stub(win, 'open').callsFake(() => {
      return {};
    });
    const doc = {
      defaultView: win,
      head: {
        appendChild: sandbox.spy(),
      },
    };
    win.document = doc;
    anchor = {
      nodeType: 1,
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
      trusted: true,
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
    expect(open).to.be.calledOnce;
    expect(open.lastCall.args).to.jsonEqual([
      'https://cdn.ampproject.org/c/www.example.com/amp.html#click=' +
          'https%3A%2F%2Ftest.com%3Famp%3D1%26adurl%3Dhttps%253A%252F%252F' +
          'cdn.ampproject.org%252Fc%252Fwww.example.com%252Famp.html',
      '_top',
      undefined,
    ]);
    expect(event.preventDefault).to.be.calledOnce;
  }

  function a2aSuccess(ampParent) {
    handleClick(event);
    expect(event.preventDefault).to.be.calledOnce;
    expect(ampParent.postMessage).to.be.calledOnce;
    expect(ampParent.postMessage.lastCall.args[0]).to.equal(
        'a2a;{"url":"https://cdn.ampproject.org/c/www.example.com/amp.html' +
        '#click=https%3A%2F%2Ftest.com%3Famp%3D1%26adurl%3Dhttps%253A%252F%' +
        '252Fcdn.ampproject.org%252Fc%252Fwww.example.com%252Famp.html"}');
    expect(ampParent.postMessage.lastCall.args[1]).to.equal(
        'https://cdn.ampproject.org');
    expect(open).to.have.not.been.called;
  }

  function noNavigation() {
    handleClick(event);
    expect(open).to.have.not.been.called;
    expect(event.preventDefault).to.have.not.been.called;
  }

  it('should navigate to correct destination', () => {
    simpleSuccess();
  });

  it('should navigate to correct destination (left mouse button)', () => {
    event.button = 1;
    simpleSuccess();
  });

  it('should perform a2a navigation if appropriate', () => {
    win.location.ancestorOrigins = [
      'https://cdn.ampproject.org',
      'https://www.google.com',
    ];
    a2aSuccess(win.parent);
  });

  it('should perform a2a navigation if appropriate (.de)', () => {
    win.location.ancestorOrigins = [
      'https://cdn.ampproject.org',
      'https://www.google.de',
    ];
    a2aSuccess(win.parent);
  });

  it('should perform a2a navigation if appropriate nested: 1', () => {
    win.location.ancestorOrigins = [
      'https://3p.ampproject.net',
      'https://cdn.ampproject.org',
      'https://www.google.de',
    ];
    a2aSuccess(win.parent.parent);
  });

  it('should perform a2a navigation if appropriate nested: 2', () => {
    win.location.ancestorOrigins = [
      'https://some-domain.com',
      'https://3p.ampproject.net',
      'https://cdn.ampproject.org',
      'https://www.google.de',
    ];
    a2aSuccess(win.parent.parent.parent);
  });

  it('should perform a2a navigation if appropriate nested: 3', () => {
    win.location.ancestorOrigins = [
      'https://some-domain.com',
      'https://some-domain.com',
      'https://3p.ampproject.net',
      'https://cdn.ampproject.org',
      'https://www.google.de',
    ];
    a2aSuccess(win.parent.parent.parent.parent);
  });

  it('should not perform a2a for other origins', () => {
    win.location.ancestorOrigins = [
      'https://cdn.ampproject.org',
      'https://www.other.com',
    ];
    simpleSuccess();
  });

  it('should not perform a2a for other origins (2)', () => {
    win.location.ancestorOrigins = [
      'https://cdn.ampproject2.org',
      'https://www.google.com',
    ];
    simpleSuccess();
  });

  it('should perform special navigation if specially asked for', () => {
    const navigateSpy = sandbox.spy();
    const opt_navigate = val => {
      navigateSpy();
      expect(val).to.equal(
          'https://cdn.ampproject.org/c/www.example.com/amp.html#click=' +
          'https%3A%2F%2Ftest.com%3Famp%3D1%26adurl%3Dhttps%253A%252F%252F' +
          'cdn.ampproject.org%252Fc%252Fwww.example.com%252Famp.html');
    };
    handleClick(event, opt_navigate);
    expect(event.preventDefault).to.be.calledOnce;
    expect(open).to.not.be.called;
    expect(navigateSpy).to.be.calledOnce;
  });

  it('should navigate if trusted is not set.', () => {
    delete event.trusted;
    simpleSuccess();
  });

  it('should fail with trusted being false', () => {
    event.isTrusted = false;
    noNavigation();
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
      undefined,
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
      undefined,
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
      nodeType: 1,
      parentElement: {
        nodeType: 1,
        parentElement: a,
      },
    };
    simpleSuccess();
  });

  it('should require an a tag', () => {
    event.target = {
      nodeType: 1,
    };
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
    expect(image).to.exist;
    expect(image.src).to.equal('https://cdn.ampproject.org/preconnect.gif');
    expect(win.document.head.appendChild).to.be.calledOnce;
    const link = win.document.head.appendChild.lastCall.args[0];
    expect(link.rel).to.equal('preload');
    expect(link.href).to.equal('https://cdn.ampproject.org/v0.js');
  });

  it('should warmup dynamically', () => {
    warmupDynamic(event);
    expect(win.document.head.appendChild).to.be.callCount(2);
    const link0 = win.document.head.appendChild.firstCall.args[0];
    expect(link0.rel).to.equal('preload');
    expect(link0.href).to.equal(
        'https://cdn.ampproject.org/c/www.example.com/amp.html');
    const link1 = win.document.head.appendChild.secondCall.args[0];
    expect(link1.rel).to.equal('preload');
    expect(link1.as).to.equal('fetch');
    expect(link1.href).to.equal(
        'https://cdn.ampproject.org/c/www.example.com/amp.html');
  });

  it('should ignore irrelevant events for warmup (bad target)', () => {
    event.target = {
      nodeType: 1,
    };
    warmupDynamic(event);
    expect(win.document.head.appendChild).to.have.not.been.called;
  });

  it('should ignore irrelevant events for warmup (bad href)', () => {
    anchor.href = 'https://www.example.com';
    warmupDynamic(event);
    expect(win.document.head.appendChild).to.have.not.been.called;
  });
});
