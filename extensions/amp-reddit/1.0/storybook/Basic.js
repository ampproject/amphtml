import * as Preact from '#preact';

import {BentoReddit} from '../component';

export default {
  title: 'Reddit',
  component: BentoReddit,
};

export const _default = () => {
  return (
    <BentoReddit
      style={{width: 300, height: 200}}
      src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
    ></BentoReddit>
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
