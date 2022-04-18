/**
 * No effect on runtime. Merely an annotation for the compiler to deeply add
 * #__PURE__ comments to an expression
 * See babel-plugin-deep-pure
 * @param {T} value
 * @return {T}
 * @template T
 */
export const pure = (value) => value;
