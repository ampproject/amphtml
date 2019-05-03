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

# Getting Started End-to-end

This end-to-end guide will show you how to contribute code to the AMP Project.  It covers everything from creating a GitHub account to getting your code reviewed and merged.

This guide is intended for people who don't know much about Git/GitHub and the tools we use to build/test AMP (Node.js, Gulp, etc.).  The guide may look long, but it includes a lot of explanation so you can get a better understanding of how things work.

If you're already familiar with Git/GitHub/etc. or you just want to know what commands to type in instead of what they're doing take a look at the much shorter [Quick Start Guide](getting-started-quick.md).

If you do not yet have a specific code contribution project in mind as you go through this guide, consider grabbing one of the [Good First Issues](https://github.com/ampproject/amphtml/labels/good%20first%20issue) we have created for new contributors.

- [How to get help](#how-to-get-help)
- [Intro to Git and GitHub](#intro-to-git-and-github)
- [Set up your GitHub account and Git](#set-up-your-github-account-and-git)
- [Get a copy of the amphtml code](#get-a-copy-of-the-amphtml-code)
  * [Understanding repositories](#understanding-repositories)
  * [Creating your GitHub fork and your local repository](#creating-your-github-fork-and-your-local-repository)
- [Set up aliases for the remote Git repositories](#set-up-aliases-for-the-remote-git-repositories)
- [Building AMP and starting a local server](#building-amp-and-starting-a-local-server)
- [Create a Git branch](#create-a-git-branch)
- [Pull the latest changes from the amphtml repository](#pull-the-latest-changes-from-the-amphtml-repository)
- [Edit files and commit them](#edit-files-and-commit-them)
- [Testing your changes](#testing-your-changes)
  * [Running tests locally](#running-tests-locally)
  * [Running all the Travis CI checks locally](#running-all-the-travis-ci-checks-locally)
  * [Adding tests for your change](#adding-tests-for-your-change)
- [Push your changes to your GitHub fork](#push-your-changes-to-your-github-fork)
- [Send a Pull Request (i.e. request a code review)](#send-a-pull-request-ie-request-a-code-review)
- [Respond to Pull Request comments](#respond-to-pull-request-comments)
- [Delete your branch](#delete-your-branch)
- [See your changes in production](#see-your-changes-in-production)
- [⚡⚡⚡... (Next steps)](#-next-steps)
- [Other resources](#other-resources)

# How to get help

If you have a question or are unsure about something while following this end-to-end guide, you can get help from the AMP Project community in many ways:

* If you are tackling a [Good First Issue](https://github.com/ampproject/amphtml/labels/good%20first%20issue) or other GitHub issue you can ask a question as a comment on the issue directly.  This works particularly well if the question is about how to make progress on that specific issue.

* The [#welcome-contributors](https://amphtml.slack.com/messages/welcome-contributors/) channel on Slack is a place for new contributors getting up to speed in the AMP Project to find help.  You should feel comfortable asking any question in there no matter how basic it may seem to you (e.g. problems getting Git set up, errors during a build, etc.).  We'll send you an [invitation](https://docs.google.com/forms/d/e/1FAIpQLSd83J2IZA6cdR6jPwABGsJE8YL4pkypAbKMGgUZZriU7Qu6Tg/viewform?fbzx=4406980310789882877) if you're not already on the AMP Slack.

* You can also ask questions on [amphtml-discuss@googlegroups.com](https://groups.google.com/forum/#!forum/amphtml-discuss).

# Intro to Git and GitHub

People who have never used Git or GitHub before can find them intimidating--even people who have been coding on large projects for years.  Once you understand a few basic concepts and several commands your day-to-day experience with Git will generally be straightforward.

Despite the similarity in names, Git & GitHub are different:

* Git is a version control system.  You'll install the Git client locally and run Git commands to grab code from a Git repository, make changes and submit code.  You don't need to use GitHub to use Git, but the AMP Project's Git repository happens to be hosted on GitHub.

* GitHub hosts Git repositories and provides other tools that make managing projects easier (like a GUI for code reviews, bug tracking, etc.).

To contribute to the AMP Project you'll use Git to grab a copy of the code from the [amphtml Git repository on GitHub](https://github.com/ampproject/amphtml), make changes locally and push your changes back up to your own Git repository on GitHub so you can get your code changes reviewed and merged into the amphtml codebase.

# Set up your GitHub account and Git

[Create a GitHub account](https://help.github.com/articles/signing-up-for-a-new-github-account/) if you don't already have one.  Because the AMP Project is an open source project you can create a free GitHub account (i.e. click "Join GitHub for free" on the pricing page you end up on).  Once your account is created set up [two-factor authentication](https://help.github.com/articles/about-two-factor-authentication/) for your account.

After you are done setting up your GitHub account [install and set up Git](https://help.github.com/articles/set-up-git/).  You'll download and install Git, perform some basic configuration and then set up authentication for talking to GitHub.  Although the authentication instructions suggest HTTPS is recommended, **you should follow the "Connecting over SSH" instructions instead**.  SSH is required for two-factor authentication which we recommend you use.  (The rest of these instructions will assume you are using SSH.)

# Get a copy of the amphtml code

## Understanding repositories

One of the central concepts of Git is the _repository_, where files are stored and kept track of.  You can browse [the amphtml repository](https://github.com/ampproject/amphtml) using the GitHub web UI.

The process of getting the amphtml code, making changes, getting your changes reviewed and then having your changes become a part of the AMP Project involves *three* repositories:

* The first repository is the **amphtml repository** mentioned above.  When you want to fix a bug or add a feature to AMP your goal is to get your code to become part of this repository (_merged_ in Git terms).  The amphtml repository is an example of a *remote* repository because it's stored in a server that your Git client connects to.

* You'll create a **_fork_ of the amphtml repository** on GitHub before you make your first change.  This creates your own complete copy of all of the files from the amphtml repository which gives you a place to put your changes without affecting other people's work.  Since your fork is on GitHub's servers this is also a *remote* repository.  Once you create your fork you'll be able to browse a copy of all of the files on the Web UI at `https://github.com/<your username>/amphtml`.

* In general you won't be making changes directly on your fork on GitHub since GitHub provides very limited edit and build capabilities.  Instead you'll create a copy of your fork in a **_local_ repository** which will download all of the amphtml files to your computer.  This is where you'll typically be building AMP, making changes, testing them out, etc.

If you are new to Git it may seem surprising that there are three different repositories involved but each one serves its purpose.  Here's how they interact in a typical scenario:

* You'll make changes on your computer (your local repository).

* When you're done you'll push these changes to your fork on GitHub so that others can see your changes and review them before they become part of the amphtml repository.

* When the changes have been approved by someone with permission to do so, that person will handle merging your changes from your GitHub fork to the amphtml repository.

Note that each of these repositories has a complete copy of the entire amphtml codebase.  If your local repository is on your computer and you lose your internet connection you'll still be able to make changes to any file in your local repository.  Part of the workflow for Git that we'll go through is how you keep these three repositories in sync.

One thing that might put your mind at ease:  if you aren't currently a [core committer](../GOVERNANCE.md) to the amphtml project, you can't actually make changes to the amphtml repository directly. So go ahead and try out different Git commands without worrying you're going to break things for other people!

## Creating your GitHub fork and your local repository
To create your fork on GitHub and your local copy of that fork:

* Create a fork of the amphtml repository on GitHub by going to [https://github.com/ampproject/amphtml](https://github.com/ampproject/amphtml) and clicking the "Fork" button near the top.  Your GitHub fork will now be visible at `https://github.com/<your username>/amphtml`. During local development, this will be referred to by `git` as `origin`.

* Create your local copy (or *clone*) of your fork:

    * go to a local directory on your computer where you want to put a copy of the code, e.g. `~/src/ampproject`

    * run the `git clone` command using the address for your remote repository (your GitHub fork):

       ```
       git clone git@github.com:<your username>/amphtml.git
       ```

      (Note that this is the SSH address for your GitHub fork since we assume you've set up SSH for your account as we recommended.  You can always find the SSH and HTTPS addresses of your GitHub fork by clicking the "Clone or download" button on your GitHub fork page.)

After running the command you'll see something like `Receiving objects` and a progress indicator; this is actually downloading all of the files in the repository to your computer.

Once the clone is done you can browse around your newly created local directories and convince yourself that they're the same as what you see on the remote amphtml repository and on your GitHub fork.

# Set up aliases for the remote Git repositories

As described in the previous section you have three repositories you are working with.  It can be helpful to setup aliases to refer to the remote repositories so you don't have to remember their full addresses.  You'll be using these aliases a lot in Git commands.

The `git clone` command you ran above automatically set up one alias for you.  From the local amphtml directory the git clone command created, run

```
git remote -v
```

and you will see

```
origin git@github.com:<your username>/amphtml.git
```

This indicates that the alias _origin_ can be used to refer to your GitHub fork remote repository.

You should also set an alias for the remote amphtml repository since you'll be referring to that in some Git commands.  The convention is to use the alias _upstream_ for this repository.  The address for the amphtml repository looks a lot like the address for your GitHub fork except your username is replaced by `ampproject`.

```
git remote add upstream git@github.com:ampproject/amphtml.git
```

Now run `git remote -v` again and notice that you have set up your upstream alias.

Each branch of your local Git repository can track a branch of a remote repository.  Right now, your local `master` branch is tracking `origin/master`, which corresponds to the `master` branch of your GitHub fork.  You don't actually want this, though; the upstream `master` branch is constantly being updated, and your fork's `master` branch will rapidly become outdated.  Instead, it's best to make your local `master` branch track the upstream `master` branch.  You can do this like so:

```
git fetch upstream master
git branch -u upstream/master master
```

# Building AMP and starting a local server

Now that you have all of the files copied locally you can actually build the code and run a local server to try things out. We use Node.js, the Yarn package manager, Closure Compiler, and the Gulp build system to build amphtml and start up a local server that lets you try out your changes.

* Install the latest LTS version of [Node.js](https://nodejs.org/) (which includes npm). An easy way to do so is with `nvm` (Mac and Linux: [here](https://github.com/creationix/nvm), Windows: [here](https://github.com/coreybutler/nvm-windows))

   ```
   nvm install --lts
   ```

* Install the stable version of [Yarn](https://yarnpkg.com/) (Mac and Linux: [here](https://yarnpkg.com/en/docs/install#alternatives-stable), Windows: [here](https://yarnpkg.com/lang/en/docs/install/#windows-stable))

   ```
   curl -o- -L https://yarnpkg.com/install.sh | bash
   ```
  An alternative to installing `yarn` is to invoke each Yarn command in this guide with `npx yarn` during local development. This will automatically use the current stable version of `yarn`.

* Closure Compiler is automatically installed by Yarn, but it requires Java 8 which you need to install separately. AMP's version of Closure Compiler won't run with newer versions of Java. Download an installer for Mac, Linux or Windows [here](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html).
  * Note: If you are using Mac OS and have multiple versions of Java installed, make sure you are using Java 8 by adding this to `~/.bashrc`:

  ```
  export JAVA_HOME=`/usr/libexec/java_home -v 1.8`
  ```

* If you have a global install of [Gulp](https://gulpjs.com/), uninstall it. (Instructions [here](https://github.com/gulpjs/gulp/blob/v3.9.1/docs/getting-started.md). See [this article](https://medium.com/gulpjs/gulp-sips-command-line-interface-e53411d4467) for why.)

   ```
   yarn global remove gulp
   ```

* Install the [Gulp](https://gulpjs.com/) command line tool, which will automatically use the version of `gulp` packaged with the the amphtml repository. (instructions [here](https://github.com/gulpjs/gulp/blob/v3.9.1/docs/getting-started.md))

   ```
   yarn global add gulp-cli
   ```
  An alternative to installing `gulp-cli` is to invoke each Gulp command in this guide with `npx gulp` during local development. This will also use the version of `gulp` packaged with the amphtml repository.

* In your local repository directory (e.g. `~/src/ampproject/amphtml`), install the packages that AMP uses by running
   ```
   yarn
   ```
   You should see a progress indicator and some messages scrolling by.  You may see some warnings about optional dependencies, which are generally safe to ignore.

Now whenever you're ready to build amphtml and start up your local server, simply go to your local repository directory and run:

```
gulp
```

Running the `gulp` command will compile the code and start up a Node.js server listening on port 8000.  Once you see a message like `Finished 'default'` you can access the local server in your browser at [http://localhost:8000](http://localhost:8000)

You can browse the [http://localhost:8000/examples](http://localhost:8000/examples) directory to see some demo pages for various AMP components and combination of components.

Note that by default each of the pages in the /examples directory uses the unminified AMP JavaScript from your local server. You can also change which JS to load from local server by hitting the `/serve_mode=<mode>` endpoint:

- [http://localhost:8000/serve_mode=default](http://localhost:8000/serve_mode=default)

  This is the default. Unminified AMP JavaScript is served from the local server. For local development you will usually want to serve unminified JS to test your changes.

- [http://localhost:8000/serve_mode=compiled](http://localhost:8000/serve_mode=compiled)

  Minified AMP JavaScript is served from the local server. This is only available after running `gulp dist --fortesting`.

- [http://localhost:8000/serve_mode=cdn](http://localhost:8000/serve_mode=cdn)

  Minified AMP JavaScript is served from `cdn.ampproject.org`.

When you're ready to make changes, you'll want to follow the steps below for creating a branch, testing and sending your changes for review.

The exact changes you'll be making will depend on the issue/feature you are working on.  If you aren't sure where to start, ask for suggestions on the GitHub issue tracking the work you are doing or reach out to the community as described in [How to get help](#how-to-get-help).

# Create a Git branch

You may have noticed that the files in your local repository are editable which makes it tempting to start making your changes right away.  The typical Git workflow, however, takes advantage of one of the best features of Git:  branches.

Branches let you work on multiple different things in your repository in parallel.  For example you can have one branch where you're fixing a bug, another branch where you're implementing a new feature and yet another branch where you're just doing some exploratory work.  These branches co-exist in the same repository so there's no need to go through the forking and cloning steps described earlier every time you want to make a change.

By default you'll have a branch named _master_.  You can see this if you run the command `git branch` which lists the branches in your local repository.

Although you could do work on the master branch, most people choose to leave the master branch unchanged and create other branches to actually do work in.  Creating a branch is easy; simply run:

```
git checkout -b <branch_name> master
```

This will move you to the new branch, which uses `master` as its start point, meaning that it will start out containing the same files as `master`.  You can then start working in the new branch.

(You can use a different branch as a start point, like if you want to make one branch based on another.  Generally, though, you want `master` as your start point.  If you omit the start point, Git will use whichever branch you're currently on.)

Whenever you want to move to a different branch, run the checkout command:

```
git checkout <branch_name>
```

You can see a list of your branches and which one you're currently in by running:

```
git branch
```

Note that currently the branch you just created only exists in your local repository.  If you check the list of branches that exist on your GitHub fork at `https://github.com/<your username>/amphtml/branches/yours`, you won't see this new branch listed.  Later on when we want to make the changes in your branch visible to others (e.g. so you can do a pull request) we'll push this branch to your GitHub fork.

# Pull the latest changes from the amphtml repository

Since your local repository is just a copy of the amphtml repository it can quickly become out of date if other people make changes to the amphtml repository.  Before you start making changes you'll want to make sure you have the latest version of the code; you'll also want to do this periodically during development, before sending your code for review, etc.

In the workflow we will be using you'll go to the master branch on your local repository and pull the latest changes in from the remote amphtml repository's master branch.  (Remember that you set up the alias _upstream_ to refer to the remote amphtml repository, and you set your local `master` branch to track `upstream/master`.)

```
# make sure you are in your local repo's master branch
git checkout master

# pull in the latest changes from the remote amphtml repository
git pull
```
If there have been any changes you'll see the details of what changed, otherwise you'll see a message like `Already up-to-date`.

After running that `git pull` command your local master branch has the latest files, but your other local branches won't get automatically updated.  To get a local branch in sync:

```
# go to the branch you want to sync
git checkout <branch name>

# bring the latest changes from your master branch into this branch
git merge master
```

Since you just ran the `git pull` in your master branch it has the latest changes from the remote amphtml repository so running  `git merge master` in your other branch effectively brings the latest changes from the remote amphtml repository to this other branch.

If there are changes that conflict with changes on your branch (e.g. someone modified a file that you're working on) you'll be prompted to resolve them at this point.

# Edit files and commit them

The common workflow for making changes to files in Git is:

* edit some files using your favorite editor

* if your code requires a new dependency, run `yarn add --dev --exact [packagename]`, which will automatically update `package.json` and `yarn.lock`

* if you manually edited `package.json`, run `yarn install` to install the dependency and generate an updated `yarn.lock` file

* tell Git that you care about these changes by _staging_ them using the `git add` command

* create a checkpoint (called a _commit_) that bundles together the changes you've staged by using the `git commit` command

Git commits bundle together related changes into a logical unit.  (If you're familiar with some other source control systems this terminology may make you think that when you create a commit you're "checking in" your code to the amphtml repository; that's *not* what a Git commit is.)

You can think of a commit as a checkpoint in your branch.  It's a good idea to create a commit when you reach a point in your change that you might want to get back to.  You will at least have to create a commit before syncing your changes to another repository (i.e. your GitHub fork) and requesting a code review.

Let's walk through creating a commit after editing a file.  First, go to the branch you created earlier:

```
git checkout <branch name>
```

Edit a file in this branch using your favorite editor.  After editing the file, run

```
git status
```

and you should see the file you modified in a section that says `Changes not staged for commit` along with some helpful suggestions for what to do next.

Git knows that there's a modified file, but isn't sure what you want to do with it.  (In Git terms, this file is _unstaged_.)  You have to tell Git that this is a change you care about by using the `git add` command.

```
git add <filename>
```

Now run `git status` again and you'll see the file listed under a `Changes to be committed` section.

Since you're done with changes to that file, go ahead and create a commit:

```
git commit -m "<a brief description of your commit>"
```

Now run `git status` again, and you'll see the message `nothing to commit` and `your branch is ahead of 'origin/master' by 1 commit`.

Note that you can optionally skip using `git add` commands and just use the `git commit -a` flag to say "add all of the modified/deleted files to this commit," e.g.

```
git commit -a -m "<a brief description of your commit>"
```

Note that you *can* add changes into an existing commit but that opens up some additional Git concepts that you don't really need to make a contribution.

# Testing your changes

Before sending your code changes for review, please make sure that all of the affected tests are passing. You may be expected to add/modify some tests as well.

{% call callout('Note', type='note') %}
Automatically run most checks on `git push` by enabling our pre-push hook. Run `./build-system/enable-git-pre-push.sh`
{% endcall %}

## Running tests locally

To run the tests that are affected by the changes on your feature branch:

```
gulp test --local-changes
```

By default, all tests are run on Chrome. Pass `--firefox` or `--safari` to run tests in Firefox and Safari, respectively.

If you need help with fixing failing tests, please ask on the GitHub issue you're working on or reach out to the community as described in [How to get help](#how-to-get-help).

## Running Travis CI checks locally

To avoid repeatedly waiting for Travis to run all pull-request checks, you can run them locally:

```
gulp pr-check
```

Notes:

* This will force a clean build and run all the PR checks one by one.
* Just like on Travis, a failing check will prevent subsequent checks from being run.
* The `gulp visual-diff` check will be skipped unless you have set up a Percy account as described in the [Testing](TESTING.md#running-visual-diff-tests-locally) guide.
* Unit and integration tests will be run on local Chrome unless you have set up a Sauce Labs account as described in the [Testing](TESTING.md#testing-on-sauce-labs) guide.

## Adding tests

The `amphtml` testing framework uses the [Mocha](https://mochajs.org/), [Chai](http://chaijs.com/) and [Sinon](http://sinonjs.org/) libraries. You will generally be expected to add tests to verify correctness and to prevent regressions.

Existing components will usually have existing tests that you can follow as an example. For example, the [amp-video](../extensions/amp-video/amp-video.md) component has tests in [test/test-amp-video.js](../extensions/amp-video/0.1/test/test-amp-video.js).

To run tests in a single file, use `gulp test --files=<path>`:

```
gulp test --files=extensions/amp-youtube/0.1/test/test-amp-youtube.js
```

Testing tips:

- Use Mocha's [`.only()`](https://mochajs.org/#exclusive-tests) feature to exclusively run certain test-cases or suites.
- Add `--watch` to your `gulp test` command to automatically re-run tests on code changes.

For more help, see [How to get help](#how-to-get-help).

# Push your changes to your GitHub fork

Up to this point you've been making changes in a branch on your local repository.  Those changes aren't visible anywhere else--not even your GitHub fork--so if you want other people to see your changes you will need to push your branch to your GitHub fork.  This is a necessary step to request a code review (known as a pull request) and to ultimately get your changes added to the amphtml repository.

Before pushing your changes, make sure you have the latest changes in the amphtml repository on your branch by running the commands we described above:

```
git checkout master
git pull
git checkout <branch name>
git merge master
```

Now push your changes to `origin` (the alias for your GitHub fork):

```
git push -u origin <branch name>
```

`-u origin <branch name>` tells Git to create a remote branch with the specified name in `origin` and to make your local branch track that remote branch from now on.  You only have to do this the first time you push each branch.  For subsequent pushes on the same branch, you can use a shorter command:

```
git push
```

The changes you've made are now visible on GitHub!  Go to your fork on GitHub:

```
https://github.com/<your username>/amphtml
```

If you recently pushed the branch you will see a message bar at the top that lists your recently pushed branches next to a convenient "Compare & pull request" button.

Instead of using that button take a look at the "Branch" dropdown on the top left.  Click it and then select the branch you just pushed.  This will take you to your branch on GitHub:

```
https://github.com/<your username>/amphtml/tree/<branch name>
```

Browse around and find the file(s) you modified; you'll see that these match the changes you made in your local repository since you ran `git push` earlier.

If you make further changes in your local repository on the same branch they will *not* automatically be reflected on your GitHub fork.  You will need to create a commit and push your changes again using the same commands as above.

Note that you *can* edit files in your branch directly on GitHub using the web UI.  For simple changes requested in a pull request (e.g. fixing a typo in a comment) this may be okay, but in general it's best to make the changes in your local repository and push them back up to GitHub to avoid confusion.

# Send a Pull Request (i.e. request a code review)

In order for your changes to become part of the amphtml repository, you will need to get your code reviewed by one of the [core committers](../GOVERNANCE.md) via a Pull Request (PR).  In fact you won't actually merge your code into the amphtml repository directly; once a core committer approves it he or she will handle the merge for you.

Once your code is ready for a review, go to [https://github.com/ampproject/amphtml](https://github.com/ampproject/amphtml) and click on the "Compare & pull request" button on the "recently pushed branches" banner.  If that banner isn't visible, go to your GitHub fork at
`https://github.com/<username>/amphtml`, use the Branch dropdown to select the branch that contains the changes you want reviewed and press the "New pull request" button.

On the "Open a pull request" page, you will see dropdowns at the top indicating the proposed merge.  It will look something like:

```
amproject/amphtml / master … <username>/amphtml / <branch name>
```

Below this are text boxes where you can provide a title and description for your pull request.  Please follow the guidelines in the template for providing a good title and description.  Make sure to refer to any Issues that you are fixing (by typing "Issue #" and selecting it from the autocomplete) so that people can see which issue you are fixing and people watching the issue will see that there's a PR for it.

The reviewer should be one of the [core committers](../GOVERNANCE.md) and ideally someone who is familiar with the change you are making (e.g. someone you've been communicating with through an associated GitHub issue).

When you're done click "Create pull request."  This will bring you to your Pull Request page where you can track progress, add comments, etc.

On the Pull Request page you can see that a few checks are running:

* The tests are being run on [Travis](https://travis-ci.org/ampproject/amphtml/pull_requests)

* The system is verifying that you have signed a CLA (Contributor License Agreement).  If this is your first time submitting a Pull Request for the amphtml project you'll need to sign an agreement.  (Make sure the email address you use to sign the CLA is the same one that you configured Git with.)  See details in the [Contributing code](../CONTRIBUTING.md#contributing-code) documentation.

* Your code is going through static analysis by [LGTM](https://lgtm.com/projects/g/ampproject/amphtml/).

* Visual diff tests that are run on Travis are being analyzed by [Percy](http://percy.io/ampproject/amphtml).

If you don't hear back from your reviewer within 2 business days, feel free to ping the pull request by adding a comment.

# Respond to Pull Request comments

If your reviewer doesn't request any changes from you they may go ahead and merge your changes into amphtml.  If they do this you're done since the reviewer will merge your changes for you!  Once your code is merged in you can safely delete your branch.

In the likely event that the reviewer has some comments, you'll need to respond to them.

If the reviewer's comments involve changes in your code, you can make changes on the branch in your local repository in the same way you made your changes originally.  When you run `git commit` after making these changes, you'll be creating a new commit.  (There are ways to "squash" all of your changes into a single commit, but since you've already shared the previous commit in a pull request it's best to avoid that.)

Remember that the changes you make in your local branch won't actually be visible to anyone (including your PR reviewer) until you push the changes up to your GitHub fork remote repository.  You can follow the same steps you followed earlier in the [Push your changes to your GitHub fork](#push-your-changes-to-your-github-fork) section.

You can respond to comments in the GitHub UI.  When making comments, you will see a button to "Start a Review" which lets you group all of your comments and send them as a group.

You can always get back to your open Pull Requests on GitHub at `https://github.com/ampproject/amphtml/pulls/<your username>`.

# Delete your branch

Creating, deleting and moving between branches in Git is cheap.  Reusing branches for multiple unrelated changes can lead to a confusing branch history.  For these reasons it's best to delete your branch once your PR using that branch has been approved and merged.  (It can also be really satisfying to delete a branch after a particularly involved change.)

GitHub offers a convenient "Delete branch" button on the PR page after the changes in your branch have been merged into the amphtml repository.  You can click this button to delete your branch in the GitHub fork if you prefer, but you will also want to delete the branch in your local repository:

```
# go back to the master branch
git checkout master

# delete the branch in your local repository
git branch -D <branch name>

# delete the branch in your GitHub fork (if you didn't use the UI)
git push -d origin <branch name>
```

# See your changes in production

**Congratulations on making your first change to AMP!**

If your change affected internal documentation, tests, the build process, etc. you can generally see your changes right after they're merged.  If your change was to the code that runs on AMP pages across the web you'll have to wait for the change to be included in a release.

AMP is pushed to production after undergoing testing. Generally, it takes about 1-2 weeks for a change to be live for all users. For more specific details on the timing of production releases, reference our [release schedule](release-schedule.md).

**Once the push of the build that includes your change is complete all users of AMP will be using the code you contributed!**

You can see whether your change made it into a given build on the [amphtml Releases page](https://github.com/ampproject/amphtml/releases).  The build marked `Pre-release` is the version on the Dev Channel and the build marked `Latest Release` is what is running in production.  Your Pull Request will be listed in the first build that includes it; if you don't see your Pull Request listed it will likely be in the next build.

You can set your browser to use the Dev Channel build by enabling `dev-channel` on the [AMP Experiments](https://cdn.ampproject.org/experiments.html) page.  This will let you see how your changes will affect any AMP page before your changes are rolled out to all AMP pages.  Note that this only affects the browser in which you enable the experiment.

You can verify the AMP version your browser is using for a given page by looking at your browser's developer console.  After loading an AMP page (e.g. [https://amp.dev](https://amp.dev)) the console will have a message like `Powered by AMP ⚡ HTML – Version <build number>`).  The `<build number>` will match one of the build numbers on the [amphtml Releases page](https://github.com/ampproject/amphtml/releases).

The [Release Schedule](release-schedule.md) doc has more details on the release process.

# ⚡⚡⚡... (Next steps)

Now that you know the process for making changes to the AMP Project you already have most of the heavy lifting done.  **We look forward to seeing your future [contributions](../CONTRIBUTING.md) to the project.** :)

If you're looking for ideas on your next contribution feel free to reach out to anyone you worked with on your first contribution or let us know in the [#welcome-contributors](https://amphtml.slack.com/messages/welcome-contributors/) channel on Slack.  (We'll send you an [invitation](https://docs.google.com/forms/d/e/1FAIpQLSd83J2IZA6cdR6jPwABGsJE8YL4pkypAbKMGgUZZriU7Qu6Tg/viewform?fbzx=4406980310789882877) if you're not already on the AMP Slack.)

# Other resources

This end-to-end guide provided enough details to get a basic understanding of a typical workflow for contributing code to the AMP Project.  If you find yourself wanting to know more there are a lot of resources available.  Here are a few:

* The ["Creating your first AMP Component" codelab](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/index.html) provides step-by-step instructions for a common type of code contribution to the AMP Project.  Even if your project involves modifying an existing AMP component this codelab will give you an overview of how AMP components work.
* GitHub has a lot of helpful introductory material, including:
   * a [Hello World tutorial](https://guides.github.com/activities/hello-world/) that's a bit less in depth than this guide, but it covers things like creating a new repository and merging in code after a pull request
   * the [Git cheat sheet](https://services.github.com/on-demand/downloads/github-git-cheat-sheet.pdf) from GitHub provides a quick reference to some common commands, including many we didn't cover in this guide (such as [diff](https://www.git-tower.com/learn/git/ebook/en/command-line/advanced-topics/diffs) and [log](https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History))
   * a [Training & Guides video series](https://www.youtube.com/user/GitHubGuides)
* The official [Git docs](https://git-scm.com/doc) have a lot of information including the [reference docs](https://git-scm.com/docs) and an online version of [Pro Git](https://git-scm.com/book/en/v2).
* You may see discussions about the difference between rebasing and merging in Git, and we glossed over the details in this guide.  If you're curious about the difference the Atlassian [Merging vs. Rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing) tutorial has a good explanation.
