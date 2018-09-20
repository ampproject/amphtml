# Code Ownership and AMP

This document describes the code ownership model for the AMP open source
project, and in particular the [AMP HTML GitHub project](https://github.com/ampproject/amphtml).

The goals of enforcing AMP code ownership are as follows:

* Provide the flexibility to specify a different set of owners for individual
  directories / files in the repository
* Allow for the recursive inheritance of ownership for files / directories based
  on the ownership of parent directory(ies)
* Prevent incoming pull requests from being merged until they are approved by a
  sufficient number of owners so as to cover all files / directories in the
  change
* Allow overall project / area owners to approve the odd PR, without their
  having to receive a GitHub notification them about every incoming PR
* Provide an automated mechanism to update the approved status of a PR each time
  a reviewer modifies it
* Forbid non-committers and non-owners from modifying the approved status of a
  pull request
* Make it easy to add / change the list of owners for a given directory / file

## Chromium's code ownership model

The Chromium open source project implements a code ownership
[model](https://chromium.googlesource.com/chromium/src/+/master/docs/code_reviews.md#OWNERS-files)
that we would like to use for AMP HTML. Unfortunately, with GitHub's
[native](https://help.github.com/articles/about-codeowners/) code-ownership
solution, a key feature is missing: `OWNERS` files are not recursive. In other
words, the owner of a directory is not automatically the owner its
subdirectories.

## AMP's code ownership solution

The AMP project will use a custom open-source web service available on GitHub at
[google/github-owners-bot](https://github.com/google/github-owners-bot). This
will be deployed on [ampproject/amphtml](https://github.com/ampproject/amphtml)
as a bot, which will update the status of a pull request in response to the
following events:

* Creation of a pull request
* New commit pushed to a pull request
* Comment posted on a pull request
* Pull request reviewed

After each of these events, the pull request's status will be updated by the bot
to indicate whether it has been approved by a sufficient number of owners.

An earlier version of this bot was limited by GitHub's API, which could only
post comments to pull requests. This did not scale well at the time, and use of
the bot was discontinued.

Today, GitHub supports a new [status API](https://developer.github.com/v3/repos/statuses/)
that will be used by the bot to directly update the status of pull requests as
described above. Stay tuned for the latest changes.
