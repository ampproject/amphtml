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
