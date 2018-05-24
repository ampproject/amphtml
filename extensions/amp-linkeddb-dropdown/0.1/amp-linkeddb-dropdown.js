/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import { Layout } from '../../../src/layout';
import $ from './jquery-1.11.2.min';
import { CSS } from '../../../build/amp-linkeddb-dropdown-0.1.css';

export class AmpLinkeddbDropdown extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {

    (function ($) {
      'use strict';

      $.fn.transitionEnd = function (callback) {
        var events = ['webkitTransitionEnd',
          'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
        var i;
        var dom = this;

        function fireCallBack(e) {
          /*jshint validthis:true */
          if (e.target !== this) {
            return;
          }
          callback.call(this, e);
          for (i = 0; i < events.length; i++) {
            dom.off(events[i], fireCallBack);
          }
        }
        if (callback) {
          for (i = 0; i < events.length; i++) {
            dom.on(events[i], fireCallBack);
          }
        }
        return this;
      };

      $.support = (function () {
        var support = {
          touch: !!(('ontouchstart' in window)
            || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
        return support;
      })();

      $.touchEvents = {
        start: $.support.touch ? 'touchstart' : 'mousedown',
        move: $.support.touch ? 'touchmove' : 'mousemove',
        end: $.support.touch ? 'touchend' : 'mouseup'
      };

      $.getTouchPosition = function (e) {
        e = e.originalEvent || e;
        if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
          return {
            x: e.targetTouches[0].pageX,
            y: e.targetTouches[0].pageY
          };
        } else {
          return {
            x: e.pageX,
            y: e.pageY
          };
        }
      };

      $.fn.scrollHeight = function () {
        return this[0].scrollHeight;
      };

      $.fn.transform = function (transform) {
        for (var i = 0; i < this.length; i++) {
          var elStyle = this[i].style;
          elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform
            = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
        }
        return this;
      };
      $.fn.transition = function (duration) {
        if (typeof duration !== 'string') {
          duration = duration + 'ms';
        }
        for (var i = 0; i < this.length; i++) {
          var elStyle = this[i].style;
          elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration
            = elStyle.msTransitionDuration = elStyle.MozTransitionDuration
            = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
        }
        return this;
      };

      $.requestAnimationFrame = function (callback) {
        if (window.requestAnimationFrame) {
          return window.requestAnimationFrame(callback);
        }
        else if (window.webkitRequestAnimationFrame) {
          return window.webkitRequestAnimationFrame(callback);
        }
        else if (window.mozRequestAnimationFrame) {
          return window.mozRequestAnimationFrame(callback);
        }
        else {
          return window.setTimeout(callback, 1000 / 60);
        }
      };

      $.cancelAnimationFrame = function (id) {
        if (window.cancelAnimationFrame) {
          return window.cancelAnimationFrame(id);
        }
        else if (window.webkitCancelAnimationFrame) {
          return window.webkitCancelAnimationFrame(id);
        }
        else if (window.mozCancelAnimationFrame) {
          return window.mozCancelAnimationFrame(id);
        }
        else {
          return window.clearTimeout(id);
        }
      };

      $.fn.join = function (arg) {
        return this.toArray().join(arg);
      };

    })($);

    +(function ($) {
      'use strict';
      var getOffset = function (container) {
        var tagName = container[0].tagName.toUpperCase();
        var scrollTop;
        if (tagName === 'BODY' || tagName === 'HTML') {
          scrollTop = container.scrollTop() || $(window).scrollTop();
        } else {
          scrollTop = container.scrollTop();
        }
        var offset = container.scrollHeight() - ($(window).height() + scrollTop);
        return offset;
      };
      var attachEvents;
      var Infinite = function (el, distance) {
        this.container = $(el);
        this.container.data('infinite', this);
        this.distance = distance || 50;
        this.attachEvents();
      };

      Infinite.prototype.scroll = function () {
        var container = this.container;
        this._check();
      };

      Infinite.prototype.attachEvents = function (off) {
        var el = this.container;
        var scrollContainer = (el[0].tagName.toUpperCase() === 'BODY' ? $(document) : el);
        scrollContainer[off ? 'off' : 'on']('scroll', $.proxy(this.scroll, this));
      };
      Infinite.prototype.detachEvents = function (off) {
        this.attachEvents(true);
      };
      Infinite.prototype._check = function () {
        var offset = getOffset(this.container);
        if (Math.abs(offset) <= this.distance) {
          this.container.trigger('infinite');
        }
      };

      var infinite = function (el) {
        attachEvents(el);
      };

      $.fn.infinite = function (distance) {
        return this.each(function () {
          new Infinite(this, distance);
        });
      };
      $.fn.destroyInfinite = function () {
        return this.each(function () {
          var infinite = $(this).data('infinite');
          if (infinite && infinite.detachEvents) {
            infinite.detachEvents();
          }
        });
      };
    })($);
  
    var ele = this.element
    var pageNum = 2;
    var pageType = $(this.element).find('.all-list').attr('data-type');
    var loading = false;
    var getUrl;
    $(this.element).parent().parent().infinite().on('infinite', ()=> {
      // 如果正在加载，则退出
      if (loading) {
        return;
      }
      // 设置flag
      loading = true;
      if (pageType === 'person') {
        getUrl = 'https://mip.linkeddb.com/person/?page=' + pageNum;
      } else if (pageType === 'tv' || pageType === 'movie') {
        getUrl = 'https://mip.linkeddb.com/' + pageType + '/?page=' + pageNum;
      } else {
        getUrl = 'https://mip.linkeddb.com/movies/?page=' + pageNum;
      }
      $.get(getUrl, function (html) {
        if (html) {
          // 重置加载flag
          loading = false;
          // 添加新条目
          $(ele).find('.infinite-list').append(html);
          pageNum++;
          // 容器发生改变,如果是js滚动，需要刷新滚动
          // $.refreshScroller();
        } else {
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          $(ele).parent().destroyInfinite();
          // 删除加载提示符
          $(ele).find('.weui-loadmore').remove();

          $(ele).find('.no-more').removeClass('hide');
          setTimeout(function () {
            $(ele).find('.no-more').addClass('hide');
          }, 1500);
          return false;
        }
      });
    });
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }
}
AMP.extension('amp-linkeddb-dropdown', '0.1', AMP => {
  AMP.registerElement('amp-linkeddb-dropdown', AmpLinkeddbDropdown, CSS);
});
