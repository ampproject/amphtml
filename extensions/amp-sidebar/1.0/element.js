import {CSS as COMPONENT_CSS} from './component.jss';
import {pauseAll} from '#core/dom/resource-container-helper';
import {realChildNodes} from '#core/dom/query';
import {toggle} from '#core/dom/style';
import {toggleAttribute} from '#core/dom';
import {useToolbarHook} from './sidebar-toolbar-hook';
import {useValueRef} from '#preact/component';

/**
 * @param {*} unusedElement
 * @return {boolean}
 */
/**
 * @param {JsonObject} props
 * @param {Node} element
 */
import * as Preact from '#preact';
export {BentoSidebar as Component} from './component';

/**
 *
 * @param {*} unusedElement
 * @return {boolean}
 */
export function deferredMount(unusedElement) {
  return false;
}

/**
 * @param {JsonObject} props
 * @param {Node} element
 */
export function updatePropsForRendering(props, element) {
  realChildNodes(element).map((child) => {
    if (
      child.nodeName === 'NAV' &&
      child.hasAttribute('toolbar') &&
      child.hasAttribute('toolbar-target')
    ) {
      props['children'].push(
        <ToolbarShim
          toolbar={child.getAttribute('toolbar')}
          toolbarTarget={child.getAttribute('toolbar-target')}
          domElement={child}
        ></ToolbarShim>
      );
    }
  });
}

/**
 * @param {Node} element
 * @param {boolean} open
 * @return {boolean}
 */
function toggleOpen(element, open) {
  toggleAttribute(element, 'open', open);
  toggle(element, open);
  if (!open) {
    pauseAll(element, /* includeSelf */ false);
  }
  return open;
}

/**
 * @param {Node} element
 * @return {boolean}
 */
export function beforeOpen(element) {
  toggleOpen(element, true);
  return true;
}

/**
 * @param {*} unusedElement
 */
export function afterOpen(unusedElement) {}

/**
 * @param {Node} element
 * @return {boolean}
 */
export function afterClose(element) {
  toggleOpen(element, false);
  return false;
}

/**
 * @param {Node} element
 * @param {boolean} prevOpen
 * @param {function():void} openCb
 * @param {function():void} closeCb
 * @return {boolean}
 */
export function mutationObserverCallback(element, prevOpen, openCb, closeCb) {
  const isOpen = element.hasAttribute('open');
  if (isOpen === prevOpen) {
    return;
  }
  isOpen ? openCb() : closeCb();

  return isOpen;
}

/**
 * @param {!BentoSidebarDef.ToolbarShimProps} props
 */
function ToolbarShim({
  domElement,
  toolbar: mediaQueryProp,
  toolbarTarget: toolbarTargetProp,
}) {
  const ref = useValueRef(domElement);
  useToolbarHook(ref, mediaQueryProp, toolbarTargetProp);
}

export const usesShadowDom = true;

export const shadowCss = COMPONENT_CSS;

export const props = {
  'children': {passthrough: true},
  'side': {attr: 'side'},
};
