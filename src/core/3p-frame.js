/**
 * Required flags to apply to the sandbox iframe.
 * @return {Array<string>}
 */
export const getRequiredSandboxFlags = () => [
  // This only allows navigation when user interacts and thus prevents
  // ads from auto navigating the user.
  'allow-top-navigation-by-user-activation',
  // Crucial because otherwise even target=_blank opened links are
  // still sandboxed which they may not expect.
  'allow-popups-to-escape-sandbox',
];

/**
 * These flags are not feature detected. Put stuff here where either
 * they have always been supported or support is not crucial.
 * @return {Array<string>}
 */
export const getOptionalSandboxFlags = () => [
  'allow-forms',
  // We should consider turning this off! But since the top navigation
  // issue is the big one, we'll leave this allowed for now.
  'allow-modals',
  // Give access to raw mouse movements.
  'allow-pointer-lock',
  // This remains subject to popup blocking, it just makes it supported
  // at all.
  'allow-popups',
  // This applies inside the iframe and is crucial to not break the web.
  'allow-same-origin',
  'allow-scripts',
  // Not allowed
  // - allow-top-navigation
  // - allow-orientation-lock
  // - allow-pointer-lock
  // - allow-presentation
];
