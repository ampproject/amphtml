import {toggle} from '#core/dom/style';
import {toggleAttribute} from '#core/dom';
import {pauseAll} from '#core/dom/resource-container-helper';

export {CSS as shadowCss} from './component.jss';
export {BentoSidebar as Component} from './component';

export const usesShadowDom = true;

export const props = {
  'children': {passthrough: true},
  'side': {attr: 'side'},
};

/**
 * @param {Element} element
 * @param {boolean} isOpen
 * @return {boolean}
 */
export function setElementOpen(element, isOpen) {
  toggleAttribute(element, 'open', isOpen);
  toggle(element, isOpen);
  if (!isOpen) {
    // TODO(wg-bento): Investigate if this is only needed on the AMP layer.
    pauseAll(element, /* includeSelf */ false);
  }
  return isOpen;
}

/**
 * @param {Element} element
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
