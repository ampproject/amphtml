const request = require('request');

const CIRCLE_WORKFLOW_ID = process.env.CIRCLE_WORKFLOW_ID || '972a46ec-a0cd-47b0-a4d2-9fad83486c51';
const CIRCLE_TOKEN = process.env.CIRCLE_TOKEN;
const CIRCLE_JOB = process.env.CIRCLE_JOB;

function get(url) {
  return new Promise((resolve, reject) => {
    request
      .get({
        method: 'GET',
        url,
      }, (err, _res, body) => {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(body));
      });
  });
}

function post(url) {
  return new Promise((resolve, reject) => {
    url = new URL(url);
    request({
      method: 'POST',
      url,
    },
      (err, _res, body) => {
        if (err) {
          reject(err);
        }
        resolve(body);
      }
    );
  });
}

async function cancelAllRunningJobs() {
  const jobs = await get(
    `https://circleci.com/api/v2/workflow/${CIRCLE_WORKFLOW_ID}/job?circle-token=${CIRCLE_TOKEN}`
  );
  // DO_NOT_SUBMIT
  console.log(jobs);
  console.log('failed', jobs.items.filter(job => job.status === 'failed').length);
  console.log('canceled', jobs.items.filter(job => job.status === 'canceled').length);
  console.log('running', jobs.items.filter(job => job.status === 'running').length);
  jobs.items.filter(job => job.status === 'running' && job.name !== CIRCLE_JOB).forEach(job => {
    console.log(`Canceling job ${job.job_number}`);
    post(`https://circleci.com/api/v2/project/github/ampproject/amphtml/job/${job.job_number}/cancel?circle-token=${CIRCLE_TOKEN}`);
  })
}

cancelAllRunningJobs();
