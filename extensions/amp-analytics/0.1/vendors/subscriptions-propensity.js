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
    'data':
      '{"skus": "${skus}","source": "${source}","is_active": ${active},"product": "${product}"}',
  },
  'requests': {
    'baseParams':
      'u_tz=240&v=1&cookie=${clientId}&cdm=${sourceHostName}&_amp_source_origin=${sourceHost}',
    'sendBase': 'https://pubads.g.doubleclick.net/subopt/data?${baseParams}',
    'sendSubscriptionState':
      '${sendBase}&states=$URLENCODE(${publicationId}:${state}:${productId})',
    'sendEvent':
      '${sendBase}&events=$URLENCODE(${publicationId}:${event}:${data})',
  },
  'triggers': {
    'onSubscribed': {
      'on': 'subscriptions-access-granted',
      'request': 'sendSubscriptionState',
      'vars': {
        'state': 'subscriber',
      },
    },
    'onNotSubscribed': {
      'on': 'subscriptions-access-denied',
      'request': 'sendSubscriptionState',
      'vars': {
        'state': 'non_subscriber',
      },
    },
    'onShowOffers': {
      'on': 'subscriptions-action-showOffers-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'offers_shown',
      },
    },
    'onPaywall': {
      'on': 'subscriptions-paywall-activated',
      'request': 'sendEvent',
      'vars': {
        'event': 'paywall',
      },
    },
    'onSelectOffer': {
      'on': 'subscriptions-action-subscribe-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'offer_selected',
      },
    },
    'onStartBuyflow': {
      'on': 'subscriptions-action-subscribe-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'payment_flow_start',
      },
    },
    'onPaymentComplete': {
      'on': 'subscriptions-action-subscribe-success',
      'request': 'sendEvent',
      'vars': {
        'event': 'payment_complete',
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
