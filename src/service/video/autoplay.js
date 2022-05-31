import {removeElement} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {dev} from '#utils/log';

/**
 * @param {!Element} node
 * @return {!Element}
 */
function cloneDeep(node) {
  return dev().assertElement(node.cloneNode(/* deep */ true));
}

/**
 * @param {!Element|!Document} elOrDoc
 * @param {?{title: (string|undefined)}=} metadata
 * @return {!Element}
 */
export function renderInteractionOverlay(elOrDoc, metadata) {
  const html = htmlFor(elOrDoc);
  const element = html`
    <button
      aria-label="Unmute video"
      class="i-amphtml-video-mask i-amphtml-fill-content"
      tabindex="0"
    ></button>
  `;
  if (metadata && metadata.title) {
    element.setAttribute('aria-label', metadata.title);
  }
  return element;
}

/**
 * @param {!Window} win
 * @param {!Element|!Document} elOrDoc
 * @return {!Element}
 */
export function renderIcon(win, elOrDoc) {
  const html = htmlFor(elOrDoc);
  const icon = html`
    <i-amphtml-video-icon class="amp-video-eq">
      <div class="amp-video-eq-col">
        <div class="amp-video-eq-filler"></div>
        <div class="amp-video-eq-filler"></div>
      </div>
    </i-amphtml-video-icon>
  `;

  // Copy equalizer column 4x and annotate filler positions for animation.
  const firstCol = dev().assertElement(icon.firstElementChild);
  for (let i = 0; i < 4; i++) {
    const col = cloneDeep(firstCol);
    const fillers = col.children;
    for (let j = 0; j < fillers.length; j++) {
      const filler = fillers[j];
      filler.classList.add(`amp-video-eq-${i + 1}-${j + 1}`);
    }
    icon.appendChild(col);
  }

  // Remove seed column.
  removeElement(firstCol);

  return icon;
}
