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
