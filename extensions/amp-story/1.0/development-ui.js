import * as Preact from '#core/dom/jsx';
import {LogLevel_Enum, dev} from '#utils/log';
import {Services} from '#service';
import {removeChildren} from '#core/dom';
import {toggle} from '#core/dom/style';
import objstr from 'obj-str';

/**
 * @param {!../../../src/service/vsync-impl.Vsync} vsync
 * @param {!Element} el
 * @param {boolean} isHidden
 */
function toggleHiddenAttribute(vsync, el, isHidden) {
  vsync.mutate(() => {
    toggle(el, !isHidden);
  });
}

/**
 * @param {!Window} win
 * @param {string} className
 * @param {function(Event)} handler
 * @return {!Element}
 */
function createButton(win, className, handler) {
  return (
    <div
      role="button"
      class={objstr({
        'i-amphtml-story-button': true,
        [className]: true,
      })}
      onClick={handler}
    ></div>
  );
}

/**
 * Development mode logs buttons.
 */
export class DevelopmentModeLogButtonSet {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.errorButton_ = null;

    /** @private {?Element} */
    this.warningButton_ = null;

    /** @private {?Element} */
    this.successButton_ = null;
  }

  /**
   * @param {!Window} win
   * @return {!DevelopmentModeLogButtonSet}
   */
  static create(win) {
    return new DevelopmentModeLogButtonSet(win);
  }

  /**
   * Builds the developer log button set element.
   * @param {function()} logButtonActionFn A callback function to be invoked when
   *     the log buttons are clicked.
   * @return {?Element}
   */
  build(logButtonActionFn) {
    this.errorButton_ = createButton(
      this.win_,
      'i-amphtml-story-error-button i-amphtml-story-dev-logs-button',
      () => logButtonActionFn()
    );

    this.warningButton_ = createButton(
      this.win_,
      'i-amphtml-story-warning-button i-amphtml-story-dev-logs-button',
      () => logButtonActionFn()
    );

    this.successButton_ = createButton(
      this.win_,
      'i-amphtml-story-success-button i-amphtml-story-dev-logs-button',
      () => logButtonActionFn()
    );

    this.root_ = (
      <div>
        {this.errorButton_}
        {this.warningButton_}
        {this.successButton_}
      </div>
    );

    return this.root_;
  }

  /**
   * Gets the button associated to a given log entry.
   * @param {!./logging.AmpStoryLogEntryDef} logEntry The log entry for which
   *     the associated button shouldbe retrieved.
   * @return {?Element} The button associated to the specified log entry, if one
   *     exists.
   * @private
   */
  getButtonForLogEntry_(logEntry) {
    if (logEntry.conforms) {
      return this.successButton_;
    }

    switch (logEntry.level) {
      case LogLevel_Enum.ERROR:
        return this.errorButton_;
      case LogLevel_Enum.WARN:
        return this.warningButton_;
      default:
        return null;
    }
  }

  /**
   * Logs an individual entry into the developer log.
   * @param {!./logging.AmpStoryLogEntryDef} logEntry The entry to log.
   */
  log(logEntry) {
    const button = this.getButtonForLogEntry_(logEntry);
    if (!button) {
      return;
    }

    const oldCount = parseInt(button.getAttribute('data-count') || 0, 10);
    button.setAttribute('data-count', oldCount + 1);
  }

  /**
   * Clears any error state held by the buttons.
   */
  clear() {
    this.errorButton_.setAttribute('data-count', 0);
    this.warningButton_.setAttribute('data-count', 0);
    this.successButton_.setAttribute('data-count', 0);
  }
}

/**
 * Development mode log for <amp-story>.
 */
export class DevelopmentModeLog {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;

    /** @private {?Element} */
    this.entriesEl_ = null;

    /** @private {?Element} */
    this.contextStringEl_ = null;
  }

  /**
   * @param {!Window} win
   * @return {!DevelopmentModeLog}
   */
  static create(win) {
    return new DevelopmentModeLog(win);
  }

  /**
   * Builds the developer log element.
   * @return {?Element}
   */
  build() {
    this.contextStringEl_ = (
      <span class="i-amphtml-story-developer-log-context"></span>
    );

    const closeDeveloperLogEl = createButton(
      this.win_,
      'i-amphtml-story-developer-log-close',
      () => this.hide()
    );

    this.entriesEl_ = <ul class="i-amphtml-story-developer-log-entries"></ul>;

    this.root_ = (
      <div class="i-amphtml-story-developer-log" hidden>
        <div class="i-amphtml-story-developer-log-header">
          <div>Developer logs for page {this.contextStringEl_}</div>
          {closeDeveloperLogEl}
        </div>
        {this.entriesEl_}
      </div>
    );

    this.clear();

    return this.root_;
  }

  /**
   * @param {!LogLevel_Enum} logLevel
   * @return {?string} The CSS class to be applied to the log entry, given the
   *     specified log level, or null if no class should be added.
   * @private
   */
  getCssLogLevelClass_(logLevel) {
    switch (logLevel) {
      case LogLevel_Enum.WARN:
        return 'i-amphtml-story-developer-log-entry-warning';
      case LogLevel_Enum.ERROR:
        return 'i-amphtml-story-developer-log-entry-error';
      default:
        return null;
    }
  }

  /**
   * @param {boolean} conforms Whether the log entry is for an element that
   *     conforms to a best practice.
   * @return {?string} The CSS class to be applied to the log entry, given the
   *     element's conformance to a best practice, or null if no class should be
   *     added.
   * @private
   */
  getCssConformanceClass_(conforms) {
    if (conforms) {
      return 'i-amphtml-story-developer-log-entry-success';
    }

    return null;
  }

  /**
   * @param {!./logging.AmpStoryLogEntryDef} logEntry The entry to be logged.
   */
  log(logEntry) {
    const logLevelClass = this.getCssLogLevelClass_(logEntry.level);
    const conformanceClass = this.getCssConformanceClass_(logEntry.conforms);

    const logEntryUi = (
      <li
        class={objstr({
          'i-amphtml-story-developer-log-entry': true,
          [logLevelClass]: !!logLevelClass,
          [conformanceClass]: !!conformanceClass,
        })}
      >
        {logEntry.message}
      </li>
    );

    this.entriesEl_.appendChild(logEntryUi);
  }

  /**
   * Clears all entries from the developer logs.
   */
  clear() {
    Services.vsyncFor(this.win_).mutate(() => {
      removeChildren(dev().assertElement(this.entriesEl_));
    });
  }

  /**
   * Sets the string providing context for the developer logs window.  This is
   * often the name or ID of the element that all logs are for (e.g. the page).
   * @param {string} contextString
   */
  setContextString(contextString) {
    this.contextStringEl_.textContent = contextString;
  }

  /**
   * Toggles the visibility of the developer log.
   */
  toggle() {
    const newHiddenState = !this.root_.hasAttribute('hidden');
    toggleHiddenAttribute(
      Services.vsyncFor(this.win_),
      dev().assertElement(this.root_),
      newHiddenState
    );
  }

  /**
   * Hides the developer log in the UI.
   */
  hide() {
    toggleHiddenAttribute(
      Services.vsyncFor(this.win_),
      dev().assertElement(this.root_),
      /* isHidden */ true
    );
  }
}
