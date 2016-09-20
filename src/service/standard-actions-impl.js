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

import {getServiceForDoc} from '../service';
import {installActionServiceForDoc} from './action-impl';
import {installResourcesService} from './resources-impl';


/**
 * This service contains implementations of some of the most typical actions,
 * such as hiding DOM elements.
 * @private Visible for testing.
 */
export class StandardActions {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  constructor(win) {
    /** @const @private {!./action-impl.ActionService} */
    this.actions_ = installActionService(win);

    /** @const @private {!./resources-impl.Resources} */
    this.resources_ = installResourcesService(win);
=======
  constructor(ampdoc) {
    /** @const @private {!./action-impl.ActionService} */
    this.actions_ = installActionServiceForDoc(ampdoc);

    /** @const @private {!./resources-impl.Resources} */
    this.resources_ = installResourcesService(ampdoc.getWin());
>>>>>>> ampproject/master
=======
  constructor(ampdoc) {
    /** @const @private {!./action-impl.ActionService} */
    this.actions_ = installActionServiceForDoc(ampdoc);

    /** @const @private {!./resources-impl.Resources} */
    this.resources_ = installResourcesService(ampdoc.getWin());
>>>>>>> ampproject/master
=======
  constructor(ampdoc) {
    /** @const @private {!./action-impl.ActionService} */
    this.actions_ = installActionServiceForDoc(ampdoc);

    /** @const @private {!./resources-impl.Resources} */
    this.resources_ = installResourcesService(ampdoc.getWin());
>>>>>>> ampproject/master

    this.actions_.addGlobalMethodHandler('hide', this.handleHide.bind(this));
  }

  /**
   * Handles "hide" action. This is a very simple action where "display: none"
   * is applied to the target element.
   * @param {!./action-impl.ActionInvocation} invocation
   */
  handleHide(invocation) {
    this.resources_.mutateElement(invocation.target, () => {
      invocation.target.style.display = 'none';
    });
  }
}


/**
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
 * @param {!Window} win
 * @return {!StandardActions}
 */
export function installStandardActions(win) {
  return /** @type {!StandardActions} */ (
      getService(win, 'standard-actions', () => {
        return new StandardActions(win);
=======
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!StandardActions}
 */
=======
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!StandardActions}
 */
>>>>>>> ampproject/master
=======
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!StandardActions}
 */
>>>>>>> ampproject/master
export function installStandardActionsForDoc(ampdoc) {
  return /** @type {!StandardActions} */ (
      getServiceForDoc(ampdoc, 'standard-actions', ampdoc => {
        return new StandardActions(ampdoc);
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
=======
>>>>>>> ampproject/master
      }));
};
