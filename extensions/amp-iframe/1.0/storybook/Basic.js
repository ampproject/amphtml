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
import {Iframe} from '../component';

export default {
  title: 'Iframe',
  component: Iframe,
};

export const _default = () => {
  return (
    <Iframe
      style={{width: 800, height: 600}}
      iframeStyle={{border: '1px solid black'}}
      src="https://www.wikipedia.org/"
      title="Wikipedia"
    ></Iframe>
  );
};

export const WithIntersectingIframe = () => {
  return (
    <div>
      <div
        style={{
          width: '100%',
          height: '20vh',
          backgroundColor: 'blue',
        }}
      ></div>
      <Iframe
        style={{width: 100, height: 100}}
        iframeStyle={{border: '1px solid black'}}
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="/examples/bento/amp-iframe-resizing-example.html"
      >
        <div placeholder>Placeholder</div>
      </Iframe>
      <p>The above iframe will not resize and should remain 100x100px</p>
    </div>
  );
};

WithIntersectingIframe.storyName = 'Resizable iframe in viewport';

export const WithResizableIframe = () => {
  return (
    <div>
      <div
        style={{
          width: '100%',
          height: '110vh', // so that iframe is outside viewport & allowed to resize
          backgroundColor: 'blue',
        }}
      ></div>
      <Iframe
        style={{width: 100, height: 100}}
        iframeStyle={{border: '1px solid black'}}
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="/examples/bento/amp-iframe-resizing-example.html"
      >
        <div placeholder>Placeholder</div>
      </Iframe>
      <p>The above iframe should be 300x300px when visible</p>
    </div>
  );
};

WithResizableIframe.storyName = 'Resizable iframe outside viewport';
