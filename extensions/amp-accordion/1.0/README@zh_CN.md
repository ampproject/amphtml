# Bento Accordion

显示可收起和可展开的内容部分。此组件提供了一种途径，使查看者能够浏览内容大纲并跳转到任意部分。有效使用此组件可减少移动设备上的滚动需求。

-   Bento Accordion 接受一个或多个 `<section>` 元素作为其直接子级。
-   每个 `<section>` 都必须正好包含两个直接子级。
-   `<section>` 中的第一个子级为 Bento Accordion 的该部分内容的标题。它必须是一个标题元素，例如 `<h1>-<h6>` 或 `<header>`。
-   `<section>` 中的第二个子级为可展开/可收起的内容。
    -   它可以是 [AMP HTML](https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md) 中允许使用的任何标记。
-   点击或点按 `<section>` 标题可展开或收起该部分。
-   具有定义 `id` 的 Bento Accordion 会在用户停留在您的域中时保留每个部分的收起或展开状态。

## 网页组件

在添加自定义样式之前，必须包含每个 Bento 组件所需的 CSS 库以确保正确加载。或者以内嵌方式使用轻量级升级前样式。请参阅[布局和样式](#layout-and-style)。

下面的示例演示了 `<bento-accordion>` 网页组件的用法。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/accordion
```

```javascript
import {defineElement as defineBentoAccordion} from '@bentoproject/accordion';
defineBentoAccordion();
```

### 示例：通过 `<script>` 包含

下面的示例包含具有三段代码的 `bento-accordion`。第三段代码中的 `expanded` 特性可在网页加载时展开该组件。

```html
<head>
  <script src="https://cdn.ampproject.org/bento.js"></script>
  <script
    async
    src="https://cdn.ampproject.org/v0/bento-accordion-1.0.js"
  ></script>
  <link
    rel="stylesheet"
    type="text/css"
    href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
  />
</head>
<body>
  <bento-accordion id="my-accordion" disable-session-states>
    <section>
      <h2>Section 1</h2>
      <p>Content in section 1.</p>
    </section>
    <section>
      <h2>Section 2</h2>
      <div>Content in section 2.</div>
    </section>
    <section expanded>
      <h2>Section 3</h2>
      <div>Content in section 3.</div>
    </section>
  </bento-accordion>
  <script>
    (async () => {
      const accordion = document.querySelector('#my-accordion');
      await customElements.whenDefined('bento-accordion');
      const api = await accordion.getApi();

      // programatically expand all sections
      api.expand();
      // programatically collapse all sections
      api.collapse();
    })();
  </script>
</body>
```

### 互动和 API 用法

启用 Bento 的组件在独立使用时可通过其 API 实现频繁互动。可以通过在文档中包含以下脚本代码来访问 `bento-accordion` 组件 API：

```javascript
await customElements.whenDefined('bento-accordion');
const api = await accordion.getApi();
```

#### 操作

##### toggle()

`toggle` 操作可以切换 `bento-accordion` 部分的 `expanded` 和 `collapsed` 状态。无参数调用时，它会切换 Accordion 组件的所有部分。要指定特定的部分，请添加 `section` 参数并使用其对应的 <code>id</code> 作为参数值。

```html
<bento-accordion id="myAccordion">
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Bunch of awesome content</div>
  </section>
</bento-accordion>
<button id="button1">Toggle All Sections</button>
<button id="button2">Toggle Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.toggle();
    };
    document.querySelector('#button2').onclick = () => {
      api.toggle('section1');
    };
  })();
</script>
```

##### expand()

`expand` 操作可以展开 `bento-accordion` 的各个部分。如果某个部分已经展开，则它会保持展开状态。无参数调用时，它会展开 Accordion 组件的所有部分。要指定特定的部分，请添加 `section` 参数并使用其对应的 <code>id</code> 作为参数值。

```html
<button id="button1">Expand All Sections</button>
<button id="button2">Expand Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.expand();
    };
    document.querySelector('#button2').onclick = () => {
      api.expand('section1');
    };
  })();
</script>
```

##### collapse()

`collapse` 操作可以收起 `bento-accordion` 的各个部分。如果某个部分已经收起，则它会保持收起状态。无参数调用时，它会收起 Accordion 组件的所有部分。要指定特定的部分，请添加 `section` 参数并使用其对应的 <code>id</code> 作为参数值。

```html
<button id="button1">Collapse All Sections</button>
<button id="button2">Collapse Section 1</button>
<script>
  (async () => {
    const accordion = document.querySelector('#myAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // set up button actions
    document.querySelector('#button1').onclick = () => {
      api.collapse();
    };
    document.querySelector('#button2').onclick = () => {
      api.collapse('section1');
    };
  })();
</script>
```

#### 事件

`bento-accordion` API 使您可以注册和响应以下事件：

##### expand

当 Accordion 组件的某个部分展开时会触发此事件，并从展开的部分调度此事件。

请参见下例。

##### collapse

当 Accordion 组件的某个部分收起时会触发此事件，并从收起的部分调度此事件。

在下例中，`section 1` 会侦听 `expand` 事件，并在自身被展开时展开 `section 2`。`section 2` 会侦听 `collapse` 事件，并在自身被收起时收起 `section 1`。

请参见下例。

```html
<bento-accordion id="eventsAccordion" animate>
  <section id="section1">
    <h2>Section 1</h2>
    <div>Puppies are cute.</div>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Kittens are furry.</div>
  </section>
</bento-accordion>

<script>
  (async () => {
    const accordion = document.querySelector('#eventsAccordion');
    await customElements.whenDefined('bento-accordion');
    const api = await accordion.getApi();

    // when section 1 expands, section 2 also expands
    // when section 2 collapses, section 1 also collapses
    const section1 = document.querySelector('#section1');
    const section2 = document.querySelector('#section2');
    section1.addEventListener('expand', () => {
      api.expand('section2');
    });
    section2.addEventListener('collapse', () => {
      api.collapse('section1');
    });
  })();
</script>
```

### 布局和样式

每个 Bento 组件都有一个小型 CSS 库，必须包含该库以确保正确加载而不会发生[内容偏移](https://web.dev/cls/)。由于基于顺序的特性，在使用任何自定义样式之前，您必须手动确保包含样式表。

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://cdn.ampproject.org/v0/bento-accordion-1.0.css"
/>
```

或者，您也可以选择以内嵌方式使用轻量级升级前样式：

```html
<style>
  bento-accordion {
    display: block;
    contain: layout;
  }

  bento-accordion,
  bento-accordion > section,
  bento-accordion > section > :first-child {
    margin: 0;
  }

  bento-accordion > section > * {
    display: block;
    float: none;
    overflow: hidden; /* clearfix */
    position: relative;
  }

  @media (min-width: 1px) {
    :where(bento-accordion > section) > :first-child {
      cursor: pointer;
      background-color: #efefef;
      padding-right: 20px;
      border: 1px solid #dfdfdf;
    }
  }

  .i-amphtml-accordion-header {
    cursor: pointer;
    background-color: #efefef;
    padding-right: 20px;
    border: 1px solid #dfdfdf;
  }

  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating),
  bento-accordion
    > section:not([expanded])
    > :last-child:not(.i-amphtml-animating)
    * {
    display: none !important;
  }
</style>
```

### 特性

#### animate

在 `<bento-accordion>` 中包含 `animate` 特性，可在内容展开时添加“向下滚动”动画，并在收起时添加“向上滚动”动画。

此特性可配置为基于[媒体查询](./../../../docs/spec/amp-html-responsive-attributes.md)。

```html
<bento-accordion animate>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <div>Content in section 2.</div>
  </section>
</bento-accordion>
```

#### expanded

将 `expanded` 特性应用于嵌套的 `<section>` 可在网页加载时展开该部分。

```html
<bento-accordion>
  <section id="section1">
    <h2>Section 1</h2>
    <p>Bunch of awesome content</p>
  </section>
  <section id="section2">
    <h2>Section 2</h2>
    <div>Bunch of awesome content</div>
  </section>
  <section id="section3" expanded>
    <h2>Section 3</h2>
    <div>Bunch of awesome expanded content</div>
  </section>
</bento-accordion>
```

#### expand-single-section

通过将 `expand-single-section` 特性应用于 `<bento-accordion>` 元素，可实现一次只允许展开一个部分。这意味着如果用户点按收起的 `<section>`，则会展开该部分并收起其他已展开的 `<section>`。

```html
<bento-accordion expand-single-section>
  <section>
    <h2>Section 1</h2>
    <p>Content in section 1.</p>
  </section>
  <section>
    <h2>Section 2</h2>
    <div>Content in section 2.</div>
  </section>
  <section>
    <h2>Section 3</h2>
    <img
      src="https://source.unsplash.com/random/320x256"
      width="320"
      height="256"
    />
  </section>
</bento-accordion>
```

### 样式设置

您可以使用 `bento-accordion` 元素选择器来自由设置 Accordion 组件的样式。

设置 amp-accordion 样式时，请记住以下几点：

-   `bento-accordion` 元素始终为 `display: block`。
-   `float` 无法设置 `<section>`、标题或内容元素的样式。
-   已展开部分会将 `expanded` 特性应用于 `<section>` 元素。
-   内容元素通过 `overflow: hidden` 清除浮动，因此不能具有滚动条。
-   `<bento-accordion>`、`<section>`、标题和内容元素的边距设置为 `0`，但可以在自定义样式中替换。
-   标题和内容元素均为 `position: relative`。

---

## Preact/React 组件

下面的示例演示了如何将 `<BentoAccordion>` 作为可与 Preact 或 React 库配合使用的功能组件。

### 示例：通过 npm 导入

```sh
npm install @bentoproject/accordion
```

```javascript
import React from 'react';
import {BentoAccordion} from '@bentoproject/accordion/react';
import '@bentoproject/accordion/styles.css';

function App() {
  return (
    <BentoAccordion>
      <BentoAccordionSection key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

### 互动和 API 用法

Bento 组件可通过其 API 实现频繁互动。可以通过传递 `ref` 来访问 `BentoAccordion` 组件 API：

```javascript
import React, {createRef} from 'react';
const ref = createRef();

function App() {
  return (
    <BentoAccordion ref={ref}>
      <BentoAccordionSection id="section1" key={1}>
        <BentoAccordionHeader>
          <h1>Section 1</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 1</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section2" key={2}>
        <BentoAccordionHeader>
          <h1>Section 2</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 2</BentoAccordionContent>
      </BentoAccordionSection>

      <BentoAccordionSection id="section3" key={3}>
        <BentoAccordionHeader>
          <h1>Section 3</h1>
        </BentoAccordionHeader>
        <BentoAccordionContent>Content 3</BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
}
```

#### 操作

`BentoAccordion` API 使您可以执行以下操作：

##### toggle()

`toggle` 操作可以切换 `bento-accordion` 部分的 `expanded` 和 `collapsed` 状态。无参数调用时，它会切换 Accordion 组件的所有部分。要指定特定的部分，请添加 `section` 参数并使用其对应的 <code>id</code> 作为参数值。

```javascript
ref.current.toggle();
ref.current.toggle('section1');
```

##### expand()

`expand` 操作可以展开 `bento-accordion` 的各个部分。如果某个部分已经展开，则它会保持展开状态。无参数调用时，它会展开 Accordion 组件的所有部分。要指定特定的部分，请添加 `section` 参数并使用其对应的 `id` 作为参数值。

```javascript
ref.current.expand();
ref.current.expand('section1');
```

##### collapse()

`collapse` 操作可以收起 `bento-accordion` 的各个部分。如果某个部分已经收起，则它会保持收起状态。无参数调用时，它会收起 Accordion 组件的所有部分。要指定特定的部分，请添加 `section` 参数并使用其对应的 `id` 作为参数值。

```javascript
ref.current.collapse();
ref.current.collapse('section1');
```

#### 事件

Bento Accordion API 使您可以响应以下事件：

##### onExpandStateChange

当 Accordion 组件的某个部分展开或收起时会触发此事件，并从展开的部分调度此事件。

请参见下例。

##### onCollapse

<strong>collapse</strong> 当 Accordion 组件的某个部分收起时会触发此事件，并从收起的部分调度此事件。

在下例中，`section 1` 会侦听 `expand` 事件，并在自身被展开时展开 `section 2`。`section 2` 会侦听 `collapse` 事件，并在自身被收起时收起 `section 1`。

请参见下例。

```jsx
<BentoAccordion ref={ref}>
  <BentoAccordionSection
    id="section1"
    key={1}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section1 expanded' : 'section1 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 1</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 1</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section2"
    key={2}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section2 expanded' : 'section2 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 2</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 2</BentoAccordionContent>
  </BentoAccordionSection>

  <BentoAccordionSection
    id="section3"
    key={3}
    onExpandStateChange={(expanded) => {
      alert(expanded ?  'section3 expanded' : 'section3 collapsed');
    }}
  >
    <BentoAccordionHeader>
      <h1>Section 3</h1>
    </BentoAccordionHeader>
    <BentoAccordionContent>Content 3</BentoAccordionContent>
  </BentoAccordionSection>
</BentoAccordion>
```

### 布局和样式

#### 容器类型

`BentoAccordion` 组件具有定义的布局大小类型。为确保正确呈现组件，请务必通过所需的 CSS 布局（例如使用 `height`、`width`、`aspect-ratio` 或其他此类属性定义的布局）为组件及其直接子级应用大小。可以内嵌应用：

```jsx
<BentoAccordion style={{width: 300, height: 100}}>...</BentoAccordion>
```

或通过 `className`：

```jsx
<BentoAccordion className="custom-styles">...</BentoAccordion>
```

```css
.custom-styles {
  background-color: red;
}
```

### 属性

#### BentoAccordion

##### animate

如果为 true，则会在每个部分展开和收起时使用“向下滚动”/“向上滚动”动画。默认值：`false`

##### expandSingleSection

如果为 true，则展开 1 个部分将自动收起所有其他部分。默认值：`false`

#### BentoAccordionSection

##### animate

如果为 true，则会在该部分展开和收起时使用“向下滚动”/“向上滚动”动画。默认值：`false`

##### expanded

如果为 true，则展开该部分。默认值：`false`

##### onExpandStateChange

```typescript
(expanded: boolean): void
```

用于侦听展开状态变更的回调。将布尔值标志作为参数指示该部分是否刚刚展开（`false` 表示它已收起）

#### BentoAccordionHeader

#### 通用属性

此组件支持 React 和 Preact 组件的[通用属性](../../../docs/spec/bento-common-props.md)。

BentoAccordionHeader 尚不支持任何自定义属性

#### BentoAccordionContent

#### 通用属性

此组件支持 React 和 Preact 组件的[通用属性](../../../docs/spec/bento-common-props.md)。

BentoAccordionContent 尚不支持任何自定义属性
