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
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-iframe-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-iframe', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const WithSrc = () => {
  return (
    <amp-iframe
      width="800"
      height="600"
      src="https://www.wikipedia.org/"
    ></amp-iframe>
  );
};

WithSrc.storyName = 'amp-iframe with src attribute';

export const WithPlaceholder = () => {
  return (
    <amp-iframe width="800" height="600" src="https://www.wikipedia.org/">
      <h1>Placeholder</h1>
    </amp-iframe>
  );
};

WithPlaceholder.storyName = 'amp-iframe with placeholder';

export const WithResizableIframe = () => {
  return (
    <div>
      <h3>Below iframe should resize to 200x200 px</h3>
      <amp-iframe
        title="Resizable iframe example"
        width="100"
        height="100"
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="https://preview.amp.dev/static/samples/files/resizable-iframe.html"
      >
        <div placeholder>Placeholder</div>
      </amp-iframe>
    </div>
  );
};

WithResizableIframe.storyName = 'resizable amp-iframe';

export const WithContentBelow = () => {
  return (
    <div>
      <amp-iframe
        title="Resizable iframe example"
        width="100"
        height="100"
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="https://preview.amp.dev/static/samples/files/resizable-iframe.html"
      >
        <div placeholder>Placeholder</div>
        <div overflow tabindex="0" role="button" aria-label="Read more">
          Read more!
        </div>
      </amp-iframe>
      <h3>
        The above iframe should be 100x100 px and should not resize on page
        load. On clicking the "Resize" button, it will toggle size between
        200x200 px and 300x300 px.
      </h3>
    </div>
  );
};

WithContentBelow.storyName = 'resizeable amp-iframe with content below';

export const WithOverflowButton = () => {
  return (
    <div>
      <amp-iframe
        style="border:2px solid #000"
        title="Resizable iframe example"
        width="100"
        height="100"
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="/examples/bento/amp-iframe-resizing-example.html"
      >
        <div placeholder>Placeholder</div>
        <button overflow aria-label="Show more">
          Show more
        </button>
      </amp-iframe>
      <h3>Click the "Show More" button to resize the iframe to 300x300 px</h3>
    </div>
  );
};

WithOverflowButton.storyName = 'resizeable amp-iframe with overflow';
