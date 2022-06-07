const singleQuote = /'/g;
const escapedSingleQuote = "\\'";

export function stylePropertyUrl(url: string): string {
  return `url('${url.replace(singleQuote, escapedSingleQuote)}') !important`;
}
