declare module '#core/dom' {
  function removeElement(Element): void;
}

declare module '#core/dom/style' {
  type StyleSet = Record<string, any>;
  function getVendorJsPropertyName(StyleSet, string, boolean?): string;
  function setStyles(Element, StyleSet): void;
}
