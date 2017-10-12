/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {CSS} from '../../../build/amp-alaantv-breakingnews-0.1.css';
import {AmpEvents} from '../../../src/amp-events';
import {createCustomEvent} from '../../../src/event-helper';
import {fetchBatchedJsonFor} from '../../../src/batched-json';
import {isArray} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeChildren,childElements} from '../../../src/dom';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {setStyles} from '../../../src/style';
import {listen} from '../../../src/event-helper';

const ACTIVE_ITEM_CLASS = 'i-amphtml-breakingnews-active';

export class AmpAlaantvBreakingnews extends AMP.BaseElement {

    /** @param {!AmpElement} element */
    constructor(element) {
        super(element);

        this.ampdoc = Services.ampdocServiceFor(this.win).getAmpDoc();


        /** @private {boolean} */
        this.fallbackDisplayed_ = false;

        /** @const {!../../../src/service/template-impl.Templates} */
        this.templates_ = Services.templatesFor(this.win);

        /** @private {number} **/
        this.pollInterval = 2000;

        /** @const {!../../../src/service/timer-impl.Timer} */
        this.timer_ = Services.timerFor(this.win);

        /** @private {?Array<!Object>} */
        this.items = [];

        /** @const @private {!../../../src/service/viewer-impl.Viewer} */
        this.viewer_ = Services.viewerForDoc(this.ampdoc);

        /** @private {Element} **/
        this.itemsContainer_ = null;

        /** @private {Element} **/
        this.container_ = null;

        /** @private {?Element} **/
        this.previousButton_ = null;

        /** @private {?Element} **/
        this.nextButton_ = null;

        /** @private {?Promise} **/
        this.resultPromise = null;

        /** @private {?../../../src/service/action-impl.ActionService} */
        this.action_ = null;

        /** @private {Function} **/
        this.inViewportAction = (inViewport) => { return inViewport ? null : this.pause() };

        /** @private {?number} **/
        this.animationDirection_= -1;

        /** @private {!Function} **/
        this.stopAnimation_ = ()=> Promise.resolve();//lambda will stop the animation.
        /** @private {!Function} **/
        this.resumeAnimation_ = ()=> Promise.resolve();//lambda will start the animation.
    }

    /** @override */
    isLayoutSupported(layout) {
        return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
        this.action_ = Services.actionServiceForDoc(this.element);
        this.container_ = this.element.querySelector('*[container]');
        dev().assertElement(this.container_, "breaking news container element is required");
        if( this.container_ ) this.applyFillContent(this.container_, true);

        this.itemsContainer_ = this.element.querySelector('*[items]');
        dev().assertElement(this.itemsContainer_, "breaking news listing container element is required");
        this.previousButton_ = this.element.querySelector('*[action-previous]');
        if( this.previousButton_)
            listen(this.previousButton_, 'click', (e) => {
                e.preventDefault();
                this.previous();
            });
        this.nextButton_ = this.element.querySelector('*[action-next]');
        if( this.nextButton_ )
            listen(this.nextButton_, 'click', (e) => {
                e.preventDefault();
                this.next();
            });

        if (!this.itemsContainer_.hasAttribute('role')) {
            this.itemsContainer_.setAttribute('role', 'list');
        }

        if (!this.element.hasAttribute('aria-live')) {
            this.element.setAttribute('aria-live', 'polite');
        }

        dev().assert(this.element.hasAttribute('data-poll-interval'));

        this.pollInterval = parseInt(this.element.getAttribute('data-poll-interval'), 10);

        this.animationDirection_ = this.element.getAttribute('animation') == 'rtl' ? 1 : -1;

        if( this.animationDirection_ > 0)
            this.element.classList.add('i-amphtml-rtl-animation');

        this.viewer_.whenFirstVisible().then(() => {
            console.log('AMPDocument firstVisible event catched');
            this.fetchAndRender().catch( this.catchCallback.bind(this) );
            this.inViewportAction = (inViewport) => {
                return inViewport ? this.resultPromise.then( this.play.bind(this)).catch( this.catchCallback.bind(this) ) : this.pause()
            };
        });

        this.registerAction('pause', this.pause.bind(this), ActionTrust.LOW);
        this.registerAction('play', this.play.bind(this), ActionTrust.LOW);
        this.registerAction('pauseOrPlay', this.resume.bind(this), ActionTrust.LOW);
        this.registerAction('resume', this.resume.bind(this), ActionTrust.LOW);
        this.registerAction('next', this.next.bind(this), ActionTrust.LOW);
        this.registerAction('previous', this.previous.bind(this), ActionTrust.LOW);
    }

    /**
     * @private
     */
    triggerEvent_(name, args){
        const event = createCustomEvent(this.win, `AMP-ALAANTV-BREAKINGNEWS.${name}`, args);
        this.action_.trigger(this.element, name, event, ActionTrust.LOW);
    }

    /** @override */
    reconstructWhenReparented() {
        return false;
    }

    fetchAndRender(){
        const fetch = this.fetchList();
        if (this.getFallback()) {
            fetch.then(() => {
                // Hide in case fallback was displayed for a previous fetch.
                this.toggleFallbackInMutate(false);
            }, unusedError => {
                // On fetch success, firstLayoutCompleted() hides placeholder.
                // On fetch error, hide placeholder if fallback exists.
                this.togglePlaceholder(false);
                this.toggleFallbackInMutate(true);
            });
        }

        return fetch;
    }

    /** @override */
    layoutCallback() {
        return Promise.resolve();
    }

    /** @override */
    firstLayoutCompleted() {
        console.log('firstLayoutCompleted');
    }

    /** @override */
    viewportCallback(inViewport) {
        console.log('viewportCallback', inViewport);
        this.inViewportAction(inViewport);
    }

    play(unused){
        console.log('play');
        this.inViewportAction = (inViewport) => {
            return inViewport ? this.resume() : this.pause()
        };
        return this.animateCurrentPromise()
            .then(this.refetchIfFullListAnimated.bind(this))
            .then( this.next.bind(this))
            .catch( this.catchCallback.bind(this) );
    }

    next(){
        return Promise.resolve()
            .then(this.switchForward.bind(this))
            .then(this.animateCurrentPromise.bind(this))
            .then(this.refetchIfFullListAnimated.bind(this))
            .then( ()=> { this.next(); })
            .catch( this.catchCallback.bind(this) );
    }

    previous(){
        return Promise.resolve()
            .then(this.switchBackward.bind(this))
            .then(this.animateCurrentPromise.bind(this))
            .then(this.refetchIfFullListAnimated.bind(this))
            .then( ()=> { this.next(); })
            .catch( this.catchCallback.bind(this) );
    }

    catchCallback(opt){
        if( opt instanceof TypeError) {
            dev().error('amp-alaantv-breakingnews', opt);
            throw opt;
        }
        else if( opt.fetch ) {
            let p = opt.timeout ? this.timer_.promise(this.pollInterval) : Promise.resolve();
            p.then(this.fetchAndRender.bind(this))
                .then(this.play.bind(this))
                .catch(this.catchCallback.bind(this));
        }
        if( opt.emptyResult) {
            this.getVsync().mutate( ()=> this.element.classList.remove('i-amphtml-breakingnews-not-empty'));
            this.triggerEvent_('empty', []);
        }

    }

    resume(){
        console.log('resume');
        return this.resumeAnimation_()
            .then( ()=>{
                console.log('resuming action is done!');
            })
            .then(this.next.bind(this))
            .catch( this.catchCallback.bind(this) );
    }

    pause(){
        console.log('pause');
        this.stopAnimation_();
    }


    switchToElement(nextItem){
        this.stopAnimation_();
        return this.getActiveItemPromise()
            .then( (activeItem)=> new Promise( resolve =>{
                this.getVsync().mutate( ()=> {
                    activeItem.classList.remove(ACTIVE_ITEM_CLASS);
                    nextItem.classList.add(ACTIVE_ITEM_CLASS);
                    //clear inline style for all elements.
                    if( this.itemsContainer_ )
                        childElements(this.itemsContainer_, ()=> true).forEach( (el)=>{
                            setStyles(el, {
                                transform: ``,
                                transition: ``
                            });
                        });
                        resolve(activeItem);
                });
            }) );
    }

    getActiveItemPromise(){
        let activeItem = this.itemsContainer_.querySelector('.'+ ACTIVE_ITEM_CLASS);
        if( activeItem )
            return Promise.resolve( activeItem );
        return new Promise( (resolve, reject) =>{
            this.getVsync().mutate( ()=>{
                if( !this.itemsContainer_.childElementCount )
                    return reject( {fetch: true, timeout: true} );
                let activeItem = this.itemsContainer_.firstElementChild;
                activeItem.classList.add(ACTIVE_ITEM_CLASS);
                return resolve(activeItem);
            });
        });
    }

    switchForward(){
        console.log('Switch to next item');
        return this.getActiveItemPromise().then( (activeItem)=>{
            return this.switchToElement( activeItem.nextElementSibling ? activeItem.nextElementSibling : this.itemsContainer_.firstElementChild );
        });
    }

    switchBackward(){
        console.log('Switch to previous item');
        console.log('Switch to next item');
        return this.getActiveItemPromise().then( (activeItem)=>{
            return this.switchToElement( activeItem.previousElementSibling ? activeItem.previousElementSibling : this.itemsContainer_.lastElementChild );
        });
    }

    refetchIfFullListAnimated(){
        return this.getActiveItemPromise()
            .then( (activeItem)=>{
                if( this.itemsContainer_.lastElementChild == activeItem )
                    return this.fetchAndRender();
                return Promise.resolve();
            }, this.fetchAndRender.bind(this));
    }

    calcReadtime(width, min){
        let minimum = min == undefined ? 3000 : min;
        return width*5 < minimum ? minimum : width*5;
    }


    animateScrollItemPromise(aPromise, aResolve, aReject, activeItem, itemWidth, containerWidth){
        let doAnimation_ = true;
        let diff = itemWidth - containerWidth + 20;
        let time = 3 * this.calcReadtime(diff, 0);
        let d = 1000.0 * diff / 60.0 / time;
        let offset = 0.0;
        let lastOffset = 0.0;
        let getAnimationFunction = (promise, resolve, reject)=>{
            let aimationFrame = () => {
                if (!doAnimation_){
                    return reject({fetch: false});//stop animating, and reject the promise.
                }

                offset += d * this.animationDirection_;
                let delta = Math.abs(offset - lastOffset);
                if (delta > 0.5) {
                    lastOffset = offset;
                    setStyles(activeItem, {transform: `translate3d(${offset.toFixed(2)}px,0,0)`});
                }
                if (offset < diff)
                    window.requestAnimationFrame(aimationFrame);
                else {
                    let animationTimer_ = this.timer_.delay( ()=>{
                        this.stopAnimation_ = this.resumeAnimation_ = ()=> Promise.resolve();
                        resolve();
                    }, 1000);
                    this.stopAnimation_ = () => {
                        this.timer_.cancel(animationTimer_);
                        this.stopAnimation_ = ()=> Promise.resolve();
                        reject({fetch: false});//stop animating, and reject the promise.
                    };
                }
            };
            return aimationFrame;
        };

        //if stopAnimation is called it will set doAnimation to false, later the animationFrame will stop.
        this.stopAnimation_ = () => {
            doAnimation_ = false;
            this.stopAnimation_ = ()=> Promise.resolve();
            aReject({fetch: false});
        };
        this.resumeAnimation_ = ()=> {
            doAnimation_ = true;
            let p = new Promise( (rs, rj) =>{
                doAnimation_ = true;
                this.stopAnimation_ = () => {
                    doAnimation_ = false;
                    this.stopAnimation_ = ()=> Promise.resolve();
                    rj({fetch: false});
                };
                window.requestAnimationFrame(getAnimationFunction(p, rs, rj));
            });
            return p;
        };
        //disable transition will applying our js animation.
        setStyles(activeItem, {transition: `none`});
        window.requestAnimationFrame(getAnimationFunction(aPromise, aResolve, aReject));
        return aPromise;
    }

    animateCurrentPromise(){
        return this.getActiveItemPromise().then( (activeItem) => {
            this.resumeAnimation_ = this.animateCurrentPromise.bind(this);
            let promise = new Promise( (resolve, reject) =>{
                this.getVsync().measure(() => {
                    let itemWidth = activeItem.clientWidth;
                    let containerWidth = this.itemsContainer_.clientWidth;

                    if (itemWidth > containerWidth) {
                      /* the item is partially visible within the itemsContainer,
                       First show the visible part and wait for reading time,
                       then start scrolling the invisible text so the reader can read.
                       after the scrolling is finished pause for 1 second and finally resolve the promise.*/

                        setStyles(activeItem, {
                            transform: `translate3d(0px,0,0)`,
                            transition: ``
                        });

                        let animationTimer_ = this.timer_.delay( ()=> this.animateScrollItemPromise(promise, resolve, reject, activeItem, itemWidth, containerWidth ), this.calcReadtime(containerWidth, undefined));

                        this.stopAnimation_ = () => {
                            this.timer_.cancel(animationTimer_);
                            this.stopAnimation_ = ()=> Promise.resolve();
                            reject({fetch: false});
                        };

                    } else {
                      /* the whole item is visible within the itemsContainer, so wait for reading time then resolve the promise.*/
                        let animationTimer_ = this.timer_.delay(()=>{
                            this.stopAnimation_ = ()=> Promise.resolve();
                            resolve();
                        }, this.calcReadtime(itemWidth, undefined));

                        this.stopAnimation_ = () => {
                            this.timer_.cancel(animationTimer_);
                            this.stopAnimation_ = ()=> Promise.resolve();
                            reject({fetch: false});
                        };

                    }
                });
            });
            return promise;
        });
    }

    /** @override */
    mutatedAttributesCallback(mutations) {
        const src = mutations['src'];
        const state = mutations['state'];

        if (src !== undefined) {
            const typeOfSrc = typeof src;
            if (typeOfSrc === 'string') {
                this.fetchList();
            } else if (typeOfSrc === 'object') {
                const items = isArray(src) ? src : [src];
                this.renderItems_(items);
            } else {
                this.user().error(TAG, 'Unexpected "src" type: ' + src);
            }
        } else if (state !== undefined) {
            const items = isArray(state) ? state : [state];
            this.renderItems_(items);
            user().warn('amp-alaantv-breakingnews', '[state] is deprecated, please use [src] instead.');
        }
    }

    /**
     * Wraps `toggleFallback()` in a mutate context.
     * @param {boolean} state
     * @private
     */
    toggleFallbackInMutate(state) {
        if (state) {
            this.getVsync().mutate(() => {
                this.toggleFallback(true);
                this.fallbackDisplayed_ = true;
            });
        } else {
            // Don't queue mutate if fallback isn't already visible.
            if (this.fallbackDisplayed_) {
                this.getVsync().mutate(() => {
                    this.toggleFallback(false);
                    this.fallbackDisplayed_ = false;
                });
            }
        }
    }

    /**
     * Request list data from `src` and return a promise that resolves when
     * the list has been populated with rendered list items.
     * @return {!Promise}
     * @private
     */
    fetchList() {
        const itemsExpr = this.element.getAttribute('items') || 'items';
        return this.fetch(itemsExpr).then(items => {
            if (this.element.hasAttribute('single-result')) {
                user().assert(typeof items !== 'undefined' ,
                    'Response must contain an arrary or object at "%s". %s',
                    itemsExpr, this.element);
                if (!isArray(items)) {
                    items = [items];
                }
            }
            user().assert(isArray(items),
                'Response must contain an array at "%s". %s',
                itemsExpr, this.element);
            const maxLen = parseInt(this.element.getAttribute('max-items'), 10);
            if (maxLen < items.length) {
                items = items.slice(0, maxLen);
            }

            if( items.length == 0 )
                return new Promise( (resolve, reject)=> {
                    this.rendered([]);
                    reject({fetch: true, timeout: true, emptyResult: true});//fetch with delay
                } );

            //if same result don't render.
            if( JSON.stringify(items) == JSON.stringify(this.items) )
                return [];
            this.items = items;
            return this.renderItems_(items);
        }, error => {
            throw user().createError('Error fetching amp-list', error);
        });
    }

    /**
     * @param {!Array} items
     * @return {!Promise}
     * @private
     */
    renderItems_(items) {
        console.log('render items:', items);
        return this.templates_.findAndRenderTemplateArray(this.element, items)
            .then( (elements)=>{
                this.element.classList.add('i-amphtml-breakingnews-not-empty');
                this.triggerEvent_('result', items);
                return elements;
            })
            .then(this.scanForBindings.bind(this))
            .then(this.rendered.bind(this));
    }

    /**
     * @param {!Array<!Element>} elements
     * @return {!Promise<!Array<!Element>>}
     * @private
     */
    scanForBindings(elements) {
        const forwardElements = () => elements;
        return Services.bindForDocOrNull(this.element).then(bind => {
            if (bind) {
                return bind.rescanAndEvaluate(elements);
            }
            // Forward elements to chained promise on success or failure.
        }).then(forwardElements, forwardElements);
    }

    /**
     * @param {!Array<!Element>} elements
     * @private
     */
    rendered(elements) {
        removeChildren(dev().assertElement(this.itemsContainer_));
        elements.forEach(element => {
            if (!element.hasAttribute('role')) {
                element.setAttribute('role', 'listitem');
            }
            this.itemsContainer_.appendChild(element);
        });

        const event = createCustomEvent(this.win,
            AmpEvents.DOM_UPDATE, /* detail */ null, {bubbles: true});
        this.itemsContainer_.dispatchEvent(event);
        return elements;
    }

    /**
     * @param {string} itemsExpr
     * @visibleForTesting
     * @private
     */
    fetch(itemsExpr) {
        console.log('fetching from URL:', this.element.getAttribute('src'));
        this.resultPromise = fetchBatchedJsonFor(this.getAmpDoc(), this.element, itemsExpr);
        return this.resultPromise;
    }
}

AMP.registerElement('amp-alaantv-breakingnews', AmpAlaantvBreakingnews, CSS);