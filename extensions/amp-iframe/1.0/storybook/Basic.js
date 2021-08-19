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
      style={{width: 800, height: 600, borderWidth: 2}}
      src="https://www.wikipedia.org/"
      title="Wikipedia"
    ></Iframe>
  );
};

export const WithIntersectingIframe = () => {
  return (
    <Iframe
      style={{borderWidth: 2}}
      width="100"
      height="100"
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
  const textAbove = text('text above', sampleText.repeat(10));
  const textBelow = text('text below', sampleText.repeat(10));
  return (
    <div>
      <h1>{textAbove}</h1>
      <Iframe
        style={{borderWidth: 2}}
        width="100"
        height="100"
        sandbox="allow-scripts allow-same-origin"
        resizable
        src="/examples/bento/amp-iframe-resizing-example.html"
      >
        <div placeholder>Placeholder</div>
      </Iframe>
      <h1>{textBelow}</h1>
    </div>
  );
};

WithResizableIframe.storyName = 'Resizable iframe outside viewport';
