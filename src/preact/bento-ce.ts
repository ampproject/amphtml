import {isEsm} from '#core/mode';
import {getWin} from '#core/window';

import type {PreactBaseElement} from './base-element';

function maybeWrapNativeSuper<T extends Function>(klass: T): T {
  if (isEsm() || typeof Reflect !== 'object' || !Reflect.construct) {
    return klass;
  }
  /**
   * @return {T}
   */
  function Wrapper() {
    return Reflect.construct(klass, arguments, this.constructor);
  }
  Wrapper.prototype = Object.create(klass.prototype, {
    constructor: {
      value: Wrapper,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  return Object.setPrototypeOf(Wrapper, klass);
}

let BaseElement: typeof AMP.BaseElement;

if (typeof AMP !== 'undefined' && AMP.BaseElement) {
  BaseElement = AMP.BaseElement;
} else {
  class CeBaseElement {
    element: Element;
    win: Window;

    constructor(element: Element) {
      this.element = element;
      this.win = getWin(element);
    }

    mutateElement(cb: () => void) {
      Promise.resolve().then(cb);
    }

    isLayoutSupported(): boolean {
      return true;
    }

    mountCallback() {}
    unmountCallback() {}
    buildCallback() {}
  }

  BaseElement = CeBaseElement as any;
}

export {BaseElement};

let ExtendableHTMLElement: typeof HTMLElement;
let win: typeof globalThis & Window;

function createBentoElementClass(
  BaseElement: typeof PreactBaseElement,
  _win: typeof globalThis & Window = self
): typeof HTMLElement {
  if (!ExtendableHTMLElement || win !== _win) {
    win = _win;
    ExtendableHTMLElement = maybeWrapNativeSuper(win.HTMLElement);
  }

  return class CustomElement extends ExtendableHTMLElement {
    implementation: PreactBaseElement<any>;
    constructor() {
      super();
      this.implementation = new BaseElement(this as unknown as AmpElement);
    }

    connectedCallback() {
      this.classList.add('i-amphtml-built');
      this.implementation.mountCallback();
      this.implementation.buildCallback();
    }

    disconnectedCallback() {
      this.implementation.unmountCallback();
    }

    getApi(): Promise<any> {
      return this.implementation.getApi();
    }
  };
}

export function defineBentoElement(
  tag: string,
  BaseElement: typeof PreactBaseElement,
  _win: typeof globalThis & Window = self
) {
  _win.customElements.define(tag, createBentoElementClass(BaseElement, _win));
}
