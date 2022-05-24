import {BentoAutocomplete} from '#bento/components/bento-autocomplete/1.0/component';

import * as Preact from '#preact';
import {xhrUtils} from '#preact/utils/xhr';

import '../component.jss';

export default {
  title: 'Autocomplete',
  component: BentoAutocomplete,
  args: {
    items: [
      'apple',
      'banana',
      'cherry',
      'orange',
      'pear',
      'pineapple',
      'strawberry',
      'watermelon',
      'lemon',
      'lime',
    ],
    filter: 'prefix',
    minChars: 1,
    highlightUserEntry: true,
    suggestFirst: false,
    onError: console.error,
  },
  argTypes: {
    filter: {
      control: {
        type: 'select',
        options: ['none', 'prefix', 'fuzzy', 'substring', 'token-prefix'],
      },
    },
  },
};

export const _default = (args) => {
  return (
    <BentoAutocomplete {...args}>
      <input type="text"></input>
    </BentoAutocomplete>
  );
};

export const inline = (args) => {
  return (
    <BentoAutocomplete {...args}>
      <textarea></textarea>
    </BentoAutocomplete>
  );
};

inline.args = {
  inline: ':',
};

// eslint-disable-next-line local/no-export-side-effect
export const withCustomItems = _default.bind();

withCustomItems.args = {
  items: [
    {
      city: 'Seattle',
      state: 'WA',
      emoji: '🦦',
    },
    {
      city: 'San Francisco',
      state: 'CA',
      emoji: '🌉',
    },
    {
      city: 'New York',
      state: 'NY',
      emoji: '🌇',
    },
  ],
  filterValue: 'city',
  itemTemplate: ({city, emoji, state}) => {
    return (
      <div data-value={`${city}, ${state}`}>
        {emoji} {city}, {state}
      </div>
    );
  },
};

// eslint-disable-next-line local/no-export-side-effect
export const withDataFromApi = _default.bind({});

withDataFromApi.args = {
  items: null,
  src: 'https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest',
  fetchJson: (src) => xhrUtils.fetchJson(src),
  parseJson: (json) => {
    return json.data.map((v) => ({state: v.State, population: v.Population}));
  },
  filterValue: 'state',
  itemTemplate: ({population, state}) => {
    return (
      <div data-value={state}>
        {state} - <span style={{color: 'gray'}}>{population}</span>
      </div>
    );
  },
};
