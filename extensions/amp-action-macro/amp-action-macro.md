---
$category@: dynamic-content
formats:
  - websites
teaser:
  text: Creates reusable actions.
experimental: true
---

# amp-action-macro

The `amp-action-macro` component allows for the creation of reusable actions.

## Usage

`amp-action-macro` creates AMP action macros that you can reuse as needed. Each
action macro needs an `id` and an action to `execute`. You can call the action
macro by its `id` and pass it arguments that alter its behavior.

### Example

```html
<amp-action-macro
  id="closeNavigations"
  execute="AMP.setState({nav1: 'close', nav2: 'close})"
></amp-action-macro>
<button on="tap:closeNavigations.execute()">Close all</button>
<div on="tap:closeNavigations.execute()">Close all</div>
<!--
  You can provide arguments in the macro.
-->
<amp-carousel id="carousel" ...>...</amp-carousel>

<amp-action-macro
  id="carousel-macro"
  execute="carousel.goToSlide(index=foo), carousel.goToSlide(index=bar)"
  arguments="foo, bar"
></amp-action-macro>
<button on="tap:carousel-macro.execute(foo=1, bar=2)">
  Go to slide 1 then 2
</button>
```

## Attributes

### id

Used to uniquely identify the action. This `id` is referenced in an action invocation.

### execute

The action to invoke. Any [valid amp action](https://amp.dev/documentation/guides-and-tutorials/learn/amp-actions-and-events)
is allowed here.

```html
<amp-action-macro
  id="navigate-action"
  execute="AMP.navigateTo(url='http://www.ampproject.org')"
></amp-action-macro>

<amp-action-macro
  id="refresh-amp-list"
  execute="ampList.refresh()"
></amp-action-macro>
<amp-list id="ampList" src="...">...</amp-list>

<button on="tap:navigate-action.execute()"></button>

<button on="tap:refresh-amp-list.execute()"></button>
```

### arguments

Used to define arguments that can be used in the called invocation and
substituted in the amp action macro call.
