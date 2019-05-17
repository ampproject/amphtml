<!---
Copyright 2017 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Getting Started: Quick Start

## About this guide

This Quick Start guide is the TL;DR version of the longer [end-to-end guide](getting-started-e2e.md) for people who don't want/need a longer explanation.

## One-time Setup

1. [Create a GitHub account](https://help.github.com/articles/signing-up-for-a-new-github-account/) if you don't already have one.
2. Set up [2 factor auth](https://help.github.com/articles/about-two-factor-authentication/) for your GitHub account.
3. [Install and set up Git](https://help.github.com/articles/set-up-git/); in the "Authenticating" step of that page use SSH instead of HTTPS.
4.  Install the latest LTS version of [Node.js](https://nodejs.org/) (which includes npm). An easy way to do so is with `nvm`. (Mac and Linux: [here](https://github.com/creationix/nvm), Windows: [here](https://github.com/coreybutler/nvm-windows))

    ```shell
    nvm install --lts
    ```
5.  Install the stable version of [Yarn](https://yarnpkg.com/). (Mac and Linux: [here](https://yarnpkg.com/en/docs/install#alternatives-stable), Windows: [here](https://yarnpkg.com/lang/en/docs/install/#windows-stable))
    
    ```shell
    curl -o- -L https://yarnpkg.com/install.sh | bash
    ```
    An alternative to installing `yarn` is to invoke each Yarn command in this guide with `npx yarn` during local  
    development. This will automatically use the current stable version of `yarn`.

6.  If you have a global install of [Gulp](https://gulpjs.com/), uninstall it. (Instructions [here](https://github.com/gulpjs/gulp/blob/v3.9.1/docs/getting-started.md). See [this article](https://medium.com/gulpjs/gulp-sips-command-line-interface-e53411d4467) for why.)
    
    ```shell
    yarn global remove gulp
    ```
    
7.  Install the [Gulp](https://gulpjs.com/) command line tool, which will automatically use the version of `gulp` packaged with the the amphtml repository. (Instructions [here](https://github.com/gulpjs/gulp/blob/v3.9.1/docs/getting-started.md))

    ```shell
    yarn global add gulp-cli
    ```
    
    An alternative to installing `gulp-cli` is to invoke each Gulp command in this guide with `npx gulp` during local 
    development. This will also use the version of `gulp` packaged with the amphtml repository.

8.  Create your own fork of the [amphtml repository](https://github.com/ampproject/amphtml) by clicking "Fork" in the Web UI. During local development, this will be referred to by `git` as `origin`.

9.  Download your fork to a local repository.
    
    ```shell
    git clone git@github.com:<your username>/amphtml.git
    ```

10.  Add an alias called `upstream` to refer to the main `ampproject/amphtml` repository. Go to the root directory of the 
     newly created local repository directory and run:
     
     ```shell
     git remote add upstream git@github.com:ampproject/amphtml.git
     ```

11.  Fetch data from the `upstream` remote:
     
     ```shell
     git fetch upstream master
     ```
    
12.  Set up your local `master` branch to track `upstream/master` instead of `origin/master` (which will rapidly become 
     outdated).
     
     ```shell
     git branch -u upstream/master master
     ```
    
## Branch (do this each time you want a new branch)

Create and go to the branch: 

```shell
git checkout -b <branch name> master
```

## Build AMP & run a local server

1. Make sure you have the latest packages (after you pull): `yarn`
1. Start the server: `gulp`
1. Access your server at [http://localhost:8000](http://localhost:8000)
1. Access your sample pages at [http://localhost:8000/examples](http://localhost:8000/examples)

## Test AMP

* Run the unit tests: `gulp test --unit` (doesn't build the runtime)
* Run the integration tests: `gulp test --integration` (builds the runtime)
* Run tests, but skip building after having done so previously: `gulp test [--unit|--integration] --nobuild`
* Run the tests in a specified set of files: `gulp test [--unit|--integration] --files=<test-files-path-glob>`
* Add the `--watch` flag to any `gulp test` command to automatically re-run the tests when a file changes
* To run only a certain set of Mocha tests, change  `describe` to `describe.only` for the tests you want to run; combine this with `gulp test --watch` to automatically rerun your test when files are changed   (but make sure to run all the tests before sending your change for review)

## Create commits to contain your changes

1. Edit files in your favorite editor
2. Make sure your changes satisfy AMP's [code quality and style rules](getting-started-e2e.md#code-quality-and-style)
3. If your code requires a new dependency, run `yarn add --dev --exact [packagename]`, which automatically updates `package.json` and `yarn.lock`
4. If you manually edited `package.json`, run `yarn` to install the dependency and generate an updated `yarn.lock` file
5. Add each file you change: `git add <file>`
6. Create a commit: `git commit -m "<your commit message>"`
7. To avoid having to run `git add` on each file, you can use `git commit -a -m "<your commit message>"` instead.

## Pull the latest changes

1.  Check out the master branch: `git checkout master`
2.  Pull the latest changes: `git pull`
3.  Check out your branch: `git checkout <branch name>`
4.  Merge the changes to your branch: `git merge master`

      **Note**: You may need to resolve conflicting changes at this point.

## Push your branch & create a Pull Request

1.  Pull the latest changes as described above.
2.  Push the changes:

    ```shell
    git checkout <branch name>
    git push -u origin <branch name>
    ```
3. Go to [https://github.com/ampproject/amphtml](https://github.com/ampproject/amphtml) and in the banner indicating you've recently pushed a branch, click the "Compare & pull request"  (if this banner does not appear, go to your fork at `https://github.com/<your username>/amphtml`, choose your branch from the "Branch" dropdown and click "New pull request")
4. Make sure you've signed the [CLA](https://github.com/ampproject/amphtml/blob/master/contributing/contributing-code.md#contributor-license-agreement) (using the same email address as your git config indicates)
5. [Find people to review your code](https://github.com/ampproject/amphtml/blob/master/contributing/contributing-code.md#code-review-and-approval) and add them as a reviewer on the PR (if you can) or cc them (by adding `/cc @username` in the PR description/comment).  If your run into any issues finding the reviewers or have any other questions, ping the [#contributing channel](https://amphtml.slack.com/messages/C9HRJ1GPN/) on [Slack](https://bit.ly/amp-slack-signup).
5. If a reviewer requests changes make them locally and then repeat the steps in this section to push the changes to your branch back up to GitHub again.
6. For pushes after the first, just use `git push`
7. If you don't get a new review within 2 business days, feel free to ping the pull request by adding a comment.
8. If you see visual diffs reported by [Percy](http://percy.io/ampproject/amphtml), click through the check on GitHub to access the results. Differences that are expected can be approved by one of your reviewers.
9. Once approved your changes are merged into the amphtml repository by one of your reviewers.

## Delete your branch after your changes are merged (optional)

1.  Go to the master branch: `git checkout master`
2. Delete your local branch: `git branch -D <branch name>`
3.  Delete the corresponding GitHub fork branch: `git push -d origin <branch name>`

## See your changes in production

* If your change affected internal documentation, tests, the build process, etc. you can generally see your changes right after they're merged.
* If your change was to the code that runs on AMP pages across the web, you'll have to wait for the change to be included in a production release. Generally, it takes about 1-2 weeks for a change to be live for all users. See the [release schedule](release-schedule.md) for more specific details.
* The [amphtml Releases page](https://github.com/ampproject/amphtml/releases) will list your PR in the first build that contains it. `Pre-release` is the build on the Dev Channel, `Latest Release` is the build in production.
* Opt in to using the Dev Channel in a browser by enabling `dev-channel` on the [AMP Experiments](https://cdn.ampproject.org/experiments.html) page.
* Find the AMP version being used on a page in the developer console, i.e. `Powered by AMP ⚡ HTML – Version <build number>`.
