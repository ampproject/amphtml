export type AttributeRewriterDef = (
  tagName: string,
  attrName: string,
  attrValue: string
) => string;

export class Purifier {
  constructor(
    doc: Document,
    opt_config?: DOMPurify.Config,
    opt_attrRewrite?: AttributeRewriterDef
  );

  purifyHtml(dirty: string): HTMLElement;
  purifyTagsForTripleMustache(dirty: string): string;
  getAllowedTags(): {[key: string]: boolean};
  validateAttributeChange(
    node: Node,
    attr: string,
    value: string | null
  ): boolean;
}
