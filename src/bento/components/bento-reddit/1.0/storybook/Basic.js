import {BentoReddit} from '#bento/components/bento-reddit/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Reddit',
  component: BentoReddit,
};

export const _default = () => {
  return (
    <div>
      <BentoReddit
        style={{width: 300, height: 200}}
        embedType="post"
        src="https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed"
      ></BentoReddit>
    </div>
  );
};

export const comments = () => {
  return (
    <div>
      <BentoReddit
        style={{width: 300, height: 400}}
        embedType="comment"
        src="https://www.reddit.com/r/sports/comments/54loj1/50_cents_awful_1st_pitch_given_a_historical/d8306kw"
        uuid="b1246282-bd7b-4778-8c5b-5b08ac0e175e"
        embedCreated="2016-09-26T21:26:17.823Z"
        embedParent="true"
        embedLive="true"
      ></BentoReddit>
    </div>
  );
};
