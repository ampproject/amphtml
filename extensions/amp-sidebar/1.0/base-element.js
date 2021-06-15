/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '#preact';
import {CSS as COMPONENT_CSS} from './component.jss';
import {PreactBaseElement} from '#preact/base-element';
import {Sidebar} from './component';
import {dict} from '#core/types/object';
import {getRealChildNodes} from '#core/dom/query';
import {pauseAll} from '../../../src/utils/resource-container-helper';
import {toggle} from '#core/dom/style';
import {toggleAttribute} from '#core/dom';
import {useToolbarHook} from './sidebar-toolbar-hook';
import {useValueRef} from '#preact/component';

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
    return dict({
      'onBeforeOpen': () => this.beforeOpen_(),
      'onAfterOpen': () => this.afterOpen_(),
      'onAfterClose': () => this.afterClose_(),
    });
  }

  /** @override */
  updatePropsForRendering(props) {
    getRealChildNodes(this.element).map((child) => {
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

  /** @override */
  unmountCallback() {
    this.removeAsContainer();
  }

  /** @private */
  beforeOpen_() {
    this.open_ = true;
    toggleAttribute(this.element, 'open', true);
    toggle(this.element, true);
  }

  /** @private */
  afterOpen_() {
    const sidebar = this.element.shadowRoot.querySelector('[part=sidebar]');
    this.setAsContainer(sidebar);
  }

  /** @private */
  afterClose_() {
    this.open_ = false;
    toggleAttribute(this.element, 'open', false);
    toggle(this.element, false);

    this.removeAsContainer();
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
BaseElement['Component'] = Sidebar;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'side': {attr: 'side', type: 'string'},
};

/**
 * @param {!SidebarDef.ToolbarShimProps} props
 */
function ToolbarShim({
  domElement,
  toolbar: mediaQueryProp,
  toolbarTarget: toolbarTargetProp,
}) {
  const ref = useValueRef(domElement);
  useToolbarHook(ref, mediaQueryProp, toolbarTargetProp);
}
