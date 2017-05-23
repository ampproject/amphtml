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

* Install [NodeJS](https://nodejs.org/)

* Install [yarn](https://yarnpkg.com/en/docs/install)

* Install Gulp by running `yarn global add gulp`

* Add this line to your hosts file (`/etc/hosts` on Mac or Linux, `%SystemRoot%\System32\drivers\etc\hosts` on Windows):

    ```
    127.0.0.1               ads.localhost iframe.localhost
    ```

* Fork the [amphtml repository](https://github.com/ampproject/amphtml) by clicking "Fork" in the Web UI.

* Create your local repository: `git clone git@github.com:<your username>/amphtml.git`
* Add an alias.  From the newly created local repository directory run: `git remote add upstream git@github.com:ampproject/amphtml.git`

# Branch (do this each time you want a new branch)

* Create the branch: `git branch --track <branch name> origin/master`
* Go to the branch: `git checkout <branch name>`

# Build AMP & run a local server
* Make sure you have the latest packages (after you pull): `yarn`
* Start the server: `gulp`
* Access your server at [http://localhost:8000](http://localhost:8000)
* Access your sample pages at [http://localhost:8000/examples](http://localhost:8000/examples)
* Change the suffix for the examples from .html to .max.html to use your local JavaScript

# Test AMP
* Run the tests: `gulp test`
* Run the tests in a specified set of files: `gulp test --files=<filename>`
* Add the `--watch` flag to any `gulp test` command to automatically re-run the tests when a file changes
* To run only a certain set of Mocha tests change  `describe` to `describe.only` for the tests you want to run; combine this with `gulp test --watch` to automatically rerun your test when files are changed   (but make sure to run all the tests before sending your change for review)

# Create commits to contain your changes

* Edit files in your favorite editor
* Add each file you change: `git add <file>`
* Create a commit: `git commit -m "<your commit message>"`
* Instead of `add`ing each file individually you can use the `-a` flag on the commit instead

# Pull the latest changes

* `git checkout master`
* `git pull upstream master`
* `git checkout <branch name>`
* `git rebase master`
* Note that you may need to resolve conflicting changes at this point

# Push your branch & create a Pull Request

* Pull the latest changes as described above
* `git checkout <branch name>`
* `git push origin <branch name>`
* Go to [https://github.com/ampproject/amphtml](https://github.com/ampproject/amphtml) and in the banner indicating you've recently pushed a branch, click the "Compare & pull request"  (if this banner does not appear, go to your fork at `https://github.com/<your username>/amphtml`, choose your branch from the "Branch" dropdown and click "New pull request")
* Make sure you've signed the CLA (using the same email address as your git config indicates)
* If your reviewer requests changes make them locally and then repeat the steps in this section to push the changes to your branch back up to GitHub again
* If you don't get a new review within 2 business days, feel free to ping the pull request by adding a comment
* Once approved your changes are merged into the amphtml repository by a core committer (you don't do this merge)

# Delete your branch after your changes are merged (optional)

* Go to the master branch: `git checkout master`
* Delete your local branch: `git branch -D <branch name>`
* Delete the GitHub fork branch: `git push origin --delete <branch name>`

# See your changes in production

* Barring any issues releases are cut on Wednesdays, pushed to Dev Channel Thursday, pushed to 1% of AMP pages on Monday and pushed to all pages a few days later on Thursday.
* The [amphtml Releases page](https://github.com/ampproject/amphtml/releases) will list your PR in the first build that contains it.  `Pre-release` is the build on the Dev Channel, `Latest Release` is the build in production.
* Opt-in to using the Dev Channel in a browser by enabling `dev-channel` on the [AMP Experiments](https://cdn.ampproject.org/experiments.html) page.
* Find the AMP version being used on a page in the developer console, i.e. `Powered by AMP ⚡ HTML – Version <build number>`).
