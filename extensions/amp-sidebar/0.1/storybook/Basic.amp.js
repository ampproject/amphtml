/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

// To do: how to add CSS
//import '!style-loader!css-loader!./Basic-styles.css';
import * as Preact from '../../../../src/preact';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-sidebar-0_1',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [{name: 'amp-sidebar', version: 0.1}],
  },
};

export const BasicSidebar = () => {
  /*
   * Use the buttons below to open / toggle the amp-sidebar. The sidebar
   * will be displayed with various navigational elements.
   */
  return (
    <div>
      <div id="main">
        <h1>Basic Sidebar</h1>
        <button on="tap:sidebar.open">Open Sidebar</button>
        <button on="tap:sidebar.toggle">Toggle Sidebar</button>
      </div>
      <amp-sidebar id="sidebar" layout="nodisplay" side="right">
        <h3>Sidebar</h3>
        <ul>
          <li>Nav Element 1</li>
          <li>Nav Element 2</li>
          <li>Nav Element 3</li>
        </ul>
        <button on="tap:sidebar.close">Close Sidebar</button>
        <button on="tap:sidebar.toggle">Toggle Sidebar</button>
      </amp-sidebar>
    </div>
  );
};

export const Toolbar = () => {
  /*
   * The toolbar feature allows elements within the amp-sidebar to be
   * displayed within the main body of the article. In this example two
   * Navigational Elements from the sidebar will be displayed under the
   * Toolbar Target when the width of the page is 500px or more.
   */
  const minWidth = 500;
  const mediaQuery = `(min-width: ${minWidth}px)`;
  return (
    <div>
      <div id="main">
        <button on="tap:toolbar.open">Open Sidebar</button>
        <button on="tap:toolbar.toggle">Toggle Sidebar</button>
        <h1>Toolbar Target</h1>
        <div id="toolbar-target"></div>
      </div>
      <amp-sidebar id="toolbar" layout="nodisplay" side="right">
        <h3>Sidebar</h3>
        <nav toolbar={mediaQuery} toolbar-target="toolbar-target">
          <ul>
            <li>Nav Element 1</li>
            <li>Nav Element 2</li>
          </ul>
        </nav>
        <ul>
          <li>Nav Element 3</li>
          <li>Nav Element 4</li>
        </ul>
        <button on="tap:toolbar.close">Close Sidebar</button>
        <button on="tap:toolbar.toggle">Toggle Sidebar</button>
      </amp-sidebar>
    </div>
  );
};
