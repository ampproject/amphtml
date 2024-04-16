import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-inline-gallery-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-inline-gallery', version: '1.0'},
      {name: 'amp-base-carousel', version: '1.0'},
    ],
    experiments: ['bento'],
  },
  argTypes: {
    orientation: {
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    topIndicatorInset: false,
    bottomIndicatorInset: true,
    orientation: 'vertical',
    'auto-advance': false,
    'auto-advance-count': 1,
    'auto-advance-interval': 1000,
    'auto-advance-loops': 3,
    thumbnailsLoop: false,
    thumbnailsAspectRatio: '',
  },
};

export const Default = ({
  bottomIndicatorInset,
  thumbnailsAspectRatio,
  thumbnailsLoop,
  topIndicatorInset,
  ...args
}) => {
  return (
    <amp-inline-gallery style={{maxWidth: '360px'}} layout="container">
      <amp-inline-gallery-pagination
        layout={topIndicatorInset ? 'nodisplay' : 'fixed-height'}
        height={topIndicatorInset ? undefined : '24'}
        inset={topIndicatorInset}
      />
      <amp-inline-gallery-thumbnails
        aspectRatio={thumbnailsAspectRatio}
        loop={thumbnailsLoop}
        layout="fixed-height"
        height="50"
      />
      <amp-base-carousel {...args} width="360" height="240">
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
        <amp-img
          width="360"
          height="240"
          src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          data-thumbnail-src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
        ></amp-img>
      </amp-base-carousel>
      <amp-inline-gallery-pagination
        layout={bottomIndicatorInset ? 'nodisplay' : 'fixed-height'}
        height={bottomIndicatorInset ? undefined : '24'}
        inset={bottomIndicatorInset}
      />
    </amp-inline-gallery>
  );
};

Default.storyName = 'default';
