import {withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {Reddit} from '../component';

export default {
  title: 'Reddit',
  component: Reddit,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <Reddit
      style={{width: 300, height: 200}}
      src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
    ></Reddit>
  );
};
// options={{"src":"https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"}}

// <Reddit
//   style={{width: 300, height: 200}}
//   bootstrap="./vendor/reddit.max.js"
//   src="http://ads.localhost:8000/dist.3p/current/frame.max.html"
//   options={{"src":"https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"}}
// >
// </Reddit>
