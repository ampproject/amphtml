import {ClickDelayFilter} from './click-delay';
import {ClickLocationFilter} from './click-location';
import {FILTER_TYPE_ENUM} from './filter';
import {InactiveElementFilter} from './inactive-element';

/**
 * @param {string} name
 * @param {!../config.FilterConfig} spec
 * @param {!../amp-ad-exit.AmpAdExit} adExitInstance
 * @return {!./filter.Filter|undefined}
 */
export function createFilter(name, spec, adExitInstance) {
  switch (spec.type) {
    case FILTER_TYPE_ENUM.CLICK_DELAY:
      return new ClickDelayFilter(
        name,
        /** @type {!../config.ClickDelayConfig} */ (spec),
        adExitInstance.win
      );
    case FILTER_TYPE_ENUM.CLICK_LOCATION:
      return new ClickLocationFilter(name, spec, adExitInstance);
    case FILTER_TYPE_ENUM.INACTIVE_ELEMENT:
      return new InactiveElementFilter(
        name,
        /** @type {!../config.InactiveElementConfig} */ (spec)
      );
    default:
      return undefined;
  }
}
