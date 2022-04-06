/**
 * DO NOT USE THIS FUNCTION DIRECTLY.
 * It's meant only to be used by babel plugin output.
 * You should import `src/config/urls` instead.
 * @return {{[string: string]: string|RegExp}|string|RegExp}
 */
export const ampConfigUrlsDoNotImportMeUseConfigUrlsInstead = () => {
  // @ts-ignore
  return self.AMP.config.urls;
};
