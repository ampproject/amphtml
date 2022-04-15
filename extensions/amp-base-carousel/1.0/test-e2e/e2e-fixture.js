import {getDefaultArgs} from '#bento/util/e2e-helpers';

import * as Preact from '#preact';
import {render} from '#preact';

import config, {_default as App} from '../storybook/Basic';

render(
  <App {...getDefaultArgs(config, App)} />,
  document.querySelector('#bento')
);
