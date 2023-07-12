import {toggleAttribute} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';
import {toggle} from '#core/dom/style';
import {parseQueryString} from '#core/types/string/url';

import {
  AmpStoryDevToolsTabDebug,
  createTabDebugElement,
} from './amp-story-dev-tools-tab-debug';
import {
  AmpStoryDevToolsTabPreview,
  createTabPreviewElement,
} from './amp-story-dev-tools-tab-preview';
import {updateHash} from './utils';

import {CSS} from '../../../build/amp-story-dev-tools-0.1.css';

/** @const {Array<Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&amp;display=swap */
const fontsToLoad = [
  {
    family: 'Poppins',
    weight: '400',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '600',
    src: "url(https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2) format('woff2')",
  },
];

/**
 * Generates the template for the root layout.
 * @param {!Element} element
 * @return {!Element}
 */
const buildContainerTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-dev-tools-container">
      <div class="i-amphtml-story-dev-tools-header">
        <span class="i-amphtml-story-dev-tools-brand">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
          >
            <circle cx="15" cy="15" r="15" fill="white"></circle>
            <path
              fill="#202125"
              d="M19.5 9a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5V9zM8.25 9a1.5 1.5 0 011.5-1.5h6.75A1.5 1.5 0 0118 9v12a1.5 1.5 0 01-1.5 1.5H9.75a1.5 1.5 0 01-1.5-1.5V9zM22.5 10.5c.621 0 1.125.504 1.125 1.125v6.75c0 .622-.504 1.125-1.125 1.125v-9z"
            ></path>
          </svg>
          <span class="i-amphtml-story-dev-tools-brand-text">
            <span>WEB STORIES</span>
            <span>DEV - TOOLS</span>
          </span>
        </span>
        <div class="i-amphtml-story-dev-tools-tabs"></div>
        <a
          class="i-amphtml-story-dev-tools-button i-amphtml-story-dev-tools-close"
        >
          <span>OPEN STORY</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M9.9165 4.08333L9.094 4.90583L10.599 6.41667H4.6665V7.58333H10.599L9.094 9.08833L9.9165 9.91667L12.8332 7L9.9165 4.08333ZM2.33317 2.91667H6.99984V1.75H2.33317C1.6915 1.75 1.1665 2.275 1.1665 2.91667V11.0833C1.1665 11.725 1.6915 12.25 2.33317 12.25H6.99984V11.0833H2.33317V2.91667Z"
              fill="black"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  `;
};

/** @enum {string} */
const DevToolsTab = {
  PREVIEW: 'Preview',
  DEBUG: 'Debug',
};

export class AmpStoryDevTools extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!{[key: string]: string}} */
    this.hashParams_ = parseQueryString(this.win.location.hash);

    this.win.document.title = `Story Dev-Tools (${this.win.document.title})`;

    // TODO: Remove support for url queryParam when widely available.
    /** @private {string} */
    this.storyUrl_ =
      this.hashParams_['url'] || this.win.location.href.split('#')[0];

    /** @private {!DevToolsTab} get URL param for tab (eg: #tab=page-experience) or default to PREVIEW*/
    this.currentTab_ =
      (this.hashParams_['tab']
        ? Object.values(DevToolsTab).find(
            (tab) =>
              tab.toLowerCase().replace(' ', '-') === this.hashParams_['tab']
          )
        : null) || DevToolsTab.PREVIEW;

    /** @private {!{[key: string]: !Element}} maps tabs to contents */
    this.tabContents_ = {};

    /** @private {!Array<!Element>} */
    this.tabSelectors_ = [];
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  buildCallback() {
    this.loadFonts_();
    this.removeCustomCSS_();
    this.buildLayout_();
    this.initializeListeners_();

    this.buildTabs_();
    this.switchTab_(this.currentTab_);
  }

  /**
   * @private
   */
  buildLayout_() {
    const container = buildContainerTemplate(this.element);
    this.element.appendChild(container);
    this.element.querySelector('.i-amphtml-story-dev-tools-close').href =
      this.storyUrl_;

    // Create tabs on top
    const tabsContainer = container.querySelector(
      '.i-amphtml-story-dev-tools-tabs'
    );
    Object.values(DevToolsTab).forEach((tabTitle) => {
      const tabSelector = this.win.document.createElement('button');
      tabSelector.classList.add('i-amphtml-story-dev-tools-tab-selector');
      tabSelector.setAttribute('data-tab', tabTitle);
      tabSelector.textContent = tabTitle;
      this.tabSelectors_.push(tabSelector);
      tabsContainer.appendChild(tabSelector);
    });
  }

  /**
   * @private
   */
  initializeListeners_() {
    const tabsContainer = this.element.querySelector(
      '.i-amphtml-story-dev-tools-tabs'
    );
    tabsContainer.addEventListener('click', (event) => {
      const tab = event.target.getAttribute('data-tab');
      if (
        Object.values(DevToolsTab).find((t) => t == tab) &&
        this.currentTab_ != tab
      ) {
        this.switchTab_(tab);
        // Update hashString with tab selected or null if tab = preview (default)
        updateHash(
          {
            'tab':
              tab == DevToolsTab.PREVIEW
                ? null
                : tab.toLowerCase().replace(' ', '-'),
          },
          this.win
        );
      }
    });
  }

  /**
   * @private
   */
  buildTabs_() {
    const container = this.element.querySelector(
      '.i-amphtml-story-dev-tools-container'
    );
    this.tabContents_[DevToolsTab.PREVIEW] = createTabPreviewElement(
      this.win,
      this.storyUrl_,
      this.hashParams_['devices']
    );
    this.tabContents_[DevToolsTab.DEBUG] = createTabDebugElement(
      this.win,
      this.storyUrl_
    );
    Object.values(this.tabContents_).forEach((tabContent) => {
      tabContent.setAttribute('layout', 'container');
      toggle(tabContent, false);
      container.appendChild(tabContent);
    });
  }

  /**
   * Switches the tab shown by activating the tab button and switching the contents.
   * @param {!DevToolsTab} tab
   */
  switchTab_(tab) {
    this.mutateElement(() => {
      toggle(this.tabContents_[this.currentTab_], false);
      toggle(this.tabContents_[tab], true);
      this.tabSelectors_.forEach((tabSelector) =>
        toggleAttribute(
          tabSelector,
          'active',
          tabSelector.getAttribute('data-tab') === tab
        )
      );
      this.currentTab_ = tab;
    });
  }

  /** @private */
  loadFonts_() {
    if (this.win.document.fonts && FontFace) {
      fontsToLoad.forEach(({family, src, style = 'normal', weight}) =>
        new FontFace(family, src, {weight, style})
          .load()
          .then((font) => this.win.document.fonts.add(font))
      );
    }
  }

  /** @private */
  removeCustomCSS_() {
    this.element.ownerDocument
      .querySelectorAll('style[amp-custom]')
      .forEach((e) => e.remove());
  }
}

AMP.extension('amp-story-dev-tools', '0.1', (AMP) => {
  AMP.registerElement('amp-story-dev-tools', AmpStoryDevTools, CSS);
  AMP.registerElement(
    'amp-story-dev-tools-tab-debug',
    AmpStoryDevToolsTabDebug
  );
  AMP.registerElement(
    'amp-story-dev-tools-tab-preview',
    AmpStoryDevToolsTabPreview
  );
});
