# Storyteller AMP ⚡

## Running The Project

- Clone the repo and `cd` to the root directory
- Run `amp` to start run the project
- Open `http://localhost:8000` in a browser to view the site with examples for each component. These can be used for testing any changes you make to AMP components

## Making Changes

- Most changes will be made to components in `src/extensions/amp-story` or in `src\amp-story-player\amp-story-player-impl.js`
- Any changes you make can be tested using the component examples
- Changes relating to stories/story player can be tested at usually `http://localhost:8000/examples/amp-story/player-local-stories.html`. This example uses stories located in the `examples/amp-story` folder. These stories can be edited iof different features need to be tested.
- Changes should also be tested on the Web SDK demo site. This should be done by merging the changes to main and testing on the demo site

## CI/CD

- Deploys to `main` will trigger the CI to build a new version
- This build will then be automatically deployed to both dev and staging environments
- Once the build has been tested on dev and staging, it can be manually deployed to prod

## Want to know more about AMP?

-   [amp.dev](https://amp.dev) is the best place to learn more about AMP--and of course the site is made using AMP!
-   For developers using AMP, amp.dev includes
    -   [guides and tutorials](https://amp.dev/documentation/guides-and-tutorials/)
    -   [examples](https://amp.dev/documentation/examples/)
    -   [reference docs](https://amp.dev/documentation/components/?format=websites)
    -   [example templates](https://amp.dev/documentation/templates/)
    -   [tools to make using AMP easier](https://amp.dev/documentation/tools)

## Having a problem using AMP?

-   The [amp.dev Support page](https://amp.dev/support/) has resources for getting help.
-   Use [Stack Overflow](http://stackoverflow.com/questions/tagged/amp-html) to ask questions about using AMP and find answers to questions others have asked.
-   [Let us know about bugs](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md#report-a-bug), and [file feature requests](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md#make-a-suggestion) to suggest improvements.
-   AMP accepts responsible security disclosures through the [Google Application Security program](https://www.google.com/about/appsecurity/).

## Want to help make AMP better?

-   [docs/contributing.md](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md) has information on how you can help improve AMP, including [ongoing participation](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md#ongoing-participation) through Slack, weekly design reviews, etc.
-   We strongly encourage [code contributions](https://github.com/ampproject/amphtml/blob/main/docs/contributing-code.md)!
-   **We enthusiastically welcome new contributors to AMP _even if you have no experience being part of an open source project_**. We've made it easy to [get started contributing](https://github.com/ampproject/amphtml/blob/main/docs/contributing.md#get-started-with-open-source).
-   Consider joining one of AMP's [Working Groups](https://github.com/ampproject/meta/tree/main/working-groups), where most of the day-to-day work in AMP gets done.

## Other useful information

-   [AMP's release documentation](docs/release-schedule.md) provides details on how and when AMP releases new versions, including [how to know when a change is live in a release](https://github.com/ampproject/amphtml/blob/main/docs/release-schedule.md#determining-if-your-change-is-in-a-release).
-   [AMP's roadmap](https://amp.dev/community/roadmap) provides details on some of the significant projects we are working on.
-   The [AMP meta repository](https://github.com/ampproject/meta) has information _about_ the AMP open source project, including AMP's [governance](https://github.com/ampproject/meta/blob/main/GOVERNANCE.md).
-   [AMP's code of conduct](https://github.com/ampproject/meta/blob/main/CODE_OF_CONDUCT.md) documents how all members, committers and volunteers in the community are required to act. AMP strives for a positive and growing project community that provides a safe environment for everyone.
