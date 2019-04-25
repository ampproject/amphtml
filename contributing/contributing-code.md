# Contributing code and features

Thank you for helping make AMP better by fixing bugs, adding features or improving the AMP code in some other way!

This document describes the process you will go through to make a change in AMP.

## Process Overview

### Process for minor bug fixes and updates

We want to make it as easy as possible to get in small fixes.  A fix for a small bug should be as easy as creating a PR with the change, adding/fixing a test, and sending it to a reviewer.

- [ ] Sign the [Contributor License Agreement (CLA)](#contributor-license-agreement) as soon as possible if you haven't already done so.  If you are contributing code on behalf of your company and your company is not yet covered by a CLA it can take a few days for the CLA to be verified.
- [ ] (optional) If you are fixing a bug and there is an existing GitHub issue, assign it to yourself (if you can) or comment on it to let others know you are working on it.  If there is no GitHub issue consider filing one, but for minor fixes your PR description may be enough.
- [ ] (optional) [Find a guide](#find-a-guide) before you start coding to help you answer questions.
- [ ] Follow the parts of the [Implementation](#implementation) section that makes sense for your change.  There are many parts of the process that you probably won't need to follow for a minor fix--e.g. you may not need to make validator changes or put your change behind an experiment for minor fixes.  If in doubt ask your guide or the [#contributing channel](https://amphtml.slack.com/messages/C9HRJ1GPN/) on [Slack](https://bit.ly/amp-slack-signup).
- [ ] When your code is ready to review, find [people to review and approve your code](#code-review-and-approval).
  - Your code must be reviewed/approved by an Owner for each area your PR affects and a Reviewer.  (It is acceptable and common for one person to fulfill both roles.)
    - choose an Owner from the OWNERS.yaml file in the directories you change (or their parent directories)
    - choose a [Reviewer](https://github.com/orgs/ampproject/teams/reviewers-amphtml)
  -  Add the Reviewers/Owners as reviewers on your PR if you are able to do so, otherwise cc them by adding the line "/cc @username" in your PR description/comment.

If your run into any issues finding a Reviewer/Owner or have any other questions, ping the [#contributing channel](https://amphtml.slack.com/messages/C9HRJ1GPN/) on [Slack](https://bit.ly/amp-slack-signup).  You can also reach out to mrjoro on Slack or cc him on your GitHub issue/PR.

### Process for significant changes

Significant changes (e.g. new components or significant changes to behavior) require consultation with and approval from knowledgeable members of the community.

- [ ] *Before you start coding*, [find a guide](#find-a-guide) who you can discuss your change with and who can help guide you through the process.
- [ ] Sign the [Contributor License Agreement (CLA)](#contributor-license-agreement) as soon as possible if you haven't already done so.  If you are contributing code on behalf of your company and your company is not yet covered by a CLA it can take a few days for the CLA to be verified.
- [ ] File an [Intent-to-implement (I2I)](https://github.com/ampproject/amphtml/issues/new?assignees=&labels=INTENT+TO+IMPLEMENT&template=intent-to-implement--i2i-.md&title=I2I:%20%3Cyour%20change/update%3E) GitHub issue and cc your guide on it.  The I2I should include:
  -  A description of the change you plan to implement.
  -  If you are integrating a third-party service, provide a link to the third-party's site and product.
  -  Details on any data collection or tracking that your change might require.
  -  A prototype or mockup (for example, an image, a GIF, or a link to a demo).
- [ ] Determine who needs to approve your I2I.  Changes that have a significant impact on AMP's behavior or significant new features require the approval from the [Approvers Working Group (WG)](https://github.com/ampproject/wg-approvers).  Work with your guide to determine whether your change is significant enough that it requires approval from the Approvers Working Group and/or any other [Working Group](https://github.com/ampproject/meta/tree/master/working-groups).
- [ ] Get pre-approval from the Approvers WG if needed.  For changes that require approval from the Approvers WG, at least 3 members of the Approvers WG should provide pre-approval on the I2I before significant implementation work proceeds.
- [ ] Finalize the design of your change.
  - Familiarize yourself with our [Design Principles](DESIGN_PRINCIPLES.md).
  - Your guide can help you determine if your change requires a design doc and whether it should be brought to a [design review](./design-reviews.md).
- [ ] Proceed with the [implementation](#implementation) of your change.
- [ ] For changes that require approval from the Approvers WG, file an [Intent-to-ship (I2S) issue](https://github.com/ampproject/amphtml/issues/new?assignees=&labels=INTENT+TO+SHIP&template=intent-to-ship--i2s-.md&title=I2S:%20%3Cyour%20change/update%3E).  Indicate which experiment is gating your change and a rollout plan.  Once this issue is approved by 3 members of the Approvers WG the rollout plan described in the I2S may proceed.

## Find a guide

A guide is a member of the AMP community who is knowledgeable about the area you are modifying and who can guide you from the design phase all the way through launch.

A guide is required if you are making a substantial change to AMP, but is optional if you are making smaller changes.

To find a guide:
- The [Working Group](https://github.com/ampproject/meta/blob/master/working-groups/README.md) that is most responsible for the area you are changing may document how to find a guide from that Working Group.  If they do not, reach out to the facilitator of the WG (on [Slack](https://bit.ly/amp-slack-signup) or by ccing them on your GitHub issue by adding "/cc @username" in the issue body or comment).
- If there is no obvious Working Group responsible for the area you are changing but you know what part of the codebase your change will be in, reach out to one of the people in the OWNERS.yaml files for the areas you're changing (on [Slack](https://bit.ly/amp-slack-signup) or by ccing them on your GitHub issue).
- If you're still not sure who your guide should be, ask for a guide on [Slack](https://bit.ly/amp-slack-signup) in the [#contributing channel](https://amphtml.slack.com/messages/C9HRJ1GPN/).
- If you can't find a guide after going through these routes or the guides you find aren't responsive, reach out to mrjoro on Slack or cc him on your GitHub issue/PR.

Once you have found a guide, make sure to @-mention them on any issues / PRs related to your change (e.g. if mrjoro is your guide you can just add "/cc @mrjoro" in the issue/PR body or comment).

## Implementation

- (optional) [Join AMP on GitHub](https://goo.gl/forms/T65peVtfQfEoDWeD3).  You don't need to wait to be added to the org before you start coding.
- [Perform the one-time setup if needed](./getting-started-quick.md#one-time-setup): Set up your GitHub account, install Node, Yarn, Gulp CLI, fork repo, track repo, etc.
- [Create a working branch](./getting-started-e2e.md#create-a-git-branch).
- [Build AMP](./getting-started-e2e.md#building-amp-and-starting-a-local-server).
- Write your code.
   - For more substantial changes, multiple smaller PRs are preferable to one large PR.  These will be easier to review and can prevent wasted work.
   - Consult these resources for guidance and guidelines:
     - **Design**: [AMP Design Principles](./DESIGN_PRINCIPLES.md)
     - **JavaScript**: [Google JavaScript Code Style Guide](https://google.github.io/styleguide/jsguide.html)
     - **CSS**: [Writing CSS For AMP Runtime](./writing-css.md)
     - **Creating new components**:
       - [Instructions and Guidelines for building an AMP component](./building-an-amp-extension.md)
       - Learn to create your first component in this [codelab](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/#0)
       - Watch this [YouTube video](https://youtu.be/FJEhQFNKeaQ?list=PLXTOW_XMsIDTDXYO-NAi2OpEH0zyguvqX) to learn about "Building a new AMP component"
     - **Integrating third-party software, embeds, services**: [Guidelines](../3p/README.md)
  - [Put your change behind an experiment flag](./building-an-amp-extension.md#experiments) unless it is a minor fix or your reviewer indicates this is not needed.
  - [Commit your files](./getting-started-e2e.md#edit-files-and-commit-them).
- [Test your changes](./getting-started-e2e.md#testing-your-changes).
  - A key feature of AMP is performance.  All changes will be analyzed for any performance impact; we particularly appreciate changes that make things even faster.  Please include any measured performance impact with substantial pull requests.
- Prepare for your code review.
   - For more substantial changes, it's usually preferable to have your code reviewed before you make a significant investment in new tests, examples, etc.
   - Before your final review, make sure your change:
     - [Has good test coverage](./TESTING.md)
     - [Follows the style and design guidelines](./DEVELOPING.md#guidelines--style)
     - [Provides good documentation](./building-an-amp-extension.md#documenting-your-element)
     - [Passes the presubmit checks (no lint and type check errors, tests are passing)](../build-system/enable-git-pre-push.sh#L17-L20)
     - [Includes validation rules and tests, if relevant](./building-an-amp-extension.md#allowing-proper-validations)
     - [Provides an example, if relevant](./building-an-amp-extension.md#example-of-using-your-extension)
- Send your code for review.
  - [Sign the Contributor License Agreement](#contributor-license-agreement) if you have not already done so.
  - [Pull the latest changes from the amphtml repo](./getting-started-e2e.md#pull-the-latest-changes-from-the-amphtml-repository) and resolve any conflicts.
  - Run the **pre push** check, which is a tool that helps catch any issues before you submit your code. To enable the git pre-push hook, see [`enable-git-pre-push.sh`](../build-system/enable-git-pre-push.sh#L17-L20).
  - [Push your changes](./getting-started-e2e.md#push-your-changes-to-your-github-fork)
  - [Create a Pull Request (PR)](./getting-started-e2e.md#send-a-pull-request-ie-request-a-code-review).
  - Make sure the presubmit checks shown on your PR on GitHub passes (e.g. no lint and type check errors, tests are passing).
  - Add reviewers to your PR that will fulfill the requirements of code review and approval documented in the [Code review and approval](#code-review-and-approval) section.  (Your guide can help with this.)
  - [Respond to feedback](./getting-started-e2e.md#respond-to-pull-request-comments).
- After your PR has all of the necessary approvals, your code may be merged into the repository by any Collaborator/Reviewer.  Your guide will typically handle this; reach out to them if your code is not merged soon after it has been approved.
- To check on your changes and find out when they get into production, read [See your changes in production](./getting-started-quick.md#see-your-changes-in-production).
- [Clean up](./getting-started-quick.md#delete-your-branch-after-your-changes-are-merged-optional): After your changes are merged, you can delete your working branch.

## Contributing extended components

AMP is designed to be extensible - it is meant to support “Extended Components” that provide first-class support for additional rich features.

Because Extended Components may have significant impact on AMP performance, security, and usage, Extended Component contributions will be very carefully analyzed and scrutinized.

In particular, we strive to design the overall component set, so that a large number of use cases can be composed from them. Instead of creating a new component it may thus be a better solution to combine existing components to a similar effect.

We have a few additional resources that provide an introduction to contributing extended components:
* ["Building an AMP Extension"](./building-an-amp-extension.md) has a detailed description of how to build an AMP component.
* ["Creating your first AMP Component" codelab](https://codelabs.developers.google.com/codelabs/creating-your-first-amp-component/#0) provides a quick overview of the steps you need to go through to create a component with examples you can modify for your component.
* The ["Building a new AMP component" talk at AMP Conf 2017](https://youtu.be/FJEhQFNKeaQ?list=PLXTOW_XMsIDTDXYO-NAi2OpEH0zyguvqX) provides an introduction to contributing AMP components.

For further detail on integrating third-party services (e.g., fonts, embeds, etc.), see our [3p contribution guidelines](https://github.com/ampproject/amphtml/tree/master/3p).

## Contributor License Agreement

AMP requires all contributors to either sign an individual Contributor License Agreement or be covered by a corporate Contributor License Agreement in order to protect contributors and users in issues of intellectual property.

We recommend you handle signing/being covered by a CLA *before* you send a PR to avoid problems, though this is not absolutely necessary until your code is ready to be merged in.

**Make sure that the email you associate with your CLA is the same email address you associate with your commits (likely via the `user.email` Git config as described on GitHub's [Set up Git](https://help.github.com/articles/set-up-git/) page).**

* **If you are contributing code on your own behalf** you can sign the [individual CLA](https://developers.google.com/open-source/cla/individual) instantly online.
* **If you are planning on contributing code on behalf of your company:**
  * Your company will need to agree to a [corporate CLA](https://developers.google.com/open-source/cla/corporate) if it has not already done so.  Although this is a relatively straightforward process, it requires approval from an authorized signer at your company and a manual verification process that may take a couple of days.  To ensure you can get your code reviewed and merged quickly please start this process as soon as possible.  The signer of your corporate CLA will associate a Google Group to the corporate CLA, and any email address added to this Google Group will be considered to be covered by this corporate CLA.
  * To be covered by your company's corporate CLA the owner of the Google Group associated with the corporate CLA (someone at your company) will need to add your address to this Google Group.
  * If you aren't sure whehther your company has already signed a corporate CLA, if you don't know who at your company owns the Google Group you need to be added to, or you run into any other questions about the corporate CLA, please reach out to @mrjoro (via cc on a PR or on [Slack](https://amphtml.slack.com) ([signup](https://bit.ly/amp-slack-signup))) or the [#contributing](https://amphtml.slack.com/messages/C9HRJ1GPN/details/) channel on Slack.

## Code review and approval

All code in AMP must be reviewed and approved before it is merged.  Reviewers/Collaborators primarily ensure that the code is correct, efficient and consistent with existing AMP code while Owners primarily provide a domain-specific review of the code.

To be merged, all code must be approved by both:

* At least one [Reviewer](https://github.com/orgs/ampproject/teams/reviewers-amphtml) who is not the author.  If the author is a Reviewer, a [Collaborator](https://github.com/orgs/ampproject/teams/reviewers-amphtml) may fulfill this requirement instead.
* At least one [Owner](https://github.com/ampproject/amphtml/search?o=asc&q=filename%3AOWNERS.yaml&s=indexed) for all areas the PR affects, except those areas in which the code author is an Owner.

It is acceptable for one person to fulfill these requirements, e.g. if an Owner who is also a Reviewer approves the PR it may be merged.

Once the PR has been approved, anyone with commit rights to the repository may merge the PR, including its author.

These guidelines are specific to the amphtml repository.  Other ampproject repos may follow the same guidelines or use different guidelines as documented in their CONTRIBUTING.md files.

### Roles

#### Collaborators
  * Review, approve and merge PRs in the repository for which they are Collaborators.
  * Collaborator status is granted to folks who have proven basic familiarity with the respective repository.
  * A person may become a Collaborator after 2 merged PRs that are non-trivial (not only fixing typos, not only config changes) and a +1 from 1 current Reviewer.  To request becoming a Collaborator file an issue in the repository in which you are requesting to be a Collaborator and cc a [Reviewer](#reviewers) in that repository.
  * The list of Collaborators is maintained in the [Collaborators (amphtml)](https://github.com/orgs/ampproject/teams/collaborators-amphtml) GitHub team.

#### Reviewers
  * Review, approve and merge PRs in the repository for which they are Reviewers.
  * Reviewer status is granted to folks who have demonstrated deep familiarity with the code-style and conventions of the respective repository.
  * A person may become a Reviewer after 10 merged PRs or 10 high quality reviews of complex PRs and a +1 from 1 current Reviewer.  Qualifying PRs must be non-trivial (not only fixing typos, not only config changes) and should have implemented or documented at least 2 new features.  To request becoming a Reviewer file an issue in the repository in which you are requesting to be a Reviewer and assign/cc a Reviewer in that repository.
  * The list of Reviewers is maintained in the [Reviewers (amphtml)](https://github.com/orgs/ampproject/teams/reviewers-amphtml) GitHub team.

#### Owners
  * Review & approve PRs in the area in which they have expertise.
  * Requirements to be an Owner:
    * Demonstrated expertise in the area in which they are an Owner.
    * Any GitHub user (including those who are not Reviewers or Collaborators) may be an Owner.
    * When creating a new directory (such as when creating a new AMP extension) the author of the pull request should designate themselves as an Owner of that directory.
    * Owners of an area may approve other Owners at or below their area of expertise following the normal PR process.  To request becoming an Owner create a PR adding yourself to the appropriate OWNERS.yaml file and assign/cc a current Owner for that directory.
  * The list of Owners for a directory can be found in the [OWNERS.yaml](https://github.com/ampproject/amphtml/search?o=asc&q=filename%3AOWNERS.yaml&s=indexed) file in the directory or a parent directory.
