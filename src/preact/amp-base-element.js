import {PreactBaseElement} from './bento-base-element';

export class AmpPreactBaseElement extends PreactBaseElement {
  /** @override @nocollapse */
  static R1() {
    return true;
  }

  /** @override @nocollapse */
  static requiresShadowDom() {
    // eslint-disable-next-line local/no-static-this
    return this['usesShadowDom'];
  }

  /** @override @nocollapse */
  static usesLoading() {
    // eslint-disable-next-line local/no-static-this
    return this['loadable'];
  }

  /** @override @nocollapse */
  static prerenderAllowed() {
    // eslint-disable-next-line local/no-static-this
    return !this.usesLoading();
  }

  /** @override */
  isLayoutSupported(layout) {
    const Ctor = this.constructor;
    if (Ctor['layoutSizeDefined']) {
      return (
        isLayoutSizeDefined(layout) ||
        // This allows a developer to specify the component's size using the
        // user stylesheet without the help of AMP's static layout rules.
        // Bento components use `ContainWrapper` with `contain:strict`, thus
        // if a user stylesheet doesn't provide for the appropriate size, the
        // element's size will be 0. The user stylesheet CSS can use
        // fixed `width`/`height`, `aspect-ratio`, `flex`, `grid`, or any
        // other CSS layouts coupled with `@media` queries and other CSS tools.
        // Besides normal benefits of using plain CSS, an important feature of
        // using this layout is that AMP does not add "sizer" elements thus
        // keeping the user DOM clean.
        layout == Layout_Enum.CONTAINER
      );
    }
    return super.isLayoutSupported(layout);
  }
}

/**
 * An override to specify that the component requires `layoutSizeDefined`.
 * This typically means that the element's `isLayoutSupported()` is
 * implemented via `isLayoutSizeDefined()`, and this is how the default
 * `isLayoutSupported()` is implemented when this flag is set.
 *
 * @protected {string}
 */
AmpPreactBaseElement['layoutSizeDefined'] = false;

AMP.PreactBaseElement = AmpPreactBaseElement;