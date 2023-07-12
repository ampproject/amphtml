import {BentoImgur} from '#bento/components/bento-imgur/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Imgur',
  component: BentoImgur,
  args: {
    style: {
      width: 300,
      height: 200,
    },
  },
};

const shipTraffic = 'a/Jz6KlaV';
const fancyCatGallery = 'a/4lyX4Uu';
const fancyCat3 = 'HmZxgDE';
const starWarsAtAt = 'a/JQlTKVh';

const medium = {width: 600, height: 200};
const small = {width: 300, height: 200};

export const Medium = (args) => {
  return <BentoImgur {...args} imgurId={shipTraffic} style={medium} />;
};
export const Small = (args) => {
  return <BentoImgur {...args} imgurId={shipTraffic} style={small} />;
};
export const InvalidID = (args) => {
  return <BentoImgur {...args} imgurId="a/INVALID" />;
};
export const Single = (args) => {
  return <BentoImgur {...args} imgurId={fancyCat3} />;
};
export const ImageGallery = (args) => {
  return <BentoImgur {...args} imgurId={fancyCatGallery} />;
};
export const VideoGallery = (args) => {
  return <BentoImgur {...args} imgurId={starWarsAtAt} />;
};
