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

import * as Preact from '../../../../src/preact';
import {makeDecorator} from '@storybook/addons';
import flush from 'styled-jsx/server';
import render from 'preact-render-to-string/jsx';

export default makeDecorator({
  name: 'withAmpDecorator',
  parameterName: 'amp',
  wrapper: (getStory, context) => {
    const contents = render(getStory(context));
    const styleElements = flush();
    const styles = render(
      <style
        amp-custom=""
        dangerouslySetInnerHTML={{
          __html: styleElements
            .map((style) => style.props.dangerouslySetInnerHTML.__html)
            .join('')
            .replace(/\/\*# sourceMappingURL=.*\*\//g, '')
            .replace(/\/\*@ sourceURL=.*?\*\//g, ''),
        }}
      />
    );

    const ampHtml = `
        <!doctype html>
        <html amp lang="en">
        <head>
            <meta charSet="utf-8" />
            <title>AMP Page Example</title>
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
            ${(context?.parameters?.extensions || []).map(
              (ext) =>
                `<script async custom-element="${
                  ext.name
                }" src="https://cdn.ampproject.org/v0/${ext.name}-${
                  ext.version || 0.1
                }.js"></script>`
            )}
            ${styles}
        </head>
        <body>
            ${contents}
        </body>
        </html>
    `;
    const blob = new Blob([ampHtml], {type: 'text/html'});

    return (
      <iframe
        src={URL.createObjectURL(blob)}
        title={'AMP Document container'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#fff',
        }}
      />
    );
  },
});
