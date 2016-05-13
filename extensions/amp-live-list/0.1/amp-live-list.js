/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import {CSS} from '../../../build/amp-live-list-0.1.css';
import {childElementByAttr} from '../../../src/dom';
import {installLiveListManager, LiveListManager} from './live-list-manager';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined, Layout} from '../../../src/layout';
import {user} from '../../../src/log';
import {viewportFor} from '../../../src/viewport';


/** @const */
const TAG = 'amp-live-list';

/**
 * @enum {!Object<string, string>}
 */
const classes = {
  ITEM: 'amp-live-list-item',
  NEW_ITEM: 'amp-live-list-item-new',
};

/**
 * @typedef {{
 *   insert: !Array<!Element>,
 *   update: !Array<!Element>,
 *   tombstone: !Array<!Element>
 * }}
 */
let MutateItemsDef;

/**
 * Defines underlying API for LiveList components.
 * @interface
 */
export class LiveListInterface {

  /**
   * Update the underlying live list dom structure.
   *
   * @param {?Element} element
   */
  update(unusedElement) {
  }

  /**
   * The interval of when the LiveList should be at best notified
   * of new updates.
   *
   * @return {number}
   */
  getInterval() {}
}


/**
 * Helper function that either returns a number derived from the given
 * string value or returns the default value passed in.
 *
 * @param {string} value
 * @param {number} defaultValue
 * @return {number}
 */
function getNumberOrDefault(value, defaultValue) {
  value = Number(value);
  return value > 0 ? Math.max(value, defaultValue) : defaultValue;
}


/**
 * Component class that handles updates to its underlying children dom
 * structure.
 * @implements {LiveListInterface}
 */
export class AmpLiveList extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    /** @const {!Window} */
    this.win = this.getWin();

    /** @private @const {boolean} */
    this.isExperimentOn_ = isExperimentOn(this.win, TAG);

    if (!this.isExperimentOn_) {
      user.warn(TAG, `Experiment ${TAG} disabled`);
      return;
    }

    /** @private @const {!Viewport} */
    this.viewport_ = viewportFor(this.win);

    /** @private @const {!LiveListManager} */
    this.manager_ = installLiveListManager(this.win);

    /** @private @const {string} */
    this.liveListId_ = user.assert(this.element.getAttribute('id'),
        'amp-live-list must have an id.');

    /** @private @const {number} */
    this.pollInterval_ = getNumberOrDefault(
        this.element.getAttribute('data-poll-interval'),
        LiveListManager.getMinDataPollInterval());

    const maxItems = this.element.getAttribute('data-max-items-per-page');
    user.assert(Number(maxItems) > 0,
        `amp-live-list#${this.liveListId_} must have ` +
        `data-max-items-per-page attribute with numeric value. ` +
        `Found ${maxItems}`);

    /** @private @const {number} */
    this.maxItemsPerPage_ = getNumberOrDefault(maxItems,
        LiveListManager.getMinDataMaxItemsPerPage());

    /** @private @const {!Object<string, string>} */
    this.knownChildIds_ = Object.create(null);

    this.manager_.register(this.liveListId_, this);

    this.insertFragment_ = this.win.document.createDocumentFragment();

    this.updateSlot_ = user.assert(
       this.getUpdateSlot_(this.element),
       'amp-live-list must have an `update` slot.');

    this.itemsSlot_ = user.assert(
        this.getItemsSlot_(this.element),
        'amp-live-list must have an `items` slot.');

    this.updateSlot_.classList.add('-amp-hidden');
    this.eachChildElement_(this.itemsSlot_, item => {
      item.classList.add(classes.ITEM);
    });

    this.validateLiveListItems_(this.itemsSlot_, true);

    this.registerAction('update', this.updateAction_.bind(this));
  }

  /** @override */
  update(updatedElement) {
    const container = this.getItemsSlot_(updatedElement);
    user.assert(container, 'amp-live-list must have an `items` slot');
    this.validateLiveListItems_(container);
    const mutateItems = this.getUpdates_(container);

    // Insert/new items will be contiguous at the top even though they
    // weren't in the actual request DOM structure.
    mutateItems.insert.sort(this.sortByDataSortTime_).forEach(child => {
      child.classList.add(classes.ITEM);
      child.classList.add(classes.NEW_ITEM);
      // Since we only manipulate the DocumentFragment instance and not the
      // live dom we don't need to be inside a vsync.mutate context.
      this.insertFragment_.insertBefore(child,
          this.insertFragment_.firstElementChild);
    });

    if (mutateItems.insert.length > 0) {
      this.deferMutate(() => {
        this.updateSlot_.classList.remove('-amp-hidden');
      });
    }
  }

  /**
   * Mutates the current elements dom and compensates for scroll
   * change if necessary.
   * @return {!Promise}
   * @private
   */
  updateAction_() {
    if (this.insertFragment_.childElementCount == 0) {
      return Promise.resolve();
    }

    // TODO(erwinm): do in place update as well as sorting,
    // correct insertion, tombstoning etc.
    return this.mutateElement(() => {
      // Remove the new class from the previously inserted items.
      this.eachChildElement_(this.itemsSlot_, child => {
        child.classList.remove(classes.NEW_ITEM);
      });
      // Items are reparented from the document fragment to the live DOM
      // by the `insertBefore` and `appendChild` operations, so we can reuse
      // the same document fragment instance safely.
      this.itemsSlot_.insertBefore(this.insertFragment_,
          this.itemsSlot_.firstElementChild);

      // Hide the update button in case we previously displayed it.
      this.updateSlot_.classList.add('-amp-hidden');

      // TODO(erwinm): Handle updates
    }).then(() => {
      this.getVsync().mutate(() => {
        // Should scroll into view be toggleable
        this.viewport_./*OK*/scrollIntoView(this.element);
      });
    });
  }

  /** @override */
  getInterval() {
    return this.pollInterval_;
  }

  /**
   * Seggregates new, updated and tombstoned elements.
   *
   * @param {!HTMLElement} element
   * @return {!MutateItemsDef}
   * @private
   */
  getUpdates_(updatedElement) {
    // NOTE: We need to import the node for custom-element implementation
    // to run. Reparenting directly or doing cloneNode alone won't work.
    // We don't import the parent as importing the whole tree will
    // trigger `createdCallback`s even though we won't actually be
    // reparenting those nodes to this tree.
    const insert = [];
    const updates = [];
    const tombstone = [];

    for (let child = updatedElement.firstElementChild; child;
        child = child.nextElementSibling) {
      const id = child.getAttribute('id');

      if (this.isChildNew_(id)) {
        const orphan = this.win.document.importNode(child, true);
        insert.push(orphan);
        this.cacheChildId_(id, child.getAttribute('data-update-time'));
        continue;
      }

      if (this.isChildUpdate_(child, id)) {
        const orphan = this.win.document.importNode(child, true);
        updates.push(orphan);
      }
    }

    return {insert, updates, tombstone};
  }

  /**
   * Predicate to check if the child passed in is new.
   * @private
   */
  isChildNew_(id) {
    return !(id in this.knownChildIds_);
  }

  /**
   * Predicate to check if the child passed in is an update, determined
   * by data-update-time attribute.
   * @private
   */
  isChildUpdate_(unusedChild, unusedId) {
    return false;
  }

  /**
   * Predicate to check if the child passed in is tombstoning, determined
   * by data-tombstone attribute.
   * @private
   */
  isChildTombstone_(unusedChild) {
    return false;
  }

  /**
   * Record ids of previously seen children to cache.
   *
   * @param {string} id
   * @param {?string} updateTime
   * @private
   */
  cacheChildId_(id, updateTime) {
    this.knownChildIds_[id] = updateTime;
  }

  /**
   * Remove id of child from cache.
   *
   * @param {string} id
   * @private
   */
  removeChildId_(id) {
    delete this.knownChildIds_[id];
  }

  /**
   * Checks if child has necessary attributes to be a valid child.
   *
   * @param {!HTMLElement} child
   * @return {boolean}
   * @private
   */
  isValidChild_(child) {
    return !!child.getAttribute('id');
  }

  /**
   * Runs through all the children of the current live-list and validates
   * them. Has optional opt_cacheIds flag which caches the ids while we iterate
   * through the children.
   *
   * @param {!HTMLElement} element
   * @param {boolean=} opt_cacheIds
   * @private
   */
  validateLiveListItems_(element, opt_cacheIds) {
    let foundInvalid = false;
    this.eachChildElement_(element, child => {
      if (!this.isValidChild_(child)) {
        foundInvalid = true;
      } else if (opt_cacheIds) {
        this.cacheChildId_(child.getAttribute('id'),
            child.getAttribute('data-update-time'));
      }
    });
    user.assert(!foundInvalid,
        `All amp-live-list-items under amp-live-list#${this.liveListId_} ` +
        `children must have an id.`);
  }

  /**
   * Iterates over the child elements and invokes the callback with
   * the current child element passed in as the first argument.
   * @param {!Element} parent
   * @param {function(!Element)} cb
   * @private
   */
  eachChildElement_(parent, cb) {
    for (let child = parent.firstElementChild; child;
        child = child.nextElementSibling) {
      cb(child);
    }
  }

  /**
   * @param {!Element} parent
   * @private
   */
  getUpdateSlot_(parent) {
    return childElementByAttr(parent, 'update');
  }

  /**
   * @param {!Element} parent
   * @private
   */
  getItemsSlot_(parent) {
    return childElementByAttr(parent, 'items');
  }

  /**
   * @param {!Element} a
   * @param {!Element} b
   * @return {number}
   * @private
   */
  sortByDataSortTime_(a, b) {
    const aTime = Number(a.getAttribute('data-sort-time'));
    const bTime = Number(b.getAttribute('data-sort-time'));
    user.assert(aTime > 0, '`data-sort-time` attribute must exist and value' +
        ' must be a number. Found %s.', aTime);
    user.assert(bTime > 0, '`data-sort-time` attribute must exist and value' +
        ' must be a number. Found %s.', aTime);
    return aTime - bTime;
  }
}

AMP.registerElement('amp-live-list', AmpLiveList, CSS);
