/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {jsonLiteral} from '../../../../src/json';

const SUBSCRIPTIONS_PROPENSITY_CONFIG = jsonLiteral({
  'vars': {
    'clientId': 'CLIENT_ID(__gads)',
    'productObj': '{"product": [${products}]}',
    'stateParams': '${publicationId}:${state}',
    'eventParams': '${publicationId}:${event}',
  },
  'requests': {
    'baseUrl': 'https://pubads.g.doubleclick.net/subopt',
    'baseParams':
      'u_tz=240&v=1&cookie=${clientId}&cdm=${sourceHostName}&_amp_source_origin=${sourceHost}&extrainfo=',
    'sendBase': '${baseUrl}/data?${baseParams}',
    'sendSubscriptionState': '${sendBase}${productObj}&states=${stateParams}',
    'sendEvent': '${sendBase}${data}&events=${eventParams}',
  },
  'triggers': {
    'onSubscribed': {
      'on': 'subscriptions-access-granted',
      'request': 'sendSubscriptionState',
      'vars': {
        'state': 'subscriber',
        'products': '"${productId}"',
      },
    },
    'onNotSubscribed': {
      'on': 'subscriptions-access-denied',
      'request': 'sendSubscriptionState',
      'vars': {
        'state': 'non_subscriber',
        'products': '"${productId}"',
      },
    },
    'onShowOffers': {
      'on': 'subscriptions-action-showOffers-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'offers_shown',
        'data': '{"skus": "${skus}","source": "${source}"}',
      },
    },
    'onPaywall': {
      'on': 'subscriptions-paywall-activated',
      'request': 'sendEvent',
      'vars': {
        'event': 'paywall',
        'data': '{"is_active": false, "source": "${source}"}',
      },
    },
    'onSelectOffer': {
      'on': 'subscriptions-action-subscribe-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'offer_selected',
        'data': '{"is_active": true,"product": "${product}"}',
      },
    },
    'onStartBuyflow': {
      'on': 'subscriptions-action-subscribe-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'payment_flow_start',
        'data': '{"is_active": true,"product": "${product}"}',
      },
    },
    'onPaymentComplete': {
      'on': 'subscriptions-action-subscribe-success',
      'request': 'sendEvent',
      'vars': {
        'event': 'payment_complete',
        'data': '{"is_active": true,"product": "${product}"}',
      },
    },
  },
  'transport': {
    'beacon': true,
    'xhrpost': false,
    'image': false,
  },
});

export {SUBSCRIPTIONS_PROPENSITY_CONFIG};
