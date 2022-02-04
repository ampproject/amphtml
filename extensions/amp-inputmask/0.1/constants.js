export const MaskChars = {
  ALPHANUMERIC_REQUIRED: 'A',
  ALPHANUMERIC_OPTIONAL: 'a',
  ALPHABETIC_REQUIRED: 'L',
  ALPHABETIC_OPTIONAL: 'l',
  ARBITRARY_REQUIRED: 'C',
  ARBITRARY_OPTIONAL: 'c',
  NUMERIC_REQUIRED: '0',
  NUMERIC_OPTIONAL: '9',
  ESCAPE: '\\',
};

export const MASK_SEPARATOR_CHAR = ' ';

export const NamedMasks = {
  PAYMENT_CARD: 'payment-card',
  DATE_DD_MM_YYYY: 'date-dd-mm-yyyy',
  DATE_MM_DD_YYYY: 'date-mm-dd-yyyy',
  DATE_MM_YY: 'date-mm-yy',
  DATE_YYYY_MM_DD: 'date-yyyy-mm-dd',
};

/** @enum {string} */
export const OutputMode = {
  RAW: 'raw',
  ALPHANUMERIC: 'alphanumeric',
};
