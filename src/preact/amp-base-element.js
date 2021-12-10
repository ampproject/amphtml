import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Layout_Enum, isLayoutSizeDefined} from '#core/dom/layout';

import {PreactBaseElement} from './base-element';

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

  /** @param {!Element} element */
  constructor(element) {
    super(element);

    Object.assign(this.defaultProps_, {
      'onLoading': () => {
        this.handleOnLoading();
      },
      'onLoad': () => {
        this.handleOnLoad();
      },
      'onError': () => {
        this.handleOnError();
      },
    });
  }

  /**
   * Default handler for onLoad event
   * Displays loader. Override to customize.
   * @protected
   */
  handleOnLoad() {
    this.toggleLoading?.(false);
    this.toggleFallback?.(false);
    this.togglePlaceholder?.(false);
  }

  /**
   * Default handler for onLoading event
   * Reveals loader. Override to customize.
   * @protected
   */
  handleOnLoading() {
    this.toggleLoading?.(true);
  }

  /**
   * Default handler for onError event
   * Displays Fallback / Placeholder. Override to customize.
   * @protected
   */
  handleOnError() {
    this.toggleLoading?.(false);
    // If the content fails to load and there's a fallback element, display the fallback.
    // Otherwise, continue displaying the placeholder.
    if (this.getFallback?.()) {
      this.toggleFallback?.(true);
      this.togglePlaceholder?.(false);
    } else {
      this.togglePlaceholder?.(true);
    }
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

  /** @override */
  attemptChangeHeight(newHeight) {
    return super.attemptChangeHeight(newHeight).catch((e) => {
      // It's okay to disable this lint rule since we check that the restricted
      // method exists.
      // eslint-disable-next-line local/restrict-this-access
      if (this.getOverflowElement && !this.getOverflowElement()) {
        console./* OK */ warn(
          '[overflow] element not found. Provide one to enable resizing to full contents.',
          this.element
        );
      }
      throw e;
    });
  }

  /**
   * Register an action for AMP documents to execute an API handler.
   *
   * This has no effect on Bento documents, since they lack an Actions system.
   * Instead, they should use `(await element.getApi()).action()`
   * @param {string} alias
   * @param {function(!API_TYPE, !../service/action-impl.ActionInvocation)} handler
   * @param {../action-constants.ActionTrust_Enum} minTrust
   * @protected
   */
  registerApiAction(alias, handler, minTrust = ActionTrust_Enum.DEFAULT) {
    this.registerAction?.(
      alias,
      (invocation) => handler(this.api(), invocation),
      minTrust
    );
  }
}
