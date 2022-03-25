/**
 * Validates that a string value is a currency code listed in
 * ISO 4217.
 * To use in imported JSON Schemas, see instructions on
 * build-system/compile/json-schema/README.md
 */
export function isIso4217CurrencyCode(data: any): boolean {
  try {
    Intl.NumberFormat('en-EN', {currency: data}).format(0);
    return true;
  } catch {
    return false;
  }
}
