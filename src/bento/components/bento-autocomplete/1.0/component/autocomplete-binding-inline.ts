import {ownProperty} from '#core/types/object';

import {AutocompleteBinding, InputElement} from '../types';

export class AutocompleteBindingInline implements AutocompleteBinding {
  trigger_: string = '';
  regex_: RegExp = new RegExp('');
  match_: RegExpExecArray | null = null;

  constructor(trigger: string) {
    this.trigger_ = trigger;

    const delimiter = this.trigger_.replace(/([()[{*+.$^\\|?])/g, '\\$1');
    const pattern = `((${delimiter}|^${delimiter})(\\w+)?)`;
    this.regex_ = new RegExp(pattern, 'gm');
  }

  get shouldShowOnFocus() {
    return false;
  }

  /**
   * Finds the closest string in the user input prior to the cursor
   * to display suggestions.
   */
  private getClosestPriorMatch_(inputEl: InputElement) {
    const regex = this.regex_;

    const {selectionStart: cursor, value} = inputEl;
    let match, lastMatch;

    while ((match = regex.exec(value)) !== null) {
      if (match[0].length + ownProperty(match, 'index') > cursor!) {
        break;
      }
      lastMatch = match;
    }

    if (
      !lastMatch ||
      lastMatch[0].length + ownProperty(lastMatch, 'index') < cursor!
    ) {
      return null;
    }
    return lastMatch;
  }

  /**
   * Returns true if a match on the publisher-provided trigger is found in the input element value.
   * Otherwise, should not display any suggestions.
   */
  shouldAutocomplete(inputEl: InputElement): boolean {
    const match = this.getClosestPriorMatch_(inputEl);
    this.match_ = match;
    return !!match;
  }

  /**
   * Display suggestions based on the partial string following the trigger
   * in the input element value.
   */
  getUserInputForUpdate(): string {
    if (!this.match_ || !this.match_[0]) {
      return '';
    }
    return this.match_[0].slice(this.trigger_.length);
  }

  /**
   * If results are not showing or there is no actively navigated-to suggestion item,
   * the user should be able to 'Enter' to add a new line.
   */
  shouldPreventDefaultOnEnter(activeElement: boolean) {
    return activeElement;
  }
}
