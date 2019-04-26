# Code Ownership and AMP

This document describes the code ownership (OWNERS) model for the AMP open source
project, and in particular the [AMP HTML GitHub project](https://github.com/ampproject/amphtml).

For more information on the overall code contribution process that the OWNERS model is a part of, see the [Contributing code and features](https://github.com/ampproject/amphtml/blob/master/contributing/contributing-code.md) documentation.

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
that we would like to use for AMP HTML.

## GitHub's native code ownership solution

GitHub's [native](https://help.github.com/articles/about-code-owners/) solution
uses a CODEOWNERS file in each directory to determine who owns the files within
the directory. It has wildcard support to specify different owners for different
files / file types, and glob support to specify owners for an entire directory
tree.

Unfortunately, this solution is missing a key feature: `OWNERS` files are not
recursive. In other words, the owner of a directory is not automatically the
owner of its subdirectories.

## AMP's custom code ownership solution

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

## Approvals required before merging a change

In order to merge a PR, an approval will be required from at least one of the
owners of each file modified by the PR. See [contributing-code.md](./contributing-code.md)
for more details.

## Criteria for being listed as an owner in an `OWNERS.yaml` file

 The `OWNERS.yaml` file for each directory will typically list the creator(s) of
 the component or extension it contains, along with those who are most familiar
 with the directory contents.  To be added to an OWNERS.yaml file create a PR and
 go through the normal [code review process](./contributing-code.md).
