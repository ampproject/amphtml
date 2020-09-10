/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '../../../../src/preact';
import {select, text, withKnobs} from '@storybook/addon-knobs';
import {storiesOf} from '@storybook/preact';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

// eslint-disable-next-line
storiesOf('amp-social-share-0_1', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .addDecorator(withAmp)
  .addParameters({extensions: [{name: 'amp-social-share', version: 0.1}]})
  .add('default', () => {
    /*
     * Knob and Component Details -
     * amp-social-share allows the user to set various parameters to configure
     * its behavior.  These parameters are controlled by storybook knobs and
     * are summarized below:
     *
     * Key Configuration Parameters -
     * type - This is a required attribute.  It configures a pre-configured set
     *   of parameters needed to share with a particular social-media.  Most
     *   notably, the share-endpoint is set by the type.  Configuration details
     *   can be found in amp-social-share-config.js.  The user may also select
     *   'custom' with this knob to manually specify the required parameters.
     *   Setting any of the other attributes below overwrites the
     *   pre-configured parameters defined by the type.
     * data-share-endpoint - This is the api endpoint of the social-media with
     *   which to share content.
     * data-param-url - This is the url to be shared via social-media.  It
     *   is defaulted to the canonical url of the current amp page in most
     *   cases where it is used in the pre-configured types.
     *
     * Other Configuration Parameters -
     * data-param-text - This is a text value included in the shared media.
     * data-param-attribution - This allows the user to specify where the
     *   share is attributed to.
     * data-param-media - This is used to specify a path to media (image) to
     *   be shared when sharing via Pinterest.
     * data-param-app_id - This is used when sharing with Facebook and is
     *   defaulted to an amp test app.
     */
    const typeConfigurations = [
      'email',
      'facebook',
      'linkedin',
      'pinterest',
      'tumblr',
      'twitter',
      'whatsapp',
      'line',
      'sms',
      'system',
      'custom',
      undefined,
    ];
    const type = select('type', typeConfigurations, typeConfigurations[0]);
    const customEndpoint = text('data-share-endpoint', undefined);
    const paramUrl = text('data-param-url', undefined);
    const paramText = text('data-param-text', undefined);
    const paramAttribution = text('data-param-attribution', undefined);
    const paramMedia = text('data-param-media', undefined);
    const appId = text('data-param-app_id', '254325784911610');
    const width = text('width', undefined);
    const height = text('height', undefined);
    return (
      <amp-social-share
        type={type}
        data-share-endpoint={customEndpoint}
        data-param-text={paramText}
        data-param-url={paramUrl}
        data-param-attribution={paramAttribution}
        data-param-media={paramMedia}
        data-param-app_id={appId}
        width={width}
        height={height}
      ></amp-social-share>
    );
  });
