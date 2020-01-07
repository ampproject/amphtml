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
    'startJson': '%7B',
    'endJson': '%7D',
    'q': '%22',
    'c': '%3A',
    ',': '%2C%20',
    'sourceKV': '${q}source${q}${c} ${q}${source}${q}',
    'activeKV': '${q}is_active${q}${c} ${q}${active}${q}',
    'adnameKV': '${q}ad_name${q}${c} ${q}${adname}${q}',
    'skusKV': '${q}skus${q}${c} ${q}${skus}${q}',
    'productKV': '${q}product${q}${c} ${q}${product}${q}',
  },
  'requests': {
    'baseParams':
      'u_tz=240&v=1&cookie=${clientId}&cdm=${sourceHostName}&_amp_source_origin=${sourceHost}',
    'baseUrl': 'https://pubads.g.doubleclick.net/subopt/data?${baseParams}',
    'stateParams': 'states=${publicationId}%3A${state}%3A${productId}',
    'eventParams':
      'events=${publicationId}%3A${event}%3A${startJson}${keyValues}${endJson}',
    'sendSubscriptionState': '${baseUrl}&${stateParams}',
    'sendEvent': '${baseUrl}&${eventParams}',
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
        'active': 'true',
        'keyValues': '${skusKV}${,}${sourceKV}${,}${activeKV}',
      },
    },
    'onPaywall': {
      'on': 'subscriptions-paywall-activated',
      'request': 'sendEvent',
      'vars': {
        'event': 'paywall',
        'active': 'false',
        'keyValues': '${sourceKV}${,}${activeKV}',
      },
    },
    'onSelectOffer': {
      'on': 'subscriptions-action-subscribe-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'offer_selected',
        'active': 'true',
        'keyValues': '${productKV}${,}${activeKV}',
      },
    },
    'onStartBuyflow': {
      'on': 'subscriptions-action-subscribe-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'payment_flow_start',
        'active': 'true',
        'keyValues': '${productKV}${,}${activeKV}',
      },
    },
    'onPaymentComplete': {
      'on': 'subscriptions-action-subscribe-success',
      'request': 'sendEvent',
      'vars': {
        'event': 'payment_complete',
        'active': 'true',
        'keyValues': '${productKV}${,}${activeKV}',
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
