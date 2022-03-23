export function isValidCurrencyCode(data: any) {
  try {
    Intl.NumberFormat('en-EN', {currency: data}).format(0);
    return true;
  } catch {
    return false;
  }
}
