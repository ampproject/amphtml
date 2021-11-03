import {ClickDelayFilter} from './click-delay';
import {ClickLocationFilter} from './click-location';
import {FilterType_Enum} from './filter';
import {InactiveElementFilter} from './inactive-element';

/**
 * @param {string} name
 * @param {!../config.FilterConfig} spec
 * @param {!../amp-ad-exit.AmpAdExit} adExitInstance
 * @return {!./filter.Filter|undefined}
 */
export function createFilter(name, spec, adExitInstance) {
  switch (spec.type) {
    case FilterType_Enum.CLICK_DELAY:
      return new ClickDelayFilter(
        name,
        /** @type {!../config.ClickDelayConfig} */ (spec),
        adExitInstance.win
      );
    case FilterType_Enum.CLICK_LOCATION:
      return new ClickLocationFilter(name, spec, adExitInstance);
    case FilterType_Enum.INACTIVE_ELEMENT:
      return new InactiveElementFilter(
        name,
        /** @type {!../config.InactiveElementConfig} */ (spec)
      );
    default:
      return undefined;
  }
}
