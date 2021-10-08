import * as dom from '#core/dom';
import {setScopeSelectorSupportedForTesting} from '#core/dom/css-selectors';
import {matches} from '#core/dom/query';
import {setShadowDomSupportedVersionForTesting} from '#core/dom/web-components';

import {loadPromise} from '#utils/event-helper';

describes.sandboxed('DOM helpers', {}, (env) => {
  afterEach(() => {
    setScopeSelectorSupportedForTesting(undefined);
    setShadowDomSupportedVersionForTesting(undefined);
  });

  it('should remove all children', () => {
    const element = document.createElement('div');
    element.appendChild(document.createElement('div'));
    element.appendChild(document.createTextNode('ABC'));
    expect(element.children.length).to.equal(1);
    expect(element.firstChild).to.not.equal(null);
    expect(element.textContent).to.equal('ABC');

    dom.removeChildren(element);
    expect(element.children.length).to.equal(0);
    expect(element.firstChild).to.equal(null);
    expect(element.textContent).to.equal('');
  });

  it('should copy all children', () => {
    const element = document.createElement('div');
    element.appendChild(document.createElement('div'));
    element.appendChild(document.createTextNode('ABC'));

    const other = document.createElement('div');
    dom.copyChildren(element, other);

    expect(element.children.length).to.equal(1);
    expect(element.firstChild).to.not.equal(null);
    expect(element.textContent).to.equal('ABC');

    expect(other.children.length).to.equal(1);
    expect(other.firstChild).to.not.equal(null);
    expect(other.firstChild.tagName).to.equal('DIV');
    expect(other.textContent).to.equal('ABC');
  });

  it('isConnectedNode', () => {
    expect(dom.isConnectedNode(document)).to.be.true;

    const a = document.createElement('div');
    expect(dom.isConnectedNode(a)).to.be.false;

    const b = document.createElement('div');
    b.appendChild(a);

    document.body.appendChild(b);
    expect(dom.isConnectedNode(a)).to.be.true;

    const shadow = a.attachShadow({mode: 'open'});
    const c = document.createElement('div');
    shadow.appendChild(c);
    expect(dom.isConnectedNode(c)).to.be.true;

    document.body.removeChild(b);
    expect(dom.isConnectedNode(c)).to.be.false;
  });

  it('isConnectedNode (no Node.p.isConnected)', () => {
    env.sandbox.deleteProperty(Node.prototype, 'isConnected');
    expect(dom.isConnectedNode(document)).to.be.true;

    const a = document.createElement('div');
    expect(dom.isConnectedNode(a)).to.be.false;

    const b = document.createElement('div');
    b.appendChild(a);

    document.body.appendChild(b);
    expect(dom.isConnectedNode(a)).to.be.true;

    const shadow = a.attachShadow({mode: 'open'});
    const c = document.createElement('div');
    shadow.appendChild(c);
    expect(dom.isConnectedNode(c)).to.be.true;

    document.body.removeChild(b);
    expect(dom.isConnectedNode(c)).to.be.false;
  });

  it('rootNodeFor', () => {
    const a = document.createElement('div');
    expect(dom.rootNodeFor(a)).to.equal(a);

    const b = document.createElement('div');
    a.appendChild(b);
    expect(dom.rootNodeFor(b)).to.equal(a);

    const c = document.createElement('div');
    b.appendChild(c);
    expect(dom.rootNodeFor(c)).to.equal(a);
  });

  it('rootNodeFor (no Node.p.getRootNode)', () => {
    env.sandbox.deleteProperty(Node.prototype, 'getRootNode');

    const a = document.createElement('div');
    expect(dom.rootNodeFor(a)).to.equal(a);

    const b = document.createElement('div');
    a.appendChild(b);
    expect(dom.rootNodeFor(b)).to.equal(a);

    const c = document.createElement('div');
    b.appendChild(c);
    expect(dom.rootNodeFor(c)).to.equal(a);

    const polyfill = document.createElement('i-amphtml-shadow-root');
    const e = document.createElement('div');
    polyfill.appendChild(e);
    a.appendChild(polyfill);
    expect(dom.rootNodeFor(e)).to.equal(polyfill);
  });

  describe('isShadowRoot', () => {
    it('should yield false for non-nodes', () => {
      expect(dom.isShadowRoot(null)).to.be.false;
      expect(dom.isShadowRoot(undefined)).to.be.false;
      expect(dom.isShadowRoot('')).to.be.false;
      expect(dom.isShadowRoot(11)).to.be.false;
    });

    it('should yield false for other types of nodes', () => {
      expect(dom.isShadowRoot(document.createElement('div'))).to.be.false;
      expect(dom.isShadowRoot(document.createTextNode('abc'))).to.be.false;
    });

    it('should yield true for natively-supported createShadowRoot API', () => {
      const element = document.createElement('div');
      if (element.createShadowRoot) {
        const shadowRoot = element.createShadowRoot();
        expect(dom.isShadowRoot(shadowRoot)).to.be.true;
      }
    });

    it('should yield true for natively-supported attachShadow API', () => {
      const element = document.createElement('div');
      if (element.attachShadow) {
        const shadowRoot = element.attachShadow({mode: 'open'});
        expect(dom.isShadowRoot(shadowRoot)).to.be.true;
      }
    });

    it('should yield false for document-fragment non-shadow-root node', () => {
      const fragment = document.createDocumentFragment();
      expect(dom.isShadowRoot(fragment)).to.be.false;
    });

    it('should yield true for polyfill', () => {
      expect(dom.isShadowRoot(document.createElement('i-amphtml-shadow-root')))
        .to.be.true;
    });
  });

  it('iterateCursor should loop through every element in a NodeList', () => {
    const fragment = document.createDocumentFragment();
    [0, 1, 2].forEach(() => fragment.appendChild(document.createElement('i')));

    const iSpy = env.sandbox.spy();
    dom.iterateCursor(fragment.querySelectorAll('i'), iSpy);
    expect(iSpy).to.be.calledThrice;

    const bSpy = env.sandbox.spy();
    dom.iterateCursor(fragment.querySelectorAll('b'), bSpy);
    expect(bSpy).to.have.not.been.called;
  });

  it('iterateCursor should allow null elements in a list', () => {
    const list = ['wow', null, 'cool'];

    const spy = env.sandbox.spy();
    dom.iterateCursor(list, spy);
    expect(spy).to.be.calledThrice;
  });

  describe('waitFor', () => {
    let parent;
    let child;

    beforeEach(() => {
      parent = document.createElement('div');
      child = document.createElement('div');
    });

    function contains() {
      return parent.contains(child);
    }

    it('should immediately return if child is available', () => {
      parent.appendChild(child);
      const spy = env.sandbox.spy();
      dom.waitForChild(parent, contains, spy);
      expect(spy).to.be.calledOnce;
    });

    it('should wait until child is available', () => {
      const spy = env.sandbox.spy();
      dom.waitForChild(parent, contains, spy);
      expect(spy).to.have.not.been.called;

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (spy.callCount > 0) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
        parent.appendChild(child);
      }).then(() => {
        expect(spy).to.be.calledOnce;
      });
    });

    it('should prefer MutationObserver and disconnect when done', () => {
      let mutationCallback;
      const mutationObserver = {
        observe: env.sandbox.spy(),
        disconnect: env.sandbox.spy(),
      };
      const parent = {
        ownerDocument: {
          defaultView: {
            MutationObserver: (callback) => {
              mutationCallback = callback;
              return mutationObserver;
            },
          },
        },
      };
      let checkFuncValue = false;
      const checkFunc = () => checkFuncValue;
      const spy = env.sandbox.spy();

      dom.waitForChild(parent, checkFunc, spy);
      expect(spy).to.have.not.been.called;
      expect(mutationObserver.observe).to.be.calledOnce;
      expect(mutationObserver.observe.firstCall.args[0]).to.equal(parent);
      expect(mutationObserver.observe.firstCall.args[1]).to.deep.equal({
        childList: true,
      });
      expect(mutationCallback).to.exist;

      // False callback.
      mutationCallback();
      expect(spy).to.have.not.been.called;
      expect(mutationObserver.disconnect).to.have.not.been.called;

      // True callback.
      checkFuncValue = true;
      mutationCallback();
      expect(spy).to.be.calledOnce;
      expect(mutationObserver.disconnect).to.be.calledOnce;
    });

    it('should fallback to polling without MutationObserver', () => {
      let intervalCallback;
      const win = {
        setInterval: (callback) => {
          intervalCallback = callback;
          return 123;
        },
        clearInterval: env.sandbox.spy(),
      };
      const parent = {
        ownerDocument: {
          defaultView: win,
        },
      };
      let checkFuncValue = false;
      const checkFunc = () => checkFuncValue;
      const spy = env.sandbox.spy();

      dom.waitForChild(parent, checkFunc, spy);
      expect(spy).to.have.not.been.called;
      expect(intervalCallback).to.exist;

      // False callback.
      intervalCallback();
      expect(spy).to.have.not.been.called;
      expect(win.clearInterval).to.have.not.been.called;

      // True callback.
      checkFuncValue = true;
      intervalCallback();
      expect(spy).to.be.calledOnce;
      expect(win.clearInterval).to.be.calledOnce;
    });

    it('should wait for body', () => {
      return dom.waitForBodyOpenPromise(document).then(() => {
        expect(document.body).to.exist;
      });
    });

    it('should wait for body even if doc is complete', () => {
      return new Promise((resolve, reject) => {
        const doc = {
          readyState: 'complete',
          body: null,
          documentElement: {
            ownerDocument: {
              defaultView: {
                setInterval() {
                  return window.setInterval.apply(window, arguments);
                },
                clearInterval() {
                  return window.clearInterval.apply(window, arguments);
                },
              },
            },
          },
        };
        setTimeout(() => {
          doc.body = {};
        }, 50);
        dom.waitForBodyOpen(doc, () => {
          try {
            expect(doc.body).to.exist;
            resolve();
          } catch (e) {
            reject(new Error("body doesn't exist"));
          }
        });
      });
    });

    it('should yield body asap even if doc is not complete', () => {
      return new Promise((resolve, reject) => {
        const doc = {
          readyState: 'loading',
          body: null,
          documentElement: {
            ownerDocument: {
              defaultView: {
                setInterval() {
                  return window.setInterval.apply(window, arguments);
                },
                clearInterval() {
                  return window.clearInterval.apply(window, arguments);
                },
              },
            },
          },
        };
        setTimeout(() => {
          doc.body = {};
        }, 50);
        dom.waitForBodyOpen(doc, () => {
          try {
            expect(doc.body).to.exist;
            resolve();
          } catch (e) {
            reject(new Error("body doesn't exist"));
          }
        });
      });
    });
  });

  describe('getDataParamsFromAttributes', () => {
    it('should return key-value for data-param- attributes', () => {
      const element = document.createElement('element');
      element.setAttribute('attr1', '1');
      element.setAttribute('data-param-hello', '2');
      element.setAttribute('data-param-from-the-other-side', '3');
      const params = dom.getDataParamsFromAttributes(element);
      expect(params.hello).to.be.equal('2');
      expect(params.fromTheOtherSide).to.be.equal('3');
      expect(params.attr1).to.be.undefined;
    });

    it('should return key-value for custom data attributes', () => {
      const element = document.createElement('element');
      element.setAttribute('data-vars-event-name', 'click');
      const params = dom.getDataParamsFromAttributes(
        element,
        null,
        /^vars(.+)/
      );
      expect(params.eventName).to.be.equal('click');
    });
  });

  describe('hasNextNodeInDocumentOrder', () => {
    it('should return true when the element has a nextSibling', () => {
      const element = document.createElement('div');
      const parent = document.createElement('div');
      const sibling = document.createElement('div');
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.false;
      parent.appendChild(element);
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.false;
      parent.appendChild(sibling);
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.true;
    });

    it('should return true when element ancestor has nextSibling', () => {
      const element = document.createElement('div');
      const parent = document.createElement('div');
      const uncle = document.createElement('div');
      const ancestor = document.createElement('div');
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.false;
      ancestor.appendChild(parent);
      ancestor.appendChild(uncle);
      parent.appendChild(element);
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.true;
    });

    it('should return false when ancestor with sibling with stop node', () => {
      const element = document.createElement('div');
      const parent = document.createElement('div');
      const uncle = document.createElement('div');
      const ancestor = document.createElement('div');
      ancestor.appendChild(parent);
      ancestor.appendChild(uncle);
      parent.appendChild(element);
      expect(dom.hasNextNodeInDocumentOrder(element)).to.be.true;
      expect(dom.hasNextNodeInDocumentOrder(element, parent)).to.be.false;
    });
  });

  describe('isJsonScriptTag', () => {
    it('should return true for <script type="application/json">', () => {
      const element = document.createElement('script');
      element.setAttribute('type', 'application/json');
      expect(dom.isJsonScriptTag(element)).to.be.true;
    });

    it('should return true for <script type="aPPLication/jSon">', () => {
      const element = document.createElement('script');
      element.setAttribute('type', 'aPPLication/jSon');
      expect(dom.isJsonScriptTag(element)).to.be.true;
    });

    it('should return false for <script type="text/javascript">', () => {
      const element = document.createElement('script');
      element.setAttribute('type', 'text/javascript');
      expect(dom.isJsonScriptTag(element)).to.be.false;
    });

    it('should return false for <div type="application/json">', () => {
      const element = document.createElement('div');
      element.setAttribute('type', 'application/json');
      expect(dom.isJsonScriptTag(element)).to.be.false;
    });
  });

  describe('getChildJsonConfig', () => {
    let element;
    let script;
    let text;
    beforeEach(() => {
      element = document.createElement('div');
      script = document.createElement('script');
      script.setAttribute('type', 'application/json');
      text = '{"a":{"b": "c"}}';
      script.textContent = text;
    });

    it('return json config', () => {
      element.appendChild(script);
      expect(dom.getChildJsonConfig(element)).to.deep.equal({
        'a': {
          'b': 'c',
        },
      });
    });

    it('throw if not one script', () => {
      expect(() => dom.getChildJsonConfig(element)).to.throw(
        'Found 0 <script> children. Expected 1'
      );
      element.appendChild(script);
      const script2 = document.createElement('script');
      element.appendChild(script2);
      expect(() => dom.getChildJsonConfig(element)).to.throw(
        'Found 2 <script> children. Expected 1'
      );
    });

    it('throw if type is not application/json', () => {
      script.setAttribute('type', '');
      element.appendChild(script);
      expect(() => dom.getChildJsonConfig(element)).to.throw(
        '<script> child must have type="application/json"'
      );
    });

    it('throw if cannot parse json', () => {
      const invalidText = '{"a":{"b": "c",}}';
      script.textContent = invalidText;
      element.appendChild(script);
      expect(() => dom.getChildJsonConfig(element)).to.throw(
        'Failed to parse <script> contents. Is it valid JSON?'
      );
    });
  });

  describe('escapeHtml', () => {
    it('should tolerate empty string', () => {
      expect(dom.escapeHtml('')).to.equal('');
    });

    it('should ignore non-escapes', () => {
      expect(dom.escapeHtml('abc')).to.equal('abc');
    });

    it('should subsctitute escapes', () => {
      expect(dom.escapeHtml('a<b>&c"d\'e`f')).to.equal(
        'a&lt;b&gt;&amp;c&quot;d&#x27;e&#x60;f'
      );
    });
  });

  describe('tryFocus', () => {
    it('should call focus on the element', () => {
      const element = {
        focus() {},
      };
      const focusSpy = env.sandbox.spy(element, 'focus');
      dom.tryFocus(element);
      expect(focusSpy).to.have.been.called;
    });

    it('should not throw exception if element focus throws exception', () => {
      const element = {
        focus() {
          throw new Error('Cannot focus');
        },
      };
      const focusSpy = env.sandbox.spy(element, 'focus');
      expect(() => dom.tryFocus(element)).to.not.throw();
      expect(focusSpy).to.have.been.called;
    });
  });

  describe('matches', () => {
    let div, img1, iframe, ampEl;
    beforeEach(() => {
      ampEl = document.createElement('x-ad');
      ampEl.className = 'i-amphtml-element';
      ampEl.id = 'ampEl';
      iframe = document.createElement('iframe');
      div = document.createElement('div');
      div.id = 'div';
      img1 = document.createElement('x-img');
      img1.id = 'img1';
      div.appendChild(img1);
      iframe.srcdoc = div.outerHTML;
      document.body.appendChild(ampEl);

      const loaded = loadPromise(iframe);
      ampEl.appendChild(iframe);
      return loaded;
    });

    afterEach(() => {
      document.body.removeChild(ampEl);
    });

    it('finds element by id', () => {
      expect(matches(ampEl, '#ampEl')).to.be.true;
      [div, img1, iframe].map((el) => {
        expect(matches(el, '#ampEl')).to.be.false;
      });
    });

    it('finds element by tagname', () => {
      expect(matches(div, 'div')).to.be.true;
      [ampEl, img1, iframe].map((el) => {
        expect(matches(el, 'div')).to.be.false;
      });
    });
  });

  it('isEnabled', () => {
    expect(dom.isEnabled(document)).to.be.true;

    const a = document.createElement('button');
    expect(dom.isEnabled(a)).to.be.true;

    a.disabled = true;
    expect(dom.isEnabled(a)).to.be.false;

    a.disabled = false;
    expect(dom.isEnabled(a)).to.be.true;

    const b = document.createElement('fieldset');
    b.appendChild(a);
    expect(dom.isEnabled(a)).to.be.true;

    b.disabled = true;
    expect(dom.isEnabled(a)).to.be.false;

    b.removeChild(a);
    const c = document.createElement('legend');
    c.appendChild(a);
    b.appendChild(c);
    expect(dom.isEnabled(a)).to.be.true;
  });

  it(
    'templateContentClone on a <template> element (browser supports' +
      ' HTMLTemplateElement)',
    () => {
      const template = document.createElement('template');
      template.innerHTML = '<span>123</span><span>456<em>789</em></span>';
      const content = dom.templateContentClone(template);

      const spans = content.querySelectorAll('span');
      expect(spans.length).to.equal(2);
      expect(spans[0].innerHTML).to.equal('123');
      expect(spans[1].innerHTML).to.equal('456<em>789</em>');
    }
  );

  it(
    'templateContentClone on a <template> element (simulate a browser' +
      ' that does not support HTMLTemplateElement)',
    () => {
      const template = document.createElement('div');
      template.innerHTML = '<span>123</span><span>456<em>789</em></span>';
      const content = dom.templateContentClone(template);

      const spans = content.querySelectorAll('span');
      expect(spans.length).to.equal(2);
      expect(spans[0].innerHTML).to.equal('123');
      expect(spans[1].innerHTML).to.equal('456<em>789</em>');
    }
  );

  it('should implement containsNotSelf', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    const uncle = document.createElement('div');
    const grandparent = document.createElement('div');
    grandparent.appendChild(parent);
    grandparent.appendChild(uncle);
    parent.appendChild(child);

    expect(dom.containsNotSelf(grandparent, grandparent)).to.be.false;
    expect(dom.containsNotSelf(grandparent, parent)).to.be.true;
    expect(dom.containsNotSelf(grandparent, uncle)).to.be.true;
    expect(dom.containsNotSelf(grandparent, child)).to.be.true;

    expect(dom.containsNotSelf(parent, parent)).to.be.false;
    expect(dom.containsNotSelf(parent, uncle)).to.be.false;
    expect(dom.containsNotSelf(parent, grandparent)).to.be.false;
    expect(dom.containsNotSelf(parent, child)).to.be.true;
  });

  describe('domOrderComparator', () => {
    it('should sort elements by dom order', () => {
      //
      // <div id='elem1'>
      //   <div id='elem2'>
      //      <div id='elem3'>
      //   <div id='elem4'>
      //
      const elem1 = document.createElement('div');
      const elem2 = document.createElement('div');
      const elem3 = document.createElement('div');
      const elem4 = document.createElement('div');

      elem1.appendChild(elem2);
      elem2.appendChild(elem3);
      elem1.appendChild(elem4);

      expect(dom.domOrderComparator(elem1, elem1)).to.equal(0);
      expect(dom.domOrderComparator(elem1, elem2)).to.equal(-1);
      expect(dom.domOrderComparator(elem1, elem3)).to.equal(-1);
      expect(dom.domOrderComparator(elem1, elem4)).to.equal(-1);

      expect(dom.domOrderComparator(elem2, elem1)).to.equal(1);
      expect(dom.domOrderComparator(elem2, elem2)).to.equal(0);
      expect(dom.domOrderComparator(elem2, elem3)).to.equal(-1);
      expect(dom.domOrderComparator(elem2, elem4)).to.equal(-1);

      expect(dom.domOrderComparator(elem3, elem1)).to.equal(1);
      expect(dom.domOrderComparator(elem3, elem2)).to.equal(1);
      expect(dom.domOrderComparator(elem3, elem3)).to.equal(0);
      expect(dom.domOrderComparator(elem3, elem4)).to.equal(-1);

      expect(dom.domOrderComparator(elem4, elem1)).to.equal(1);
      expect(dom.domOrderComparator(elem4, elem2)).to.equal(1);
      expect(dom.domOrderComparator(elem4, elem3)).to.equal(1);
      expect(dom.domOrderComparator(elem4, elem4)).to.equal(0);
    });
  });
});

describes.realWin(
  'DOM',
  {
    amp: {
      /* amp spec */
      ampdoc: 'single',
    },
  },
  () => {
    describe('toggleAttribute', () => {
      let el;

      beforeEach(() => {
        el = document.createElement('div');
      });

      it('should toggle to remove the attribute with an empty value', () => {
        el.setAttribute('foo', '');
        dom.toggleAttribute(el, 'foo');
        expect(el.getAttribute('foo')).to.be.null;
      });

      it('should toggle to remove the attribute with a non-empty value', () => {
        el.setAttribute('foo', 'asdf');
        dom.toggleAttribute(el, 'foo');
        expect(el.getAttribute('foo')).to.be.null;
      });

      it('should toggle to add the attribute', () => {
        dom.toggleAttribute(el, 'foo');
        expect(el.getAttribute('foo')).to.equal('');
      });

      it('should remove the attribute when forced', () => {
        el.setAttribute('foo', '');
        dom.toggleAttribute(el, 'foo', false);
        expect(el.getAttribute('foo')).to.be.null;
      });

      it('should not add the attribute when forced off', () => {
        dom.toggleAttribute(el, 'foo', false);
        expect(el.getAttribute('foo')).to.be.null;
      });

      it('should add the attribute when forced and it does not exist', () => {
        dom.toggleAttribute(el, 'foo', true);
        expect(el.getAttribute('foo')).to.equal('');
      });

      it('should leave the attribute when forced and it exists', () => {
        el.setAttribute('foo', 'asdf');
        dom.toggleAttribute(el, 'foo', true);
        expect(el.getAttribute('foo')).to.equal('asdf');
      });
    });

    describe('parseBooleanAttribute', () => {
      it('should return null for null/undefined', () => {
        expect(dom.parseBooleanAttribute(null)).to.be.undefined;
        expect(dom.parseBooleanAttribute(undefined)).to.be.undefined;
      });

      it('should return true for empty string', () => {
        expect(dom.parseBooleanAttribute('')).to.be.true;
      });

      it('should return true for "true" string', () => {
        expect(dom.parseBooleanAttribute('true')).to.be.true;
      });

      it('should return false for "false" string', () => {
        expect(dom.parseBooleanAttribute('false')).to.be.false;
      });

      it('should return true for a random string', () => {
        expect(dom.parseBooleanAttribute('a')).to.be.true;
      });
    });
  }
);
