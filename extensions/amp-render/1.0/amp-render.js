import {Layout_Enum} from '#core/dom/layout';
import {computedStyle, setStyles} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {dev, user, userAssert} from '#utils/log';

import {BaseElement} from './base-element';
import {FetchJsonUtil, isAmpStateSrc} from './shared/amp-fetch-utils';

import {isAmpScriptUri} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-render';

/** @enum {string}  */
const Binding = {
  ALWAYS: 'always',
  REFRESH: 'refresh',
  NEVER: 'never',
  NO: 'no',
};

/**
 * @param {string} bindingValue
 * @param {boolean} isFirstMutation
 * @return {boolean} Whether bind should evaluate and apply changes.
 */
function getUpdateValue(bindingValue, isFirstMutation) {
  if (!bindingValue || bindingValue === Binding.REFRESH) {
    // default is 'refresh', so check that its not the first mutation
    return !isFirstMutation;
  }
  if (bindingValue === Binding.ALWAYS) {
    // TODO(dmanek): add link to amp-render docs that elaborates on performance implications of "always"
    user().warn(TAG, 'binding="always" has performance implications.');
    return true;
  }
  return false;
}

/**
 * Returns the non-empty node count in a template (defined as a `template`
 * or `script` element). This is required to establish if the template content has
 * a single wrapper element and if so we need to include it while rendering the
 * template. For more info, see https://github.com/ampproject/amphtml/issues/35401.
 * TODO(dmanek): Observe rewrapping at a lower level in BaseTemplate.
 * @param {!Document} doc
 * @param {?Element} template
 * @return {number} count of non-empty child nodes
 */
function getTemplateNonEmptyNodeCount(doc, template) {
  let childNodes = [];
  if (template.tagName === 'SCRIPT') {
    const div = doc.createElement('div');
    div./*OK*/ innerHTML = template./*OK*/ innerHTML;
    childNodes = div.childNodes;
  } else if (template.tagName === 'TEMPLATE') {
    childNodes = template.content.childNodes;
  }
  return toArray(childNodes).reduce(
    (count, node) =>
      count +
      Number(
        node.nodeType === Node.TEXT_NODE
          ? node.textContent.trim().length > 0
          : node.nodeType !== Node.COMMENT_NODE
      ),
    0
  );
}

export class AmpRender extends setSuperClass(
  BaseElement,
  AmpPreactBaseElement
) {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.template_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    if (layout === Layout_Enum.CONTAINER) {
      userAssert(
        this.getPlaceholder(),
        'placeholder required with layout="container"'
      );
    }
    return true;
  }

  /** @private */
  handleResizeToContentsAction_() {
    let currentHeight, targetHeight;
    this.measureMutateElement(
      () => {
        currentHeight = this.element./*OK*/ offsetHeight;
        targetHeight = this.element./*OK*/ scrollHeight;
        if (targetHeight < currentHeight) {
          // targetHeight is smaller than currentHeight, we need to shrink the height.
          const container = this.element.querySelector(
            'div[i-amphtml-rendered]'
          );
          targetHeight = container./*OK*/ scrollHeight;
          // Check if the first child has any margin-top and add it to the target height
          if (container.firstElementChild) {
            const marginTop = computedStyle(
              this.getAmpDoc().win,
              container.firstElementChild
            ).getPropertyValue('margin-top');
            targetHeight += parseInt(marginTop, 10);
          }
          // Check if the last child has any margin-bottom and add it to the target height
          if (container.lastElementChild) {
            const marginBottom = computedStyle(
              this.getAmpDoc().win,
              container.lastElementChild
            ).getPropertyValue('margin-bottom');
            targetHeight += parseInt(marginBottom, 10);
          }
        }
      },
      () => {
        this.forceChangeHeight(targetHeight);
      }
    );
  }

  /** @override */
  init() {
    this.src_ = this.element.getAttribute('src');
    this.fetchUtil_ = new FetchJsonUtil(TAG, this.element, this.src_);

    const hasAriaLive = this.element.hasAttribute('aria-live');
    if (!hasAriaLive) {
      this.element.setAttribute('aria-live', 'polite');
    }

    this.registerApiAction('refresh', (api) => {
      const src = this.element.getAttribute('src');
      // There is an alternative way to do this using `mutationObserverCallback` while using a boolean
      // variable `canRefresh`. See https://github.com/ampproject/amphtml/pull/33776#discussion_r614087734
      // for more context. This approach may be better if src does not mutate often. But the alternative might
      // be better if src mutatates often and component user does not use `refresh` action.
      if (!src || isAmpStateSrc(src) || isAmpScriptUri(src)) {
        return;
      }
      api.refresh();
    });

    this.registerAction('resizeToContents', () => {
      this.handleResizeToContentsAction_();
    });

    return {
      'ariaLiveValue': hasAriaLive
        ? this.element.getAttribute('aria-live')
        : 'polite',
      'getJson': this.fetchUtil_.getFetchJsonCallback(),
    };
  }

  /** @override */
  handleOnLoad() {
    this.toggleLoading(false);
    if (this.element.getAttribute('layout') !== Layout_Enum.CONTAINER) {
      this.togglePlaceholder(false);
      return;
    }

    let componentHeight, contentHeight;
    // TODO(dmanek): Look into using measureIntersection instead
    this.measureMutateElement(
      () => {
        componentHeight = computedStyle(
          this.getAmpDoc().win,
          this.element
        ).getPropertyValue('height');
        contentHeight = this.element.querySelector(
          '[i-amphtml-rendered]'
        )./*OK*/ scrollHeight;
      },
      () => {
        setStyles(this.element, {
          'overflow': 'hidden',
          'height': componentHeight,
        });
      }
    ).then(() => {
      return this.attemptChangeHeight(contentHeight)
        .then(() => {
          this.togglePlaceholder(false);
          setStyles(this.element, {
            'overflow': '',
          });
        })
        .catch(() => {
          this.togglePlaceholder(false);
        });
    });
  }

  /** @override */
  mutationObserverCallback() {
    const src = this.element.getAttribute('src');
    if (src === this.src_) {
      return;
    }
    this.src_ = src;
    this.mutateProps({'getJson': this.fetchUtil_.getFetchJsonCallback()});
  }

  /**
   * @param {!JsonObject} data
   * @return {!Promise<!Element>}
   * @private
   */
  renderTemplateAsString_(data) {
    return this.templates_
      .renderTemplateAsString(dev().assertElement(this.template_), data)
      .then((html) => ({
        '__html': html,
      }));
  }

  /** @override */
  checkPropsPostMutations() {
    const templates =
      this.templates_ ||
      (this.templates_ = Services.templatesForDoc(this.element));
    const template = templates.maybeFindTemplate(this.element);
    if (template === this.template_) {
      return;
    }
    this.template_ = template;
    if (!template) {
      this.mutateProps({'render': null});
      return;
    }

    // Only overwrite `render` when template is ready to minimize FOUC.
    templates.whenReady(template).then(() => {
      if (template !== this.template_) {
        // A new template has been set while the old one was initializing.
        return;
      }
      this.mutateProps({
        'render': (data) => {
          const bindingValue = this.element.getAttribute('binding');
          if (bindingValue === Binding.NEVER || bindingValue === Binding.NO) {
            return this.renderTemplateAsString_(data);
          }
          return Services.bindForDocOrNull(this.element).then((bind) => {
            if (!bind) {
              return this.renderTemplateAsString_(data);
            }
            const nonEmptyNodeCount = getTemplateNonEmptyNodeCount(
              this.element.ownerDocument,
              template
            );
            return templates
              .renderTemplate(dev().assertElement(template), data)
              .then((element) => {
                return bind
                  .rescan([element], [], {
                    'fast': true,
                    'update': getUpdateValue(
                      bindingValue,
                      // bind.signals().get('FIRST_MUTATE') returns timestamp (in ms) when first
                      // mutation occured, which is null for the initial render
                      bind.signals().get('FIRST_MUTATE') === null
                    ),
                  })
                  .then(() => ({
                    // We should use innerHTML when the template lacks a wrapper
                    // element, outerHTML otherwise in order to include the wrapper
                    // element itself.
                    '__html':
                      nonEmptyNodeCount === 1
                        ? element./* OK */ outerHTML
                        : element./* OK */ innerHTML,
                  }));
              });
          });
        },
      });
    });
  }

  /**
   * TODO: this implementation is identical to one in amp-date-display &
   * amp-date-countdown. Move it to a common file and import it.
   * @override
   */
  isReady(props) {
    // If a template is specified, then it must be available.
    return !this.template_ || 'render' in props;
  }
}

/**
 * This is disabled to remove the fill content style in the AMP layer.
 * @override
 */
AmpRender['layoutSizeDefined'] = false;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpRender);
});
