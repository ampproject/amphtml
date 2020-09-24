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

---

\$title: amp-story-interactive
teaser:
text: >-
A rich set of interactive experiences for stories, including quizzes, polls and results.
toc: true
version: '0.1'
versions:

- '0.1'
  latest_version: '0.1'
  formats:
- stories
  is_current: true
  $path: /documentation/components/amp-story-interactive.html
$localization:
  path: '/{locale}/documentation/components/amp-story-interactive.html'
  scripts:
- > -
      <script async custom-element="amp-story-interactive"
      src="https://cdn.ampproject.org/v0/amp-story-interactive-0.1.js"></script>
  author: mszylkowski
  tags:
- dynamic-content
- social

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

The amp-story-interactive component provides a set of experiences, such as quizzes or polls, for users in [Web stories](https://amp.dev/documentation/guides-and-tutorials/start/create_successful_stories/?format=stories). Interactive experiences provided by amp-story-interactive can integrate into tools or editors and support analytics.

<div layout="container" width="3" height="2">
<div style="width:32%;display:inline-block"><amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/quiz-art.png" layout="responsive" width="200" height="350"/></div>
<div style="width:32%;display:inline-block"><amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/animal-poll.png" layout="responsive" width="200" height="350"/></div>
<div style="width:32%;display:inline-block"><amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/results-art.png" layout="responsive" width="200" height="350"/></div>
</div>

## Interactive experiences

The amp-story-interactive extension encompasses a set of interactive experiences. Specify an interactive experience by defining one of the elements below. For best results, only use one element per amp-story-page.

If you want to see all the components in action, check out the [example story](/documentation/examples/components/amp-story-interactive-poll/story#page=title-components)

### amp-story-interactive-binary-poll

The amp-story-interactive-binary-poll element provides a two option voting user interface. Users may select one of two valid options. When selected, the highlighted option fills the container and displays the total percentage of votes.

Is well suited to be used without amp-story-interactive-results, and can optionally have a prompt.

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

The amp-story-interactive-poll element provides a voting experience with 2-4 options displayed vertically, where all options are valid. When selected, each option displays the total percentage of votes.

Can be paired up with amp-story-interactive-results to display different categories based on the answers to polls, but can be used independently as well. It is encouraged to add a prompt for extra context.

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

The amp-story-interactive-quiz element provides a guessing experience with 2-4 options, one of which is correct. The option selected gets highlighted with green if correct, and red if not; and the percentages are displayed on the options according to the percentages of votes.

Can be paired up with amp-story-interactive-results to display a score based on the correctness of the answers to quizzes, but can be used independently as well. It is encouraged to add a prompt for extra context.

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

The amp-story-interactive-results element provides an interface to display a custom state depending on the options selected on the previous pages of a story.
Requires polls or quizzes in previous pages to feed into the state of the element, and the state will be calculated according to either the quizzes (if thresholds are specified) or the polls (if only categories are specified) that the user answered.
Each category can specify an image, title and description that will be shown when the component selects that category for the user.

<amp-img src="https://github.com/mszylkowski/amphtml/raw/interactive_docs/extensions/amp-story-interactive/img/results-raw.png" layout="intrinsic" width="400" height="500">

[sourcecode:html]
<amp-story-interactive-results
    theme="dark"
    prompt-text="You are a"
    option-1-text="Dog" option-1-image="dog.png"
    option-1-description="You always have energy and love being with friends. Outdoors is your favorite place"
    option-2-text="Cat" option-2-image="cat.png"
    option-2-description="Cats are great animals for WFH">
</amp-story-interactive-results>
[/sourcecode]

## Attributes

The components have a shared API language for customizing their options. This makes it easier to port the configuration steps across all the interactive components.

### id (required for binary-poll, poll, quiz)

Identifies the interactive component, and is used to compose the interactiveId that is sent to the backend. Should be unique for each component in the story.

### endpoint (required for binary-poll, poll, quiz)

Complete URL of the backend, where votes for the interactive components are stored.

### theme (optional)

Controls the color of the chips and text. Can be light (default), dark.

### chip-style (optional for poll, quiz, results)

Controls the style of the component. Can be flat (default), shadow, or transparent.
Results components don't support shadow.

### prompt-text (optional)

Adds a prompt on top of the component, useful for writing the question to a quiz or poll. Also used to write a prompt to the results component before the category title (highly encouraged).

### prompt-size (optional for binary-poll, poll, quiz)

Controls the font-size of the prompt text. Can be small, medium (default), large. Large prompts will hold up to 3 lines of text, other sizes will hold up to 4 lines of text.

### option-{1/2/3/4}-text (required)

String that represents the option. On a results component, it determines the description for the category associated (highly encouraged). Binary polls require 2 options, but polls, quizzes and results can have 2-4 options.

### option-{1/2/3/4}-confetti (optional for binary-poll, poll, quiz)

Emoji that is used in a confetti burst animation when the option is selected. When specified on an option, the confetti burst will be activated. On quizzes, only the correct option should have a confetti.

### option-{1/2/3/4}-results-category (optional for poll, required for results)

On the results component, it is used as the name of the category. On polls it links the options to the result with that name. The string has to match for the options to be linked.
If the results component doesn't specify thresholds, the category strategy will be used: the category with more options selected in polls across the story will be shown.

### option-{1/2/3/4}-results-threshold (optional for results)

On the results component, it is used as a lower boundary for the category when linked to quizzes. The component will calculate the score as a percentage of questions answered correctly (between 0 and 100), and it will show the category that has the best lower threshold that matches the score. The best threshold is the highest one that is lower or equal to the score, or the lowest score if all thresholds are higher than the score. If a threshold is specified for any option, all other options also need a threshold.

## Aggregate data source

All selectable interactive components (not results) show the percentage of users that selected each option. This data is aggregated on a backend specified with the `endpoint` attribute.
To fetch the data for an interactive component, the necessary fields are:

- `interactiveId`: the `base64encode(CANONICAL_URL) + "+" + element.id`
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

## Styling

If you want to see all the theming options in action, check out the [example story](/documentation/examples/components/amp-story-interactive-poll/story#page=title-themes)

### CSS Variables

All interactive components support similar styling, which is controlled through CSS variables and attributes.
CSS variables
Some variables can be overridden through assigning a class to the component.

- `--interactive-accent-color`: The accent color of the component. If no prompt-background is specified, it will use that for the prompt background as well.
- `--interactive-prompt-text-color`: Color of the top text. Only used on selectable components if a
  prompt is specified, or on results components if there are thresholds (which will color the score).
- `--interactive-prompt-background`: Background of the top text. Only used on selectable components if a prompt is specified, or on results if there are thresholds but no image (which will color the score background). Can be a color (including transparent) or CSS gradient.
- `--interactive-prompt-alignment`: Alignment of the prompt. Only used in selectable components (not results). Will default to center if the component has the transparent style or if it's a binary poll, otherwise it will default to initial.

### Themes

The `theme` attribute controls the chip color and text color of the component.
The `chip-style` attribute controls the style details of the component.

## Sizing

The component follows the [container](https://amp.dev/documentation/guides-and-tutorials/learn/amp-html-layout/layouts_demonstrated/#container) model. The size can be changed by overriding the element's font-size, which by default will be set to `3*var(--story-page-vmin)`. The component has a `min-width: 14em` and `max-width: 25em`, unless it's a binary-poll or results, in which case it will have `max-width:18em`. This makes it occupy 75% of the width on portrait stories by default, but the width can be overridden with a CSS rule to any value in between the min and max. The height will depend on the font-size and number of lines on the prompt, so it cannot be specified.

### Creating pixel-perfect layouts using amp-story-grid-layer[aspect-ratio]

While the component by default adapts to the screen size with the variable font-size, it doesn't stay perfectly consistent across screen sizes. It's possible to use the aspect-ratio layer in order to create layouts that will scale perfectly with different screen sizes, by setting the font-size in ems on the component.

The width can be set either in ems or percentages of the parent width, and it will behave perfectly consistent (while keeping it between the min and max widths).

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

Polls and binary polls can adapt their font-sizes according to the content types. When they are created, depending on the number of lines that they have for the option text, they can increase or decrease the font size. The font-size will default to the largest possible that accommodates all the texts being measured. For instance, if one of the options requires a small font-size (because it has a lot of text) but the other options don't, the small font-size will be used for all the texts involved. Note that this only optimizes the content of the components to fit better, but they don't change the inherent size of the components.

Binary polls only on post-selection will show different font-sizes for the options. They will hold a large font-size if all the options are either emojis or have short texts (length <= 3). Medium font-size will be used if at least one of the options are longer than 3 characters but both can be displayed in one line; and small font-size will be used if at least one option has two lines.

Polls will also adapt the font-size of the options depending on the content. If all the options fit in one line, they will use a large font-size. If any of the options require 2 lines, all the options will be reduced in size to accommodate the option text in the chip.

For a live demo, check out the [binary-poll](https://codepen.io/mszylkowski/pen/oNxogoV) and [poll](https://codepen.io/mszylkowski/pen/ZEWaBoZ) Codepens, and change the option texts (be sure to select "Answered" on the binary-poll demo to see the size change).

## Animations

The designs provide a subtle animation that enhances the interactivity aspect of the component, and are also animated when an option is selected to show the aggregate data.
To add entering animations, [amp-story animations](https://amp.dev/documentation/components/amp-story/?format=stories#animation-attributes) can be added to all components.

## Analytics

The component comes with support for [amp-analytics](https://amp.dev/documentation/components/amp-analytics/) events out of the box, and will report when an option is selected:

- `storyInteractiveId`: the element id
- `storyInteractiveResponse`: the option selected
- `storyInteractiveType`: the enum InteractiveType

## Validation

See validation rules in [amp-story-interactive validator](https://github.com/ampproject/amphtml/blob/master/extensions/amp-story-interactive/validator-amp-story-interactive.protoascii).

## References

Check this [Codepen collection](https://codepen.io/collection/DEGRLE) to play with the components and styles.
