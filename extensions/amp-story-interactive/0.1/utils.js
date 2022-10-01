import {htmlFor} from '#core/dom/static-template';
import {map} from '#core/types/object';

import {user} from '#utils/log';

/** @private Whether ids are deduplicated or not */
let deduplicatedIds = false;

/**
 * Deduplicates the interactive Ids, only called once
 * @param {!Document} doc
 */
export const deduplicateInteractiveIds = (doc) => {
  if (deduplicatedIds) {
    return;
  }
  deduplicatedIds = true;
  const interactiveEls = doc.querySelectorAll(
    'amp-story-interactive-binary-poll, amp-story-interactive-poll, amp-story-interactive-quiz'
  );
  const idsMap = map();
  for (let i = 0; i < interactiveEls.length; i++) {
    const currId = interactiveEls[i].id || 'interactive-id';
    if (idsMap[currId] === undefined) {
      idsMap[currId] = 0;
    } else {
      user().error(
        'AMP-STORY-INTERACTIVE',
        `Duplicate interactive ID ${currId}`
      );
      const newId = `${currId}__${++idsMap[currId]}`;
      interactiveEls[i].id = newId;
    }
  }
};

/**
 * Generates the template for the image quizzes and polls.
 *
 * @param {!Element} element
 * @return {!Element}
 */
export const buildImgTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div
      class="i-amphtml-story-interactive-img-container i-amphtml-story-interactive-container"
    >
      <div class="i-amphtml-story-interactive-prompt-container"></div>
      <div class="i-amphtml-story-interactive-img-option-container"></div>
    </div>
  `;
};
