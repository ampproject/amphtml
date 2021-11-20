import {toggle} from '#core/dom/style';
import {dispatchCustomEvent, toggleAttribute} from '#core/dom';
import {unmountAll} from '#core/dom/resource-container-helper';

export {CSS as shadowCss} from './component.jss';
export {BentoLightbox as Component} from './component';

export const usesShadowDom = true;
export const props = {
  'animation': {attr: 'animation', media: true},
  'closeButtonAs': {selector: '[slot="close-button"]', single: true, as: true},
  'children': {passthrough: true},
};

/**
 * @param {Element} element
 * @param {boolean} isOpen
 * @return {boolean}
 */
export function setElementOpen(element, isOpen) {
  toggleAttribute(element, 'open', isOpen);
  toggle(element, isOpen);
  dispatchCustomEvent(element, isOpen ? 'open' : 'close');
  if (!isOpen) {
    // Unmount all children when the lightbox is closed. They will automatically
    // remount when the lightbox is opened again.
    // TODO(wg-bento): Investigate if this is only needed on the AMP layer.
    unmountAll(element, /* includeSelf */ false);
  }
  return isOpen;
}

/**
 * @param {!Element} element
 * @param {boolean} wasOpen
 * @return {boolean}
 */
export function toggleOnMutation(element, wasOpen) {
  const isOpen = element.hasAttribute('open');
  if (isOpen !== wasOpen) {
    element.getApi().then((api) => {
      if (isOpen) {
        api.open();
      } else {
        api.close();
      }
    });
  }
  return isOpen;
}
