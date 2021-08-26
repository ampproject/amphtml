import * as Preact from '#preact';
import {Iframe} from '../component';
import {text, withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Iframe',
  component: Iframe,
  decorators: [withKnobs],
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
    <Iframe
      style={{width: 100, height: 100}}
      iframeStyle={{border: '1px solid black'}}
      sandbox="allow-scripts allow-same-origin"
      resizable
      src="/examples/bento/amp-iframe-resizing-example.html"
    >
      <div placeholder>Placeholder</div>
    </Iframe>
  );
};

WithIntersectingIframe.storyName = 'Resizable iframe in viewport';

export const WithResizableIframe = () => {
  const sampleText =
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore, beatae repellat, eligendi tempora, cumque veniam voluptatibus amet cum aliquid aut aperiam officiis autem pariatur. Nemo cum maxime vitae. Consectetur, iure?';
  const textAbove = text('text above', sampleText.repeat(20));
  const textBelow = text('text below', sampleText.repeat(5));
  return (
    <div>
      <h1>{textAbove}</h1>
      <Iframe
        style={{width: 100, height: 100}}
        iframeStyle={{border: '1px solid black'}}
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="/examples/bento/amp-iframe-resizing-example.html"
      >
        <div placeholder>Placeholder</div>
      </Iframe>
      <p>The above iframe should resize to 300x300px when visible</p>
      <h1>{textBelow}</h1>
    </div>
  );
};

WithResizableIframe.storyName = 'Resizable iframe outside viewport';
