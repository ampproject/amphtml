/**
 * Describes the contract for an inputmask UX controller.
 * @interface
 */
export class MaskInterface {
  /**
   * Initialize an inputmask UX for an input element using the given mask.
   * The constructor does not apply the mask to the element.
   * @param {!Element} unusedElement
   * @param {string} unusedMask
   */
  constructor(unusedElement, unusedMask) {}

  /**
   * Apply the mask to the element.
   */
  mask() {}

  /**
   * Get the value of the masked element.
   * @return {string}
   */
  getValue() {}

  /**
   * Get the unmasked value from the element
   * @return {string}
   */
  getUnmaskedValue() {}

  /**
   * Removes the inputmask from the input element UX and cleans up any resources
   * consumed by the controller.
   */
  dispose() {}
}
