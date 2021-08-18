

import {addons} from '@storybook/addons';

/**
 * Register the AMP Storybook decorator addon
 */
export function register() {
  addons.register('amp/storybook', () => {});
}
