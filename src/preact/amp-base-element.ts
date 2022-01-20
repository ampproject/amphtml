/* eslint-disable local/restrict-this-access */

import {ActionTrust_Enum} from '#core/constants/action-constants';
import type {ReadyState_Enum} from '#core/constants/ready-state';

import {PreactBaseElement} from './base-element';

interface API_TYPE {
  readyState?: ReadyState_Enum;
  pause?: () => void;
}

export class AmpPreactBaseElement extends PreactBaseElement<API_TYPE> {
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
   * @override
   */
  attemptChangeHeight(newHeight: number) {
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
   */
  protected handleOnLoad() {
    this.toggleLoading?.(false);
    this.toggleFallback?.(false);
    this.togglePlaceholder?.(false);
  }

  /**
   * Default handler for onLoading event
   * Reveals loader. Override to customize.
   */
  protected handleOnLoading() {
    this.toggleLoading?.(true);
  }

  /**
   * Default handler for onError event
   * Displays Fallback / Placeholder. Override to customize.
   */
  protected handleOnError() {
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
   */
  protected registerApiAction(
    alias: string,
    handler: (t: API_TYPE, invocation: any) => void,
    minTrust: ActionTrust_Enum = ActionTrust_Enum.DEFAULT
  ) {
    this.registerAction?.(
      alias,
      (invocation: any) => {
        handler(this.api(), invocation);
      },
      minTrust
    );
  }
}

/**
 * Changes the inheritance hierarchy of clazz such that it now extends from superClazz.
 * If clazz previously inherited from a previousSuperClazz, it now no longer does so.
 * Dangerous, use sparingly!
 */
export function setSuperClass(clazz: any, superClazz: any): typeof clazz {
  Object.setPrototypeOf(clazz, superClazz);
  Object.setPrototypeOf(clazz.prototype, superClazz.prototype);
  return clazz;
}
