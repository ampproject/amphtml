/**
 * @param Ctor
 */
function createBentoContainer(Ctor, element) {
  const isShadow = Ctor['usesShadowDom'];
  const lightDomTag = isShadow ? null : Ctor['lightDomTag'];
  const isDetached = Ctor['detached'];
  const doc = element.ownerDoc;

  if (isShadow) {
    devAssert(
      !isDetached,
      'The AMP element cannot be rendered in detached mode ' +
        'when "props" are configured with "children" property.'
    );
    // Check if there's a pre-constructed shadow DOM.
    let {shadowRoot} = this.element;
    let container = shadowRoot && childElementByTag(shadowRoot, 'c');
    if (container) {
      this.hydrationPending_ = true;
    } else {
      // Create new shadow root.
      shadowRoot = this.element.attachShadow({
        mode: 'open',
        delegatesFocus: Ctor['delegatesFocus'],
      });

      // The pre-constructed shadow root is required to have the stylesheet
      // inline. Thus, only the new shadow roots share the stylesheets.
      const shadowCss = Ctor['shadowCss'];
      if (shadowCss) {
        installShadowStyle(shadowRoot, this.element.tagName, shadowCss);
      }

      // Create container.
      // The pre-constructed shadow root is required to have this container.
      container = createElementWithAttributes(doc, 'c', SHADOW_CONTAINER_ATTRS);
      shadowRoot.appendChild(container);

      // Create a slot for internal service elements i.e. "i-amphtml-sizer".
      // The pre-constructed shadow root is required to have this slot.
      const serviceSlot = createElementWithAttributes(
        doc,
        'slot',
        SERVICE_SLOT_ATTRS
      );
      shadowRoot.appendChild(serviceSlot);
      this.getPlaceholder?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
      this.getFallback?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
      this.getOverflowElement?.()?.setAttribute('slot', SERVICE_SLOT_NAME);
    }
    this.container_ = container;

    // Connect shadow root to the element's context.
    setParent(shadowRoot, this.element);
    // In Shadow DOM, only the children distributed in
    // slots are displayed. All other children are undisplayed. We need
    // to create a simple mechanism that would automatically compute
    // `CanRender = false` on undistributed children.
    addGroup(this.element, UNSLOTTED_GROUP, MATCH_ANY, /* weight */ -1);
    // eslint-disable-next-line local/restrict-this-access
    setGroupProp(this.element, UNSLOTTED_GROUP, CanRender, this, false);
  } else if (lightDomTag) {
    this.container_ = this.element;
    const replacement =
      childElementByAttr(this.container_, RENDERED_ATTR) ||
      createElementWithAttributes(doc, lightDomTag, RENDERED_ATTRS);
    replacement[RENDERED_PROP] = true;
    if (Ctor['layoutSizeDefined']) {
      replacement.classList.add('i-amphtml-fill-content');
    }
    this.container_.appendChild(replacement);
  } else {
    const container = doc.createElement('i-amphtml-c');
    this.container_ = container;
    applyFillContent(container);
    if (!isDetached) {
      this.element.appendChild(container);
    }
  }
}
