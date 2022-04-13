/* eslint-disable local/restrict-this-access */

import {ActionTrust_Enum} from '#core/constants/action-constants';

import {PreactBaseElement} from './base-element';

/**
 * @template {{
 *  readyState?: import('#core/constants/ready-state').ReadyState_Enum,
 *  pause?: function():void
 * }} API_TYPE
 * @extends PreactBaseElement<API_TYPE>
 */
export class AmpPreactBaseElement extends PreactBaseElement {
  /**
   * todo(kvchari): confirm this can be safely moved
   * @override
   */
  mutatedAttributesCallback() {
    if (this.container_) {
      this.scheduleRender_();
    }
  }

  /**
   * todo(kvchari): confirm this can be safely moved
   * @param {number} newHeight
   * @override
   */
  attemptChangeHeight(newHeight) {
    return super.attemptChangeHeight(newHeight).catch((e) => {
      // It's okay to disable this lint rule since we check that the restricted
      // method exists.

      if (this.getOverflowElement && !this.getOverflowElement()) {
        console./* OK */ warn(
          '[overflow] element not found. Provide one to enable resizing to full contents.',
          this.element
        );
      }
      throw e;
    });
  }

  /** @override */
  getDefaultProps() {
    return {
      ...super.getDefaultProps(),
      'onLoading': () => {
        this.handleOnLoading();
      },
      'onLoad': () => {
        this.handleOnLoad();
      },
      'onError': () => {
        this.handleOnError();
      },
    };
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

  /**
   * Register an action for AMP documents to execute an API handler.
   *
   * This has no effect on Bento documents, since they lack an Actions system.
   * Instead, they should use `(await element.getApi()).action()`
   * @param {string} alias
   * @param {function(API_TYPE, *):void} handler
   * @param {ActionTrust_Enum} minTrust
   * @protected
   */
  registerApiAction(alias, handler, minTrust = ActionTrust_Enum.DEFAULT) {
    this.registerAction?.(
      alias,
      /**
       * @param {*} invocation
       * @return {*}
       */
      (invocation) => {
        return handler(this.api(), invocation);
      },
      minTrust
    );
  }
}

/**
 * Changes the inheritance hierarchy of clazz such that it now extends from superClazz.
 * If clazz previously inherited from a previousSuperClazz, it now no longer does so.
 * Dangerous, use sparingly!
 * @param {*} clazz
 * @param {*} superClazz
 * @return {*}
 */
export function setSuperClass(clazz, superClazz) {
  Object.setPrototypeOf(clazz, superClazz);
  Object.setPrototypeOf(clazz.prototype, superClazz.prototype);
  return clazz;
}
