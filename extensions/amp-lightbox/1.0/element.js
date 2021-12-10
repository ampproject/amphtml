import {CSS as COMPONENT_CSS} from './component.jss';
import {toggle} from '#core/dom/style';
import {toggleAttribute} from '#core/dom';
import {unmountAll} from '#core/dom/resource-container-helper';
export {BentoLightbox as Component} from './component';

/**
 * @param {*} element
 * @param {*} isOpen
 */
export function toggleOpen(element, isOpen) {
  toggleAttribute(element, 'open', isOpen);
  toggle(element, isOpen);
  if (!isOpen) {
    // Unmount all children when the lightbox is closed. They will automatically
    // remount when the lightbox is opened again.
    unmountAll(element, /* includeSelf */ false);
  }
}

/**
 * @param {*} element
 * @param {*} triggerEvent
 * @return {boolean}
 */
export function beforeLightboxOpen(element, triggerEvent) {
  toggleOpen(element, true);
  triggerEvent(element, 'open');
  return true;
}

/**
 * @param {*} element
 * @param {*} triggerEvent
 * @return {boolean}
 */
export function afterLightboxClose(element, triggerEvent) {
  toggleOpen(element, false);
  triggerEvent(element, 'close');
  return false;
}

export const props = {
  'animation': {attr: 'animation', media: true, default: 'fade-in'},
  'closeButtonAs': {selector: '[slot="close-button"]', single: true, as: true},
  'children': {passthrough: true},
};

export const usesShadowDom = true;

export const shadowCss = COMPONENT_CSS;
