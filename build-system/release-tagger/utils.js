/**
 * @fileoverview
 * GitHub API util functions.
 */

const dedent = require('dedent');
const {graphql} = require('@octokit/graphql');
const {Octokit} = require('@octokit/rest');

/** @typedef {import('@octokit/graphql').GraphQlQueryResponseData} GraphQlQueryResponseData */

/**
 * GitHub API util functions
 */
class GitHubApi {
  /**
   * @param {object} octokitRest
   * @param {object} octokitGraphQl
   */
  constructor(octokitRest, octokitGraphQl) {
    this.octokit = octokitRest
      ? octokitRest
      : new Octokit({
          auth: process.env.GITHUB_TOKEN,
          userAgent: 'amp release tagger',
          timeZone: 'America/Los_Angeles',
        });
    this.octokit.hook.error('request', (error) => {
      // don't throw an error if resource is not found
      if (error.status === 404) {
        return;
      }
    });

    this.graphqlWithAuth = octokitGraphQl
      ? octokitGraphQl
      : graphql.defaults({
          headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        });

    this.info = {owner: 'ampproject', repo: 'amphtml'};
    this.config = {
      singleNodeQueryLimit: 100,
      totalNodeQueryLimit: 500000,
      batchSize: 5,
    };
  }

  /**
   * Queries the GitHub GraphQL API in batches.
   * @param {string} queryType
   * @param {Array<string>} queries
   * @return {Promise<Array<GraphQlQueryResponseData>>}
   */
  async runQueryInBatches(queryType, queries) {
    const responses = [];
    for (let i = 0; i < queries.length; i += this.config.batchSize) {
      const join = queries
        .slice(i, i + Math.min(queries.length, this.config.batchSize))
        .join(' ');
      const query = `${queryType} {${join}}`;
      const data = await this.graphqlWithAuth({query});
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
  async createIssue(body, label, title) {
    const {data} = await this.octokit.rest.issues.create({
      ...this.info,
      title,
      body,
      labels: [label],
    });
    return data;
  }

  /**
   * Create a GitHub release
   * @param {string} tag
   * @param {string} commit
   * @param {string} body
   * @param {boolean} prerelease
   * @return {Promise<Object>}
   */
  async createRelease(tag, commit, body, prerelease) {
    const {data} = await this.octokit.rest.repos.createRelease({
      ...this.info,
      name: tag,
      'tag_name': tag,
      'target_commitish': commit,
      body,
      prerelease,
    });
    return data;
  }

  /**
   * Get a GitHub issue by title
   * @param {string} title
   * @return {Promise<GraphQlQueryResponseData|undefined>}
   */
  async getIssue(title) {
    const search = dedent`\
      search(query:"repo:${this.info.owner}/${this.info.repo} in:title ${title}", \
      type: ISSUE, first: 1) { nodes { ... on Issue \
      { number title body url }}}`;
    const query = `query {${search}}`;
    const response = await this.graphqlWithAuth({query});
    if (response.search?.nodes) {
      return response.search.nodes[0];
    }
  }

  /**
   * Get a GitHub release by tag name
   * @param {string} tag
   * @return {Promise<Object|undefined>}
   */
  async getRelease(tag) {
    const response = await this.octokit.rest.repos.getReleaseByTag({
      ...this.info,
      tag,
    });
    return response?.data;
  }

  /**
   * Update a GitHub issue
   * @param {string} body
   * @param {number} number
   * @param {string} title
   * @param {'open' | 'closed'} state
   * @return {Promise<Object>}
   */
  async updateIssue(body, number, title, state = 'open') {
    const {data} = await this.octokit.rest.issues.update({
      ...this.info,
      'issue_number': number,
      title,
      body,
      state,
    });
    return data;
  }

  /**
   * Update a GitHub release
   * @param {string} id
   * @param {object} changes
   * @return {Promise<Object>}
   */
  async updateRelease(id, changes) {
    const {data} = await this.octokit.rest.repos.updateRelease({
      ...this.info,
      'release_id': id,
      ...changes,
    });
    return data;
  }

  /**
   * Get a list of commits between two commits
   * @param {string} head
   * @param {string} base
   * @return {Promise<Object>}
   */
  async compareCommits(head, base) {
    const {data} = await this.octokit.rest.repos.compareCommits({
      ...this.info,
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
  async getPullRequests(shas) {
    const queries = [];
    for (const [i, sha] of shas.entries()) {
      queries.push(
        dedent`\
        pr${i}: search(query:"repo:${this.info.owner}/${this.info.repo} sha:${sha}", type:ISSUE \
        first:${this.config.singleNodeQueryLimit}){\
        nodes { ... on PullRequest { id title number url author { login } \
        files(first:${this.config.singleNodeQueryLimit}) { nodes { path }} \
        mergeCommit { commitUrl oid abbreviatedOid }}}}`
      );
    }
    const nodesLists = await this.runQueryInBatches('query', queries);

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
  async getPullRequestsBetweenCommits(head, base) {
    const {commits} = await this.compareCommits(head, base);
    const shas = commits.map((commit) => commit.sha);
    return this.getPullRequests(shas);
  }

  /**
   * Get label
   * @param {string} name
   * @return {Promise<Object|undefined>}
   */
  async getLabel(name) {
    const response = await this.octokit.rest.issues.getLabel({
      ...this.info,
      name,
    });
    return response?.data;
  }

  /**
   * Label pull requests
   * @param {Array<Object>} prs
   * @param {string} labelId
   * @return {Promise<Array<GraphQlQueryResponseData>>}
   */
  async labelPullRequests(prs, labelId) {
    const mutations = [];
    for (const [i, pr] of prs.entries()) {
      mutations.push(
        dedent`\
        pr${i}: addLabelsToLabelable(input:{labelIds:"${labelId}", \
        labelableId:"${pr.id}", clientMutationId:"${pr.id}"})\
        {clientMutationId}`
      );
    }
    return await this.runQueryInBatches('mutation', mutations);
  }

  /**
   * Unlabel pull requests
   * @param {Array<Object>} prs
   * @param {string} labelId
   * @return {Promise<Array<GraphQlQueryResponseData>>}
   */
  async unlabelPullRequests(prs, labelId) {
    const mutations = [];
    for (const [i, pr] of prs.entries()) {
      mutations.push(
        dedent`\
        pr${i}: removeLabelsFromLabelable(input:{labelIds:"${labelId}", \
        labelableId:"${pr.id}", clientMutationId:"${pr.id}"})\
        {clientMutationId}`
      );
    }
    return await this.runQueryInBatches('mutation', mutations);
  }

  /**
   * Get a git ref
   * @param {string} tag
   * @return {Promise<Object|undefined>}
   */
  async getRef(tag) {
    const response = await this.octokit.rest.git.getRef({
      ...this.info,
      ref: `tags/${tag}`,
    });

    return response?.data;
  }

  /**
   * Create git tag and ref
   * @param {string} tag
   * @param {string} sha
   * @return {Promise<Object>}
   */
  async createTag(tag, sha) {
    await this.octokit.rest.git.createTag({
      ...this.info,
      tag,
      message: tag,
      object: sha,
      type: 'commit',
    });

    // once a tag object is created, create a reference
    const {data} = await this.octokit.rest.git.createRef({
      ...this.info,
      ref: `refs/tags/${tag}`,
      sha,
    });
    return data;
  }
}

module.exports = {GitHubApi};
