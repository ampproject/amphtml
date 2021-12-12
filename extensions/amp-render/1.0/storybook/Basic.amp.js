import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-render-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-mustache', version: '0.2'},
      {name: 'amp-bind', version: '0.1'},
      {name: 'amp-render', version: '1.0'},
      {name: 'amp-script', version: '0.1'},
    ],
    experiments: ['amp-render'],
  },
};

export const WithAmpState = () => {
  const content = JSON.stringify({'name': 'Bill'});

  return (
    <>
      <amp-state id="someData">
        <script
          type="application/json"
          dangerouslySetInnerHTML={{__html: content}}
        ></script>
      </amp-state>

      <amp-render
        src="amp-state:someData"
        width="300"
        height="400"
        layout="fixed"
      >
        <template type="amp-mustache">{`Hi {{name}}!`}</template>
      </amp-render>
    </>
  );
};

WithAmpState.storyName = 'With AMP State';

export const WithRemoteSrc = (args) => {
  return (
    <amp-render {...args} width="300" height="400" layout="fixed">
      <div placeholder style={{background: 'blue'}}>
        placeholder
      </div>
      <div fallback style={{background: 'red'}}>
        fallback
      </div>
      <template type="amp-mustache">{`Hi {{name}}!`}</template>
    </amp-render>
  );
};

WithRemoteSrc.storyName = 'With remote src';
WithRemoteSrc.args = {
  src: 'http://localhost:9001/examples/amp-render-data.json',
};

export const WithBindableSrc = () => {
  return (
    <>
      <amp-render
        data-amp-bind-src="bindSrc"
        src="https://amp.dev/static/samples/json/examples.json"
        width="300"
        height="200"
        layout="fixed"
      >
        <template type="amp-mustache">
          <ul>
            {`{{#items}}`}
            <li>{`{{title}}`}</li>
            {`{{/items}}`}
          </ul>
        </template>
      </amp-render>

      <button on="tap:AMP.setState({ bindSrc: 'https://amp.dev/static/samples/json/examples2.json' })">
        Change source
      </button>
    </>
  );
};

WithBindableSrc.storyName = 'With bindable src';

export const WithAmpScriptSrc = () => {
  return (
    <>
      <amp-script id="dataFunctions" script="local-script" nodom></amp-script>
      <script id="local-script" type="text/plain" target="amp-script">
        {`
        function getRemoteData() {
          return fetch('https://amp.dev/static/samples/json/examples2.json')
            .then(function(resp) { return resp.json(); });
        }
        exportFunction('getRemoteData', getRemoteData);
        `}
      </script>

      <amp-render
        src="amp-script:dataFunctions.getRemoteData"
        width="auto"
        height="100"
        layout="fixed-height"
      >
        <template type="amp-mustache">
          <ul>
            {`{{#items}}`}
            <li>{`{{title}}`}</li>
            {`{{/items}}`}
          </ul>
        </template>
      </amp-render>
    </>
  );
};

WithAmpScriptSrc.storyName = 'With AMP script src';

export const WithRefreshButton = () => {
  return (
    <>
      <amp-render
        id="my-amp-render"
        src="https://amp.dev/static/samples/json/examples.json"
        width="300"
        height="200"
        layout="fixed"
      >
        <template type="amp-mustache">
          <ul>
            {`{{#items}}`}
            <li>{`{{title}}`}</li>
            {`{{/items}}`}
          </ul>
        </template>
      </amp-render>

      <button on="tap:my-amp-render.refresh">Refresh data</button>
    </>
  );
};

WithBindableSrc.storyName = 'With bindable src';
