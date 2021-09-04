import {copyProperties, install} from '#polyfills/custom-elements';

describes.realWin(
  'install patches',
  {skipCustomElementsPolyfill: true},
  (env) => {
    let win;
    let innerHTMLProto;

    function getInnerHtmlProto(win) {
      let innerHTMLProto = win.Element.prototype;
      if (!Object.getOwnPropertyDescriptor(innerHTMLProto, 'innerHTML')) {
        innerHTMLProto = win.HTMLElement.prototype;
        if (!Object.getOwnPropertyDescriptor(innerHTMLProto, 'innerHTML')) {
          return null;
        }
      }
      return innerHTMLProto;
    }

    before(function () {
      if (!getInnerHtmlProto(window)) {
        this.skipTest();
      }
    });

    beforeEach(function () {
      win = env.win;
      innerHTMLProto = getInnerHtmlProto(win);

      // We want to test the full polyfill.
      delete win.Reflect;
      delete win.customElements;
    });

    it('handles non-configurable innerHTML accessor (Safari 9)', () => {
      // Use strict is important, as strict mode code will throw an error when
      // trying to redefine a non-configurable property.
      'use strict';

      Object.defineProperty(innerHTMLProto, 'innerHTML', {configurable: false});
      install(win, function () {});

      class Test extends win.HTMLElement {}

      expect(() => {
        win.customElements.define('x-test', Test);
      }).not.to.throw();

      expect(win.HTMLElementOrig).to.exist;
      expect(Object.getPrototypeOf(win.HTMLElement)).to.equal(
        win.HTMLElementOrig
      );
    });

    it('handles missing innerHTML descriptor (Yandex)', () => {
      // Use strict is important, as strict mode code will throw an error when
      // trying to redefine a non-configurable property.
      'use strict';

      delete innerHTMLProto.innerHTML;
      install(win, function () {});

      class Test extends win.HTMLElement {}

      expect(() => {
        win.customElements.define('x-test', Test);
      }).not.to.throw();

      expect(win.HTMLElementOrig).to.exist;
      expect(Object.getPrototypeOf(win.HTMLElement)).to.equal(
        win.HTMLElementOrig
      );
    });

    it('handles innerHTML descriptor on HTMLElement (IE11)', () => {
      // Use strict is important, as strict mode code will throw an error when
      // trying to redefine a non-configurable property.
      'use strict';

      const desc = Object.getOwnPropertyDescriptor(innerHTMLProto, 'innerHTML');
      delete innerHTMLProto.innerHTML;
      Object.defineProperty(win.HTMLElement.prototype, 'innerHTML', desc);
      install(win, function () {});

      class Test extends win.HTMLElement {}

      expect(() => {
        win.customElements.define('x-test', Test);
      }).not.to.throw();

      expect(win.HTMLElementOrig).to.exist;
      expect(Object.getPrototypeOf(win.HTMLElement)).to.equal(
        win.HTMLElementOrig
      );
    });
  }
);

describes.fakeWin('copyProperties', {}, () => {
  it('copies own properties from proto object', () => {
    const obj = {};
    const proto = {test: 1};

    copyProperties(obj, proto);

    expect(obj).to.have.ownPropertyDescriptor('test', {
      value: 1,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  });

  it('copies own descriptor from proto object', () => {
    const obj = {};
    const proto = {};
    Object.defineProperty(proto, 'test', {value: 1});

    copyProperties(obj, proto);

    expect(obj).to.have.ownPropertyDescriptor('test', {
      value: 1,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  });

  it('copies own getter/setter from proto object', () => {
    const obj = {};
    const proto = {};

    let value = 1;
    Object.defineProperty(proto, 'test', {
      get() {
        return value;
      },
      set(v) {
        value = v;
      },
    });

    copyProperties(obj, proto);

    expect(obj).to.have.ownPropertyDescriptor('test');
    expect(obj.test).to.equal(1);
    obj.test = 2;
    expect(obj.test).to.equal(2);
    expect(value).to.equal(2);
  });

  it('does not override already defined property', () => {
    const obj = {test: 1};
    const proto = {test: 2};

    copyProperties(obj, proto);

    expect(obj.test).to.equal(1);
  });

  it('copies own properties from proto.__proto__ object', () => {
    const obj = {};
    const proto = Object.create({test: 1});

    copyProperties(obj, proto);

    expect(obj).to.have.ownPropertyDescriptor('test', {
      value: 1,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  });

  it('copies own descriptor from proto object', () => {
    const obj = {};
    const proto = Object.create(
      {},
      {
        test: {value: 1},
      }
    );

    copyProperties(obj, proto);

    expect(obj).to.have.ownPropertyDescriptor('test', {
      value: 1,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  });

  it('copies own getter/setter from proto object', () => {
    let value = 1;
    const obj = {};
    const proto = Object.create(
      {},
      {
        test: {
          get() {
            return value;
          },
          set(v) {
            value = v;
          },
        },
      }
    );

    copyProperties(obj, proto);

    expect(obj).to.have.ownPropertyDescriptor('test');
    expect(obj.test).to.equal(1);
    obj.test = 2;
    expect(obj.test).to.equal(2);
    expect(value).to.equal(2);
  });

  it('does not override already defined property', () => {
    const obj = {test: 1};
    const proto = Object.create({test: 2});

    copyProperties(obj, proto);

    expect(obj.test).to.equal(1);
  });

  it('does not override closer property with __proto__ property', () => {
    const obj = {};
    const proto = Object.create(
      {test: 2},
      {
        test: {value: 1},
      }
    );

    copyProperties(obj, proto);

    expect(obj.test).to.equal(1);
  });
});
