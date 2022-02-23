import * as Preact from '#preact';

import {BentoIframe} from '../component';

export default {
  title: 'Iframe',
  component: BentoIframe,
  argTypes: {
    src: {
      name: 'iframe src',
      defaultValue: 'https://www.wikipedia.org/',
      control: {type: 'text'},
    },
  },
};

export const _default = ({src}) => {
  return (
    <BentoIframe
      style={{width: 800, height: 600}}
      iframeStyle={{border: '1px solid black'}}
      src={src}
      title="Wikipedia"
    ></BentoIframe>
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
      <BentoIframe
        style={{width: 100, height: 100}}
        iframeStyle={{border: '1px solid black'}}
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="/examples/bento/amp-iframe-resizing-example.html"
      >
        <div placeholder>Placeholder</div>
      </BentoIframe>
      <p>The above iframe will not resize and should remain 100x100px</p>
    </div>
  );
};

export const WithResizableIframe = () => {
  return (
    <div>
      <h1>Scroll down</h1>
      <div
        style={{
          width: '100%',
          height: '110vh', // so that iframe is outside viewport & allowed to resize
          backgroundColor: 'blue',
        }}
      ></div>
      <BentoIframe
        style={{width: 100, height: 100}}
        iframeStyle={{border: '1px solid black'}}
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="/examples/bento/amp-iframe-resizing-example.html"
      >
        <div placeholder>Placeholder</div>
      </BentoIframe>
      <p>The above iframe should be 300x300px when visible</p>
    </div>
  );
};

export const WithSendIntersectionsPostMessage = () => {
  return (
    <div>
      <h1>Scroll down</h1>
      <div
        style={{
          width: '100%',
          height: '110vh', // so that iframe is outside viewport
          backgroundColor: 'blue',
        }}
      ></div>
      <BentoIframe
        style={{width: 500, height: 500}}
        iframeStyle={{border: '1px solid black'}}
        sandbox="allow-scripts allow-same-origin"
        src="/examples/bento/amp-iframe-send-intersections-example.html"
      >
        <div placeholder>Placeholder</div>
      </BentoIframe>
    </div>
  );
};
