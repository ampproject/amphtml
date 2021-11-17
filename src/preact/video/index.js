import {ActionTrust_Enum} from '#core/constants/action-constants';

/**
 * @param {PreactBaseElement<VideoWrapperDef.Api>} impl
 */
export function registerVideoActions(impl) {
  const registerAction = (action, handler) => {
    impl.registerAction(action, (invocation) => {
      const api = impl.api();
      if (invocation.trust >= ActionTrust_Enum.HIGH) {
        // TODO(alanorozco): There may be a better solution that doesn't
        // require this method which is not standard in HTMLMediaElement, like
        // potentially toggling `autoplay` instead.
        api.userInteracted();
      }
      handler(api);
    });
  };
  registerAction('play', (api) => api.play());
  registerAction('pause', (api) => api.pause());
  registerAction('mute', (api) => api.mute());
  registerAction('unmute', (api) => api.unmute());

  // Ugly that this action has three names, but:
  // - requestFullscreen for consistency with Element.requestFullscreen
  // - fullscreenenter / fullscreen are for backwards compatibility
  const requestFullscreen = (api) => api.requestFullscreen();
  registerAction('requestFullscreen', requestFullscreen);
  registerAction('fullscreenenter', requestFullscreen);
  registerAction('fullscreen', requestFullscreen);
}
