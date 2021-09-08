/**
 * @fileoverview
 * GitHub API util functions.
 * TODO: set owner repo defaults
 * TODO: error handling
 */

const dedent = require('dedent');
const {GraphQlQueryResponseData, graphql} = require('@octokit/graphql'); //eslint-disable-line no-unused-vars
const {Octokit} = require('@octokit/rest');

// setup
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'amp release tagger',
  timeZone: 'America/New_York',
});

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});
const owner = 'ampproject';
const repo = 'amphtml';

const config = {
  singleNodeQueryLimit: 100,
  totalNodeQueryLimit: 500000,
  batchSize: 20,
};

/**
 * Queries the GitHub GraphQL API in batches.
 * @param {string} queryType
 * @param {Array<string>} queries
 * @return {Promise<Array<GraphQlQueryResponseData>>}
 */
async function _runQueryInBatches(queryType, queries) {
  const responses = [];
  for (let i = 0; i < queries.length; i += config.batchSize) {
    const join = queries
      .slice(i, i + Math.min(queries.length, config.batchSize))
      .join(' ');
    const query = `${queryType} {${join}}`;
    const data = await graphqlWithAuth({query});
    responses.push(...Object.values(data));
  }
  return responses;
}

/**
 * Create a GitHub issue
 * @param {string} body
 * @param {string} label
 * @param {string} title
 * @return {Promise<Object>}
 */
async function createIssue(body, label, title) {
  return await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
    labels: [label],
  });
}

/**
 * Create a GitHub release
 * @param {string} tag
 * @param {string} commit
 * @param {string} body
 * @param {boolean} prerelease
 * @return {Promise<Object>}
 */
async function createRelease(tag, commit, body, prerelease) {
  return await octokit.rest.repos.createRelease({
    owner,
    repo,
    name: tag,
    'tag_name': tag,
    'target_commitish': commit,
    body,
    prerelease,
  });
}

/**
 * Get a GitHub issue by title
 * @param {string} title
 * @return {Promise<GraphQlQueryResponseData|undefined>}
 */
async function getIssue(title) {
  const search = dedent`\
    search(query:"repo:${owner}/${repo} in:title ${title}", \
    type: ISSUE, first: 1) { nodes { ... on Issue \
    { number title body }}}`;
  const query = `query {${search}}`;
  const response = await graphqlWithAuth({query});
  if (response.search?.nodes) {
    return response.search.nodes[0];
  }
}

/**
 * Get a GitHub release by tag name
 * @param {string} tag
 * @return {Promise<Object>}
 */
async function getRelease(tag) {
  const {data} = await octokit.rest.repos.getReleaseByTag({owner, repo, tag});
  return data;
}

/**
 * Update a GitHub issue
 * @param {string} body
 * @param {number} number
 * @param {string} title
 * @return {Promise<Object>}
 */
async function updateIssue(body, number, title) {
  return await octokit.rest.issues.update({
    owner,
    repo,
    'issue_number': number,
    title,
    body,
  });
}

/**
 * Update a GitHub release
 * @param {string} id
 * @param {Object} changes
 * @return {Promise<Object>}
 */
async function updateRelease(id, changes) {
  return await octokit.rest.repos.updateRelease({
    owner,
    repo,
    'release_id': id,
    ...changes,
  });
}

/**
 * Get a list of commits between two commits
 * @param {string} head
 * @param {string} base
 * @return {Promise<Object>}
 */
async function compareCommits(head, base) {
  const {data} = await octokit.rest.repos.compareCommits({
    owner,
    repo,
    base,
    head,
  });
  return data;
}

/**
 * Get pull requests associated with a list of commits
 * @param {Array<string>} shas
 * @return {Promise<Array<GraphQlQueryResponseData>>}
 */
async function getPullRequests(shas) {
  const queries = [];
  for (const [i, sha] of shas.entries()) {
    queries.push(
      dedent`\
      pr${i}: search(query:"repo:${owner}/${repo} sha:${sha}", type:ISSUE \
      first:${config.singleNodeQueryLimit}){\
      nodes { ... on PullRequest { id title number url author { login } \
      files(first:${config.singleNodeQueryLimit}) { nodes { path }} \
      mergeCommit { commitUrl oid abbreviatedOid }}}}`
    );
  }
  const nodesLists = await _runQueryInBatches('query', queries);

  // Only return pull requests with the merge commit shas
  const prs = [];
  for (const nodesList of nodesLists) {
    for (const node of nodesList.nodes) {
      if (node.mergeCommit && shas.includes(node.mergeCommit.oid)) {
        prs.push(node);
      }
    }
  }
  return prs;
}

/**
 * Get pull requests between two commits
 * @param {string} head
 * @param {string} base
 * @return {Promise<Array<GraphQlQueryResponseData>>}
 */
async function getPullRequestsBetweenCommits(head, base) {
  const {commits} = await compareCommits(head, base);
  const shas = commits.map((commit) => commit.sha);
  return await getPullRequests(shas);
}

/**
 * Get label
 * @param {string} name
 * @return {Promise<Object>}
 */
async function getLabel(name) {
  const {data} = await octokit.rest.issues.getLabel({owner, repo, name});
  return data;
}

/**
 * Label pull requests
 * @param {Array<Object>} prs
 * @param {string} labelId
 * @return {Promise<Array<GraphQlQueryResponseData>>}
 */
async function labelPullRequests(prs, labelId) {
  const mutations = [];
  for (const [i, pr] of prs.entries()) {
    mutations.push(
      dedent`\
      pr${i}: addLabelsToLabelable(input:{labelIds:"${labelId}", \
      labelableId:"${pr.id}", clientMutationId:"${pr.id}"})\
      {clientMutationId}`
    );
  }
  return await _runQueryInBatches('mutation', mutations);
}

/**
 * Unlabel pull requests
 * @param {Array<Object>} prs
 * @param {string} labelId
 * @return {Promise<Array<GraphQlQueryResponseData>>}
 */
async function unlabelPullRequests(prs, labelId) {
  const mutations = [];
  for (const [i, pr] of prs.entries()) {
    mutations.push(
      dedent`\
      pr${i}: removeLabelsFromLabelable(input:{labelIds:"${labelId}", \
      labelableId:"${pr.id}", clientMutationId:"${pr.id}"})\
      {clientMutationId}`
    );
  }
  return await _runQueryInBatches('mutation', mutations);
}

module.exports = {
  createIssue,
  createRelease,
  getLabel,
  getIssue,
  getPullRequestsBetweenCommits,
  getRelease,
  labelPullRequests,
  unlabelPullRequests,
  updateIssue,
  updateRelease,
};
