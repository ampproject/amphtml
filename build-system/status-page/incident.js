/**
 * @fileoverview
 * Sync status.amp.dev with cherry-pick progress
 */

const {getChannels, getFormats, steps} = require('./common');
const {log} = require('../common/logging');

const [number] = process.argv.slice(2);
const body = process.env.BODY || '';
const after = process.env.COMMENT_AFTER || '';
const before = process.env.COMMENT_BEFORE || '';

const apiUrl = `https://api.statuspage.io/v1/pages/${process.env.STATUS_PAGE_ID}`;
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `OAuth ${process.env.STATUS_PAGE_TOKEN}`,
};
const componentsIds = {
  'Websites': process.env.WEBSITES_ID || '7sg50qz95rt7',
  'Stories': process.env.STORIES_ID || 'yy777zy1tzt4',
  'Ads': process.env.ADS_ID || '9vglh2hndltg',
  'Emails': process.env.EMAILS_ID || 'd3lmsf61qb52',
};
const updateBodies = {
  'identified': 'The issue has been identified and a fix is underway.',
  'monitoring': `The fix has been deployed and is being rolled out to the CDN.
    Please allow up to 30 minutes for the CDN to pick up the fix.`,
  'resolved': 'The fix has been verified.',
};

/**
 * Create incident on status.amp.dev
 * @param {Array<string>} channels
 * @param {Array<string>} formats
 * @param {string} status
 * @return {Promise<Object>} response
 */
async function createIncident(channels, formats, status) {
  const components = {};
  formats.forEach((format) => {
    components[componentsIds[format]] = 'degraded_performance';
  });

  const incident = {
    'name': `Incident in ${channels.join(' and ').toUpperCase()}`,
    'status': status,
    'impact_override': 'minor',
    'body': `We are investigating reports of a bug that is seen in ${channels
      .join(' and ')
      .toUpperCase()}.
      https://github.com/ampproject/amphtml/issues/${number}`,
    'components': components,
    'metadata': {
      'github': {
        'cherry_pick_issue_number': number,
      },
    },
  };

  const response = await fetch(`${apiUrl}/incidents`, {
    method: 'POST',
    headers,
    body: JSON.stringify({'incident': incident}),
  });

  return await response.json();
}

/**
 * Get unresolved incident by cherry-pick issue number
 * @return {Promise<Object>}
 */
async function getIncident() {
  const response = await fetch(`${apiUrl}/incidents/unresolved`, {
    headers,
  });

  for (const incident of await response.json()) {
    if (incident.metadata.github.cherry_pick_issue_number === number) {
      return incident;
    }
  }

  throw new Error(
    `Could not find an unresolved incident for cherry-pick issue #${number}`
  );
}

/**
 * Updates incident on status.amp.dev
 * @param {Array<string>} formats
 * @param {string} status
 * @return {Promise<Object>}
 */
async function updateIncident(formats, status) {
  const components = {};
  formats.forEach((format) => {
    components[componentsIds[format]] =
      status === 'resolved' ? 'operational' : 'degraded_performance';
  });

  const incident = await getIncident();
  incident.body = updateBodies[status];
  incident.status = status;
  incident.components = components;

  const response = await fetch(`${apiUrl}/incidents/${incident.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({'incident': incident}),
  });

  return await response.json();
}

/**
 * Syncs incident with cherry-pick progress
 * @return {Promise<void>}
 */
async function syncIncident() {
  const formats = getFormats(body);
  const channels = getChannels(body);
  if (channels.length == 0) {
    return;
  }

  // get step that was checked off
  let checked = -1;
  for (let i = steps.length - 1; i >= 0; i--) {
    const regex = new RegExp(
      `[x] <!-- status=${steps[i].status} -->`.replace(/[[\]\\]/g, '\\$&')
    );
    if (regex.test(after) && !regex.test(before)) {
      checked = i;
      break;
    }
  }

  if (checked === -1) {
    return;
  }

  if (checked === 0) {
    const response = await createIncident(
      channels,
      formats,
      steps[checked].status
    );
    log(response);
    return;
  }

  const response = await updateIncident(formats, steps[checked].status);
  log(response);
}

syncIncident();
