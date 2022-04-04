import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-list-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-list', version: '1.0'},
      {name: 'amp-mustache', version: '0.2'},
    ],
    experiments: ['bento'],
  },
  args: {},
};

export const BasicExample = (args) => {
  return (
    <div style={{outline: '1px solid blue', margin: 2}}>
      <amp-list
        {...args}
        src="https://jsonplaceholder.typicode.com/users"
        items="."
      >
        <template
          type="amp-mustache"
          dangerouslySetInnerHTML={{
            __html: `
              {{% raw %}}
              <div>
                <h3>Name: {{name}} ({{username}})</h3>
                <p>Contact: {{email}}; {{phone}}</p>
              </div>
              {{% endraw %}}
            `,
          }}
        />
      </amp-list>
    </div>
  );
};
