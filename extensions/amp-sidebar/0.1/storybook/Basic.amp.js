// To do: how to add CSS
//import '!style-loader!css-loader!./Basic-styles.css';
import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-sidebar-0_1',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-sidebar', version: 0.1}],
  },

  args: {
    minWidth: 500,
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

export const Toolbar = (minWidth) => {
  /*
   * The toolbar feature allows elements within the amp-sidebar to be
   * displayed within the main body of the article. In this example two
   * Navigational Elements from the sidebar will be displayed under the
   * Toolbar Target when the width of the page is 500px or more.
   */
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
