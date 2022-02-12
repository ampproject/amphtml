import {BentoReddit} from '#bento/components/bento-reddit/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Reddit',
  component: BentoReddit,
};

export const _default = () => {
  return (
    <div>
      <h1>HELLO FRESH</h1>
      <BentoReddit
        style={{width: 300, height: 200}}
        embedAs="comment"
        src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
      ></BentoReddit>
    </div>
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
