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

# About this guide

This Quick Start guide is the TL;DR version of the longer [end-to-end guide](getting-started-e2e.md) for people who don't want/need a longer explanation.

# One-time Setup

* [Create a GitHub account](https://help.github.com/articles/signing-up-for-a-new-github-account/) if you don't already have one
* Set up [2 factor auth](https://help.github.com/articles/about-two-factor-authentication/) for your GitHub account

* [Install and set up Git](https://help.github.com/articles/set-up-git/); in the "Authenticating" step of that page use SSH instead of HTTPS

* Install [Node.js](https://nodejs.org/) version >= 6 (which includes npm); [NVM](https://github.com/creationix/nvm) is a convenient way to do this on Mac and Linux

* Install [Yarn](https://yarnpkg.com/) version >= 1.2.0 (instructions [here](https://yarnpkg.com/en/docs/install), this may require elevated privileges using `sudo` on some platforms)

* Install Gulp by running `yarn global add gulp` (this may require elevated privileges using `sudo` on some platforms)

* Add this line to your hosts file (`/etc/hosts` on Mac or Linux, `%SystemRoot%\System32\drivers\etc\hosts` on Windows):

    ```
    127.0.0.1 ads.localhost iframe.localhost
    ```

* Fork the [amphtml repository](https://github.com/ampproject/amphtml) by clicking "Fork" in the Web UI.

* Create your local repository: `git clone git@github.com:<your username>/amphtml.git`
* Add an alias:  Go to the newly created local repository directory and run `git remote add upstream git@github.com:ampproject/amphtml.git` and then `git branch -u upstream/master master`

# Branch (do this each time you want a new branch)

* Create and go to the branch: `git checkout -b <branch name> master`

# Build AMP & run a local server

* Make sure you have the latest packages (after you pull): `yarn`
* Start the server: `gulp`
* Access your server at [http://localhost:8000](http://localhost:8000)
* Access your sample pages at [http://localhost:8000/examples](http://localhost:8000/examples)

# Test AMP

* Run all tests: `gulp test`
* Run only the unit tests: `gulp test --unit` (doesn't build the runtime)
* Run only the integration tests: `gulp test --integration` (builds the runtime)
* Run tests, but skip building after having done so previously: `gulp test --nobuild`
* Run the tests in a specified set of files: `gulp test --files=<filename>`
* Add the `--watch` flag to any `gulp test` command to automatically re-run the tests when a file changes
* To run only a certain set of Mocha tests change  `describe` to `describe.only` for the tests you want to run; combine this with `gulp test --watch` to automatically rerun your test when files are changed   (but make sure to run all the tests before sending your change for review)

# Create commits to contain your changes

* Edit files in your favorite editor
* if your code requires a new dependency, run `yarn add --dev --exact [packagename]`, which will automatically update `package.json` and `yarn.lock`
* if you manually edited `package.json`, run `yarn install` to install the dependency and generate an updated `yarn.lock` file
* Add each file you change: `git add <file>`
* Create a commit: `git commit -m "<your commit message>"`
* Instead of `add`ing each file individually you can use the `-a` flag on the commit instead

# Pull the latest changes

* `git checkout master`
* `git pull`
* `git checkout <branch name>`
* `git rebase master`
* Note that you may need to resolve conflicting changes at this point

# Push your branch & create a Pull Request

* Pull the latest changes as described above
* `git checkout <branch name>`
* `git push -u origin <branch name>`
* Go to [https://github.com/ampproject/amphtml](https://github.com/ampproject/amphtml) and in the banner indicating you've recently pushed a branch, click the "Compare & pull request"  (if this banner does not appear, go to your fork at `https://github.com/<your username>/amphtml`, choose your branch from the "Branch" dropdown and click "New pull request")
* Make sure you've signed the CLA (using the same email address as your git config indicates)
* If your reviewer requests changes make them locally and then repeat the steps in this section to push the changes to your branch back up to GitHub again
* For pushes after the first, just use `git push`
* If you don't get a new review within 2 business days, feel free to ping the pull request by adding a comment
* If you see visual diffs reported by [Percy](percy.io/ampproject/amphtml), and want to access the results, fill out this [form](https://docs.google.com/forms/d/e/1FAIpQLScZma6qVJtYUTqSm4KtiF3Zc-n5ukNe2GXNFqnaHxospsz0sQ/viewform).

* Once approved your changes are merged into the amphtml repository by a core committer (you don't do this merge)

# Delete your branch after your changes are merged (optional)

* Go to the master branch: `git checkout master`
* Delete your local branch: `git branch -D <branch name>`
* Delete the GitHub fork branch: `git push -d origin <branch name>`

# See your changes in production

* Barring any issues releases are cut on Wednesdays, pushed to Dev Channel Thursday, pushed to 1% of AMP pages on Monday and pushed to all pages a few days later on Thursday.
* The [amphtml Releases page](https://github.com/ampproject/amphtml/releases) will list your PR in the first build that contains it.  `Pre-release` is the build on the Dev Channel, `Latest Release` is the build in production.
* Opt-in to using the Dev Channel in a browser by enabling `dev-channel` on the [AMP Experiments](https://cdn.ampproject.org/experiments.html) page.
* Find the AMP version being used on a page in the developer console, i.e. `Powered by AMP ⚡ HTML – Version <build number>`).
