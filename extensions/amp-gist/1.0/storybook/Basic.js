import * as Preact from '#preact';

import {BentoGist} from '../component';
const GIST_ID = 'b9bb35bc68df68259af94430f012425f';
export default {
  title: 'Gist',
  component: BentoGist,
};

export const _default = () => {
  return <BentoGist style={{height: 500}} gistId={GIST_ID}></BentoGist>;
};
