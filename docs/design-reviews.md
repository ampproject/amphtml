# Design Reviews

The AMP open source community holds weekly public design reviews via video conference. We encourage everyone to attend these design reviews to discuss the design challenges being faced by the community.

-   [Upcoming design reviews](https://github.com/ampproject/amphtml/labels/Type%3A%20Design%20Review)
-   [Past design reviews](https://github.com/ampproject/amphtml/issues?q=label%3A%22Type%3A+Design+Review%22+is%3Aclosed)

The GitHub issue for a given week's design review will have links to the designs being discussed that week. When the design review is over notes from the discussion will be posted to the GitHub issue.

## Attending a design review

To join a design review, follow the link for the video conference in the Design Review issue.

You can optionally join the [design review Google Group](https://groups.google.com/a/ampproject.org/forum/#!forum/amp-design-review) to be able to join the video conference automatically; otherwise when you click on the video conference link you may have to wait a bit for someone in the meeting to accept your request to join.

**When attending a design review please read through the designs _before_ the review starts.**

## Design reviews are global

Because AMP contributors are located all over the world we rotate the design review times to accommodate people in different time zones. The time and date for a design review will be specified in that design review's issue.

If none of the design review times are convenient for you and you have a design you would like to discuss please reach out on the [#contributing](https://amphtml.slack.com/messages/C9HRJ1GPN/) channel in Slack.

## Bringing your design to a design review

Design reviews are a great way to discuss and refine your designs with knowledgeable people in the community. Not every feature/change has to be brought to a design review. For smaller changes a design review is completely optional; for larger changes covered by the [code and feature contribution process](https://github.com/ampproject/amphtml/blob/main/docs/contributing-code.md) work with your reviewer to determine if a design review makes sense.

The process for bringing a design to the design review is:

-   Determine how to document your design.
    -   Most larger, more complex designs should use an [explainer](#explainers).
    -   For smaller issues, you may use a fully detailed Intent-to-implement (I2I) GitHub issue or other GitHub issue describing the problem and proposed solution.
    -   If you aren't sure which option you should use to document your design, ask your reviewer or the [#contributing Slack channel](https://amphtml.slack.com/messages/docs/) ([sign up](https://bit.ly/amp-slack-signup)).
-   Perform a design pre-review with your reviewer if you have one; they may include other people that know the areas your design affects in this pre-review as well. If you don't have a reviewer you can request a pre-review in the [#contributing Slack channel](https://amphtml.slack.com/messages/contributing) ([sign up](https://bit.ly/amp-slack-signup)). It is fine to request a pre-review before your design is complete.
-   When your design is ready to be discussed at a design review add a comment on the [Design Review GitHub issue](https://github.com/ampproject/amphtml/labels/Type%3A%20Design%20Review) for the date/time that works best for you.
    -   You must add your design review topic to the design review issue at least 24 hours in advance of the design review.
    -   Your comment should point to the explainer, I2I or other GitHub issue describing the design that you want to discuss. Your design review comment **must** link to an explainer or GitHub issue. Topics that do not provide this link will not be discussed at the design review. You may highlight in this comment which parts of the design you'd like feedback on.
-   During the design review you'll lead the community in a conversation about your design. The design reviews are fairly informal and don't have a fixed structure.
    -   You don't need to have any slides or material other than your explainer/GitHub issue prepared for the design review.
    -   Present your explainer/issue during the meeting using the video conference "present" functionality. (If you have technical trouble doing this, someone else at the meeting can handle it.)
    -   You can assume that the people at the meeting have at least skimmed through your design to understand the area being discussed, but they may not be completely familiar with the nuances of your design.
    -   It is recommended that you start the discussion with a brief overview of your design.
    -   After the initial overview, lead the attendees through the parts of the design you would like feedback on. If you have a reviewer, they may suggest particular areas to focus on in the discussion. Potential things to think about:
        -   What are the performance tradeoffs to think about in the proposed approaches?
        -   How does this feature impact accessibility of AMP pages?
        -   Do we need to think about internationalization for this feature?
        -   Do we need to conduct user research before going in to the implementation?
    -   Working Groups will be represented at the Design Review to allow you to gather feedback across their different areas of expertise.
    -   We'll take notes during the design review and post them to the Design Review GitHub issue shortly after the meeting.
-   Update your design based on the feedback in the design review and any followup conversations in other channels.
-   Once your design is finalized, please provide a brief update at the start of a future design review (if you are able to attend).

## Explainers

For larger design topics (e.g. new features, or a significant change), the use of an explainer merged into the appropriate working group repository on GitHub is preferred.

-   An explainer is simply a document in the markdown format (md) that describes your proposed design.
    -   You create an explainer as a Pull Request, and comments/updates can be made using the normal PR review process.
    -   Explainers should be added to the appropriate Working Group repository. Explainers for work that span multiple working groups may be placed in any of the appropriate WG repos. Explainers for work that does not align with a WG may use the [ampproject design-doc](https://github.com/ampproject/design-docs) repository.
    -   You _may_ use a public Google document (with public comments enabled) instead of an md file for your explainer, but this has significant disadvantages. If you use a Google document, you _must_ submit a PDF version in the same repository you would have used for an explainer md file.
    -   The [W3C TAG Explainer document](https://tag.w3.org/explainers/) describes what an explainer should contain and a recommended template. [Design docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/) also has tips on documenting a design.
    -   An explainer does not need to be "final" before being merged in. You may merge in a draft copy and handle updates through issues/PRs as needed.
    -   Explainers (whether as an md file or in a Google document) should be visible to the public, and any member of the community should be able to comment on it. The explainer should not link to non-public information except in extraordinary circumstances, and the non-public nature of the link and the reason for it not being public should be detailed.
-   See the ["Using React/Preact to implement AMP elements" explainer](https://github.com/ampproject/wg-bento/blob/main/react/explainer.md) for an example.
