import {toggleAttribute} from '#core/dom';
import {realChildNodes} from '#core/dom/query';
import {pauseAll} from '#core/dom/resource-container-helper';
import {toggle} from '#core/dom/style';

import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';
import {useValueRef} from '#preact/component';

import {BentoSidebar} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';
import {useToolbarHook} from './sidebar-toolbar-hook';

export class BaseElement extends PreactBaseElement {
  /** @override */
  static deferredMount(unusedElement) {
    return false;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.open_ = false;
  }

  /** @override */
  init() {
    return {
      'onBeforeOpen': () => this.beforeOpen(),
      'onAfterOpen': () => this.afterOpen(),
      'onAfterClose': () => this.afterClose(),
    };
  }

  /** @override */
  updatePropsForRendering(props) {
    realChildNodes(this.element).map((child) => {
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

  /** @protected */
  beforeOpen() {
    this.open_ = true;
    toggleAttribute(this.element, 'open', true);
    toggle(this.element, true);
  }

  /** @protected */
  afterOpen() {}

  /** @protected */
  afterClose() {
    this.open_ = false;
    toggleAttribute(this.element, 'open', false);
    toggle(this.element, false);

    pauseAll(this.element, /* includeSelf */ false);
  }

  /** @override */
  mutationObserverCallback() {
    const open = this.element.hasAttribute('open');
    if (open === this.open_) {
      return;
    }
    this.open_ = open;
    open ? this.api().open() : this.api().close();
  }
}

/** @override */
BaseElement['Component'] = BentoSidebar;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'side': {attr: 'side'},
};

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
