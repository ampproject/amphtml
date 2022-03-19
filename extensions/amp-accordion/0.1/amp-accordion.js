import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import {bezierCurve} from '#core/data-structures/curve';
import {dispatchCustomEvent, tryFocus} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';
import {closest, realChildElements} from '#core/dom/query';
import {getStyle, setImportantStyles, setStyles} from '#core/dom/style';
import {
  numeric,
  px,
  setStyles as setStylesTransition,
} from '#core/dom/transition';
import {clamp} from '#core/math';
import {parseJson} from '#core/types/object/json';

import {Services} from '#service';

import {Animation} from '#utils/animation';
import {createCustomEvent} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-accordion-0.1.css';
import {removeFragment} from '../../../src/url';

const TAG = 'amp-accordion';
const MAX_TRANSITION_DURATION = 500; // ms
const MIN_TRANSITION_DURATION = 200; // ms
const EXPAND_CURVE_ = bezierCurve(0.47, 0, 0.745, 0.715);
const COLLAPSE_CURVE_ = bezierCurve(0.39, 0.575, 0.565, 1);

class AmpAccordion extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Array<!Element>} */
    this.headers_ = [];

    /** @private {?string} */
    this.sessionId_ = null;

    /** @private {?JsonObject} */
    this.currentState_ = null;

    /** @private {boolean} */
    this.sessionOptOut_ = false;

    /** @private {?Array<!Element>} */
    this.sections_ = null;

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {number|string} */
    this.prefix_ = element.id ? element.id : Math.floor(Math.random() * 100);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.action_ = Services.actionServiceForDoc(this.element);
    this.sessionOptOut_ = this.element.hasAttribute('disable-session-states');

    // sessionStorage key: special created id for this element, this.sessionId_.
    // sessionStorage value: string that can convert to this.currentState_ obj.
    this.sessionId_ = this.getSessionStorageKey_();
    this.currentState_ = this.getSessionState_();

    this.sections_ = realChildElements(this.element);
    this.sections_.forEach((section, index) => {
      userAssert(
        section.tagName.toLowerCase() == 'section',
        'Sections should be enclosed in a <section> tag, ' +
          'See https://github.com/ampproject/amphtml/blob/main/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s',
        this.element
      );
      const sectionComponents = section.children;
      userAssert(
        sectionComponents.length == 2,
        'Each section must have exactly two children. ' +
          'See https://github.com/ampproject/amphtml/blob/main/extensions/' +
          'amp-accordion/amp-accordion.md. Found in: %s',
        this.element
      );
      const {0: header, 1: content} = sectionComponents;
      content.classList.add('i-amphtml-accordion-content');

      // Ensure each accordion has a unique id, helping screen readers
      // understand the relationship between the pieces of content.
      let contentId = content.getAttribute('id');
      if (!contentId) {
        contentId = this.prefix_ + '_AMP_content_' + index;
        content.setAttribute('id', contentId);
      }
      let headerId = header.getAttribute('id');
      if (!headerId) {
        headerId = this.prefix_ + '_AMP_header_' + index;
        header.setAttribute('id', headerId);
      }

      this.registerAction('toggle', (i) => this.handleAction_(i));
      this.registerAction('expand', (i) => this.handleAction_(i));
      this.registerAction('collapse', (i) => this.handleAction_(i));
      /** If the element is in an email document, allow its `open` and `close` actions. */
      this.action_.addToAllowlist(
        TAG,
        ['toggle', 'expand', 'collapse'],
        ['email']
      );

      // Listen for mutations on the 'data-expand' attribute.
      const expandObserver = new this.win.MutationObserver((mutations) => {
        // [data-expand] mutations can only be triggered by AMP.setState which
        // requires "default" trust.
        this.toggleExpandMutations_(mutations, ActionTrust_Enum.DEFAULT);
      });
      expandObserver.observe(section, {
        attributes: true,
        attributeFilter: ['data-expand'],
      });

      if (this.currentState_[contentId]) {
        section.setAttribute('expanded', '');
      } else if (this.currentState_[contentId] === false) {
        section.removeAttribute('expanded');
      }
      this.mutateElement(() => {
        // Just mark this element as dirty since we changed the state
        // based on runtime state. This triggers checking again
        // whether children need layout.
        // See https://github.com/ampproject/amphtml/issues/3586
        // for details.
      });

      userAssert(
        !section.hasAttribute('[expanded]') &&
          !section.hasAttribute('data-amp-bind-expanded'),
        'The "expanded" attribute cannot be used with amp-bind in version ' +
          '0.1 of amp-accordion. Please bind to [data-expand] instead. ' +
          'Found in: %s',
        this.element
      );

      const isExpanded = section.hasAttribute('expanded');
      header.classList.add('i-amphtml-accordion-header');
      if (!header.hasAttribute('role')) {
        header.setAttribute('role', 'button');
      }
      header.setAttribute('aria-controls', contentId);
      header.setAttribute('aria-expanded', String(isExpanded));
      if (!header.hasAttribute('tabindex')) {
        header.setAttribute('tabindex', 0);
      }
      this.headers_.push(header);
      content.setAttribute('aria-labelledby', headerId);
      if (!content.hasAttribute('role')) {
        content.setAttribute('role', 'region');
      }

      userAssert(
        this.action_.hasAction(header, 'tap', section) == false,
        'amp-accordion headings should not have tap actions registered.'
      );

      header.addEventListener('click', this.clickHandler_.bind(this));
      header.addEventListener('keydown', this.keyDownHandler_.bind(this));
    });
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  handleAction_(invocation) {
    const {args, method, trust} = invocation;

    let toExpand = undefined;
    if (method === 'expand') {
      toExpand = true;
    } else if (method === 'collapse') {
      toExpand = false;
    }

    if (args) {
      const sectionId = args['section'];
      let sectionEl = this.getAmpDoc().getElementById(sectionId);
      sectionEl = user().assertElement(sectionEl);
      userAssert(sectionEl, 'No element found with id: %s', sectionId);
      this.toggle_(sectionEl, trust, toExpand);
    } else {
      for (let i = 0; i < this.sections_.length; i++) {
        this.toggle_(this.sections_[i], trust, toExpand);
      }
    }
  }

  /**
   * Generate a sessionStorage Key based on amp-accordion element id.
   * @return {?string}
   * @private
   */
  getSessionStorageKey_() {
    const id_ = this.element.id || this.element.getResourceId();
    const url = removeFragment(this.win.location.href);
    return `amp-${id_}-${url}`;
  }

  /**
   * Get previous state from sessionStorage.
   * @return {!JsonObject}
   * @private
   */
  getSessionState_() {
    if (this.sessionOptOut_) {
      return {};
    }
    try {
      const sessionStr = this.win./*OK*/ sessionStorage.getItem(
        dev().assertString(this.sessionId_)
      );
      return sessionStr
        ? /** @type {!JsonObject} */ (
            devAssert(parseJson(dev().assertString(sessionStr)))
          )
        : {};
    } catch (e) {
      dev().fine(
        'AMP-ACCORDION',
        'Error setting session state: %s, %s',
        e.message,
        e.stack
      );
      return {};
    }
  }

  /**
   * Set current state to sessionStorage.
   * @private
   */
  setSessionState_() {
    if (this.sessionOptOut_) {
      return;
    }
    const sessionStr = JSON.stringify(this.currentState_);
    try {
      this.win./*OK*/ sessionStorage.setItem(
        dev().assertString(this.sessionId_),
        sessionStr
      );
    } catch (e) {
      dev().fine(
        'AMP-ACCORDION',
        'Error setting session state: %s, %s',
        e.message,
        e.stack
      );
    }
  }

  /**
   * Triggers event given name
   * @param {string} name
   * @param {!Element} section
   * @param {!ActionTrust_Enum} trust
   */
  triggerEvent_(name, section, trust) {
    const event = createCustomEvent(this.win, `accordionSection.${name}`, {});
    this.action_.trigger(section, name, event, trust);

    dispatchCustomEvent(this.element, name);
  }

  /**
   * Toggles section between expanded or collapsed.
   * @param {!Element} section
   * @param {!ActionTrust_Enum} trust
   * @param {(boolean|undefined)=} opt_forceExpand
   * @private
   */
  toggle_(section, trust, opt_forceExpand) {
    const sectionComponents = section.children;
    const header = sectionComponents[0];
    const content = sectionComponents[1];
    const contentId = content.getAttribute('id');
    const isSectionClosedAfterClick = section.hasAttribute('expanded');
    const toExpand =
      opt_forceExpand == undefined
        ? !section.hasAttribute('expanded')
        : opt_forceExpand;

    if (
      (toExpand && section.hasAttribute('expanded')) ||
      (!toExpand && !section.hasAttribute('expanded'))
    ) {
      // Caveat: if expand-single-section is added when target section
      // already expanded, it would still short circuit here and
      // not collapsing other sections
      return;
    }

    // Animate Toggle
    if (this.element.hasAttribute('animate')) {
      if (toExpand) {
        header.setAttribute('aria-expanded', 'true');
        this.animateExpand_(section, trust);
        if (this.element.hasAttribute('expand-single-section')) {
          this.sections_.forEach((sectionIter) => {
            if (sectionIter != section) {
              this.animateCollapse_(sectionIter, trust);
              sectionIter.children[0].setAttribute('aria-expanded', 'false');
            }
          });
        }
      } else {
        header.setAttribute('aria-expanded', 'false');
        this.animateCollapse_(section, trust);
      }
    } else {
      // Toggle without animation
      this.mutateElement(() => {
        if (toExpand) {
          this.triggerEvent_('expand', section, trust);
          section.setAttribute('expanded', '');
          header.setAttribute('aria-expanded', 'true');
          // if expand-single-section is set, only allow one <section> to be
          // expanded at a time
          if (this.element.hasAttribute('expand-single-section')) {
            this.sections_.forEach((sectionIter) => {
              if (sectionIter != section) {
                if (sectionIter.hasAttribute('expanded')) {
                  this.triggerEvent_('collapse', sectionIter, trust);
                  sectionIter.removeAttribute('expanded');
                }
                sectionIter.children[0].setAttribute('aria-expanded', 'false');
              }
            });
          }
        } else {
          this.triggerEvent_('collapse', section, trust);
          section.removeAttribute('expanded');
          header.setAttribute('aria-expanded', 'false');
        }
      }, section);
    }
    this.currentState_[contentId] = !isSectionClosedAfterClick;
    this.setSessionState_();
  }

  /**
   * @param {!Element} section
   * @param {!ActionTrust_Enum} trust
   * @return {!Promise}
   * @private
   */
  animateExpand_(section, trust) {
    let sectionWidth;
    let headerHeight;
    let contentHeight;
    let duration;
    let originalWidthStyle;
    const sectionChild = section.children[1];

    return this.measureMutateElement(
      () => {
        sectionWidth = section./*OK*/ offsetWidth;
        originalWidthStyle = getStyle(sectionChild, 'width');
      },
      () => {
        // We set position and opacity to avoid a FOUC while measuring height.
        // We set the width for layouts where the height depends on the width.
        setImportantStyles(sectionChild, {
          'position': 'fixed',
          'width': `${sectionWidth}px`,
          'opacity': '0',
        });
        if (!section.hasAttribute('expanded')) {
          section.setAttribute('expanded', '');
        }
      }
    )
      .then(() => {
        return this.measureMutateElement(
          () => {
            headerHeight = section./*OK*/ offsetHeight;
            contentHeight = sectionChild./*OK*/ offsetHeight;
            const viewportHeight = this.getViewport().getHeight();
            duration = this.getTransitionDuration_(
              Math.abs(contentHeight),
              viewportHeight
            );
          },
          () => {
            setStyles(section, {
              'overflow': 'hidden',
              // Set the height of the section immediately, so it is correct
              // until the animation below starts (on the next frame).
              'height': `${headerHeight}px`,
            });
            setStyles(sectionChild, {
              'position': '',
              'opacity': '',
              'width': originalWidthStyle,
            });
          }
        );
      })
      .then(() => {
        const animation = new Animation(this.element);
        animation.setCurve(EXPAND_CURVE_);
        // We expand the whole section to make sure we do not effect the size of
        // the content.
        animation.add(
          0,
          setStylesTransition(section, {
            'height': px(numeric(headerHeight, headerHeight + contentHeight)),
          }),
          1
        );
        animation.add(
          0,
          setStylesTransition(sectionChild, {
            'opacity': numeric(0, 1),
          }),
          1
        );
        return animation.start(duration).thenAlways(() => {
          this.mutateElement(() => {
            this.triggerEvent_('expand', section, trust);
            setStyles(section, {
              'overflow': '',
              'height': '',
            });
            setStyles(sectionChild, {
              'opacity': '',
            });
          });
        });
      });
  }

  /**
   * @param {!Element} section
   * @param {!ActionTrust_Enum} trust
   * @return {!Promise}
   * @private
   */
  animateCollapse_(section, trust) {
    let sectionHeight;
    let headerHeight;
    let duration;
    const sectionHeader = section.firstElementChild;

    return this.measureMutateElement(
      () => {
        sectionHeight = section./*OK*/ offsetHeight;
        headerHeight = sectionHeader./*OK*/ offsetHeight;
        const viewportHeight = this.getViewport().getSize().height;
        duration = this.getTransitionDuration_(
          Math.abs(sectionHeight),
          viewportHeight
        );
      },
      () => {
        setStyles(section, {
          'overflow': 'hidden',
        });
      }
    ).then(() => {
      return Animation.animate(
        section,
        setStylesTransition(section, {
          'height': px(numeric(sectionHeight, headerHeight)),
        }),
        duration,
        COLLAPSE_CURVE_
      ).thenAlways(() => {
        return this.mutateElement(() => {
          if (section.hasAttribute('expanded')) {
            this.triggerEvent_('collapse', section, trust);
            section.removeAttribute('expanded');
          }
          setStyles(section, {
            'height': '',
            'overflow': '',
          });
        });
      });
    });
  }

  /**
   * Calculates transition duration from vertical distance traveled
   * @param {number} dy
   * @param {number} maxY
   * @param {number=} opt_minDur
   * @param {number=} opt_maxDur
   * @return {number}
   * @private
   */
  getTransitionDuration_(
    dy,
    maxY,
    opt_minDur = MIN_TRANSITION_DURATION,
    opt_maxDur = MAX_TRANSITION_DURATION
  ) {
    const distanceAdjustedDuration = (Math.abs(dy) / maxY) * opt_maxDur;
    return clamp(distanceAdjustedDuration, opt_minDur, opt_maxDur);
  }

  /**
   * Handles accordion header activation, through clicks or enter/space presses.
   * @param {!Event} event 'click' or 'keydown' event.
   * @private
   */
  onHeaderPicked_(event) {
    event.preventDefault();
    const header = dev().assertElement(event.currentTarget);
    const section = dev().assertElement(header.parentElement);
    // Click or keypress gestures are high trust.
    this.toggle_(section, ActionTrust_Enum.HIGH);
  }

  /**
   * Handles clicks on an accordion header to expand/collapse its content.
   * @param {!Event} event
   * @private
   */
  clickHandler_(event) {
    if (this.shouldHandleClick_(event)) {
      this.onHeaderPicked_(event);
    }
  }

  /**
   * We should support clicks on any children of the header except for on
   * links or elements with tap targets, which should not have their default
   * behavior overidden.
   * @param {!Event} event
   * @return {boolean}
   * @private
   */
  shouldHandleClick_(event) {
    const target = dev().assertElement(event.target);
    const header = dev().assertElement(event.currentTarget);
    const hasAnchor = !!closest(target, (e) => e.tagName == 'A', header);
    const hasTapAction = this.action_.hasAction(target, 'tap', header);
    return !hasAnchor && !hasTapAction;
  }

  /**
   * Handles key presses on an accordion header to expand/collapse its content
   * or move focus to previous/next header.
   * @param {!Event} event keydown event.
   */
  keyDownHandler_(event) {
    if (event.defaultPrevented) {
      return;
    }
    const {key} = event;
    switch (key) {
      case Keys_Enum.UP_ARROW: /* fallthrough */
      case Keys_Enum.DOWN_ARROW:
        this.navigationKeyDownHandler_(event);
        return;
      case Keys_Enum.ENTER: /* fallthrough */
      case Keys_Enum.SPACE:
        if (event.target == event.currentTarget) {
          // Only activate if header element was activated directly.
          // Do not respond to key presses on its children.
          this.onHeaderPicked_(event);
        }
        return;
    }
  }

  /**
   * Handles keyboard navigation events. Only respond to keyboard navigation
   * if a section header already has focus.
   * @param {!Event} event
   * @private
   */
  navigationKeyDownHandler_(event) {
    const header = dev().assertElement(event.currentTarget);
    const index = this.headers_.indexOf(header);
    if (index !== -1) {
      event.preventDefault();
      // Up and down are the same regardless of locale direction.
      const diff = event.key == Keys_Enum.UP_ARROW ? -1 : 1;
      // If user navigates one past the beginning or end, wrap around.
      let newFocusIndex = (index + diff) % this.headers_.length;
      if (newFocusIndex < 0) {
        newFocusIndex = newFocusIndex + this.headers_.length;
      }
      const newFocusHeader = this.headers_[newFocusIndex];
      tryFocus(newFocusHeader);
    }
  }

  /**
   * Callback function to execute when mutations are observed on "data-expand".
   * @param {!Array<!MutationRecord>} mutations
   * @param {!ActionTrust_Enum} trust
   */
  toggleExpandMutations_(mutations, trust) {
    mutations.forEach((mutation) => {
      const sectionEl = dev().assertElement(mutation.target);
      const toExpand = sectionEl.hasAttribute('data-expand');
      const isExpanded = sectionEl.hasAttribute('expanded');
      if (isExpanded !== toExpand) {
        this.toggle_(sectionEl, trust, /* opt_forceExpand */ toExpand);
      }
    });
  }

  /**
   * @return {?../../../src/service/action-impl.ActionService}
   * @visibleForTesting
   */
  getActionServiceForTesting() {
    return this.action_;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAccordion, CSS);
});
