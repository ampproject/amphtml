import * as Preact from '#preact';

import {BentoGist} from '../component';
export default {
  title: 'Gist',
  component: BentoGist,
};

export const _default = () => {
  return (
    <BentoGist
      style={{height: 500}}
      gistId="b9bb35bc68df68259af94430f012425f"
    ></BentoGist>
  );
};

export const singleFile = () => {
  return (
    <BentoGist
      style={{height: 500}}
      gistId="a19e811dcd7df10c4da0931641538497"
      file="index.js"
    ></BentoGist>
  );
};
