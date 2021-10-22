/** @enum {string} */
export const FilterType = {
  CLICK_DELAY: 'clickDelay',
  CLICK_LOCATION: 'clickLocation',
  INACTIVE_ELEMENT: 'inactiveElement',
};

export class Filter {
  /**
   * @param {string} name The name given to this filter.
   * @param {!FilterType} type
   */
  constructor(name, type) {
    /** @const {string} */
    this.name = name;
    /** @const {!FilterType} */
    this.type = type;
  }

  /**
   * @param {!../../../../src/service/action-impl.ActionEventDef} unusedEvent
   * @return {boolean} Whether the exit is allowed.
   */
  filter(unusedEvent) {}

  /**
   * This function is expected to be called in the onLayoutMeasure function of
   * AmpAdExit element to do any measure work for the filter.
   */
  onLayoutMeasure() {}
}
