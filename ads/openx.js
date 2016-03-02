/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, writeScript, checkData} from '../src/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function openx(global, data) {

    const openxData = ['host', 'nc', 'auid', 'dfpSlot', 'dfp'];
    let dfpData = Object.assign({}, data);// make a copy for dfp

    checkData(data, openxData);

    // consolidate doubleclick inputs for forwarding
    // conversion rules are explained in openx.md
    if (data.dfpSlot) {

        // anything starting with 'dfp' gets promoted
        // otherwise it's removed
        for (let openxKey of openxData) {
            if (openxKey in dfpData && openxKey !== 'dfp') {
                if (openxKey.startsWith('dfp')) {

                    // remove 'dfp' prefix, lowercase first letter
                    let fixKey = openxKey.substring(3);
                    fixKey = fixKey.substring(0,1).toLowerCase() + fixKey.substring(1);

                    dfpData[fixKey] = data[openxKey];
                }
                delete dfpData[openxKey];
            }
        }

        // promote the whole 'dfp' object
        if ('dfp' in data) {
            Object.assign(dfpData, dfpData.dfp);
            delete dfpData['dfp'];
        }

        checkData(dfpData, [
            'slot', 'targeting', 'categoryExclusions',
            'tagForChildDirectedTreatment', 'cookieOptions',
            'overrideWidth', 'overrideHeight',
        ]);
    }

    let jssdk = 'https://' + data.host + '/mw/1.0/jstag';

    // decide how to render
    if (data.nc && data.dfpSlot) { // doubleclick bidder
        jssdk += '?nc=' + data.nc;
        writeScript(global, jssdk, () => {
            doubleClickWithGpt(global, dfpData);
        });
    } else if (data.auid) { // show just an ad
        global.OX_cmds = [
            () => {
                const oxRequest = OX();
                const oxAnchor = document.createElement('div');
                global.document.body.appendChild(oxAnchor);
                oxRequest.addAdUnit(data.auid);
                oxRequest.setAdSizes([data.width + 'x' + data.height]);
                oxRequest.getOrCreateAdUnit(data.auid).set('anchor', oxAnchor);
                oxRequest.load();
            }
        ];
        loadScript(global, jssdk);
    } else if (data.dfpSlot) { // plain dfp fallback
        doubleClickWithGpt(global, dfpData);
    }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function doubleClickWithGpt(global, data) {
    const dimensions = [[
        parseInt(data.overrideWidth || data.width, 10),
        parseInt(data.overrideHeight || data.height, 10)
    ]];

    if (global.context.clientId) {
        // Read by GPT for GA/GPT integration.
        global.gaGlobal = {
            vid: global.context.clientId,
            hid: global.context.pageViewId,
        };
    }

    loadScript(global, 'https://www.googletagservices.com/tag/js/gpt.js', () => {
        global.googletag.cmd.push(() => {
            const googletag = global.googletag;
            const pubads = googletag.pubads();
            const slot = googletag.defineSlot(data.slot, dimensions, 'c')
                .addService(pubads);

            pubads.enableSingleRequest();
            pubads.markAsAmp();
            pubads.set('page_url', global.context.canonicalUrl);
            pubads.setCorrelator(Number(getCorrelator(global)));
            googletag.enableServices();

            if (data.categoryExclusions) {
                if (Array.isArray(data.categoryExclusions)) {
                    for (const categoryExclusion of data.categoryExclusions) {
                        slot.setCategoryExclusion(categoryExclusion);
                    }
                } else {
                    slot.setCategoryExclusion(data.categoryExclusions);
                }
            }

            if (data.cookieOptions) {
                pubads.setCookieOptions(data.cookieOptions);
            }

            if (data.tagForChildDirectedTreatment != undefined) {
                pubads.setTagForChildDirectedTreatment(
                    data.tagForChildDirectedTreatment);
            }

            if (data.targeting) {
                for (const key in data.targeting) {
                    slot.setTargeting(key, data.targeting[key]);
                }
            }

            pubads.addEventListener('slotRenderEnded', event => {
                let creativeId = event.creativeId || '_backfill_';
                if (event.isEmpty) {
                    global.context.noContentAvailable();
                    creativeId = '_empty_';
                }
                global.context.reportRenderedEntityIdentifier('dfp-' + creativeId);
            });

            // Exported for testing.
            c.slot = slot;
            googletag.display('c');
        });
    });
}

/**
 * @param {!Object} data
 * @return {number}
 */
function getCorrelator(global) {
    const clientId = global.context.clientId;
    const pageViewId = global.context.pageViewId;
    if (global.context.clientId) {
        return pageViewId + (clientId.replace(/\D/g, '') % 1e6) * 1e6;
    } else {
        return pageViewId;
    }
}