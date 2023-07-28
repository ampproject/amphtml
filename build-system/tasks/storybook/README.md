# Storybook

Task that launches [Storybook](https://storybook.js.org/) for isolated component testing.

```console
amp storybook
```

Run `amp storybook -h` or see [testing.md](../../../docs/testing.md) for more launch options.

## Style Recommendations

Follow these recommendations when [writing stories.](https://storybook.js.org/docs/guides/guide-preact/#step-4-write-your-stories)

### Identify `args` and `argTypes` exactly like their component properties

Passing a value from a Control specified through `args` or `argTypes` without modification is implicit when spreading `{...args}`.

It's preferred to name a Control property id uniformly with its corresponding component property or element attribute. This way, we write a shorter and more generic story by taking advantage of `{...args}`:

✅ Do:

```js
const MyStory = (args) => {
  return <amp-my-component {...args} />;
};

MyStory.args = {
  width: 500,
  height: 200,
  layout: 'responsive',
  'data-foo': 'bar',
};
```

🚫 Don't:

```js
const MyStory = ({width, height, layout, foo}) => {
  return (
    // bad: not spreading {...args}
    // bad: different names for data-foo and foo
    <amp-my-component
      width={width}
      height={height}
      layout={layout}
      data-foo={foo}
    />
  );
};

MyStory.args = {
  width: 500,
  height: 200,
  layout: 'responsive',
  foo: 'bar',
};
```

👍 It's fine to destructure individual properties when they are needed in a different context:

```js
const MyStory = ({includePlaceholder, ...args}) => {
  return (
    <amp-my-component {...args}>
      {includePlaceholder && (
        <div placeholder>
          placeholder
        </div>
      )}
    </amp-my-component>
  );
};

MyStory.args = {
  width: 500,
  height: 200,
  layout: 'responsive',
  includePlaceholder: false,
};
```

### Prefer `args` over `argTypes` for simple values

Simple controls, like `text`, `boolean`, `number` and `object` derive their configuration automatically when specifying a default value only.

`argTypes` is more verbose, which is why we avoid it.

However, you should feel free to use `argTypes` when you need more than the default configuration, like specifying a `name` label that does not match the property name, or specifying a number range.

Additionally, other controls, like `select`, `file`, or `color` can only be configured through `argTypes`, so it's fine to use in that case. See [possible types in the official Storybook documentation](https://storybook.js.org/docs/react/essentials/controls#annotation).

✅ Do:

```js
MyStory.args = {
  two: 2,
  foo: 'bar',
};

MyStory.argTypes = {
  bestPants: {
    name: 'best kind of pants',
    control: {type: 'select'},
    options: ['jeans', 'jorts', 'skirts'],
  },
};
```

🚫 Don't:

```js
MyStory.argTypes = {
  two: {
    name: 'two',
    defaultValue: 2,
  },
  foo: {
    name: 'foo',
    defaultValue: 'bar',
    control: {type: 'text'},
  },
  bestPants: {
    name: 'best kind of pants',
    control: {type: 'select'},
    options: ['jeans', 'jorts', 'skirts'],
  },
};
```

### Use `storyName` sparingly

Listed Stories derive their names from their functions, and are split according to `camelCase` (`MyNamedStory` becomes `My Named Story` when listed).

For this reason, the `storyName` property should be avoided when it's too similar to the function name.

✅ Do:

```js
const MyNamedStory = (args) => { /* ... */ };
```

🚫 Don't:

```js
const MyNamedStory = (args) => { /* ... */ };
MyNamedStory.storyName = 'My Named Story';
```

👍 Feel free to use `storyName` when you'd like to add more detail or formatting (like text in parentheses).

```js
const Resizable = (args) => { /* ... */ };
Resizable.storyName = 'resizable (outside viewport)';
```

### Do not use the main component name in a story name

Stories are listed hierarchically: first by component name, then by story name. It's redundant to include the name of the component a story resides in.

✅ Do:

```js
// amp-date-display/1.0/Basic.amp.js
const DefaultRenderer = (args) => { /* ... */ };
```

_Listed as:_

```
amp-date-display-1_0
├─ Default Renderer
```

🚫 Don't:

```js
// amp-date-display/1.0/Basic.amp.js
const AmpDateDisplayWithDefaultRenderer = (args) => { /* ... */ };
```

_Listed as:_

```
amp-date-display-1_0
├─ Amp Date Display With Default Renderer
```

🚫 Don't:

```js
// amp-date-display/1.0/Basic.amp.js
const DefaultRenderer = (args) => { /* ... */ };
DefaultRenderer.storyName = 'amp-date-display with default renderer';
```

_Listed as:_

```
amp-date-display-1_0
├─ amp-date-display with default renderer
```
