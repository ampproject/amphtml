import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-iframe-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-iframe', version: '1.0'}],
    experiments: ['bento'],
  },
  argTypes: {
    src: {
      name: 'iframe src',
      defaultValue: 'https://www.wikipedia.org/',
      control: {type: 'text'},
    },
  },
};

export const WithSrc = ({src}) => {
  return <amp-iframe width="800" height="600" src={src}></amp-iframe>;
};

export const WithPlaceholder = ({src}) => {
  return (
    <amp-iframe width="800" height="600" src={src}>
      <h1 placeholder>Placeholder</h1>
      <h1 fallback>Fallback</h1>
    </amp-iframe>
  );
};

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
      </amp-iframe>
      <h3>
        The above iframe should be 100x100 px and should not resize on page load
        due to this content. On clicking the "Resize" button, it will toggle
        size between 200x200 px and 300x300 px.
      </h3>
    </div>
  );
};

export const WithOverflowButton = () => {
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
        <button overflow>Show More</button>
      </amp-iframe>
      <h3>Click the "Show More" button to resize the iframe</h3>
    </div>
  );
};
