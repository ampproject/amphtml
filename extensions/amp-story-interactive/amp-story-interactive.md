---
$category@: dynamic-content
formats:
  - stories
teaser:
  text: A rich set of interactive experiences for stories, including quizzes, polls and results.
draft:
  - true
tags:
  - dynamic-content
  - social
author: mszylkowski
---

<!---
Copyright 2020 The AMP HTML Authors. All Rights Reserved.

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

[tip type="important"]Change image sources to ampproject/amphtml/master!!![/tip]

The amp-story-interactive component provides a set of experiences, such as quizzes or polls, for users in [Web stories](https://amp.dev/documentation/guides-and-tutorials/start/create_successful_stories/?format=stories). Interactive experiences provided by amp-story-interactive can integrate into tools or editors and support analytics.

<div layout="container" width="3" height="2">
<div style="width:32%;display:inline-block"><amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/quiz-art.png" layout="responsive" width="200" height="350"/></div>
<div style="width:32%;display:inline-block"><amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/animal-poll.png" layout="responsive" width="200" height="350"/></div>
<div style="width:32%;display:inline-block"><amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/results-art.png" layout="responsive" width="200" height="350"/></div>
</div>

## Usage

The amp-story-interactive component encompasses a set of interactive experiences. Specify an interactive experience by defining one of the elements below. For best results, only use one element per amp-story-page.

Most elements require a backend endpoint that will store aggregate data for each interactive, as well as persist the selected option for a user across sessions. Elements will fetch the percentage of votes for each option as well as the user selection (if any) from this endpoint, and display it with the options after the user has selected one.

To see all the components in action, check out the [example story](https://amp.dev/documentation/examples/components/amp-story-interactive-poll/story#page=title-components).

### amp-story-interactive-binary-poll

The `amp-story-interactive-binary-poll` element provides a two option voting user interface. Users may select one of two valid options. When selected, the highlighted option fills the container and displays the total percentage of votes.

Does not support pairing with `amp-story-interactive-results`, and can optionally have a prompt.

<amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/binary-poll-raw.png" layout="intrinsic" width="400" height="230">

```html
<amp-story-interactive-binary-poll
  id="pizza-binary-poll"
  endpoint="https://endpoint.com/v1/interactives"
  prompt-text="Like Pizza?"
  option-1-text="Yes"
  option-1-confetti="🍕"
  option-2-text="No"
  option-2-confetti="🤢"
>
</amp-story-interactive-binary-poll>
```

### amp-story-interactive-poll

The `amp-story-interactive-poll` element provides a voting experience with 2-4 options displayed vertically, where all options are valid. When selected, each option displays the total percentage of votes.

Display different categories based on user poll answers by pairing `amp-story-interactive-poll` with `amp-story-interactive-results`. Add a prompt for extra context.

<amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/poll-raw.png" layout="intrinsic" width="400" height="450">

[sourcecode:html]
<amp-story-interactive-poll
    id="season-poll"
    theme="dark"
    endpoint="https://endpoint.com/v1/interactives"
    prompt-text="Pick a season"
    option-1-text="Spring" option-1-confetti="🌼"
    option-2-text="Summer" option-2-confetti="☀️"
    option-3-text="Fall" option-3-confetti="🍁"
    option-4-text="Winter" option-4-confetti="☃️">
</amp-story-interactive-poll>
[/sourcecode]

### amp-story-interactive-quiz

The `amp-story-interactive-quiz` element provides a guessing experience with 2-4 options, one of which is correct. It displays the voting percentages after the user makes a selection. The user selection is green if correct and red if incorrect.

Display different categories based on percentage of correct user answers by pairing `amp-story-interactive-quiz` with `amp-story-interactive-results`. Add a prompt for extra context.

<amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/quiz-raw.png" layout="intrinsic" width="400" height="450">

[sourcecode:html]
<amp-story-interactive-quiz
    id="arts-quiz"
    endpoint="https://endpoint.com/v1/interactives"
    prompt-text='Who was the artist that created the famous painting "The Last Supper"?'
    option-1-text="Michelangelo"
    option-2-text="Leonardo da Vinci" option-2-correct option-2-confetti="🎨"
    option-3-text="Rahael"
    option-4-text="Sandro Boticelli">
</amp-story-interactive-quiz>
[/sourcecode]

### amp-story-interactive-results

The `amp-story-interactive-result` element displays a customized state defined by the user's selection from previous polls or quizzes. This element requires use of polls or quizzes from previous pages to calculate an answer-based state. Each result category may include an image, title and description to display to the user.

Each category specifies its content `option-{1/2/3/4}-{text/image/results-category}` attributes, where `-results-category` refers to the name of the category, `-image` refers to the image that will be displayed if that category is selected, and `-text` refers to the description.

Results can feed its state from quizzes if all categories also specify `option-{1/2/3/4}-results-threshold`. If no categories have thresholds, the state will count the `option-{1/2/3/4}-results-category` from options selected in polls.

<amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/results-raw.png" layout="intrinsic" width="400" height="500">

[sourcecode:html]
<amp-story-interactive-results
    theme="dark"
    prompt-text="You are a"
    option-1-results-category="Dog" option-1-image="dog.png"
    option-1-text="You always have energy and love being with friends. Outdoors is your favorite place"
    option-2-results-category="Cat" option-2-image="cat.png"
    option-2-text="Cats are great animals for WFH">
</amp-story-interactive-results>
[/sourcecode]

### Store and display user selection

All selectable interactive elements (amp-story-interactive-binary-poll, amp-story-interactive-poll, amp-story-interactive-quiz) show the percentage of users that selected each option. The backend specified with the `endpoint` attribute will store the aggregate data for the interaction following the API described below.
To fetch the data for an interactive element, the necessary fields are:

- <div id="interactiveId"></div> `interactiveId`: the `base64encode(CANONICAL_URL) + "+" + element.id`
- `interactiveType`: enum from [amp-story-interactive-abstract:48](https://github.com/ampproject/amphtml/blob/3a86226fe428ce72adb67cffe2dd2f1fae278a35/extensions/amp-story-interactive/1.0/amp-story-interactive-abstract.js#L48)
- `endpoint`: the attribute `element.getAttribute("endpoint")`
- `ampId`: client ID that identifies the session, optional

Then, the requests and responses are:

[sourcecode:js]
// Getting the votes for an interactive.
// If no client param, selected will always be false
// (can be used to display the results on a dashboard).

GET_URL = "{endpoint}/{interactiveId}?type={interactiveType}&client={ampId}"

Response: {
"options": [
{"index": 0, "selected": false, "count": 0},
{"index": 1, "selected": false, "count": 5},
{"index": 2, "selected": false, "count": 7},
{"index": 3, "selected": false, "count": 2}
]
}
[/sourcecode]

[sourcecode:js]
// Posting the vote for an interactive. Client param is required.

POST_URL = "{endpoint}/{interactiveId}:vote?type={interactiveType}&client={ampId}"
POST_BODY = {'option_selected': 1}

Response: No response necessary
[/sourcecode]

Backends need to be specified on the necessary components (binary-poll, poll, quiz), and can be deployed by publishers, tools or others. Available free-to-use backends are:

- Google hosted: _coming soon_

[tip type="note"]
Before setting up a backend, consider if the already existing backends satisfy your requirements.
[/tip]

## Attributes

The interactive experience elements from `amp-story-interactive` share an API language for customizing options.

### id (required for binary-poll, poll, quiz)

Element ID that identifies the interactive component in the story, and is used to compose the [`interactiveId`](#interactiveId) that is sent to the backend. Should be unique for each component in the story.

### endpoint (required for binary-poll, poll, quiz)

Complete URL of backend. Stores interactive element votes.

### theme (optional)

Controls the color of the chips and text. Can be `light` (default), `dark`.

### chip-style (optional for poll, quiz, results)

Controls the style of the component. Can be `flat` (default), `shadow`, or `transparent`.
Results and binary-poll elements don't support shadow.

### prompt-text (optional)

Adds a prompt to the top of the component. Use `prompt-text` to write the poll/quiz question, or as a prefix to the category in the `amp-story-interactive-result` element.

### prompt-size (optional for binary-poll, poll, quiz)

Controls the `font-size` of the prompt text, so it only applies for elements that have prompts. Can be `small` (), `medium` (default), `large`. Large prompts will hold up to 3 lines of text, other sizes will hold up to 4 lines of text.

### option-{1/2/3/4}-text (required)

String that represents a numbered option. Binary polls require 2 options. Polls and quizzes may include between 2 and 4 options.

The `amp-story-interactive-result` element uses this string value as category description.

### option-{1/2/3/4}-confetti (optional for binary-poll, poll, quiz)

Emoji that bursts in an explosion animation when an option is selected. On quizzes, only the correct option should have a confetti.

### option-{1/2/3/4}-results-category (optional for poll, required for results)

On the results component, this attribute represents the name of the category, shown in larger text after the `prompt-text` and before the category description. If the results element doesn't specify thresholds, the category strategy will be used: the category with more options selected in polls across the story will be shown.

On polls it links the options to the result with that name as mentioned above. The string has to match perfectly for the options to be linked.

Example:
[sourcecode:html]

<amp-story-interactive-poll
    prompt-text="What's your favorite food"
    endpoint="https://backend.com/v1/interactives"
    option-1-results-category="Bunny" option-1-text="Carrots"
    option-2-results-category="Dog" option-2-text="Bones"
    option-3-results-category="Cat" option-3-text="Fish">
</amp-story-interactive-poll>

<!-- Each option in the poll above will count towards a category in the result's state, linked using the `option-{1/2/3/4}-results-category` attribute. -->

<amp-story-interactive-results
    prompt-text="You are a"
    option-1-results-category="Dog" option-1-image="dog.png"
    option-2-results-category="Cat" option-2-image="cat.png"
    option-3-results-category="Bunny" option-3-image="bunny.png">
</amp-story-interactive-results>
[/sourcecode]

### option-{1/2/3/4}-results-threshold (optional for results)

On the results element, it determines the lower boundary for the category when linked to quizzes. The component will calculate the score as a percentage of questions answered correctly (between 0 and 100), and it will show the category that has the best lower threshold that matches the score. The best threshold is the highest one that is lower or equal to the score, or the lowest score if all thresholds are higher than the score. If a threshold is present for any option, all other options also need a threshold.

Example:

[sourcecode:html]

<!-- State is "beginner" if less than 80% of the quizzes were correct, state is "expert" otherwise. -->

<amp-story-interactive-results
    prompt-text="Your level is"
    option-1-results-category="Beginner" option-1-image="beginner.png"
    option-1-results-threshold="0"
    option-2-results-category="Expert" option-2-image="expert.png"
    option-2-results-threshold="80">
</amp-story-interactive-results>
[/sourcecode]

## Styling

View all theming options in action in the [example story](https://amp.dev/documentation/examples/components/amp-story-interactive-poll/story#page=title-themes).

[tip type="read-on"]
Check this [Codepen collection](https://codepen.io/collection/DEGRLE) to play with the components and styles.
[/tip]

### CSS Variables

Style all `amp-story-interactive` elements with CSS variables and attributes. Override default variables by assigning a class to the element.

- `--interactive-accent-color`: The accent color of the component.
- `--interactive-prompt-text-color`: Color of the top text where applicable (elements with prompts or results with thresholds).
- `--interactive-prompt-background`: Background of the top text where applicable (elements with prompts or results with thresholds but no images). Can be a color (including transparent) or CSS gradient.
- `--interactive-prompt-alignment`: Alignment of the prompt where applicable (elements with prompts). Will default to center if the component has the transparent style or if it's a binary poll, otherwise it will default to initial.

### Themes

The `theme` attribute controls the chip color and text color of the component. Can be `light` (default) or `dark`.
The `chip-style` attribute controls the style details of the component. Can be `flat` (default), `shadow` or `transparent`.

### Sizing

All `amp-story-interactive` elements use the [container](https://amp.dev/documentation/guides-and-tutorials/learn/amp-html-layout/layouts_demonstrated/#container) layout, so the width can be manipulated but the height is automatically computed. You may override the `font-size` on the element to any value in `rem`s, `em`s, or other units, and the element will scale accordingly. You may override the width to any value between the max and min widths (explained below) using CSS to update the element's aspect ratio.

The default `font-size` is `3*var(--story-page-vmin)` so that elements take 75% of the width of portrait stories, independently of the screen size.

The `amp-story-interactive-poll` and `amp-story-interactive-quiz` elements have a `min-width: 14em` and `max-width: 25em`. The `amp-story-interactive-binary-poll` and `amp-story-interactive-results` have a `min-width: 14em` and `max-width: 18em`.

#### Sizing within amp-story-grid-layer[aspect-ratio]

It's possible to use the [aspect-ratio](https://amp.dev/documentation/components/amp-story-grid-layer/#aspect-ratio-[optional]) layer in order to create layouts that will scale perfectly with different screen sizes, by setting the font-size in `em`s or `%` on the component. Users should not use pixels and they don't scale accordingly with different screen sizes.

The width can be set either in `em`s or percentages of the parent width, and it will behave perfectly consistent (while keeping it between the min and max widths).

[sourcecode:html]
<amp-story-grid-layer template="fill" aspect-ratio="400:600">

  <div class="center-quiz">
    <amp-story-interactive-quiz
      style="font-size:0.2em"
      ...>
    </amp-story-interactive-quiz>
  </div>
</amp-story-grid-layer>
[/sourcecode]

### Adaptive font sizes for options

Polls and binary polls can adapt their font-sizes according to the content types. Depending on the number of lines that they have for the option text, they can increase or decrease the font size. The font-size will default to the largest possible that accommodates all the texts measured. For instance, if one of the options requires a small font-size (because it has a lot of text) but the other options don't, all the involved text elements will use a small font-size. Note that this only optimizes the content of the options to fit better, but they don't change the inherent size of the elements.

Binary polls only on post-selection will show different font-sizes for the options. They will hold a large font-size if all the options are either emojis or have short texts (length <= 3). The element will use medium font-size if at least one of the options are longer than 3 characters but both can be displayed in one line; and small font-size if at least one option has two lines.

Polls will also adapt the font-size of the options depending on the content. If all the options fit in one line, they will use a large font-size. If any of the options require 2 lines, all the options will reduce in size to accommodate the option text in the chip.

For a live demo, check out the [binary-poll](https://codepen.io/mszylkowski/pen/oNxogoV) and [poll](https://codepen.io/mszylkowski/pen/ZEWaBoZ) Codepens, and change the option texts (be sure to select "Answered" on the binary-poll demo to see the size change).

## Animations

The designs provide a subtle animation on page-enter that enhances the interactivity aspect of the component. Transitioning animations also triggered when an option is selected to show the aggregate data.
To add entering animations, [amp-story animations](https://amp.dev/documentation/components/amp-story/?format=stories#animation-attributes) `animate-in` attributes can be added to all elements.

## Analytics

The `amp-story-interactive` component elements support [`amp-analytics`](https://amp.dev/documentation/components/amp-analytics/). Report a selected option by adding the `story-interactive` event to your configuration:

- `storyInteractiveId`: the element id
- `storyInteractiveResponse`: the option selected
- `storyInteractiveType`: the enum InteractiveType

```html
<amp-analytics id="my-analytics">
  <script type="application/json">
    {
      "requests": {
        "interactive": "https://example.com/interactive?id=${storyInteractiveId}&response=${storyInteractiveResponse}"
      },
      "triggers": {
        "interactiveSelected": {
          "on": "story-interactive",
          "request": "interactive"
        }
      }
    }
  </script>
</amp-analytics>
```

## Validation

See validation rules in [amp-story-interactive validator](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story-interactive/validator-amp-story-interactive.protoascii).
