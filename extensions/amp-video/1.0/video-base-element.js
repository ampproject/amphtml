import {ActionTrust_Enum} from '#core/constants/action-constants';

import {
  Component,
  layoutSizeDefined,
  loadable,
  props,
  shadowCss,
  usesShadowDom,
} from './element';
import {AmpPreactBaseElement} from '#preact/amp-base-element';

/** @extends {PreactBaseElement<VideoWrapperDef.Api>} */
export class AmpVideoBaseElement extends AmpPreactBaseElement {
  /** @override */
  init() {
    this.registerApiAction_('play', (api) => api.play());
    this.registerApiAction_('pause', (api) => api.pause());
    this.registerApiAction_('mute', (api) => api.mute());
    this.registerApiAction_('unmute', (api) => api.unmute());

    // Ugly that this action has three names, but:
    // - requestFullscreen for consistency with Element.requestFullscreen
    // - fullscreenenter / fullscreen are for backwards compatibility
    const requestFullscreen = (api) => api.requestFullscreen();
    this.registerApiAction_('requestFullscreen', requestFullscreen);
    this.registerApiAction_('fullscreenenter', requestFullscreen);
    this.registerApiAction_('fullscreen', requestFullscreen);
  }

  /**
   * @param {string} alias
   * @param {function(!VideoWrapperDef.Api, !../../../src/service/action-impl.ActionInvocation)} handler
   * @param {!../../../src/core/constants/action-constants.ActionTrust_Enum=} minTrust
   * @private
   */
  registerApiAction_(alias, handler, minTrust = ActionTrust_Enum.HIGH) {
    this.registerApiAction(
      alias,
      (api, invocation) => {
        if (invocation.trust >= ActionTrust_Enum.HIGH) {
          // TODO(alanorozco): There may be a better solution that doesn't
          // require this method which is not standard in HTMLMediaElement, like
          // potentially toggling `autoplay` instead.
          api.userInteracted();
        }
        handler(api, invocation);
      },
      minTrust
    );
  }
}

/** @override */
AmpVideoBaseElement['Component'] = Component;

/** @override */
AmpVideoBaseElement['loadable'] = loadable;

/** @override */
AmpVideoBaseElement['layoutSizeDefined'] = layoutSizeDefined;

/**
 * Defaults to `{component: 'video'}` from `BentoVideo` component.
 * Subclasses may set:
 * ```
 *   AmpMyPlayer['staticProps'] = dict({
 *     'component': MyPlayerComponent,
 *   });
 * ```
 * @override
 */
AmpVideoBaseElement['staticProps'];

/** @override */
AmpVideoBaseElement['props'] = props;

/** @override */
AmpVideoBaseElement['shadowCss'] = shadowCss;

/** @override */
AmpVideoBaseElement['usesShadowDom'] = usesShadowDom;
