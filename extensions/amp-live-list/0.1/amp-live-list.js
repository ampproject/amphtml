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

import {ActionTrust} from '../../../src/action-trust';
import {CSS} from '../../../build/amp-live-list-0.1.css';
import {childElementByAttr} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {liveListManagerForDoc, LiveListManager} from './live-list-manager';
import {isLayoutSizeDefined, Layout} from '../../../src/layout';
import {user} from '../../../src/log';


/**
 * @enum {string}
 */
const classes = {
  ITEM: 'amp-live-list-item',
  NEW_ITEM: 'amp-live-list-item-new',
};

/**
 * @typedef {{
 *   insert: !Array<!Element>,
 *   replace: !Array<!Element>,
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
   * @param {!Element} unusedElement
   * @return {time}
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

  /**
   * Sets or removes the `disabled` property on the amp-live-list component.
   *
   * @param {boolean} unusedValue
   */
  toggle(unusedValue) {}

  /**
   * Identifies if the amp-live-list component is able to receive updates.
   *
   * @return {boolean}
   */
  isEnabled() {}

  /**
   * Retrieves the highest update time from the live list.
   *
   * @return {time}
   */
  getUpdateTime() {}
}


/**
 * Helper function that either returns a number derived from the given
 * string value if its greater than the default, else returns the default.
 *
 * @param {string} value
 * @param {number} defaultValue
 * @return {number}
 * @visibleForTesting
 */
export function getNumberMaxOrDefault(value, defaultValue) {
  return Math.max(parseInt(value, 10) || 0, defaultValue);
}


/**
 * Component class that handles updates to its underlying children dom
 * structure.
 *
 * @implements {LiveListInterface}
 */
export class AmpLiveList extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/viewport-impl.Viewport} */
    this.viewport_ = null;

    /** @private {?LiveListManager} */
    this.manager_ = null;

    /** @private {?Element} */
    this.updateSlot_ = null;

    /** @private {?Element} */
    this.itemsSlot_ = null;

    /** @private {?Element} */
    this.paginationSlot_ = null;

    /** @private {string} */
    this.liveListId_ = '';

    /** @private {number} */
    this.pollInterval_ = 0;

    /**
     * Use the passed in value OR the actual item count if the actual item
     * count is higher.
     * @private {number}
     */
    this.maxItemsPerPage_ = 0;

    /** @private {number} */
    this.updateTime_ = 0;

    /** @private @const {!Object<string, string>} */
    this.knownItems_ = Object.create(null);

    /** @private @const {!Array<!Element>} */
    this.pendingItemsInsert_ = [];

    /** @private @const {!Array<!Element>} */
    this.pendingItemsReplace_ = [];

    /** @private @const {!Array<!Element>} */
    this.pendingItemsTombstone_ = [];

    /** @private {?Element} */
    this.pendingPagination_ = null;

    /**
     * This is the count of items we treat as "active" (exclusing tombstone'd
     * items). We increment it on insert operations done,
     * decrement it on tombstone operations done and again decrement it
     * on deletion operations to try and cap the items down to the
     * `data-max-items-per-page` limit.
     * @private {number}
     */
    this.curNumOfLiveItems_ = 0;

    /** @private @const {function(!Element, !Element): number} */
    this.comparator_ = this.sortByDataSortTime_.bind(this);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER || layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    this.viewport_ = this.getViewport();

    this.manager_ = liveListManagerForDoc(this.getAmpDoc());

    this.updateSlot_ = user().assert(
        this.getUpdateSlot_(this.element),
        'amp-live-list must have an "update" slot.');

    this.itemsSlot_ = user().assert(
        this.getItemsSlot_(this.element),
        'amp-live-list must have an "items" slot.');

    this.paginationSlot_ = this.getPaginationSlot_(this.element);

    this.liveListId_ = user().assert(this.element.getAttribute('id'),
        'amp-live-list must have an id.');

    this.pollInterval_ = getNumberMaxOrDefault(
        this.element.getAttribute('data-poll-interval'),
        LiveListManager.getMinDataPollInterval());

    const maxItems = this.element.getAttribute('data-max-items-per-page');
    user().assert(Number(maxItems) > 0,
        `amp-live-list#${this.liveListId_} must have ` +
        'data-max-items-per-page attribute with numeric value. ' +
        `Found ${maxItems}`);

    const actualCount = ([].slice.call(this.itemsSlot_.children)
        .filter(child => !child.hasAttribute('data-tombstone'))).length;

    this.maxItemsPerPage_ = Math.max(getNumberMaxOrDefault(maxItems, 1),
        actualCount);

    this.manager_.register(this.liveListId_, this);

    // Make sure we hide the button
    this.toggleUpdateButton_(false);
    this.eachChildElement_(this.itemsSlot_, item => {
      item.classList.add(classes.ITEM);
    });

    this.curNumOfLiveItems_ = this.validateLiveListItems_(
        this.itemsSlot_, true);

    this.registerAction(
        'update', this.updateAction_.bind(this), ActionTrust.LOW);

    if (!this.element.hasAttribute('aria-live')) {
      this.element.setAttribute('aria-live', 'polite');
    }
  }

  /** @override */
  isEnabled() {
    return !this.element.hasAttribute('disabled');
  }

  /** @override */
  toggle(value) {
    if (value) {
      this.element.removeAttribute('disabled');
    } else {
      this.element.setAttribute('disabled', '');
    }
  }

  /** @override */
  activate() {
    this.updateAction_();
  }

  /** @override */
  update(updatedElement) {
    const container = this.getItemsSlot_(updatedElement);
    if (!container) {
      return this.updateTime_;
    }
    this.validateLiveListItems_(container);
    const mutateItems = this.getUpdates_(container);

    this.preparePendingItemsInsert_(mutateItems.insert);
    this.preparePendingItemsReplace_(mutateItems.replace);
    this.preparePendingItemsTombstone_(mutateItems.tombstone);

    this.pendingPagination_ = this.getPaginationSlot_(updatedElement);

    // We prefer user interaction if we have pending items to insert at the
    // top of the component.
    if (this.pendingItemsInsert_.length > 0) {
      this.deferMutate(() => {
        this.toggleUpdateButton_(true);
        this.viewport_.updateFixedLayer();
      });
    } else if (this.pendingItemsReplace_.length > 0 ||
        this.pendingItemsTombstone_.length > 0) {
      this.updateAction_();
    }

    return this.updateTime_;
  }

  /**
   * Mutates the current elements dom and compensates for scroll
   * change if necessary.
   * Makes sure to zero out the pending items arrays after flushing
   * server DOM to live client DOM.
   *
   * @return {!Promise}
   * @private
   */
  updateAction_() {
    const hasInsertItems = this.pendingItemsInsert_.length > 0;
    const hasTombstoneItems = this.pendingItemsTombstone_.length > 0;
    const hasReplaceItems = this.pendingItemsReplace_.length > 0;

    const updateHasNewItems = hasInsertItems || hasReplaceItems;

    let promise = this.mutateElement(() => {
      const itemsSlot = user().assertElement(this.itemsSlot_);

      if (hasInsertItems) {
        // Remove the new class from the previously inserted items if
        // we are inserting new items.
        this.eachChildElement_(itemsSlot, child => {
          child.classList.remove(classes.NEW_ITEM);
        });

        this.curNumOfLiveItems_ += this.insert_(
            itemsSlot, this.pendingItemsInsert_);
        this.pendingItemsInsert_.length = 0;
      }

      if (this.pendingItemsReplace_.length > 0) {
        this.replace_(itemsSlot, this.pendingItemsReplace_);
        this.pendingItemsReplace_.length = 0;
      }

      if (this.pendingItemsTombstone_.length > 0) {
        this.curNumOfLiveItems_ -= this.tombstone_(
            itemsSlot, this.pendingItemsTombstone_);
        this.pendingItemsTombstone_.length = 0;
      }

      // Only replace the pagination reference point if there are items
      // to insert or tombstone as those are the times it makes sense
      // the pagination section would have changes (item count change)
      if ((hasInsertItems || hasTombstoneItems) && this.paginationSlot_
            && this.pendingPagination_) {
        this.element.replaceChild(this.pendingPagination_,
            this.paginationSlot_);
        this.paginationSlot_ = this.getPaginationSlot_(this.element);
      }

      // Always hide update slot after mutation operation.
      this.toggleUpdateButton_(false);
      // Always null out the pending pagination section after update
      this.pendingPagination_ = null;

      // Insert and tombstone operations must happen first before we measure
      // number of items to delete down to `data-max-items-per-page`.
      return this.removeOverflowItems_(itemsSlot);
      // TODO(erwinm, #3332) compensate scroll position here.
    });

    if (updateHasNewItems) {
      promise = promise.then(() => {
        this.sendAmpDomUpdateEvent_();

        const templatedEvent = createCustomEvent(this.win,
            'amp:template-rendered', /* detail */ null, {bubbles: true});
        this.itemsSlot_.dispatchEvent(templatedEvent);
      });
    }

    if (hasInsertItems) {
      promise = promise.then(() => {
        return this.viewport_.animateScrollIntoView(this.element);
      });
    }
    return promise;
  }

  /**
   * Sets the `amp-hidden` and `amp-active` classes on the `update` reference
   * point.
   *
   * @param {boolean} visible
   * @private
   */
  toggleUpdateButton_(visible) {
    this.updateSlot_.classList.toggle('amp-hidden', !visible);
    this.updateSlot_.classList.toggle('amp-active', visible);
  }

  /**
   * Reparents the html from the server to the live DOM.
   * Returns the number of element insertion operations done.
   *
   * @param {!Element} parent
   * @param {!Array<!Element>} orphans
   * @return {number} number of actual insert operations done.
   * @private
   */
  insert_(parent, orphans) {
    let count = 0;

    orphans.forEach(orphan => {
      if (this.itemsSlot_.childElementCount == 0) {
        this.itemsSlot_.appendChild(orphan);
      } else {
        const orphanSortTime = this.getSortTime_(orphan);
        for (let child = this.itemsSlot_.firstElementChild; child;
            child = child.nextElementSibling) {
          const childSortTime = this.getSortTime_(child);
          if (orphanSortTime >= childSortTime) {
            this.itemsSlot_.insertBefore(orphan, child);
            count++;
            break;
          // We've exhausted the children list and the current orphan
          // can be the last item.
          } else if (!child.nextElementSibling) {
            this.itemsSlot_.appendChild(orphan);
          }
        }
      }
    });
    return count;
  }

  /**
   * Does an inline replace of a list item using the element ID.
   * Does nothing if item has already been tombstoned or removed from the
   * live DOM.
   * Returns the number of actual replace operations done as this can differ
   * from the number of elements to replace passed in.
   *
   * @param {!Element} parent
   * @param {!Array<!Element>} orphans
   * @return {number} number of actual replace operations done.
   * @private
   */
  replace_(parent, orphans) {
    let count = 0;
    orphans.forEach(orphan => {
      const orphanId = orphan.getAttribute('id');
      const liveElement = parent./*OK*/querySelector(`#${orphanId}`);
      // Don't bother updating if live element is tombstoned or
      // if we can't find it.
      if (!liveElement) {
        return;
      }
      parent.replaceChild(orphan, liveElement);
      count++;
    });
    return count;
  }

  /**
   * Empties out the current child's subtree. If no counterpart
   * element is found in the live DOM, do nothing.
   * Returns the number of actual tombstone operations done as this can differ
   * from the number of elements to tombstone passed in.
   *
   * @param {!Element} parent
   * @param {!Array<!Element>} orphans
   * @return {number} number of actual tombstone operations done.
   * @private
   */
  tombstone_(parent, orphans) {
    let count = 0;
    orphans.forEach(orphan => {
      const orphanId = orphan.getAttribute('id');
      const liveElement = parent./*OK*/querySelector(`#${orphanId}`);
      if (!liveElement) {
        return;
      }
      // We have default styles that apply `display: none` on data-tombstone
      // attribute.
      liveElement.setAttribute('data-tombstone', '');
      // This will empty out its subtree
      liveElement.textContent = '';
      count++;
    });
    return count;
  }

  /**
   * Remove items from the live DOM if number of valid live items is over
   * the `max-items-per-page` limit. `data-tombstone`d items are not considered
   * live items and are ignored in the count.
   *
   * @param {!Element} parent
   * @return {!Promise}
   */
  removeOverflowItems_(parent) {
    const numOfItemsToDelete = this.curNumOfLiveItems_ - this.maxItemsPerPage_;

    if (numOfItemsToDelete < 1) {
      return Promise.resolve();
    }
    const deleteItemsCandidates = [];
    const actualDeleteItems = [];

    // Walk through the children from last to first.
    // Only accumulate the items in this loop. Removing them here
    // will break the prev reference.
    for (let child = parent.lastElementChild; child;
        child = child.previousElementSibling) {
      if (deleteItemsCandidates.length >= numOfItemsToDelete) {
        break;
      }
      if (!this.isChildTombstone_(child)) {
        deleteItemsCandidates.push(child);
      }
    }

    return this.getVsync().runPromise({
      measure: () => {
        // The moment one of the items is in viewport stop deleting.
        for (let i = 0; i < deleteItemsCandidates.length; i++) {
          const child = deleteItemsCandidates[i];
          if (!this.isElementBelowViewport_(child)) {
            break;
          }
          actualDeleteItems.push(child);
        }
      },
      mutate: () => {
        actualDeleteItems.forEach(child => {
          parent.removeChild(child);
          this.curNumOfLiveItems_--;
        });
      },
    });
  }

  /**
   * Prepares the items from the server to be inserted into the DOM
   * by sorting using `data-sort-time` and adding the needed list items
   * classes for styling.
   *
   * @param {!Array<!Element>} items
   * @private
   */
  preparePendingItemsInsert_(items) {
    // Insert/new items will be contiguous at the top even though they
    // weren't in the actual request DOM structure as it doesn't make sense
    // to insert new items between old items.
    // Order matters as this is how it will be appended into the DOM.
    items.sort(this.comparator_).forEach(elem => {
      elem.classList.add(classes.ITEM);
      elem.classList.add(classes.NEW_ITEM);
    });
    this.pendingItemsInsert_.push.apply(this.pendingItemsInsert_, items);
  }

  /**
   * Prepares the items from the server to directly replace an item in the
   * live DOM. If item has a counterpart in the current pending changes
   * that hasn't been flushed yet we just swap it out directly, else
   * we push it into the array.
   * Makes sure to add the `amp-live-list-item` class for items styling.
   *
   * @param {!Array<!Element>} items
   * @private
   */
  preparePendingItemsReplace_(items) {
    // Order doesn't matter since we do an in place replacement.
    items.forEach(elem => {
      const hasPendingCounterpart = this.hasMatchingPendingElement_(
          this.pendingItemsReplace_, elem);
      elem.classList.add('amp-live-list-item');
      if (hasPendingCounterpart == -1) {
        this.pendingItemsReplace_.push(elem);
      } else {
        this.pendingItemsReplace_[hasPendingCounterpart] = elem;
      }
    });
  }

  /**
   * Transfers the items from the server that is marked to be tombstone
   * into the pending queue.
   *
   * @param {!Array<!Element>} items
   * @private
   */
  preparePendingItemsTombstone_(items) {
    this.pendingItemsTombstone_.push.apply(this.pendingItemsTombstone_, items);
  }

  /**
   * Returns the index of the matching element from the queue using the
   * element id. Otherwise returns -1 for not found.
   *
   * @param {!Array<!Element>} pendingQueue
   * @param {!Element} elem
   * @return {number}
   */
  hasMatchingPendingElement_(pendingQueue, elem) {
    for (let i = 0; i < pendingQueue.length; i++) {
      if (pendingQueue[i].getAttribute('id') == elem.getAttribute('id')) {
        return i;
      }
    }
    return -1;
  }

  /** @override */
  getInterval() {
    return this.pollInterval_;
  }

  /**
   * Seggregates new, updated and tombstoned elements.
   *
   * @param {!Element} updatedElement
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
    const replace = [];
    const tombstone = [];

    for (let child = updatedElement.firstElementChild; child;
        child = child.nextElementSibling) {
      const id = child.getAttribute('id');

      if (this.isChildNew_(child)) {
        const orphan = this.win.document.importNode(child, true);
        insert.push(orphan);
        this.cacheChild_(child);
      } else if (this.isChildUpdate_(child)) {
        const updateTime = this.getUpdateTime_(child);
        this.knownItems_[id] = updateTime;
        const orphan = this.win.document.importNode(child, true);
        if (updateTime > this.updateTime_) {
          this.updateTime_ = updateTime;
        }
        replace.push(orphan);
      // To prevent multiple tombstoning of an item we mark it with a -1.
      } else if (this.isChildTombstone_(child) && this.knownItems_[id] != -1) {
        this.knownItems_[id] = -1;
        tombstone.push(child);
      }
    }

    return {insert, replace, tombstone};
  }

  /**
   * Predicate to check if the child passed in is new.
   *
   * @param {!Element} elem
   * @return {boolean}
   * @private
   */
  isChildNew_(elem) {
    const id = elem.getAttribute('id');

    // Even if its an item we haven't seen before but it has a tombstone
    // attribute, don't treat it as a new child.
    if (elem.hasAttribute('data-tombstone')) {
      return false;
    }
    return !(id in this.knownItems_);
  }

  /**
   * Predicate to check if the child passed in is an update, determined
   * by data-update-time attribute.
   *
   * @param {!Element} elem
   * @return {boolean}
   * @private
   */
  isChildUpdate_(elem) {
    // It can't be a child update if it actually has no data-update-time
    // attribute.
    if (!elem.hasAttribute('data-update-time')) {
      return false;
    }
    // It can't be a child update if it has data-tombstone
    if (elem.hasAttribute('data-tombstone')) {
      return false;
    }
    const id = elem.getAttribute('id');
    const updateTime = this.getUpdateTime_(elem);
    // Known items with -1 value are previously tombstoned items which
    // means they can no longer be updated.
    return id in this.knownItems_ && this.knownItems_[id] != -1 &&
        updateTime > this.knownItems_[id];
  }

  /**
   * Predicate to check if the child passed in is tombstone-able, determined
   * by data-tombstone attribute.
   *
   * @param {!Element} elem
   * @return {boolean}
   * @private
   */
  isChildTombstone_(elem) {
    return elem.hasAttribute('data-tombstone');
  }

  /**
   * Record ids of previously seen children to cache.
   *
   * @param {!Element} child
   * @private
   */
  cacheChild_(child) {
    const id = child.getAttribute('id');
    const updateTime = this.getUpdateTime_(child);
    if (updateTime > this.updateTime_) {
      this.updateTime_ = updateTime;
    }
    this.knownItems_[id] = updateTime;
  }

  /**
   * Remove id of child from cache.
   *
   * @param {string} id
   * @private
   */
  removeChildId_(id) {
    delete this.knownItems_[id];
  }

  /**
   * Checks if child has necessary attributes to be a valid child.
   *
   * @param {!Element} child
   * @return {boolean}
   * @private
   */
  isValidChild_(child) {
    return !!child.hasAttribute('id') &&
        Number(child.getAttribute('data-sort-time')) > 0;
  }

  /**
   * Runs through all the children of the current live-list and validates
   * them. Has optional opt_cacheIds flag which caches the ids while we iterate
   * through the children.
   *
   * @param {!Element} element
   * @param {boolean=} opt_cacheIds
   * @return {number}
   * @private
   */
  validateLiveListItems_(element, opt_cacheIds) {
    let numItems = 0;
    let foundInvalid = false;
    this.eachChildElement_(element, child => {
      if (!this.isValidChild_(child)) {
        foundInvalid = true;
      } else if (opt_cacheIds) {
        this.cacheChild_(child);
      }
      numItems++;
    });
    user().assert(!foundInvalid,
        `All amp-live-list-items under amp-live-list#${this.liveListId_} ` +
        'children must have id and data-sort-time attributes. ' +
        'data-sort-time must be a Number greater than 0.');
    return numItems;
  }

  /**
   * Iterates over the child elements from first to last and invokes the
   * callback with the current child element passed in as the first argument.
   *
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
   * @return {?Element}
   * @private
   */
  getItemsSlot_(parent) {
    return childElementByAttr(parent, 'items');
  }

  /**
   * @param {!Element} parent
   * @return {?Element}
   * @private
   */
  getPaginationSlot_(parent) {
    return childElementByAttr(parent, 'pagination');
  }

  /**
   * Sort from oldest to newest time.
   *
   * @param {!Element} a
   * @param {!Element} b
   * @return {time}
   * @private
   */
  sortByDataSortTime_(a, b) {
    return this.getSortTime_(a) - this.getSortTime_(b);
  }

  /**
   * @param {!Element} elem
   * @return {time}
   * @private
   */
  getSortTime_(elem) {
    return this.getTimeAttr_(elem, 'data-sort-time');
  }

  /**
   * @param {!Element} elem
   * @return {time}
   * @private
   */
  getUpdateTime_(elem) {
    if (!elem.hasAttribute('data-update-time')) {
      return this.getSortTime_(elem);
    }
    return this.getTimeAttr_(elem, 'data-update-time');
  }

  /**
   * @param {!Element} elem
   * @return {time}
   * @private
   */
  getTimeAttr_(elem, attr) {
    // TODO(erwinm): add memoization for these time properties when possible.
    // For example since data-sort-time should be immutable we can do so, but
    // we can't for data-update-time since we always have to evaluate if it
    // changed or not if it exists.
    const time = Number(elem.getAttribute(attr));
    user().assert(time > 0, `"${attr}" attribute must exist and value ` +
        `must be a number greater than 0. Found ${time} on ` +
        `${elem.getAttribute('id')} instead.`);
    return time;
  }

  /**
   * Checks if the elements top is below the viewport height.
   *
   * @param {!Element} element
   * @return {boolean}
   */
  isElementBelowViewport_(element) {
    return this.viewport_.getDOMRect(element).top >
        this.viewport_.getScrollTop() + this.viewport_.getSize().height;
  }

  /** @override */
  getUpdateTime() {
    return this.updateTime_;
  }

  sendAmpDomUpdateEvent_() {
    const event = this.win.document.createEvent('Event');
    event.initEvent('amp:dom-update', true, true);
    this.win.document.dispatchEvent(event);
  }
}


AMP.extension('amp-live-list', '0.1', function(AMP) {
  AMP.registerElement('amp-live-list', AmpLiveList, CSS);
});
