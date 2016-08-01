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


import {CSS} from '../../../build/amp-disqus-0.1.css';
import {documentInfoFor} from '../../../src/document-info';
import {generateGUID} from './guid';
import {isLayoutSizeDefined} from '../../../src/layout';
import {sanitizeHtml} from '../../../src/sanitizer';
import {user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';


function timeSince(timeStamp) {
  const secondsPast = (Date.now() - Date.parse(timeStamp)) / 1000;

  if (secondsPast < 60) {
    return parseInt(secondsPast, 10) + ' seconds ago';
  }
  if (secondsPast < 3600) {
    return parseInt(secondsPast / 60, 10) + ' minutes ago';
  }
  if (secondsPast < 86400) {
    return parseInt(secondsPast / 3600, 10) + ' hours ago';
  }
  if (secondsPast < 2592000) {
    return parseInt(secondsPast / 86400, 10) + ' days ago';
  }

  return parseInt(secondsPast / 2592000, 10) + ' months ago';
}


function isDNTEnabled() {
  return (
    window.navigator.doNotTrack === '1' ||  // W3 Spec & Firefox
      window.navigator.doNotTrack === 'yes' ||  // Old Chrome, Opera etc.
      window.navigator.msDoNotTrack === '1'  // IE
  );
}


function serializeArgs(params) {
  return Object.keys(params)
    .filter(key => params[key] !== undefined)
    .map(key => {
      const val = params[key];
      return encodeURIComponent(key) + (
        val === null ? '' : '=' + encodeURIComponent(val));
    })
    .join('&');
}


class AmpDisqus extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    // API
    this.preconnect.url('https://tempest.services.disqus.com/engage-iframe/amp/', onLayout);
    // Image resources
    this.preconnect.url('https://a.disquscdn.com', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.forum = user.assert(
      this.element.getAttribute('data-forum'),
      'The data-forum attribute is required for <amp-disqus> %s',
      this.element);

    this.identifier = this.element.getAttribute('data-identifier') || '';
    this.url = this.element.getAttribute('data-url') ||
      documentInfoFor(this.getWin()).canonicalUrl;
    this.title = this.element.getAttribute('data-title') ||
      this.element.ownerDocument.title;
    this.slug = this.element.getAttribute('data-slug') || '';
    this.language = this.element.getAttribute('data-language') || '';
    this.categoryId = this.element.getAttribute('data-category-id') || '';

    this.guid_ = generateGUID();
    this.data_ = null;
    this.shouldReportView_ = false;
    this.reportedView_ = false;
  }

  /** @override */
  layoutCallback() {
    return this.render().then(node => {
      if (node) {
        this.element.appendChild(node);
      }
    });
  }

  viewportCallback(inViewport) {
    if (inViewport && !this.reportedView_) {
      this.shouldReportView_ = true;
      if (this.data_) {
        this.sendViewEvent(this.data_);
      }
    }
  }

  fetch() {
    const url = 'https://tempest.services.disqus.com/engage-iframe/amp/?' + serializeArgs({
      category: this.categoryId,
      'disqus_identifier': this.identifier,
      'disqus_url': this.url,
      forum: this.forum,
      language: this.language,
      slug: this.slug,
      title: this.title,
    });

    return xhrFor(this.getWin()).fetchJson(url).then(response => {
      const hasKeyWithoutError = key =>
              response && response[key] && !response[key].code;
      if (['details', 'forum', 'posts', 'threads'].every(hasKeyWithoutError)) {
        return response;
      }

      return null;
    }).catch(() => null);
  }

  sendInitEvent({details, forum}) {
    const forumSettings = forum.settings;

    const dntEnabled = isDNTEnabled();
    // NOTE: Does not support per-user opt-out
    const shouldTrack = !forumSettings.disable3rdPartyTrackers && !dntEnabled;

    const eventParams = {
      event: 'init_embed',
      thread: details.id,
      forum: details.forum,  // Shortname
      'forum_id': forum.pk,

      product: 'embed:amp',

      imp: this.guid_,
      'prev_imp': null,

      'thread_slug': details.slug,
      // user_type here differs from userType reported to Google
      // The user_type attribute is only attached by the
      // embed/threadDetails endpoint
      'user_type': 'anon',  // NOTE: Always send 'anon' since we don't have auth here
      // NOTE: In Embed the referer is usually the embedding page's url
      referrer: this.getWin().location.href,
      theme: 'next',
      dnt: dntEnabled ? '1' : '0',
      abe: '0',
      'tracking_enabled': shouldTrack ? '1' : '0',
      'embed_hidden': '0',

      experiment: 'default',
      variant: 'control',
      service: 'dynamic',
    };

    // NOTE: user_id is not sent since we don't have auth

    const includeDiscoveryInformation = Object.prototype.hasOwnProperty.call(
      forumSettings, 'organicDiscoveryEnabled');
    if (includeDiscoveryInformation) {
      Object.assign(eventParams, {
        // Forum settings for Discovery:
        'organic_enabled': forumSettings.organicDiscoveryEnabled,
        'promoted_enabled': forumSettings.promotedDiscoveryEnabled,
        'max_enabled': forumSettings.discoveryMax,
        'thumbnails_enabled': forumSettings.discoveryThumbnailsEnabled,
      });
    }

    this.sendEvent(eventParams);
  }

  sendViewEvent({details, forum}) {
    this.reportedView_ = true;

    this.sendEvent({
      verb: 'view',
      'object_type': 'product',
      'object_id': 'embed:amp',
      'extra_data': '{}',
      product: 'embed:amp',
      thread: details.id,
      'thread_id': details.id,  // NOTE: Intentionally same as previous field
      forum: details.forum,  // Shortname
      'forum_id': forum.pk,
      zone: 'thread',
      'page_url': this.getWin().location.href,
      experiment: 'default',
      variant: 'control',
      service: 'dynamic',
      'page_referrer': this.getWin().document.referrer,
      event: 'activity',
      imp: this.guid_,
      'prev_imp': null,
      section: 'default',
      area: 'n/a',
    });
  }

  sendEvent(params) {
    new window.Image().src = 'https://referrer.disqus.com/juggler/event.gif?' + serializeArgs(params);
  }

  render() {
    const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

    const doc = this.element.ownerDocument;

    function m(tagName, attributes = null, children = []) {
      const element = doc.createElement(tagName);

      if (attributes) {
        Object.keys(attributes).forEach(key => {
          element.setAttribute(key, attributes[key]);
        });
      }

      children.forEach(child => {
        if (!child.nodeName) {
          child = doc.createTextNode(child);
        }
        element.appendChild(child);
      });

      return element;
    }

    function renderPost(post) {
      const messageEl = m('span');
      messageEl./*OK*/innerHTML = sanitizeHtml(post.message);

      const upvotesSvg = doc.createElementNS(SVG_NAMESPACE, 'svg');
      upvotesSvg.setAttributeNS(null, 'version', '1.1');
      upvotesSvg.setAttributeNS(null, 'width', '10');
      upvotesSvg.setAttributeNS(null, 'height', '10');
      upvotesSvg.setAttributeNS(null, 'viewBox', '0 0 18 18');
      upvotesSvg.setAttributeNS(null, 'class',
                                '-amp-disqus-comments__upvote-icon');
      const upvotesPath = doc.createElementNS(SVG_NAMESPACE, 'path');
      upvotesPath.setAttributeNS(
        null, 'd',
        'M7.1 6.4l-4.3 4.9L0.3 9l8.7-9H9l8.7 9l-2.6 2.2l-4.3-4.9V18H7.1V6.4z');
      upvotesSvg.appendChild(upvotesPath);

      const postEl = m('div', {class: '-amp-disqus-comments__item'}, [
        m('img', {
          class: '-amp-disqus-comments__avatar',
          src: post.author.avatar.cache,
        }),
        m('div', {class: '-amp-disqus-margin-left-large'}, [
          m('div', {class: '-amp-disqus-text-small'}, [
            m('strong', {}, [post.author.name]),
            '\u00a0\u00a0',
            m('span', {class: '-amp-disqus-text-gray'}, [
              timeSince(post.createdAt),
            ]),
          ]),
          messageEl,
          m('span', {class: '-amp-disqus-text-small -amp-disqus-text-gray'}, [
            upvotesSvg,
            post.likes + ' upvotes',
          ]),
        ]),
      ]);
      return postEl;
    }

    function renderThread(thread) {
      const threadSvg = doc.createElementNS(SVG_NAMESPACE, 'svg');
      threadSvg.setAttributeNS(null, 'version', '1.1');
      threadSvg.setAttributeNS(null, 'width', '16');
      threadSvg.setAttributeNS(null, 'height', '16');
      threadSvg.setAttributeNS(null, 'viewBox', '0 0 1016 801');
      threadSvg.setAttributeNS(null, 'class',
                               '-amp-disqus-thread__comments-icon');
      const threadPath = doc.createElementNS(SVG_NAMESPACE, 'path');
      threadPath.setAttributeNS(null, 'd', 'M210.030942,705.925055 L0.008,729.247922 L81.1676594,566.676211 C52.8867922,516.031734 37.027917,459.805289 37.027917,400.5 C37.027917,179.311359 256.162966,0 526.502021,0 C796.856951,0 1015.992,179.311359 1015.992,400.5 C1015.992,621.701156 796.856951,801 526.502021,801 C405.798359,801 295.389473,765.174023 210.030942,705.925055 Z');  // eslint-disable-line max-len
      threadSvg.appendChild(threadPath);

      const threadImage = m('img', {
        src: thread.thumbnail,
        class: '-amp-disqus-thread__thumb',
        // Image is hidden until it loads to avoid layout impact
        // in the case where the thread does not have a thumbnail.
        style: 'display: none;',
      });
      threadImage.addEventListener('load', evt => {
        evt.srcElement.style.display = 'block';
      });
      return m('div', {class: '-amp-disqus-thread__item'}, [
        m('a', {href: thread.link}, [
          threadImage,
          m('div', {class: '-amp-disqus-thread__title'}, [
            m('strong', null, [thread.clean_title]),
          ]),
          m('div', {
            class: '-amp-disqus-text-small -amp-disqus-text-gray ' +
              '-amp-disqus-margin-bottom-small',
          }, [
            timeSince(thread.createdAt),
            threadSvg,
            thread.posts + ' comments',
          ]),
        ]),
      ]);
    }

    const buttonGraphic = doc.createElementNS(SVG_NAMESPACE, 'svg');
    buttonGraphic.setAttributeNS(null, 'version', '1.1');
    buttonGraphic.setAttributeNS(null, 'width', '1024');
    buttonGraphic.setAttributeNS(null, 'height', '1024');
    buttonGraphic.setAttributeNS(null, 'viewBox', '0 0 1024 1024');
    buttonGraphic.setAttributeNS(null, 'class',
                                 '-amp-disqus-launch-button__svg');
    const buttonPath = doc.createElementNS(SVG_NAMESPACE, 'path');
    buttonPath.setAttributeNS(null, 'd', 'M524.456259,1012.5 C404.195712,1012.5 294.23718,968.012444 209.221899,894.419296 L0,923.35537 L80.8289496,721.399852 C52.6676835,658.493741 36.8688345,588.659481 36.8688345,515 C36.8688345,240.254704 255.169612,17.5 524.456259,17.5 C793.721065,17.5 1012,240.254704 1012,515 C1012,789.796889 793.728345,1012.5 524.456259,1012.5 L524.456259,1012.5 Z M790.685065,520.577519 L790.685065,519.191889 C790.685065,375.631815 690.679079,273.264741 518.245928,273.264741 L332.008806,273.264741 L332.008806,770.764741 L515.48659,770.764741 C689.259367,770.772111 790.685065,664.130222 790.685065,520.577519 L790.685065,520.577519 L790.685065,520.577519 Z M520.29905,648.534519 L465.825784,648.534519 L465.825784,395.531815 L520.29905,395.531815 C600.305295,395.531815 653.409813,441.707185 653.409813,521.344037 L653.409813,522.729667 C653.409813,603.037222 600.305295,648.534519 520.29905,648.534519 L520.29905,648.534519 Z');  // eslint-disable-line max-len
    buttonGraphic.appendChild(buttonPath);

    return this.fetch().then(data => {
      console.log(data);

      if (!data) {
        // TODO: Render something on error
        return null;
      }

      this.data_ = data;

      this.sendInitEvent(data);
      if (this.shouldReportView_) {
        this.sendViewEvent(data);
      }

      let headerText = '';
      let buttonText = '';
      let posts = [];

      if (data.posts.length > 0) {
        headerText = 'WHAT PEOPLE ARE SAYING';
        buttonText = `READ DISCUSSION (${data.details.posts} POSTS)`;
        posts = data.posts.map(renderPost);
      } else if (data.threads.length > 0) {
        headerText = 'WHAT PEOPLE ARE TALKING ABOUT';
        buttonText = 'START DISCUSSION';
        posts = data.threads.map(renderThread);
      } else {
        // TODO: Update button text and header
        posts = [
          m('div', {class: '-amp-disqus-comments__link-wrap'}, [
            'No one else has said anything.',
            m('br'),
            m('a', {
              class: '-amp-disqus-comments__link',
              href: data.amp_url,
              target: '_blank',
            }, [
              'Add your thoughts \u00bb',
            ]),
          ]),
        ];
      }

      return m('div', {class: '-amp-disqus--body'}, [
        m('div', {class: '-amp-disqus--header -amp-disqus-text-gray'}, [
          headerText,
        ]),
        m('div', {class: '-amp-disqus-container'}, [
          m('div', {class: '-amp-disqus-comments'}, [
            m('div', {class: '-amp-disqus-comments__fader'}),
          ].concat(posts)),
          m('a', {
            class: '-amp-disqus-button -amp-disqus-button-wide ' +
              '-amp-disqus-button-fill--brand -amp-disqus-margin-top ' +
              '-amp-disqus-text-smaller -amp-disqus-launch-button',
            href: data.amp_url,
            target: '_blank',
          }, [
            buttonGraphic,
            buttonText,
          ]),
        ]),
      ]);
    });
  }
};

AMP.registerElement('amp-disqus', AmpDisqus, CSS);
