/**
 * A list of options to correspond with options.json for testing purposes.
 * To add an option, add the corresponding key-value pair into the
 * options.json, then add the field to this interface.
 */
export interface OptionSet {
  minified?: boolean;
  esm?: boolean;
  port?: number;
  fortesting?: boolean;
  looseOriginUrlCheck?: boolean;
  useMaxNames?: boolean;
}
