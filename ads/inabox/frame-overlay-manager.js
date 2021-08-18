import {collapseFrame, expandFrame} from './frame-overlay-helper';

/** @const */
const AMP_INABOX_FRAME_OVERLAY_MANAGER = 'ampInaboxFrameOverlayManager';

/**
 * Inabox host manager for full overlay frames.
 */
export class FrameOverlayManager {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.isExpanded_ = false;

    /** @private {boolean} */
    this.viewportChangedSinceExpand_ = false;

    // TODO(alanorozco): type
    /** @private {?} */
    this.collapsedRect_ = null;

    this.listenToViewportChanges_();
  }

  /** @private */
  listenToViewportChanges_() {
    this.win_.addEventListener('resize', () => this.onWindowResize());
  }

  /** @visibleForTesting */
  onWindowResize() {
    if (this.isExpanded_) {
      this.viewportChangedSinceExpand_ = true;
    }
  }

  /**
   * Expands an iframe to full overlay.
   * @param {!HTMLIFrameElement} iframe
   * @param {!Function} callback Gets executed when expanded with the new box
   *  rect.
   */
  expandFrame(iframe, callback) {
    expandFrame(this.win_, iframe, (collapsedRect, expandedRect) => {
      this.isExpanded_ = true;
      this.viewportChangedSinceExpand_ = false;
      this.collapsedRect_ = collapsedRect;
      callback(expandedRect);
    });
  }

  /**
   * Collapses an iframe back from full overlay.
   * @param {!HTMLIFrameElement} iframe
   * @param {!Function} callback Gets executed when collapsed with the new box
   *  rect.
   */
  collapseFrame(iframe, callback) {
    // There is a delay of one animation frame between collapsing and measuring
    // the box rect. collapseFrame() takes a callback for each event.
    //
    // We know what the collapsed box was. If the viewport has not changed while
    // expanded, we can immediately notify the consumer of the collapsed
    // box rect since it should be the same. Otherwise, we wait for remeasure.
    collapseFrame(
      this.win_,
      iframe,
      () => {
        this.isExpanded_ = false;

        if (!this.viewportChangedSinceExpand_) {
          callback(this.collapsedRect_);
        }
      },
      (collapsedRect) => {
        this.collapsedRect_ = collapsedRect;

        if (this.viewportChangedSinceExpand_) {
          callback(this.collapsedRect_);
        }
      }
    );
  }
}

/**
 * Use an existing frame overlay manager within the window, if any.
 * @param {!Window} win
 * @return {!FrameOverlayManager}
 */
export function getFrameOverlayManager(win) {
  win[AMP_INABOX_FRAME_OVERLAY_MANAGER] =
    win[AMP_INABOX_FRAME_OVERLAY_MANAGER] || new FrameOverlayManager(win);
  return win[AMP_INABOX_FRAME_OVERLAY_MANAGER];
}
