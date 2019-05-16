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

export const FACEBOOKPIXEL_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'pixelId': 'PIXEL-ID',
  },
  'requests': {
    'host': 'https://www.facebook.com',
    'base': '${host}/tr?noscript=1',
    'pageview': '${base}&ev=PageView&id=${pixelId}',
    'event':
      '${base}&ev=${eventName}&' +
      'id=${pixelId}' +
      '&cd[content_name]=${content_name}',
    'eventViewContent':
      '${base}&ev=ViewContent&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_name]=${content_name}' +
      '&cd[content_type]=${content_type}' +
      '&cd[content_ids]=${content_ids}',
    'eventSearch':
      '${base}&ev=Search&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_category]=${content_category}' +
      '&cd[content_ids]=${content_ids}' +
      '&cd[search_string]=${search_string}',
    'eventAddToCart':
      '${base}&ev=AddToCart&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_name]=${content_name}' +
      '&cd[content_type]=${content_type}' +
      '&cd[content_ids]=${content_ids}',
    'eventAddToWishlist':
      '${base}&ev=AddToWishlist&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_name]=${content_name}' +
      '&cd[content_category]=${content_category}' +
      '&cd[content_ids]=${content_ids}',
    'eventInitiateCheckout':
      '${base}&ev=InitiateCheckout&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_name]=${content_name}' +
      '&cd[content_category]=${content_category}' +
      '&cd[num_items]=${num_items}' +
      '&cd[content_ids]=${content_ids}',
    'eventAddPaymentInfo':
      '${base}&ev=AddPaymentInfo&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_category]=${content_category}' +
      '&cd[content_ids]=${content_ids}',
    'eventPurchase':
      '${base}&ev=Purchase&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_name]=${content_name}' +
      '&cd[content_type]=${content_type}' +
      '&cd[content_ids]=${content_ids}' +
      '&cd[num_items]=${num_items}',
    'eventLead':
      '${base}&ev=Lead&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_name]=${content_name}' +
      '&cd[content_category]=${content_category}',
    'eventCompleteRegistration':
      '${base}&ev=CompleteRegistration&' +
      'id=${pixelId}' +
      '&cd[value]=${value}' +
      '&cd[currency]=${currency}' +
      '&cd[content_name]=${content_name}' +
      '&cd[status]=${status}',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
});
