# Interactive components

## Summary

The interactive components extension provides story creators with a set of interactive experiences they can use to make stories more engaging.

A more complete version of this document can be found in [amp.dev](https://amp.dev/documentation/components/amp-story-interactive/?format=stories).

<table>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/22420856/89562666-4e0bc480-d7e8-11ea-8897-372a24b6fb8b.png"></td>
    <td><img src="https://user-images.githubusercontent.com/22420856/89562460-fc633a00-d7e7-11ea-8cbb-03351c05b5c8.png"></td>
<td><img src="https://user-images.githubusercontent.com/22420856/90187528-e9bca800-dd87-11ea-8a22-0a99970fab1c.png"></td>
  </tr>
</table>

## List of interactive components

<table>
<tr>
<td>
<strong>amp-story-interactive-binary-poll</strong>
<br><br>Subjective component with only two options. When selected, the option gets hightlighted and it fills the container based on the percentage of votes.<br><br>Works well by itself, with or without prompt.</td><td><img src="https://user-images.githubusercontent.com/22420856/87987329-7ab3a280-caac-11ea-8395-7fcaf93b5550.png"></td>
</tr>
<tr>
<td>
<strong>amp-story-interactive-poll</strong>
<br><br>Subjective component with 2-4 options displayed vertically. When selected, each option gets filled up according to the percentage of votes<br><br>Can be easily paired up to display different categories on a results component based on the answers to polls, but can be used by itself.</td><td><img src="https://user-images.githubusercontent.com/22420856/87987364-8a32eb80-caac-11ea-9754-c7f09c2c25ab.png"></td>
</tr>
<tr>
<td>
<strong>amp-story-interactive-quiz</strong>
<br><br>Objective component with 2-4 options, one of which is correct. The option selected gets highlighted with green if correct, and red if not; and the percentages fill up the options according to the percentages of votes.<br><br>Can be easily paired up with a results component to display different states depending on the correctness of the quizzes on a story, but works well by itself. Prompt recommended to write the question to the quiz.</td><td><img src="https://user-images.githubusercontent.com/22420856/87987413-9dde5200-caac-11ea-8603-a1d5d23ac987.png"></td>
</tr>
<tr>
<td>
<strong>amp-story-interactive-results</strong>
<br><br>Component that can display 2-4 different states/categories depending on the options selected on the previous pages of a story.<br><br>Requires polls or quizzes in previous pages to feed into the state of the component, and the state will be calculated following the strategy specified: correctness, category-voting, etc.</td>
<td><img src="https://user-images.githubusercontent.com/22420856/89945317-2b661b00-dbef-11ea-9319-e36bede95460.png"></td>
</tr>
</table>

## Environment setup

Add the following import to your AMP documents:

```html
<script
  async
  custom-element="amp-story-interactive"
  src="https://cdn.ampproject.org/v0/amp-story-interactive-0.1.js"
></script>
```

## Single-Page Component APIs

Single-page components are ones that can be embedded onto a story by themselves, which refers to all components but the interactive-results. The components have a shared API language for customizing their options. This makes it easier to port the configuration steps across all the interactive components.

All of them support the config attributes:

-   **id**: Unique element identifier, also used to match the votes in the backend.
-   **endpoint**: Required url of the backend. More info on the backend section.
-   **prompt-text**: Optional string that represents the title or question. All components support it out of the box. If too long (past 3 visible lines) it will be truncated. If not specified, the prompt space will not show up.
-   **prompt-size**: String that determines the font size of the prompt, default is _medium_. Supports _small_, _medium_ and _large_.
-   **option-{1/2/3/4}-text**: Strings that represent the options, indexed from 1. Binary polls require 2 options, polls and quizzes require 2-4 options.
-   **option-{1/2/3/4}-confetti**: Optional emoji that, when the option is selected, will trigger a confetti animation with the given emoji.

All of them support the styling attributes:

-   **theme**: String that represents the color theme, default is _light_. Supports _light_ and _dark_.
-   **chip-style**: Alternates the visual style of the component, defaults to _flat_. Supports _flat_ and _shadow_ (_transparent_ might also be available in upcoming PR). Only affects quizzes and polls, but not binary-polls.
-   **style**: We have exposed the following CSS properties, available to be overridden through a class declaration:
    -   **--interactive-accent-color**: Default color of the prompt background, and quizzes' option letters, defaults to blue.
    -   **--interactive-prompt-background**: Color or gradient for the prompt background, defaults to \_var(--interactive-accent-color). Note: We recommend setting the accent color to match the prompt background color.
    -   **--interactive-prompt-text-color**: Color of the prompt text, defaults to white. Note: We recommend changing to black/dark if the accent color is bright.
    -   **--interactive-prompt-alignment**: Text alignment of the prompt, defaults to _initial_.

Quizzes support:

-   **option-{1/2/3/4}-correct**: Empty attribute that selects the correct option. All other options are assumed to be incorrect.

### Components API examples

Example of correctly configured binary poll:

```html
<amp-story-interactive-binary-poll
  id="favorite-country-binary-poll"
  endpoint="https://webstoriesinteractivity-beta.web.app/api/v1/"
  prompt-text="What is your favorite country?"
  option-1-text="Spain"
  option-2-text="France"
>
</amp-story-interactive-binary-poll>
```

Example of correctly configured poll:

```html
<amp-story-interactive-poll
  chip-style="shadow"
  endpoint="https://webstoriesinteractivity-beta.web.app/api/v1/"
  id="best-country-poll"
  option-1-text="Spain"
  option-2-text="France"
  option-3-text="Uruguay"
  option-4-text="Germany"
>
</amp-story-interactive-poll>
```

Example of correctly configured quiz:

```html
<amp-story-interactive-quiz
  id="first-cup-quiz"
  endpoint="https://webstoriesinteractivity-beta.web.app/api/v1/"
  prompt-text="Who won the first world cup?"
  option-1-text="Spain"
  option-2-text="France"
  option-3-text="Uruguay"
  option-3-correct=""
  option-4-text="Germany"
>
</amp-story-interactive-quiz>
```

Example of CSS config for shared styles:

```html
<style amp-custom>
  .orange-interactives {
    --interactive-accent-color: orange;
    --interactive-prompt-background: linear-gradient(120deg, red, orange);
  }
</style>
```

## Multi-Page Component APIs

The interactive-results component allows for rich multipage experiences, but extra configuration may be needed.
Currently multi-page results support 2 strategies to decide on what option to show: percentage and category.

All of them support the config attributes:

-   **prompt-text**: Optional short text that shows before the category name. Eg: "you are a", "your spirit animal is", etc.
-   **option-{1/2/3/4}-results-category**: Name of the category, also used to link the poll results to this option; required for all options.
-   **option-{1/2/3/4}-image**: The image associated with this option, optional but highly encouraged.
-   **option-{1/2/3/4}-text**: Description of the category, usually explaining what it is.

All of them support the styling attributes:

-   **theme**: String that represents the color theme, default is _light_. Supports _light_ and _dark_.
-   **style**: We have exposed the following CSS properties, available to be overridden here:
    -   **--interactive-accent-color**: Default color of the accents.

### Percentage results

Percentage results are linked to the percentage of quizzes answered correctly, and the threshold between different states can be specified with the attribute **option-{1/2/3/4}-results-threshold** on the results component. The threshold specified serves as an inclusive lower boundary to the option. No modifications need to be done to the quizzes in order to count towards the result, so this component should be placed after all the quizzes in a story. If the lowest threshold is not 0, it will be treated as 0. Thresholds don't need to be in order, but is usually a good idea.

Eg:

```html
<amp-story-interactive-results
  prompt-text="You are an"
  option-1-results-category="Art Expert"
  option-1-text="You got it all!"
  option-1-image="expert.jpg"
  option-1-results-threshold="90"
  option-2-results-category="Art Enthusiast"
  option-2-text="Keep going!"
  option-2-image="enthusiast.jpg"
  option-2-results-threshold="70"
  option-3-results-category="Art Beginner"
  option-3-text="Don't feel bad!"
  option-3-image="beginner.jpg"
  option-3-results-threshold="40"
  option-4-results-category="Art Ignorant"
  option-4-text="Give up already!"
  option-4-image="ignorant.jpg"
  option-4-results-threshold="0"
>
</amp-story-interactive-results>
```

### Category results

Category results are linked to polls results, and each option in a poll can contribute towards a category by specifying **option-{1/2/3/4}-results-category** on the poll option as well as the result option. The category shown is the one that had the most poll options matching it. In case of ties, the first option with most votes is shown.

Eg:

```html
<amp-story-interactive-results
  class="orange"
  prompt-text="You are a"
  theme="dark"
  option-1-results-category="Cat"
  option-1-text="Everyone loves cats, and so do you!"
  option-1-image="cat.png"
  option-2-results-category="Dog"
  option-2-text="You always have energy and love being with friends."
  option-2-image="dog.png"
  option-3-results-category="Bunny"
  option-3-text="You love jumping around and having fun."
  option-3-image="bunny.png"
  option-4-results-category="Mouse"
  option-4-text="Even though you're small, you're also full of curiosity."
  option-4-image="mouse.png"
>
</amp-story-interactive-results>
```

Polls that want to count towards the categories specified, can do so with the attribute `option-{1/2/3/4}-results-category` matching the option on the results component. The category needs to match exactly the name of the category in the results component to count towards it.

```html
<amp-story-interactive-poll
  chip-style="shadow"
  endpoint="https://webstoriesinteractivity-beta.web.app/api/v1/"
  id="favorite-food-poll"
  prompt-text="What food do you like the most?"
  option-1-text="Bones"
  option-1-results-category="Dog"
  option-2-text="Cheese"
  option-2-results-category="Mouse"
  option-3-text="Carrots"
  option-3-results-category="Bunny"
  option-4-text="Fish"
  option-4-results-category="Cat"
>
</amp-story-interactive-poll>
```

## Backend API

Tools are welcome to create their own backend implementations and provide the url on the **endpoint** attribute, but there will be a Google hosted backend that provides the necessary functionality to support the components out of the box (expected to be released in September). Users/creators should not be expected to set up their own backends.

Meanwhile, please use:

```html
<amp-story-interactive
  endpoint="https://webstoriesinteractivity-beta.web.app/api/v1/"
  ...
>
</amp-story-interactive>
```

The endpoint will return the JSON on a GET request, useful for testing. The public endpoint will be released before the public launch, and with it, this mock endpoint will be deprecated.

## Sizing

The component follows the container model. The size can be changed by overriding the element's font-size, which by default will be set to `3*var(--story-page-vmin)`. The component has a `min-width: 14ems` and `max-width: 25ems`, unless it's a binary-poll or results, in which case it will have `max-width:18em`. This makes it occupy 75% of the width on portrait stories by default, but the width can be overridden with a CSS rule to any value in between the min and max. The height will depend on the font-size and number of lines on the prompt, so it cannot be specified.

The demos section contains updated CSS to reflect all the mesurements in ems.

### Creating pixel-perfect layouts with interactive components using amp-story-grid-layer with aspect-ratio

While the component by default adapts to the screen size with the variable font-size, it doesn't stay perfectly consistent across screen sizes. It's possible to use the aspect-ratio layer in order to create layouts that will scale perfectly with different screen sizes, by setting the `font-size` in ems on the component.

The width can be set either in ems or percentages of the parent width, and it will behave perfectly consistent (while keeping it between the min and max widths).

<table>
<tr>
  <td>
    <code>

    ```
    <amp-story-grid-layer template="fill" aspect-ratio="400:600">
      <amp-story-interactive-quiz
        style="font-size:0.2em">
      </amp-story-interactive-quiz>
    </amp-story-grid-layer>
    ```

  </code>
  </td>

  <td><img src="https://user-images.githubusercontent.com/22420856/92150262-26ab1600-eded-11ea-9b16-0e482c2f7d58.png" width="300"></td></tr>
</table>

### Resizing components without aspect-ratio

By default the component will take 75% of the width, but publishers can set a `font-size` rule on the component, overriding the initial value. The `font-size` can take em, rem, px, var(--story-page-vmin) or any other units, but responsive units are recommended to have a component that scales with the screen size.

The `width` can also be overriden to any value between the min and max using ems, percentages or any other unit available. It is important to consider that by default the component will take 25ems of width, which resizes with the component helping it keep the same look. If the width is specified in different units from the font-size, the component could shift the contents on different screen sizes (specially the prompt and option titles), so it's recommended to keep in mind the units used (or keep the width untouched).

The `height` is always auto and will adapt to fit the prompt and options with the given font-size and width.

## Demos

With these components we wanted to help users create more entertaining and immersive experiences, and to facilitate that, we have created demos with good use cases of the components. Feel free to ~~steal~~ implement any ideas from these demos into your own stories (or check the source code).

<table>
  <tr>
   <td><strong>Name that artist:</strong> How much do you know about art? This story contains 4 interactive quizzes about past and present artists showing the capabilities of quizzes. Coupled with a results component and (fake) aggregate data, displays the full experience of a multipage set of quizzes. We also added CSS timers and previous/next arrows for a responsive and fun UX.
<br><br>
Warning: you might learn facts about art along the way.
<br><br>
<a href="https://webstoriesinteractivity-beta.web.app/arts-quizzes.html">https://webstoriesinteractivity-beta.web.app/arts-quizzes.html</a>
   </td>
<td>
<img src="https://user-images.githubusercontent.com/22420856/89209183-cde92300-d58b-11ea-903c-2e4148474c39.png">
   </td>
  </tr>
<tr>
<td>
<img src="https://user-images.githubusercontent.com/22420856/89562853-9a570480-d7e8-11ea-94bc-abfd43cf15d7.png">
   </td>
   <td><strong>What Cute Animal Are You?</strong> Have you ever wondered what your spirit animal is? This story contains 4 interactive polls that will uncover your true animal self. Coupled with a results component and (fake) aggregate data, displays the full experience of a multipage set of polls.
<br><br>
<a href="https://webstoriesinteractivity-beta.web.app/animals-polls.html">https://webstoriesinteractivity-beta.web.app/animals-polls.html</a>
   </td>
</tr>
<tr>
<td>
Codepen with HTML and CSS of a quiz, and a simple panel that could show how the component could look like on a creation tool. Useful to experiment how the component looks on different states, as well as imagine how to integrate it with creation tools.
<br><br>
Note: not all properties can be modified on this Codepen. When integrating, take into account other fields and variants such as prompt-text-color, prompt-background (if users want it different from the accent color, or if users want gradients), etc.
<br><br>
<a href="https://codepen.io/mszylkowski/pen/qBZXmQj">https://codepen.io/mszylkowski/pen/qBZXmQj</a>
</td>
<td>
<img src="https://user-images.githubusercontent.com/22420856/88303287-dd878280-ccd4-11ea-8238-1dcedf4c5bee.png">
</td>
</tr>
<tr>
<td>
<img src="https://user-images.githubusercontent.com/22420856/88310091-45da6200-ccdd-11ea-9d70-d65f54fecff1.png">
</td>
<td>
Codepen with HTML and CSS of a poll, and a simple panel that could show how the component could look like on a creation tool. Useful to experiment how the component looks on different states, as well as imagine how to integrate it with creation tools.
<br><br>
Note: not all properties can be modified on this Codepen. When integrating, take into account other fields and variants such as prompt-text-color, prompt-background (if users want it different from the accent color, or if users want gradients), etc.
<br><br>
<a href="https://codepen.io/mszylkowski/pen/ZEWaBoZ">https://codepen.io/mszylkowski/pen/ZEWaBoZ</a>
</td>
</tr>
<tr>
<td>
Codepen with HTML and CSS of a results component, and a simple panel that could show how the component could look like on a creation tool. This component is highly customizable, so we included a list of custom styles that can be implemented with the given CSS. The Codepen also can reflect the layout of results with/without an image on the category, and with/without score (for quizzes and polls results).
<br><br>
Note: not all properties can be modified on this Codepen. When integrating, take into account other fields and variants such as prompt-text-color, prompt-background (if users want it different from the accent color, or if users want gradients), etc.
<br><br>
<a href="https://codepen.io/mszylkowski/pen/abNWzdb">https://codepen.io/mszylkowski/pen/abNWzdb</a>
</td>
<td>
<img src="https://user-images.githubusercontent.com/22420856/92153654-9f60a100-edf2-11ea-86ec-fe8bcd816879.png">
</td>
</tr>
<tr>
<td>
<img src="https://user-images.githubusercontent.com/22420856/92153451-4c86e980-edf2-11ea-9327-1b5136e7e63c.png">
</td>
<td>
Codepen with HTML and CSS of a binary poll, and a simple panel that could show how the component could look like on a creation tool. Useful to experiment how the component looks on different states, as well as imagine how to integrate it with creation tools. On answered state, the component reflects the option sizing that adapts to the content of the options.
<br><br>
Note: not all properties can be modified on this Codepen. When integrating, take into account other fields and variants such as prompt-text-color, prompt-background (if users want it different from the accent color, or if users want gradients), etc.
<br><br>
<a href="https://codepen.io/mszylkowski/pen/oNxogoV">https://codepen.io/mszylkowski/pen/oNxogoV</a>
</td>
</tr>
</table>

You can check out our explorations and mocks on https://codepen.io/collection/XjYZMq

You can check the roadmap in https://github.com/ampproject/amphtml/projects/110

## FAQ

**Who can I contact if I have any questions?**

We'll be answering on the Slack channel any questions, or feel free to email [mszylkowski@google.com](mailto:mszylkowski@google.com) for questions or feedback. We might update this FAQ with your questions, so everyone wins.

**Can we branch to different pages based on the option selected?**

That's not currently available or in our roadmap, but we will be listening to the feedback for feature requests.

**How can we integrate the interactive components into our creation tools?**

We have provided Codepens in the Demos section to check the current HTML and CSS component source codes. The actual integration of the layout and styles will depend on the tool UI, but it provides visualizations for the different styles available. Since all the components have very similar fields, the main customization options can be reused. The style rules on these codepens are not 100% matching the components to allow for live editing, but is visually identical in terms of looks.

This is a starting point for creating the inputs on a creation tool (and just a guideline / thoughts on good ideas):

-   _Styles_: A good starting point for customizing the style is to provide a color picker for accent color (and can additionally provide gradients for the prompt-background), and have dropdowns to select the theme=dark|light) and chip-style=flat|shadow. Dropdowns are better for future-proofing the attributes, as we may add more styles later.
-   _Fields_: Prompt text can be a field that, if left empty, the tool doesn't specify it in the component. Options should be a list of custom fields, where users start with 2 options and can add new options (up to 4 if not a binary-poll). Each option requires a text, but more attributes such as the confetti/correct can be assigned to each option.
-   _Results_: It's useful to guide the users through creating multi-page results. For quizzes, users can add the results component to any page, but it's a good idea to warn users that they need quizzes on previous pages to use it correctly. Users can edit the attributes in a WYSIWYG editor for the multiple states if tools provide a dropdown to change the visible option, allowing users to input one state at a time. Poll results can also be edited in a WYSIWYG manner, but it's a good idea to first require users to create the categories in the results component, and provide a dropdown on each poll option to link it to a category of the results page. This prevents errors in matching the names of the categories across components (eg: titlecase vs lowercase, extra spaces, etc) that are hard to debug from a user standpoint.

**What if I want to animate the interactive components?**

We're working on cool animations, starting with the confetti explosions. For entering animations, check out [amp-animation](https://amp.dev/documentation/examples/visual-effects/amp_story_animations/#introduction).

**Is it possible to get the history of an interactive aggregate data from the backend API?**

In order to show story creators the history, tools can set up backends that query the endpoint once an hour/day (without specifying a client ID). The API only supports retrieving the current status, and we don't plan to support other advanced features, but check out the analytics extensions for added functionality.

**Is the endpoint attribute mandatory?**

We have seen in tests that interactive components are more engaging when users can see the mass results from everyone, that's why we require an endpoint attribute. However, we will provide a stable url to plug and play (you can use the testing endpoint in Backend API for now). However, the components will still work if users have slow connections or disconnect before fetching the results.

**Why category results use polls and percentage results use quizzes?**

Category results are subjective, meaning that all the options are equally valid; that maps perfectly with the subjectivity of polls. Percentage results require answers to be correct or wrong, so quizzes are the components that have objective questions and answers.

**How can I specify all the custom style attributes or a component?**

By creating a class and assigning it to the component/components, you can override as many of the CSS variables provided here as necessary.

**Why does x feature of the component not work as I expected?**

We're in the process of finishing the validation (as well as other aspects of the component), but we're giving developers the chance to contribute in the form of feedback before releasing the component to the rest of the community. While these components are not 100% bulletproof, we tried to consider every use-case and give options to users. We will be more actively listening for feedback in this early stage of development, in order to catch any last-minute bug. Also check the browser is receiving the nightly version of AMP (specially in the first days of the beta preview)

**What's next for interactive components?**

We have to polish animations, behaviors and write the public documentation before releasing publicly. After the public release, we plan to add more interactive components such as image polls and quizzes, sliders, and text fields. We also plan to release additional styles (eg: we just merged the transparent style). As always, the future will be shaped with the feedback we receive.
