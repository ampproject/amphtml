/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview
 * Common functions for comment.js and incident.js
 */

const steps = [
  {
    'text':
      'Cherry-pick request approved *(this creates an incident on [status.amp.dev](https://status.amp.dev))*',
    'status': 'investigating',
  },
  {
    'text':
      'Cherry-pick started *(this sets the incident status to "Identified")*',
    'status': 'identified',
  },
  {
    'text':
      'Fix deployed to release channels *(this sets the incident status to "Monitoring")*',
    'status': 'monitoring',
  },
  {
    'text': 'Fix verified on release channels *(this resolves the incident)*',
    'status': 'resolved',
  },
];

/**
 * Gets text between two headers
 * @param {string }body
 * @param {string} header
 * @return {string}
 */
function getInnerText(body, header) {
  const markdownHeader = `### ${header}`;
  const start = body.indexOf(markdownHeader);
  const end = body.indexOf('###', start + markdownHeader.length);
  return body.substring(start + markdownHeader.length, end).trim();
}

/**
 * Get channels from Channels section
 * status.amp.dev only cares about Stable and LTS, so ignore other channels
 * @param {string} body
 * @return {Array<string>}
 */
function getChannels(body) {
  const text = getInnerText(body, 'Channels');
  const channels = [];
  for (const channel of ['Stable', 'LTS']) {
    if (text.includes(channel)) {
      channels.push(channel);
    }
  }
  return channels;
}

/**
 * Gets formats from Formats section
 * @param {string} body
 * @return {Array<string>}
 */
function getFormats(body) {
  const text = getInnerText(body, 'Formats');
  const formats = [];
  for (const format of ['Websites', 'Stories', 'Ads', 'Emails']) {
    if (text.includes(format)) {
      formats.push(format);
    }
  }
  return formats;
}

module.exports = {
  getChannels,
  getFormats,
  steps,
};
