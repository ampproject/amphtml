# Design Reviews

The AMP open source community holds weekly public design reviews via video conference.  We encourage everyone to attend these design reviews to discuss the design challenges being faced by the community.

* [Upcoming design reviews](https://github.com/ampproject/amphtml/labels/Type%3A%20Design%20Review)
* [Past design reviews](https://github.com/ampproject/amphtml/issues?q=label%3A%22Type%3A+Design+Review%22+is%3Aclosed)

The GitHub issue for a given week's design review will have links to the designs being discussed that week.  When the design review is over notes from the discussion will be posted to the GitHub issue.

## Attending a design review

To join a design review, follow the link for the video conference in the Design Review issue.

You can optionally join the [design review Google Group](https://groups.google.com/a/ampproject.org/forum/#!forum/amp-design-review) to be able to join the video conference automatically; otherwise when you click on the video conference link you may have to wait a bit for someone in the meeting to accept your request to join.

**When attending a design review please read through the designs _before_ the review starts.**

## Design reviews are global

Because AMP contributors are located all over the world we rotate the design review times to accommodate people in different time zones.  The time and date for a design review will be specified in that design review's issue.

If none of the design review times are convenient for you and you have a design you would like to discuss please reach out to mrjoro on [Slack](https://github.com/ampproject/amphtml/blob/master/CONTRIBUTING.md#discussion-channels).

## Bringing your design to a design review

Design reviews are a great way to discuss and refine your designs with knowledgeable people in the community.  Not every feature/change has to be brought to a design review.  For smaller changes a design review is completely optional; for larger changes covered by the [code and feature contribution process](https://github.com/ampproject/amphtml/blob/master/contributing/contributing-code.md) work with your reviewer to determine if a design review makes sense.

The process for bringing a design to the design review is:

* Determine if you need a design document; in many cases a fully detailed Intent-to-implement (I2I) GitHub issue or other GitHub issue describing the problem and proposed solution may be sufficient.  If you have a reviewer work with them to decide what makes sense in your case, otherwise you can ask in the [#design-review Slack channel](https://amphtml.slack.com/messages/design-review/) ([sign up](https://bit.ly/amp-slack-signup)).
* If you are going to create a design document, create it as a shared Google Document open to public comments:
  * A short design doc is fine as long as it covers your design in sufficient detail to allow for a review by other members of the community.
  * Take a look at [Design docs - A design doc](https://medium.com/@cramforce/design-docs-a-design-doc-a152f4484c6b) for tips on putting together a good design doc.  [Phone call tracking in AMP](https://docs.google.com/document/d/1UDMYv0f2R9CvMUSBQhxjtkSnC4984t9dJeqwm_8WiAM/edit) and [New AMP Boilerplate](https://docs.google.com/document/d/1gZFaKvcDffceJNaI3bYfuYPtYU5u2y6UhE5wBPTsJ9w/edit) are examples of past AMP design docs.
  * Add this license text to the top of your design doc before sharing it with anyone else in the community (updating the year if necessary):
      ```
      Copyright 2019 The AMP HTML Authors. All Rights Reserved.

      Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

      Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

      See the License for the specific language governing permissions and limitations under the License.
      ```
* Perform a design pre-review with your reviewer if you have one; they may include other people that know the areas your design affects in this pre-review as well.  If you don't have a reviewer you can request a pre-review in the [#design-review Slack channel](https://amphtml.slack.com/messages/design-review/) ([sign up](https://bit.ly/amp-slack-signup)).  It is fine to request a pre-review before your design is complete.

* When your design is ready to be discussed at a design review add a comment on the [Design Review GitHub issue](https://github.com/ampproject/amphtml/labels/Type%3A%20Design%20Review) for the date/time that works best for you.  Make sure to pay attention to the time since we rotate between times that work for differents parts of the world.  Post a link to your GitHub issue/design doc and a brief summary by **Monday** on the week of your design review.  In your comment on the Design Review issue you may want to point out details of the design you'd particularly like to cover in the review.

* During the design review you'll lead the community in a conversation about your design.  The design reviews are fairly informal and don't have a fixed structure.    
  * You don't need to have any slides or material other than your GitHub issue/design doc prepared for the design review.
  * It can be helpful to present the GitHub issue/design doc during the meeting using the video conference "share your screen" functionality.  (If you have technical trouble doing this, someone else at the meeting can handle it.)
  * You can assume that the people at the meeting have at least skimmed through your design to understand the area being discussed, but they may not be completely familiar with the nuances of your design.
  * It is recommended that you start the discussion with a brief overview of your design.
  * After the initial overview, lead the attendees through the parts of the design you would like feedback on.  If you have a reviewer, they may suggest particular areas to focus on in the discussion.
  * We'll take notes during the design review and post them to the Design Review GitHub issue shortly after the meeting.

* Update your design based on the feedback in the design review and any followup conversations in other channels.  Once your design is finalized, please provide a brief update at the start of a future design review (if you are able to attend).  If you create a design doc submit a PDF version in the [ampproject design-doc](https://github.com/ampproject/design-docs) repository.
